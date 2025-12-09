from fastapi import FastAPI

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
from fastapi.responses import FileResponse
import os

@app.get("/orders/{order_id}/excel")
def get_order_excel(order_id: int):
    file_path = f"orders/order_{order_id}.xlsx"

    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"pedido_{order_id}.xlsx"
    )
