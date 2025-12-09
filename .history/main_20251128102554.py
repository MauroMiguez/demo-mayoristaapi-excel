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
@app.get("/", tags=["System"])
def root():
    return {"status": "API OK"}

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

@app.get("/orders/{order_id}/excel", tags=["Orders"])
def get_order_excel(order_id: int):
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    wb = Workbook()
    ws = wb.active
    ws.title = "Pedido"

    ws.append(["Producto", "Color", "Talle", "Cantidad"])

    for item in order["items"]:
        ws.append([
            item.get("product"),
            item.get("color"),
            item.get("size"),
            item.get("quantity")
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=pedido_{order_id}.xlsx"
        }
    )
