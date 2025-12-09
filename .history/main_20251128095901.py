from fastapi import FastAPI

app = FastAPI(
    title="DylanHost - B2B Orders API",
    version="0.1.0",
    description="API demo de pedidos mayoristas con PDF y Excel"
)

@app.get("/")
def read_root():
    return {"status": "API OK"}

