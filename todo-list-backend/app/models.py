from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# -- Связующая таблица "назначений пользователей на задачи" (многие-ко-многим)
task_assignments = Table(
    "task_assignments",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("task_id", Integer, ForeignKey("tasks.id"))
)

# -- Связующая таблица для тегов
task_tags = Table(
    "task_tags",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id")),
    Column("tag_id", Integer, ForeignKey("tags.id"))
)

project_members = Table(
    'project_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('project_id', Integer, ForeignKey('projects.id'))
)

# -- Пользователь
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    tasks_created = relationship("Task", back_populates="creator")
    assigned_tasks = relationship("Task", secondary=task_assignments, back_populates="assignees")
    comments = relationship("Comment", back_populates="author")
    projects = relationship("Project", secondary=project_members, back_populates="members")

# -- Проект

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    
    tasks = relationship("Task", back_populates="project")
    members = relationship("User", secondary=project_members, back_populates="projects")

# -- Задача
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    completed = Column(Boolean, default=False)
    deadline = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    project_id = Column(Integer, ForeignKey("projects.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))

    project = relationship("Project", back_populates="tasks")
    creator = relationship("User", back_populates="tasks_created")
    assignees = relationship("User", secondary=task_assignments, back_populates="assigned_tasks")
    comments = relationship("Comment", back_populates="task")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")

# -- Комментарий
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author_id = Column(Integer, ForeignKey("users.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))

    author = relationship("User", back_populates="comments")
    task = relationship("Task", back_populates="comments")

# -- Метка (тег)
class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"))

    tasks = relationship("Task", secondary=task_tags, back_populates="tags")