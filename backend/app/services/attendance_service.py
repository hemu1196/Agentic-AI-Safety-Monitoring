from datetime import date, datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.attendance import Attendance
from app.models.worker import Worker
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate


class AttendanceService:
    @staticmethod
    def get_by_id(db: Session, attendance_id: str) -> Optional[Attendance]:
        return db.query(Attendance).filter(Attendance.id == attendance_id).first()

    @staticmethod
    def get_worker_attendance(
        db: Session, worker_id: str, skip: int = 0, limit: int = 100
    ) -> List[Attendance]:
        return (
            db.query(Attendance)
            .filter(Attendance.worker_id == worker_id)
            .order_by(Attendance.date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def check_in(db: Session, worker_id: str, notes: Optional[str] = None) -> Attendance:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        today = date.today()
        existing = (
            db.query(Attendance)
            .filter(Attendance.worker_id == worker_id, Attendance.date == today)
            .first()
        )

        now = datetime.now(timezone.utc)
        if existing:
            if existing.check_in_time:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Worker already checked in for today"
                )
            existing.check_in_time = now
            existing.status = "PRESENT"
            if notes:
                existing.notes = notes
            db.commit()
            db.refresh(existing)
            return existing

        attendance = Attendance(
            worker_id=worker_id,
            date=today,
            check_in_time=now,
            status="PRESENT",
            notes=notes,
        )
        worker.status = "ON SITE"
        db.add(attendance)
        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    def check_out(db: Session, worker_id: str, notes: Optional[str] = None) -> Attendance:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        today = date.today()
        attendance = (
            db.query(Attendance)
            .filter(Attendance.worker_id == worker_id, Attendance.date == today)
            .first()
        )

        if not attendance or not attendance.check_in_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Worker has not checked in today"
            )

        now = datetime.now(timezone.utc)
        attendance.check_out_time = now
        duration = now - attendance.check_in_time
        attendance.total_hours = round(duration.total_seconds() / 3600.0, 2)
        if notes:
            attendance.notes = (attendance.notes or "") + ("\n" + notes if attendance.notes else notes)
        
        worker.status = "OFF SITE"
        db.commit()
        db.refresh(attendance)
        return attendance

    @staticmethod
    def get_daily_summary(db: Session, target_date: Optional[date] = None) -> Dict[str, Any]:
        eval_date = target_date or date.today()
        records = db.query(Attendance).filter(Attendance.date == eval_date).all()
        
        total_present = sum(1 for r in records if r.status == "PRESENT")
        total_absent = sum(1 for r in records if r.status == "ABSENT")
        total_leave = sum(1 for r in records if r.status == "ON_LEAVE")
        avg_hours = sum(r.total_hours for r in records) / len(records) if records else 0.0

        return {
            "date": eval_date,
            "total_records": len(records),
            "present_count": total_present,
            "absent_count": total_absent,
            "on_leave_count": total_leave,
            "average_working_hours": round(avg_hours, 2),
        }
