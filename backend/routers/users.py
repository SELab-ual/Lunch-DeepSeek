from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging
from datetime import datetime

from database import get_db
from models import MobileUser, SystemStats
from schemas import MobileUserCreate, MobileUserResponse
from auth import get_password_hash, check_memory_constraint, check_storage_constraint

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=MobileUserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: MobileUserCreate, db: Session = Depends(get_db)):
    """
    Register a new mobile user (FR3)
    
    Validates:
    - Unique username (QR17)
    - Unique email
    - Password strength
    - Memory/storage constraints (QR10, QR11)
    """
    # Check if username already exists (QR17)
    existing_user = db.query(MobileUser).filter(
        MobileUser.username == user.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(MobileUser).filter(
        MobileUser.email == user.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check memory constraint (QR11)
    estimated_data_size_mb = len(user.json()) / (1024 * 1024)  # Convert to MB
    if not check_memory_constraint(estimated_data_size_mb):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Registration would exceed memory constraint (QR11)"
        )
    
    # Check storage constraint (QR10)
    current_stats = db.query(SystemStats).filter(
        SystemStats.stat_key == "storage_usage"
    ).first()
    
    if current_stats:
        current_usage = current_stats.stat_value.get("current_mb", 0)
        if not check_storage_constraint(current_usage, estimated_data_size_mb):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Registration would exceed storage constraint (QR10)"
            )
    
    # Create new user
    db_user = MobileUser(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        phone=user.phone
    )
    
    try:
        db.add(db_user)
        
        # Update storage stats
        if current_stats:
            current_stats.stat_value["current_mb"] += estimated_data_size_mb
            current_stats.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"New user registered: {user.username}")
        
        return db_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.get("/check-username/{username}")
async def check_username_availability(username: str, db: Session = Depends(get_db)):
    """Check if username is available (QR17)"""
    existing = db.query(MobileUser).filter(MobileUser.username == username).first()
    return {"available": existing is None}

@router.get("/check-email/{email}")
async def check_email_availability(email: str, db: Session = Depends(get_db)):
    """Check if email is available"""
    existing = db.query(MobileUser).filter(MobileUser.email == email).first()
    return {"available": existing is None}