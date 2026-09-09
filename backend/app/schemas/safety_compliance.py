from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SafetyComplianceBase(BaseModel):
    worker_id: str
    compliance_score: float = 100.0
    helmet_compliant: bool = True
    vest_compliant: bool = True
    shoes_compliant: bool = True
    gloves_compliant: bool = True
    badge_compliant: bool = True


class SafetyComplianceCreate(SafetyComplianceBase):
    pass


class SafetyComplianceUpdate(BaseModel):
    compliance_score: float
    helmet_compliant: bool
    vest_compliant: bool
    shoes_compliant: bool
    gloves_compliant: bool
    badge_compliant: bool


class SafetyComplianceResponse(SafetyComplianceBase):
    id: str
    last_evaluated_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
