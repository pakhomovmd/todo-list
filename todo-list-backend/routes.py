from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas, database, crud
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

# Зависимость
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------
# Пользователи
# ------------------------------

@router.post("/users/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password = pwd_context.hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = crud.create_access_token(data = {"sub": str(user.id), "username": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/all", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@router.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.get("/users/{username}/stats")
def get_user_stats(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    created_tasks_count = db.query(models.Task).filter(models.Task.creator_id == user.id).count()
    completed_tasks_count = db.query(models.Task).filter(models.Task.creator_id == user.id, models.Task.completed == True).count()
    active_tasks_count = db.query(models.Task).filter(models.Task.creator_id == user.id, models.Task.completed == False).count()
    projects_count = db.query(models.Project).filter(models.Project.members.any(id=user.id)).count()

    return {
        "createdTasks": created_tasks_count,
        "completedTasks": completed_tasks_count,
        "activeTasks": active_tasks_count,
        "projectsCount": projects_count
    }

# ------------------------------
# Проекты
# ------------------------------

@router.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    new_project = models.Project(
        name=project.name,
        description=project.description,
        #owner_id=project.owner_id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.post("/projects/{project_id}/add_user")
def add_user_to_project(project_id: int, user_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).options(joinedload(models.Project.members)).get(project_id)
    user = db.query(models.User).get(user_id)
    if not project or not user:
        raise HTTPException(status_code=404, detail="Project or User not found")
    if user not in project.members:
        project.members.append(user)
        db.commit()
    return {"message": f"User {user.username} added to project {project.name}"}

@router.get("/projects/", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@router.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Not found")
    return project

@router.post("/projects/{project_id}/tasks")
def attach_task_to_project(project_id: int, task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.project_id = project_id
    db.commit()
    return {"detail": "Task attached to project"}


# ------------------------------
# Задачи
# ------------------------------

@router.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    new_task = models.Task(
        title=task.title,
        description=task.description,
        project_id=task.project_id,
        deadline=task.deadline
    )
    db.add(new_task)

    # Привязываем теги, если есть
    if task.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(task.tag_ids)).all()
        new_task.tags = tags

    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/tasks/all", response_model=List[schemas.Task])
def get_all_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    return tasks

@router.get("/tasks/{project_id}", response_model=List[schemas.Task])
def get_tasks(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.Task).filter(models.Task.project_id == project_id).all()

@router.get("/tasks/detail/{task_id}", response_model=schemas.Task)
def get_task_detail(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/{task_id}/comments", response_model=List[schemas.Comment])
def get_comments(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task.comments


@router.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task_completed(task_id: int, task_data: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = task_data.completed
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/delete/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None  # 204 No Content — тело не возвращаем

@router.patch("/tasks/{task_id}")
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task_update.completed is not None:
        task.completed = task_update.completed
    db.commit()
    return task


@router.get("/tasks")
def get_user_tasks(user: str, limit: int = 5, sort: str = "recent", db: Session = Depends(get_db)):
    user_obj = db.query(models.User).filter(models.User.username == user).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(models.Task).filter(models.Task.creator_id == user_obj.id)

    if sort == "recent":
        query = query.order_by(models.Task.created_at.desc())

    tasks = query.limit(limit).all()

    return tasks

# @router.get("/tasks/{task_id}", response_model=schemas.TaskDetail)
# def get_task(task_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
#     task = db.query(models.Task).filter(models.Task.id == task_id).first()
#     if not task:
#         raise HTTPException(status_code=404, detail="Task not found")
#     return task


# ------------------------------
# Комментарии
# ------------------------------

@router.post("/tasks/{task_id}/comments", response_model=schemas.Comment)
def add_comment_to_task(task_id: int, comment_data: schemas.CommentCreateBase, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_comment = models.Comment(
        content=comment_data.content,
        task_id=task_id,
        author_id=comment_data.author_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


@router.get("/comments/{task_id}", response_model=List[schemas.Comment])
def get_comments(task_id: int, db: Session = Depends(get_db)):
    return db.query(models.Comment).filter(models.Comment.task_id == task_id).all()

@router.delete("/tasks/{task_id}/comments/{comment_id}", status_code=204)
def delete_comment(task_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id, models.Comment.task_id == task_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return None

# ------------------------------
# Назначения (Assignments)
# ------------------------------

@router.post("/assignments/")
def assign_user(data: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == data.task_id).first()
    user = db.query(models.User).filter(models.User.id == data.user_id).first()

    if not task or not user:
        raise HTTPException(status_code=404, detail="Task or User not found")

    if user not in task.assignees:
        task.assignees.append(user)
        db.commit()
    
    return {"user_id": user.id, "task_id": task.id}


@router.get("/assignments/{task_id}", response_model=List[schemas.Assignment])
def get_task_assignments(task_id: int, db: Session = Depends(get_db)):
    return db.query(models.task_assignments).filter(models.task_assignments.task_id == task_id).all()

# ------------------------------
# Теги и связи TaskTag
# ------------------------------

@router.post("/tags/", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    new_tag = models.Tag(name=tag.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

@router.post("/task-tags/")
def link_task_tag(link: schemas.TaskTagCreate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == link.task_id).first()
    tag = db.query(models.Tag).filter(models.Tag.id == link.id).first()
    task.tags.append(tag)  # 'tags' — это relationship в модели Task
    db.commit()
    return {"message": "Тег привязан к задаче"}

@router.get("/task-tags/{task_id}", response_model=List[schemas.Tag])
def get_tags_for_task(task_id: int, db: Session = Depends(get_db)):
    task_tags = db.query(models.Tag).filter(models.Tag.task_id == task_id).all()
    tag_ids = [tt.id for tt in task_tags]
    return db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()

@router.get("/tags/all", response_model=List[schemas.Tag])
def get_all_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()