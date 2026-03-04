from pydantic import BaseModel, EmailStr, Field, validator
import re
from typing import Optional
from uuid import UUID
from datetime import datetime

# Mobile User Schemas
class MobileUserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[str] = None

class MobileUserCreate(MobileUserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class MobileUserResponse(MobileUserBase):
    id: UUID
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Restaurant Owner Schemas
class RestaurantOwnerBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    address: str = Field(..., min_length=10)
    phone: str = Field(..., min_length=10)
    mobile_phone: Optional[str] = None

class RestaurantOwnerCreate(RestaurantOwnerBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class RestaurantOwnerResponse(RestaurantOwnerBase):
    id: UUID
    verification_status: str
    created_at: datetime
    is_active: bool
    verification_token: UUID
    
    class Config:
        from_attributes = True

# System Stats Schemas
class SystemStatsResponse(BaseModel):
    memory_usage_mb: int
    storage_usage_mb: int
    system_health: str
    version: str
    
class HealthCheckResponse(BaseModel):
    status: str
    version: str
    database: str
    timestamp: datetime