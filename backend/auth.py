from passlib.context import CryptContext
from datetime import datetime
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def check_memory_constraint(data_size_mb: float) -> bool:
    """Check if operation would exceed 20MB memory constraint (QR11)"""
    MAX_MEMORY_MB = 20
    return data_size_mb <= MAX_MEMORY_MB

def check_storage_constraint(current_usage_mb: float, new_data_mb: float) -> bool:
    """Check if operation would exceed 20MB storage constraint (QR10)"""
    MAX_STORAGE_MB = 20
    return (current_usage_mb + new_data_mb) <= MAX_STORAGE_MB