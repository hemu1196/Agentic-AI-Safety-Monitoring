from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportUpdate


class ReportService:
    @staticmethod
    def get_all(
        db: Session,
        project_id: Optional[str] = None,
        report_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Report]:
        query = db.query(Report)
        if project_id:
            query = query.filter(Report.project_id == project_id)
        if report_type:
            query = query.filter(Report.type == report_type)
        return query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.id == report_id).first()

    @staticmethod
    def get_by_author(
        db: Session, author_id: str, skip: int = 0, limit: int = 50
    ) -> List[Report]:
        return (
            db.query(Report)
            .filter(Report.author_id == author_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create(db: Session, report_in: ReportCreate) -> Report:
        report = Report(
            project_id=report_in.project_id,
            author_id=report_in.author_id,
            title=report_in.title,
            type=report_in.type,
            summary=report_in.summary,
            details=report_in.details,
            file_url=report_in.file_url,
            status=report_in.status,
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def update(db: Session, report_id: str, report_in: ReportUpdate) -> Report:
        report = ReportService.get_by_id(db, report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        for field, value in report_in.model_dump(exclude_unset=True).items():
            setattr(report, field, value)
        db.commit()
        db.refresh(report)
        return report
