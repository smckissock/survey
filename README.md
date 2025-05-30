# Survey Data App


### Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate (Windows: source venv/bin/activate)
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
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Access App
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Frontend:** Open `frontend/index.html` in your browser


