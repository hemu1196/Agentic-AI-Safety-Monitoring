from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    users,
    admin,
    workers,
    attendance,
    safety,
    risks,
    projects,
    resources,
    equipment,
    reports,
    notifications,
    leave,
    gate_access,
    compliance,
    sites,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
api_router.include_router(workers.router)
api_router.include_router(attendance.router)
api_router.include_router(safety.router)
api_router.include_router(risks.router)
api_router.include_router(projects.router)
api_router.include_router(resources.router)
api_router.include_router(equipment.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(leave.router)
api_router.include_router(gate_access.router)
api_router.include_router(compliance.router)
api_router.include_router(sites.router)
