from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.models.site import Site, Zone
from app.schemas.site import (
    SiteResponse, SiteCreate, SiteUpdate, ZoneResponse, ZoneCreate, ZoneUpdate
)

router = APIRouter(prefix="/sites", tags=["Sites & Zones"])


@router.get("/", response_model=List[SiteResponse])
def get_sites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List construction sites and their zones."""
    return db.query(Site).offset(skip).limit(limit).all()


@router.post("/", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Create a new construction site (Admin only)."""
    site = Site(
        name=site_in.name,
        location=site_in.location,
        client_name=site_in.client_name,
        status=site_in.status,
        description=site_in.description,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.get("/{site_id}", response_model=SiteResponse)
def get_site_by_id(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve site details and all designated zones."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    return site


@router.put("/{site_id}", response_model=SiteResponse)
def update_site(
    site_id: str,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update site information (Admin only)."""
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    for field, value in site_in.model_dump(exclude_unset=True).items():
        setattr(site, field, value)
    db.commit()
    db.refresh(site)
    return site


@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    zone_in: ZoneCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Define a new construction zone within a site (Admin only)."""
    site = db.query(Site).filter(Site.id == zone_in.site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    zone = Zone(
        site_id=zone_in.site_id,
        name=zone_in.name,
        description=zone_in.description,
        risk_score=zone_in.risk_score,
        max_capacity=zone_in.max_capacity,
        is_restricted=zone_in.is_restricted,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.put("/zones/{zone_id}", response_model=ZoneResponse)
def update_zone(
    zone_id: str,
    zone_in: ZoneUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update zone attributes, capacity, or hazard level (Admin only)."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    for field, value in zone_in.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    db.commit()
    db.refresh(zone)
    return zone
