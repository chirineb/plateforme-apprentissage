import asyncio
from app.db.database import engine, Base

# Importer tous les modèles ici pour les enregistrer
from app.models.user import User
from app.models.course import Course
from app.models.pdf import PDF
# from app.models.video import Video
from app.models.enrollment import Enrollment 

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())

