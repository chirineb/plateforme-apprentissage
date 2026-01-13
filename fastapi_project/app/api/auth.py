from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.crud.crud import user_crud
from app.db.database import get_db
from app.schemas import schemas
from app.models.user import User


# Router
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = "supersecretkey"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



def verify_password(plain_password: str, db_password: str) -> bool:
    return plain_password == db_password

# Create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await user_crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


# Register
@router.post("/register", response_model=schemas.UserOut)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Vérifier si l'email existe déjà
    if await user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Vérifier si le username existe déjà
    if await user_crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Créer l'utilisateur
    new_user = await user_crud.create_user(db, user)
    
    # Convertir en Pydantic UserOut pour éviter le 400
    user_out = schemas.UserOut.from_orm(new_user)
    
    # Optionnel : debug
    print(user_out.dict())
    
    return user_out


# Login
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # form_data.username contient l'email dans notre cas
    user = await user_crud.get_user_by_email(db, form_data.username)
    
    #if not user or not user_crud.verify_password(form_data.password, user.hashed_password):
    if not user or not user_crud.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role.value}


# 🟣 Protected route example
@router.get("/me", response_model=schemas.UserOut)
async def read_current_user(current_user: schemas.UserOut = Depends(get_current_user)):
    return current_user


def verify_role(required_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient permissions"
            )
        return current_user
    return role_checker



