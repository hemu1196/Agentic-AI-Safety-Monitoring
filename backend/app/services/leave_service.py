from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.leave_request import LeaveRequest
from app.models.worker import Worker
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestReview, LeaveRequestWorkerSubmit


class LeaveService:
    @staticmethod
    def get_by_id(db: Session, leave_id: str) -> Optional[LeaveRequest]:
        return db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()

    @staticmethod
    def get_all(
        db: Session, status_filter: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[LeaveRequest]:
        query = db.query(LeaveRequest)
        if status_filter:
            query = query.filter(LeaveRequest.status == status_filter)
        return query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_worker(
        db: Session, worker_id: str, skip: int = 0, limit: int = 50
    ) -> List[LeaveRequest]:
        return (
            db.query(LeaveRequest)
            .filter(LeaveRequest.worker_id == worker_id)
            .order_by(LeaveRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def submit(db: Session, worker_id: str, leave_in: LeaveRequestWorkerSubmit) -> LeaveRequest:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        if leave_in.end_date < leave_in.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date cannot be earlier than start date"
            )

        leave_req = LeaveRequest(
            worker_id=worker_id,
            leave_type=leave_in.leave_type,
            start_date=leave_in.start_date,
            end_date=leave_in.end_date,
            reason=leave_in.reason,
            status="PENDING",
        )
        db.add(leave_req)
        db.commit()
        db.refresh(leave_req)
        return leave_req

    @staticmethod
    def review(
        db: Session, leave_id: str, reviewer_id: str, review_in: LeaveRequestReview
    ) -> LeaveRequest:
        leave = LeaveService.get_by_id(db, leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        status_upper = review_in.status.upper()
        if status_upper not in ["APPROVED", "REJECTED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be APPROVED or REJECTED"
            )

        leave.status = status_upper
        leave.reviewed_by_id = reviewer_id
        leave.review_notes = review_in.review_notes
        db.commit()
        db.refresh(leave)
        return leave
