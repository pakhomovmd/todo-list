from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ---------- User ----------
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    username: str
    email: str
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True


# ---------- Project ----------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    members: List[User] = []
    class Config:
        from_attributes = True


# ---------- Task ----------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    deadline: Optional[datetime] = None
    tag_ids: Optional[List[int]] = []
class Task(TaskBase):
    id: int
    completed: bool
    created_at: Optional[datetime]
    project_id: Optional[int]
    creator_id: Optional[int]

    assignees: Optional[List[User]] = []
    project: Optional[Project] = None
    creator: Optional[User] = None
    assignees: Optional[List[User]] = []

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    completed: bool

# ---------- Comment ----------
class CommentCreateBase(BaseModel):
    content: str
    author_id: int

class CommentCreate(CommentCreateBase):
    task_id: int  # для старого POST /comments/ эндпоинта

class Comment(BaseModel):
    id: int
    content: str
    author: Optional[User]

    class Config:
        from_attributes = True


# ---------- Tag ----------
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Assignment ----------
class AssignmentBase(BaseModel):
    user_id: int
    task_id: int

class AssignmentCreate(AssignmentBase):
    pass

class Assignment(AssignmentBase):
    id: int

    class Config:
        from_attributes = True

# ---------- TaskTag ----------
class TaskTagBase(BaseModel):
    pass

class TaskTagCreate(TaskTagBase):
    task_id: int
    id: int

class TaskTag(TaskTagBase):
    id: int  # если ты добавил id в модель связи

    class Config:
        from_attributes = True