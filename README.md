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
