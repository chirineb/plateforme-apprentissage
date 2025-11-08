# app/db/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# URL de la base PostgreSQL asynchrone (avec asyncpg)
DATABASE_URL = os.getenv("DATABASE_URL")

# Exemple de valeur dans .env :
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/elearning_db

# ✅ Créer le moteur asynchrone
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# ✅ Créer la session asynchrone
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ✅ Classe de base pour les modèles
Base = declarative_base()

# ✅ Dépendance FastAPI (pour les routes)
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# ✅ Fonction d’initialisation de la base (création des tables)
# app/db/database.py
async def init_db():
    # ✅ IMPORTS DES MODÈLES ICI, après Base
    from app.models.user import User
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        