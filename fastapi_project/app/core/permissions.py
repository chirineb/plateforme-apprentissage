from fastapi import Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.user import RoleEnum, User

def allow_roles(*roles: RoleEnum):
    def checker(current_user: User = Depends(get_current_user)):
        print("USER ROLE:", current_user.role)
        print("ALLOWED ROLES:", roles)
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )
        return current_user
    return checker

