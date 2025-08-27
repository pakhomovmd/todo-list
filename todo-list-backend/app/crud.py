from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta

from .database import SessionLocal
from . import models, database

SECRET_KEY = "supersecretkey"  # Замени на свой
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Зависимость
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db, username, password):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# # ----------- USERS ----------
# def create_user(db: Session, user: schemas.UserCreate):
#     hashed_pw = pwd_context.hash(user.password)
#     db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user

# def get_user(db: Session, user_id: int):
#     return db.query(models.User).filter(models.User.id == user_id).first()


# # ----------- PROJECTS ----------
# def create_project(db: Session, project: schemas.ProjectCreate):
#     db_project = models.Project(**project.dict())
#     db.add(db_project)
#     db.commit()
#     db.refresh(db_project)
#     return db_project

# def get_projects(db: Session):
#     return db.query(models.Project).all()


# # ----------- TASKS ----------
# def create_task(db: Session, task: schemas.TaskCreate, creator_id: int):
#     db_task = models.Task(**task.dict(), creator_id=creator_id)
#     db.add(db_task)
#     db.commit()
#     db.refresh(db_task)
#     return db_task

# def get_tasks(db: Session):
#     return db.query(models.Task).all()


# # ----------- COMMENTS ----------
# def create_comment(db: Session, comment: schemas.CommentCreate):
#     db_comment = models.Comment(**comment.dict())
#     db.add(db_comment)
#     db.commit()
#     db.refresh(db_comment)
#     return db_comment


# # ----------- TAGS ----------
# def create_tag(db: Session, tag: schemas.TagCreate):
#     db_tag = models.Tag(**tag.dict())
#     db.add(db_tag)
#     db.commit()
#     db.refresh(db_tag)
#     return db_tag

# def get_tags(db: Session):
#     return db.query(models.Tag).all()