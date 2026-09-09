from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.risk_analytics import RiskAssessment
from app.models.site import Zone
from app.models.safety_issue import SafetyIssue
from app.models.worker import Worker
from app.schemas.risk_analytics import RiskAssessmentCreate, ZoneRiskSummary, RiskAnalyticsSummaryResponse


class RiskService:
    @staticmethod
    def create_assessment(db: Session, risk_in: RiskAssessmentCreate) -> RiskAssessment:
        assessment = RiskAssessment(
            project_id=risk_in.project_id,
            zone_id=risk_in.zone_id,
            risk_score=risk_in.risk_score,
            risk_level=risk_in.risk_level,
            risk_coefficient=risk_in.risk_coefficient,
            primary_driver=risk_in.primary_driver,
            mitigation_plan=risk_in.mitigation_plan,
            recorded_at=risk_in.recorded_at,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def get_assessments(
        db: Session, project_id: Optional[str] = None, zone_id: Optional[str] = None, limit: int = 50
    ) -> List[RiskAssessment]:
        query = db.query(RiskAssessment)
        if project_id:
            query = query.filter(RiskAssessment.project_id == project_id)
        if zone_id:
            query = query.filter(RiskAssessment.zone_id == zone_id)
        return query.order_by(RiskAssessment.recorded_at.desc()).limit(limit).all()

    @staticmethod
    def get_risk_summary(db: Session, project_id: Optional[str] = None) -> RiskAnalyticsSummaryResponse:
        # Evaluate zone-level risks
        zones = db.query(Zone).all()
        zone_summaries: List[ZoneRiskSummary] = []
        
        for z in zones:
            active_workers = db.query(Worker).filter(Worker.assigned_zone_id == z.id, Worker.status == "ON SITE").count()
            open_alerts = db.query(SafetyIssue).filter(SafetyIssue.zone_id == z.id, SafetyIssue.status == "Active").count()
            
            level = "Low"
            if z.risk_score >= 75:
                level = "Critical"
            elif z.risk_score >= 50:
                level = "High"
            elif z.risk_score >= 25:
                level = "Medium"
            elif z.risk_score >= 15:
                level = "Low-Moderate"

            zone_summaries.append(
                ZoneRiskSummary(
                    zone_id=z.id,
                    zone_name=z.name,
                    risk_score=z.risk_score,
                    risk_level=level,
                    active_workers=active_workers,
                    open_alerts=open_alerts
                )
            )

        avg_risk = sum(z.risk_score for z in zone_summaries) / len(zone_summaries) if zone_summaries else 18.0
        overall_level = "Low-Moderate" if avg_risk < 30 else ("Medium" if avg_risk < 60 else "High")
        coefficient = round(avg_risk / 50.0, 2)

        return RiskAnalyticsSummaryResponse(
            overall_risk_score=round(avg_risk, 1),
            risk_level=overall_level,
            risk_coefficient=coefficient,
            primary_driver="Structural & Heavy Equipment Operations",
            zone_risks=zone_summaries
        )
