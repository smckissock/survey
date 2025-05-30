from sqlmodel import SQLModel, Field

class SurveyResponse(SQLModel, table=True):
    id: int = Field(primary_key=True)
    age: int
    gender: str
    zip_code: str
    city: str
    state: str
    income: int
    education_level: str
    q1_rating: int
    q2_rating: int
    q3_open: str
    q4_rating: int
    q5_open: str
    sentiment_label: str