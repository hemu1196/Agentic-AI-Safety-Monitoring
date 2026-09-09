from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.resource import Resource
from app.models.equipment import Equipment
from app.schemas.resource import ResourceCreate, ResourceUpdate
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


class ResourceService:
    # Material / Workforce Resources
    @staticmethod
    def get_all_resources(
        db: Session, project_id: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Resource]:
        query = db.query(Resource)
        if project_id:
            query = query.filter(Resource.project_id == project_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_resource(db: Session, res_in: ResourceCreate) -> Resource:
        resource = Resource(
            project_id=res_in.project_id,
            name=res_in.name,
            type=res_in.type,
            quantity=res_in.quantity,
            unit=res_in.unit,
            utilization_rate=res_in.utilization_rate,
            status=res_in.status,
            notes=res_in.notes,
        )
        db.add(resource)
        db.commit()
        db.refresh(resource)
        return resource

    @staticmethod
    def update_resource(db: Session, resource_id: str, res_in: ResourceUpdate) -> Resource:
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        for field, value in res_in.model_dump(exclude_unset=True).items():
            setattr(res, field, value)
        db.commit()
        db.refresh(res)
        return res

    # Equipment Resources
    @staticmethod
    def get_all_equipment(
        db: Session, project_id: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Equipment]:
        query = db.query(Equipment)
        if project_id:
            query = query.filter(Equipment.project_id == project_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_equipment(db: Session, eq_in: EquipmentCreate) -> Equipment:
        equipment = Equipment(
            project_id=eq_in.project_id,
            name=eq_in.name,
            model=eq_in.model,
            serial_number=eq_in.serial_number,
            status=eq_in.status,
            location=eq_in.location,
            utilization_rate=eq_in.utilization_rate,
            next_maintenance_date=eq_in.next_maintenance_date,
        )
        db.add(equipment)
        db.commit()
        db.refresh(equipment)
        return equipment

    @staticmethod
    def update_equipment(db: Session, equipment_id: str, eq_in: EquipmentUpdate) -> Equipment:
        eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
        if not eq:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
        for field, value in eq_in.model_dump(exclude_unset=True).items():
            setattr(eq, field, value)
        db.commit()
        db.refresh(eq)
        return eq
