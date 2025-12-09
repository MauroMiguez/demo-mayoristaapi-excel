from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI(
    title="DylanHost - B2B Orders API",
    version="0.1.0",
    description="API demo de pedidos mayoristas con PDF y Excel"
)


# ---------- DATA DEMO ----------
products = [
    {
        "id": 1,
        "name": "Remera Básica",
        "sku": "REM-001",
        "image": "https://via.placeholder.com/150",
        "variants": [
            {"id": 101, "color": "Negro", "size": "M", "price": 5000},
            {"id": 102, "color": "Blanco", "size": "L", "price": 5000}
        ]
    },
    {
        "id": 2,
        "name": "Buzo Canguro",
        "sku": "BUZ-002",
        "image": "https://via.placeholder.com/150",
        "variants": [
            {"id": 201, "color": "Gris", "size": "L", "price": 12000}
        ]
    }
]

# ---------- ENDPOINTS ----------
@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/products", tags=["Products"])
def get_products():
    return products

from fastapi import HTTPException
from openpyxl import Workbook
from fastapi.responses import StreamingResponse
import io

orders = []
order_counter = 1

@app.post("/orders", tags=["Orders"])
def create_order(order: dict):
    global order_counter
    
    new_order = {
        "id": order_counter,
        "client": order.get("client", "Cliente Demo"),
        "items": order.get("items", [])
    }
    orders.append(new_order)
    order_counter += 1

    return {
        "message": "Pedido creado correctamente",
        "order_id": new_order["id"]
    }

@app.get("/orders/{order_id}/excel")
def get_order_excel(order_id: int):
    file_path = f"orders/order_{order_id}.xlsx"

    if not os.path.exists(file_path):
        return {"error": f"No existe {file_path}"}

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"pedido_{order_id}.xlsx"
    )