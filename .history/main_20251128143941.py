from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage

app = FastAPI(
    title="DylanHost B2B Catalog API",
    description="Catálogo mayorista interactivo con generación automática de pedidos",
    version="1.1.0"
)

# =========================
# PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORDERS_DIR = os.path.join(BASE_DIR, "orders")
os.makedirs(ORDERS_DIR, exist_ok=True)

# =========================
# MODELOS
# =========================
class OrderItem(BaseModel):
    producto: str
    color: str
    talle: str
    cantidad: int
    imagen: str | None = None



class Order(BaseModel):
    cliente: str
    items: List[OrderItem]

# =========================
# STORAGE TEMPORAL
# =========================
orders_db = {}
order_id_counter = 1

# =========================
# HELPERS
# =========================
def generate_excel(order_id: int, order: Order):
    wb = Workbook()
    ws = wb.active
    ws.title = "Pedido"

    ws.append(["Pedido #", order_id])
    ws.append(["Cliente", order.cliente])
    ws.append([])
    ws.append(["Producto", "Color", "Talle", "Cantidad", "Imagen"])

    for item in order.items:
        ws.append([
            item.producto,
            item.color,
            item.talle,
            item.cantidad,
            item.imagen
        ])

    file_path = os.path.join(ORDERS_DIR, f"order_{order_id}.xlsx")
    wb.save(file_path)

    return file_path


def image_url_to_path(image_url: str):
    """
    Convierte http://127.0.0.1:8000/images/x.jpg
    a static/images/x.jpg
    """
    if not image_url:
        return None

    if "/images/" in image_url:
        return os.path.join(BASE_DIR, "static", image_url.split("/images/")[1])

    return None

# =========================
# ENDPOINTS
# =========================
@app.post("/orders")
def create_order(order: Order):
    global order_id_counter

    order_id = order_id_counter
    order_id_counter += 1

    orders_db[order_id] = order
    generate_excel(order_id, order)

    return {
        "order_id": order_id,
        "excel_url": f"/orders/{order_id}/excel"
    }

@app.get("/orders/{order_id}/excel")
def get_order_excel(order_id: int):
    file_path = os.path.join(ORDERS_DIR, f"order_{order_id}.xlsx")

    if not os.path.exists(file_path):
        return {"error": "El Excel no existe"}

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"pedido_{order_id}.xlsx"
    )

# =========================
# STATIC (SIEMPRE AL FINAL)
# =========================
app.mount("/", StaticFiles(directory="static", html=True), name="static")
