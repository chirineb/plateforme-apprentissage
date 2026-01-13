from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from app.db.database import init_db
from app.routers import user_routers,courses_routers, pdf_routers, enrollment_routers, chatbot_routers, quiz_routers
from app.api import auth
from app.routers import admin_routers

app = FastAPI(title="Smart Learning Platform")

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173"   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,
    allow_methods=["*"],
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
app.include_router(quiz_routers.router)
app.include_router(admin_routers.router)


@app.get("/")
async def root():
    return {"message": "API is running"}
