from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from app.db.database import init_db
from app.routers import user_routers,courses_routers, pdf_routers, enrollment_routers, chatbot_routers
from app.api import auth

app = FastAPI(title="Smart Learning Platform")

origins = [
    "http://localhost:5173",  # ton frontend React (Vite)
    "http://127.0.0.1:5173"   # parfois Vite utilise cette adresse aussi
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Autoriser le frontend
    allow_credentials=True,
    allow_methods=["*"],             # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(auth.router)
app.include_router(user_routers.router)
app.include_router(courses_routers.router)
app.include_router(pdf_routers.router)
app.include_router(enrollment_routers.router)
app.include_router(chatbot_routers.router)


@app.get("/")
async def root():
    return {"message": "API is running"}
