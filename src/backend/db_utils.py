import csv
from pathlib import Path
from sqlmodel import SQLModel, Session, create_engine
from .survey import SurveyResponse

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
CSV_PATH = DATA_DIR / "us_ai_survey_unique_50.csv"
DB_PATH = DATA_DIR / "database.db"
engine = create_engine(f"sqlite:///{DB_PATH}")

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def load_csv_and_insert():
    with CSV_PATH.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        records = [
            SurveyResponse(
                id=int(row["id"]),
                age=int(row["age"]),
                gender=row["gender"],
                zip_code=row["zip_code"],
                city=row["city"],
                state=row["state"],
                income=row["income"],
                education_level=row["education_level"],
                q1_rating=int(row["q1_rating"]),
                q2_rating=int(row["q2_rating"]),
                q3_open=row["q3_open"],
                q4_rating=int(row["q4_rating"]),
                q5_open=row["q5_open"],
                sentiment_label=row["sentiment_label"]
            )
            for row in reader
        ]

    with Session(engine) as session:
        session.add_all(records)
        session.commit()