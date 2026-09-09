from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.worker import Worker
from app.models.safety_compliance import SafetyCompliance
from app.schemas.worker import WorkerCreate, WorkerUpdate
from app.utils.helpers import utc_now


class WorkerService:
    @staticmethod
    def get_by_id(db: Session, worker_id: str) -> Optional[Worker]:
        return db.query(Worker).filter(Worker.id == worker_id).first()

    @staticmethod
    def get_by_code(db: Session, worker_code: str) -> Optional[Worker]:
        return db.query(Worker).filter(Worker.worker_code == worker_code).first()

    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> Optional[Worker]:
        return db.query(Worker).filter(Worker.user_id == user_id).first()

    @staticmethod
    def get_all(
        db: Session,
        project_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Worker]:
        query = db.query(Worker).filter(Worker.is_archived == False)
        if project_id:
            query = query.filter(Worker.assigned_project_id == project_id)
        if zone_id:
            query = query.filter(Worker.assigned_zone_id == zone_id)
        if status_filter:
            query = query.filter(Worker.status == status_filter)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, worker_in: WorkerCreate) -> Worker:
        if db.query(Worker).filter(Worker.worker_code == worker_in.worker_code).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Worker with code {worker_in.worker_code} already exists"
            )

        worker = Worker(
            user_id=worker_in.user_id,
            worker_code=worker_in.worker_code,
            name=worker_in.name,
            role=worker_in.role,
            phone=worker_in.phone,
            email=worker_in.email,
            assigned_project_id=worker_in.assigned_project_id,
            assigned_zone_id=worker_in.assigned_zone_id,
            status=worker_in.status,
            access_status=worker_in.access_status,
            access_level=worker_in.access_level,
            access_start_date=worker_in.access_start_date,
            access_expiry_date=worker_in.access_expiry_date,
            registration_date=worker_in.registration_date,
            photo_url=worker_in.photo_url,
            ppe_requirements=worker_in.ppe_requirements.model_dump(),
            safety_notes=worker_in.safety_notes,
            emergency_contact_name=worker_in.emergency_contact_name,
            emergency_contact_phone=worker_in.emergency_contact_phone,
        )
        db.add(worker)
        db.flush()

        # Initialize default SafetyCompliance record
        compliance = SafetyCompliance(
            worker_id=worker.id,
            compliance_score=100.0,
            helmet_compliant=True,
            vest_compliant=True,
            shoes_compliant=True,
            gloves_compliant=True,
            badge_compliant=True,
            last_evaluated_at=utc_now()
        )
        db.add(compliance)

        db.commit()
        db.refresh(worker)
        return worker

    @staticmethod
    def update(db: Session, worker_id: str, worker_in: WorkerUpdate) -> Worker:
        worker = WorkerService.get_by_id(db, worker_id)
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        update_data = worker_in.model_dump(exclude_unset=True)
        if "ppe_requirements" in update_data and update_data["ppe_requirements"]:
            update_data["ppe_requirements"] = update_data["ppe_requirements"]

        for field, value in update_data.items():
            setattr(worker, field, value)

        db.commit()
        db.refresh(worker)
        return worker

    @staticmethod
    def archive(db: Session, worker_id: str) -> Worker:
        worker = WorkerService.get_by_id(db, worker_id)
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")
        worker.is_archived = True
        db.commit()
        db.refresh(worker)
        return worker
