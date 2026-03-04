from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os
import logging

from database import get_db, engine
from models import Base, SystemStats
from routers import users, owners

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Amazing Lunch Indicator API",
    description="Backend API for ALI - Sprint 1",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(owners.router)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "app": "Amazing Lunch Indicator API",
        "version": "0.1.0",
        "sprint": 1,
        "status": "operational",
        "endpoints": {
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with system status (QR22 - Internet Connection)"""
    try:
        # Check database connection
        db.execute("SELECT 1")
        db_status = "connected"
        
        # Get system stats
        memory_stats = db.query(SystemStats).filter(
            SystemStats.stat_key == "memory_usage"
        ).first()
        
        storage_stats = db.query(SystemStats).filter(
            SystemStats.stat_key == "storage_usage"
        ).first()
        
        return {
            "status": "healthy",
            "version": "0.1.0",
            "database": db_status,
            "timestamp": datetime.utcnow().isoformat(),
            "constraints": {
                "memory_usage_mb": memory_stats.stat_value.get("current_mb", 0) if memory_stats else 0,
                "memory_limit_mb": 20,
                "storage_usage_mb": storage_stats.stat_value.get("current_mb", 0) if storage_stats else 0,
                "storage_limit_mb": 20
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "version": "0.1.0",
            "database": "disconnected",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Get system metrics for monitoring (QR10, QR11)"""
    memory_stats = db.query(SystemStats).filter(
        SystemStats.stat_key == "memory_usage"
    ).first()
    
    storage_stats = db.query(SystemStats).filter(
        SystemStats.stat_key == "storage_usage"
    ).first()
    
    user_count = db.query(users.MobileUser).count()
    owner_count = db.query(owners.RestaurantOwner).count()
    
    return {
        "users": {
            "mobile_users": user_count,
            "restaurant_owners": owner_count,
            "total": user_count + owner_count
        },
        "constraints": {
            "current_memory_mb": memory_stats.stat_value.get("current_mb", 0) if memory_stats else 0,
            "max_memory_mb": 20,
            "memory_usage_percent": (memory_stats.stat_value.get("current_mb", 0) / 20 * 100) if memory_stats else 0,
            "current_storage_mb": storage_stats.stat_value.get("current_mb", 0) if storage_stats else 0,
            "max_storage_mb": 20,
            "storage_usage_percent": (storage_stats.stat_value.get("current_mb", 0) / 20 * 100) if storage_stats else 0
        }
    }