# create_tables.py
from app.db.database import engine, Base
import app.models  # s'assure que tous les modèles sont importés

def create_all():
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès.")

if __name__ == "__main__":
    create_all()
