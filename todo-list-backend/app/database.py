from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker, declarative_base 
DATABASE_URL = "postgresql://postgres:1972@localhost/todo-list" 
engine = create_engine(DATABASE_URL) 
SessionLocal = sessionmaker(bind=engine, autoflush=False) 
Base = declarative_base() 