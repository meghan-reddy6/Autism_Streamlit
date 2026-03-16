# Thundersoft Autism Behavioural Checklist (TABC)

This project has been transformed from a single-file Streamlit prototype into a modern, production-grade web application using:

- **Frontend**: Next.js (React), TailwindCSS, Shadcn UI, Zustand
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL
- **Deployment ready**: Docker Compose

## Features

- Fully responsive, medical-grade clean UI.
- Secure backend API to store patient responses.
- Prepared for scalable database integrations.
- Structured logic scoring for TABC assessments.

## Prerequisites

- Docker and Docker Compose
- (Optional) Node.js 18+ and Python 3.11+ for local development without Docker

## Setup & Run (Docker)

To run the entire stack (Database, Backend API, Frontend Web):

1. **Clone and enter the directory**:

   ```bash
   cd d:\Thundersoft\Autism
   ```

2. **Run Docker Compose**:

   ```bash
   docker-compose up --build
   ```

3. **Access the Application**:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

Note: On the very first run, Alembic migrations (if added) should be applied to create the database tables. If skipping Alembic, SQLAlchemy's `Base.metadata.create_all` can be used to initialize the schema. Since this runs `uvicorn`, ensure you configure your schema creation policy properly in `database.py`.

## Future Improvements for ML Integration

This structure allows deep learning endpoints to be added modularly to the `backend/app/api/` folder. The React frontend is set up with generic components to handle features like Image Uploads for MRI data through the `Admin Dashboard`.

## ML Model: training & troubleshooting

The backend includes a small RandomForest model trained on synthetic examples to demonstrate how the TABC scoring could be consumed by an ML model. The model file is expected at `backend/tabc_model.joblib`.

To (re)train the model locally and regenerate `tabc_model.joblib`:

1. Create and activate a Python environment (Windows example):

```powershell
cd d:\Thundersoft\Autism\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # or use activate.bat on cmd
pip install --upgrade pip
pip install -r requirements.txt
```

2. Run the training script:

```powershell
python ..\backend\scripts\train_model.py
# This writes tabc_model.joblib into the current working directory (backend/) which the API will load
```

3. Restart the backend (if running via Docker, rebuild the image) so the new model is loaded.

Notes and troubleshooting:

- The project `requirements.txt` pins `scikit-learn==1.4.1.post1`. If you train using a different scikit-learn version you may see a warning about "Trying to unpickle estimator ..." when the API loads the model. The safest approach is to train and run inference with the same scikit-learn version.
- If the API prints "Failed to load ML model" on startup, confirm `backend/tabc_model.joblib` exists and the Python environment used to train matches the runtime environment. The API will fall back to rule-based scoring when the model is missing.
- The predictor returns a human-readable label (for example "Severely Autistic") and, when available from the model, a parenthesized confidence (e.g. `Severely Autistic (0.92)`). The frontend displays this text directly in the report.

If you'd like, I can add a small `Makefile` or npm scripts to simplify training and local runs, or add an admin API to retrain in-place — tell me which you'd prefer.

Admin retrain endpoint
----------------------

For convenience there is an admin endpoint that retrains the model in-place and reloads it into the running API:

1. POST to `/api/admin/retrain` (no auth in this development build).
2. The endpoint runs the training script and attempts to reload `backend/tabc_model.joblib` into memory.
3. The JSON response contains the training stdout/stderr, return code, and whether the model reload succeeded.

Use this in development only; add authentication before enabling on any public host.
