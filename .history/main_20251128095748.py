from fastapi import FastAPI

app = FastAPI(title="B2B Order Demo")

@app.get("/")
def root():
    return {"status": "API OK"}
