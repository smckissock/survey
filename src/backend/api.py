from fastapi import FastAPI, UploadFile, File, HTTPException
from sqlmodel import Session, select
from .survey import SurveyResponse
from .db_utils import engine, create_db_and_tables, load_csv_and_insert
import shutil
from pathlib import Path

app = FastAPI()


@app.get("/surveys")
def get_all_surveys():
    with Session(engine) as session:
        results = session.exec(select(SurveyResponse)).all()
        return results

@app.get("/surveys/{survey_name}")
def get_surveys_by_name(survey_name: str):
    with Session(engine) as session:
        # Add filter for survey_name if field is added
        results = session.exec(select(SurveyResponse)).all()
        return results

@app.get("/questions/{question_id}")
def get_responses_to_question(question_id: str):
    QUESTION_FIELDS = {
        "q1_rating",
        "q2_rating",
        "q3_open",
        "q4_rating",
        "q5_open"
    }

    if question_id not in QUESTION_FIELDS:
        raise HTTPException(status_code=400, detail=f"'{question_id}' is not a question ID")

    with Session(engine) as session:
        results = session.exec(select(SurveyResponse)).all()
        return [
            {
                "id": r.id,
                question_id: getattr(r, question_id)
            }
            for r in results
        ]

@app.post("/upload")
def upload_csv(file: UploadFile = File(...)):
    data_path = Path(__file__).resolve().parents[2] / "data" / "survey.csv"
    try:
        with open(data_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        load_csv_and_insert()
        return {"detail": "File uploaded and data refreshed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
