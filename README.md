# Survey Data App

Questions and answers mean nothing! This is for prototyping UI interactions and rendering for any survey data. 

### [Live link](https://smckissock.github.io/survey/)  


#### 1. Backend API- SqlModel for an ORM because it works well with FastApi
- SQLite for ease of configuration, but usually I would use postgresql
- pyproject.toml for dev and prod requirements, etc
- I didn't setup up tests, black, mypy etc, but orginarily they would be run in pre-commit
- I would ordinarily set up a github action for deployement
- The api ignores survey_name in /surveys/{survey_name} but that could be added if the column is added later
- upload method for populating the db from a csv. As is, it isn't robust - it needs methods to either default sensible values for malformed data, or reject the record in some cases
- If data is read much more than it is written, reddis or static json files could be used to improve scalability and performance   
### 2. Frontend
- vanilla js with d3.js and dc.js for filtering the data. Crossfilter.js for in-browser analytics
- Minimal css with no framework 
- This approach works with as many as 100k-300k records in the browser
- crossfilter.js used for in-browser data management
- dc.js used for row charts, custom crossfilter charts for states, and scatter with best fit line 
### 3. Infrastructure
- Very basic setup, no postgresql
- For now, no precommit hooks to assure code quality, and no github actions for deployment, but those would be needed


## Setup

### Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate (Windows: venv/Scripts/activate)
```

### Install Dependencies

**Development**
```bash
pip install -e ".[dev]"
```

**Production**
```bash
pip install -e .
```

### Setup Database
```bash
python scripts/setup_db.py
```

### Start Server
```bash
uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
```

Access App
- **Backend API:** http://localhost:8000
- **API Documentation/Testing:** http://localhost:8000/docs
- **Frontend:** http://127.0.0.1:8000/app


