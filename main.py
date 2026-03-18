from backend.app.main import app as backend_app

# Primary recognized entrypoint for hosting environments that scan for app/main/index/etc.
app = backend_app
application = backend_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
