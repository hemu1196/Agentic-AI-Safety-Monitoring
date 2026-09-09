from datetime import datetime, date, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.safety_issue import SafetyIssue
from app.models.safety_monitoring import SafetyMonitoringRecord
from app.models.safety_compliance import SafetyCompliance
from app.schemas.safety_issue import SafetyIssueCreate, SafetyIssueUpdate
from app.schemas.safety_monitoring import SafetyMonitoringCreate


class SafetyService:
    @staticmethod
    def create_issue(db: Session, issue_in: SafetyIssueCreate) -> SafetyIssue:
        issue = SafetyIssue(
            reporter_id=issue_in.reporter_id,
            project_id=issue_in.project_id,
            zone_id=issue_in.zone_id,
            title=issue_in.title,
            category=issue_in.category,
            description=issue_in.description,
            severity=issue_in.severity,
            status=issue_in.status,
            evidence_file_url=issue_in.evidence_file_url,
            evidence_metadata=issue_in.evidence_metadata,
        )
        db.add(issue)
        db.commit()
        db.refresh(issue)
        return issue

    @staticmethod
    def get_issues(
        db: Session,
        project_id: Optional[str] = None,
        zone_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        severity_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[SafetyIssue]:
        query = db.query(SafetyIssue)
        if project_id:
            query = query.filter(SafetyIssue.project_id == project_id)
        if zone_id:
            query = query.filter(SafetyIssue.zone_id == zone_id)
        if status_filter:
            query = query.filter(SafetyIssue.status == status_filter)
        if severity_filter:
            query = query.filter(SafetyIssue.severity == severity_filter)
        return query.order_by(SafetyIssue.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_issue_by_id(db: Session, issue_id: str) -> Optional[SafetyIssue]:
        return db.query(SafetyIssue).filter(SafetyIssue.id == issue_id).first()

    @staticmethod
    def update_issue(db: Session, issue_id: str, issue_in: SafetyIssueUpdate) -> SafetyIssue:
        issue = SafetyService.get_issue_by_id(db, issue_id)
        if not issue:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety issue not found")

        update_data = issue_in.model_dump(exclude_unset=True)
        if update_data.get("status") in ["Resolved", "Closed"] and not issue.resolved_at:
            issue.resolved_at = datetime.now(timezone.utc)

        for field, value in update_data.items():
            setattr(issue, field, value)

        db.commit()
        db.refresh(issue)
        return issue

    @staticmethod
    def create_monitoring_record(db: Session, record_in: SafetyMonitoringCreate) -> SafetyMonitoringRecord:
        record = SafetyMonitoringRecord(
            project_id=record_in.project_id,
            zone_id=record_in.zone_id,
            safety_score=record_in.safety_score,
            violation_count=record_in.violation_count,
            inspection_date=record_in.inspection_date,
            status=record_in.status,
            trend_indicator=record_in.trend_indicator,
            notes=record_in.notes,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_safety_summary(db: Session, project_id: Optional[str] = None) -> Dict[str, Any]:
        issues_query = db.query(SafetyIssue)
        records_query = db.query(SafetyMonitoringRecord)
        
        if project_id:
            issues_query = issues_query.filter(SafetyIssue.project_id == project_id)
            records_query = records_query.filter(SafetyMonitoringRecord.project_id == project_id)

        all_issues = issues_query.all()
        active_violations = sum(1 for i in all_issues if i.status == "Active")
        critical_violations = sum(1 for i in all_issues if i.status == "Active" and i.severity == "Critical")
        resolved_violations = sum(1 for i in all_issues if i.status == "Resolved")

        records = records_query.order_by(SafetyMonitoringRecord.inspection_date.desc()).limit(10).all()
        
        # Calculate dynamic safety score
        base_score = 100.0 - (critical_violations * 10.0) - ((active_violations - critical_violations) * 3.0)
        overall_score = max(0.0, min(100.0, base_score))

        return {
            "overall_safety_score": round(overall_score, 1),
            "safety_change_percentage": "+2.5% vs last week",
            "active_violations": active_violations,
            "critical_violations": critical_violations,
            "resolved_violations": resolved_violations,
            "records": records,
        }

    @staticmethod
    def get_worker_safety_status(db: Session, worker_id: str) -> Dict[str, Any]:
        compliance = db.query(SafetyCompliance).filter(SafetyCompliance.worker_id == worker_id).first()
        reported_issues = db.query(SafetyIssue).filter(SafetyIssue.reporter_id == worker_id).all()
        
        return {
            "worker_id": worker_id,
            "compliance": compliance,
            "reported_issues_count": len(reported_issues),
            "open_issues_count": sum(1 for i in reported_issues if i.status == "Active"),
        }
