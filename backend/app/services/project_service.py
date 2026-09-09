from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project, Task
from app.models.worker import Worker
from app.models.equipment import Equipment
from app.models.safety_issue import SafetyIssue
from app.schemas.project import ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate


class ProjectService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
        return db.query(Project).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, project_id: str) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def create(db: Session, project_in: ProjectCreate) -> Project:
        if db.query(Project).filter(Project.code == project_in.code).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Project with code '{project_in.code}' already exists"
            )
        project = Project(
            site_id=project_in.site_id,
            name=project_in.name,
            code=project_in.code,
            description=project_in.description,
            progress=project_in.progress,
            target_date=project_in.target_date,
            status=project_in.status,
            manager_id=project_in.manager_id,
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def update(db: Session, project_id: str, project_in: ProjectUpdate) -> Project:
        project = ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        for field, value in project_in.model_dump(exclude_unset=True).items():
            setattr(project, field, value)

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete(db: Session, project_id: str) -> None:
        project = ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        db.delete(project)
        db.commit()

    # Tasks
    @staticmethod
    def create_task(db: Session, task_in: TaskCreate) -> Task:
        task = Task(
            project_id=task_in.project_id,
            zone_id=task_in.zone_id,
            name=task_in.name,
            description=task_in.description,
            owner=task_in.owner,
            due_date=task_in.due_date,
            progress=task_in.progress,
            status=task_in.status,
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(db: Session, task_id: str, task_in: TaskUpdate) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        for field, value in task_in.model_dump(exclude_unset=True).items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def get_dashboard_summary(db: Session, project_id: Optional[str] = None) -> Dict[str, Any]:
        """Aggregate site-wide statistics for Admin/Site Manager Dashboard."""
        projects_query = db.query(Project)
        workers_query = db.query(Worker).filter(Worker.is_archived == False)
        equipment_query = db.query(Equipment)
        issues_query = db.query(SafetyIssue)

        if project_id:
            projects_query = projects_query.filter(Project.id == project_id)
            workers_query = workers_query.filter(Worker.assigned_project_id == project_id)
            equipment_query = equipment_query.filter(Equipment.project_id == project_id)
            issues_query = issues_query.filter(SafetyIssue.project_id == project_id)

        all_workers = workers_query.all()
        active_workers = sum(1 for w in all_workers if w.status == "ON SITE")
        workers_on_break = sum(1 for w in all_workers if w.status == "OFF SITE")

        all_equipment = equipment_query.all()
        active_equipment = sum(1 for e in all_equipment if e.status == "Active")
        idle_equipment = sum(1 for e in all_equipment if e.status == "Idle")
        utilization = (
            sum(e.utilization_rate for e in all_equipment) / len(all_equipment)
            if all_equipment else 0.0
        )

        all_issues = issues_query.all()
        open_violations = sum(1 for i in all_issues if i.status == "Active")
        critical_violations = sum(1 for i in all_issues if i.status == "Active" and i.severity == "Critical")

        projects = projects_query.all()
        avg_progress = (
            sum(p.progress for p in projects) / len(projects)
            if projects else 0.0
        )

        return {
            "overall_progress": round(avg_progress, 1),
            "progress_change": "+3.8% vs planned",
            "progress_target": "On schedule",
            "safety_score": 92.0,
            "safety_change": "+2 pts this week",
            "active_workers": active_workers,
            "workers_on_break": workers_on_break,
            "total_workers": len(all_workers),
            "active_equipment": active_equipment,
            "idle_equipment": idle_equipment,
            "equipment_utilization": round(utilization, 1),
            "open_violations": open_violations,
            "critical_violations": critical_violations,
            "risk_score": 22.0,
            "risk_level": "Low-Moderate",
            "total_projects": len(projects),
        }
