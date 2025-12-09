# imports
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()

# rutas base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORDERS_DIR = os.path.join(BASE_DIR, "orders")
os.makedirs(ORDERS_DIR, exist_ok=True)

# modelos
class OrderItem(BaseModel):
    producto: str
    color: str
    cantidad: int

class Order(BaseModel):
    cliente: str
    items: List[OrderItem]

# memoria temporal
orders_db = {}
order_id_counter = 1

# endpoints
@app.post("/orders")
def create_order(order: Order):
    global order_id_counter

    order_id = order_id_counter
    order_id_counter += 1

    orders_db[order_id] = order

    return {
        "order_id": order_id,
        "excel_url": f"/orders/{order_id}/excel"
    }

@app.get("/orders/{order_id}/excel")
def get_order_excel(order_id: int):
    file_path = os.path.join(ORDERS_DIR, f"order_{order_id}.xlsx")

    if not os.path.exists(file_path):
        return {"error": "Excel todavía no generado"}

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"pedido_{order_id}.xlsx"
    )

# static (SIEMPRE AL FINAL)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
