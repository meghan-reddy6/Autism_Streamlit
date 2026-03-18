from backend.app.main import app as backend_app

app = backend_app
application = backend_app

# Optional local dev fallback
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
