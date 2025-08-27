from fastapi import FastAPI
from app import models, database
from routes import router
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="To-Do Tracker API")

# 👇 Разрешаем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или ["*"] для всех
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты
app.include_router(router)