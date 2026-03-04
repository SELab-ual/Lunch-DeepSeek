from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from datetime import datetime

from database import get_db
from models import RestaurantOwner, SystemStats
from schemas import RestaurantOwnerCreate, RestaurantOwnerResponse
from auth import get_password_hash

router = APIRouter(prefix="/api/owners", tags=["owners"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=RestaurantOwnerResponse, status_code=status.HTTP_201_CREATED)
async def register_owner(owner: RestaurantOwnerCreate, db: Session = Depends(get_db)):
    """
    Register a new restaurant owner (FR22)
    
    Validates:
    - Unique username (QR18)
    - Unique email
    - All required fields
    """
    # Check if username already exists (QR18)
    existing_user = db.query(RestaurantOwner).filter(
        RestaurantOwner.username == owner.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(RestaurantOwner).filter(
        RestaurantOwner.email == owner.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new restaurant owner (pending verification)
    db_owner = RestaurantOwner(
        username=owner.username,
        email=owner.email,
        password_hash=get_password_hash(owner.password),
        address=owner.address,
        phone=owner.phone,
        mobile_phone=owner.mobile_phone,
        verification_status="pending",
        is_active=False
    )
    
    try:
        db.add(db_owner)
        db.commit()
        db.refresh(db_owner)
        
        logger.info(f"New restaurant owner registered: {owner.username}")
        
        return db_owner
        
    except Exception as e:
        db.rollback()
        logger.error(f"Owner registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.get("/verify/{token}")
async def verify_owner(token: str, db: Session = Depends(get_db)):
    """Verify restaurant owner (would be triggered by admin in later sprint)"""
    # This will be implemented in Sprint 2+ with admin features
    return {"message": "Verification endpoint - to be implemented in Sprint 2"}

@router.get("/status/{owner_id}")
async def get_verification_status(owner_id: str, db: Session = Depends(get_db)):
    """Check verification status"""
    owner = db.query(RestaurantOwner).filter(RestaurantOwner.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    return {
        "verification_status": owner.verification_status,
        "is_active": owner.is_active
    }