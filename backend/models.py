from sqlalchemy import Column, String, Boolean, DateTime, Text, UUID, JSON
from sqlalchemy.sql import func
import uuid
from database import Base

class MobileUser(Base):
    __tablename__ = "mobile_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))

class RestaurantOwner(Base):
    __tablename__ = "restaurant_owners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=False)
    mobile_phone = Column(String(20))
    verification_status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True))
    verification_token = Column(UUID(as_uuid=True), default=uuid.uuid4)

class SystemStats(Base):
    __tablename__ = "system_stats"

    id = Column(Integer, primary_key=True)
    stat_key = Column(String(50), unique=True, nullable=False)
    stat_value = Column(JSON)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())