# Autism Behavioural Checklist (TABC) Web Application

A modern, production-grade web application designed to evaluate behavioral traits for early autism detection. This project has been fully transformed from a single-file Streamlit prototype into a robust architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)

## ✨ Features
- **Clean UI**: A fully responsive, medical-grade interface built with TailwindCSS and Shadcn UI.
- **Secure Backend**: FastAPI serving as a blazingly fast backend with secure SQLAlchemy-managed PostgreSQL transactions.
- **ML Integration**: Integrated scikit-learn machine learning inference model to assist with behavioral predictions alongside traditional TABC rule-based scoring.
- **Visual Clinical Reports**: Deeply detailed, printable results pages featuring dynamic interactive Radar Charts (via Recharts).

---

## 🚀 Getting Started

You can run this project in two ways. **Option 1 (Docker)** is highly recommended as it sets up the frontend, backend, and PostgreSQL database seamlessly. **Option 2 (Local)** allows you to run development servers directly on your machine.

### Prerequisites (For both options)
- [Git](https://git-scm.com/downloads) installed on your system.

---

### 🐳 Option 1: Setup & Run with Docker (Recommended)

This is the fastest and easiest way to get the application running without worrying about dependencies.

**Requirements:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd Autism
   ```

2. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build -d
   ```
   *Note: The `-d` flag runs the containers in the background. The initial build might take a few minutes as it downloads the standard Node and Python images.*

3. **Verify the installation:**
   Once the terminal indicates the containers are running, navigate to:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Stopping the application:**
   To safely shut down the database and servers:
   ```bash
   docker-compose down
   ```

---

### 💻 Option 2: Setup & Run Manually (Local Development)

If you prefer to run the services individually on your host machine (great for active development), follow these steps. Local development automatically uses an isolated SQLite database (`autism.db`).

**Requirements:**
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/en/download/)

#### Step 1: Start the Backend (FastAPI)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd Autism/backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
3. Install dependencies and start the server:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The API will be live at [http://localhost:8000](http://localhost:8000).*

#### Step 2: Start the Frontend (Next.js)

1. Open a **new** terminal alongside the backend terminal and navigate to the frontend folder:
   ```bash
   cd Autism/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The Web UI will be live at [http://localhost:3000](http://localhost:3000).*

---

## 🧠 Machine Learning Model Information

The backend includes a RandomForest model trained on synthetic data to demonstrate how TABC scoring can be integrated into clinical pipelines. The serialized model file is located at `backend/tabc_model.joblib`. 

The core application logic encapsulates this model. If the `tabc_model.joblib` file is missing or fails to load, the API gracefully falls back to exactly reproducing the traditional static TABC rule-based interpretations without crashing.

### Retraining the Model
If you modify the training parameters, you can regenerate the model:
```bash
cd backend
python scripts/train_model.py
```
This will overwrite `tabc_model.joblib`. Restart the FastAPI server for the new model to take effect. If you're building a custom admin console, you can also trigger a retraining event programmatically via a `POST` request to `/api/admin/retrain`.

---

## 🛠️ Testing the Application

1. Open your browser and navigate to `http://localhost:3000`.
2. Click **Start Assessment**.
3. Fill out the **Patient & Guardian Details** form and accept the consent agreement.
4. Complete the multi-section **TABC Questionnaire**. (Ensure you answer all 20 questions across the 4 sections).
5. Submit the test. You will instantly be redirected to a beautifully structured **Clinical Report** detailing the overall score, the rule-based clinical interpretation, the ML prediction, and a behavioral radar chart breakdown. 

Enjoy exploring the TABC web application!
