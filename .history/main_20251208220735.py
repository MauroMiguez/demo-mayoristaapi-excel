from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
from openpyxl import Workbook
from openpyxl.drawing.image import Image as XLImage
from datetime import datetime
from starlette.middleware.sessions import SessionMiddleware
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import smtplib
from email.message import EmailMessage


ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "24680")
SECRET_KEY = os.getenv("SECRET_KEY", "5e8c9f0a4d3b7c9e2a1f6b0c9d4a7e8f")

app = FastAPI(
    title="B2B Catalog API",
    description="Catálogo mayorista interactivo con generación automática de pedidos",
    version="1.1.0"
)

app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-key-cambiala"
)

@app.get("/admin")
def admin_login(request: Request):
    if request.session.get("admin"):
        return FileResponse("static/admin.html")

    return HTMLResponse("""
    <form method="post">
      <input name="password" placeholder="Password admin" type="password"/>
      <button>Entrar</button>
    </form>
    """)


@app.post("/admin")
async def admin_auth(request: Request):
    form = await request.form()

    if form.get("password") != ADMIN_PASSWORD:
        return HTMLResponse("Acceso denegado", status_code=401)

    request.session["admin"] = True
    return RedirectResponse("/admin", status_code=302)

@app.get("/admin/logout")
def admin_logout(request: Request):
    request.session.clear()
    return RedirectResponse("/admin", status_code=302)


# =========================
# PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORDERS_DIR = os.path.join(BASE_DIR, "orders")
os.makedirs(ORDERS_DIR, exist_ok=True)

# =========================
# MODELOS
# =========================
class Cliente(BaseModel):
    nombre: str
    empresa: str
    provincia: str
    ciudad: str
    cuit: str
    telefono: str
    observaciones: str = ""

class OrderItem(BaseModel):
    producto: str
    color: str
    talle: str
    cantidad: int
    imagen: str

class Order(BaseModel):
    cliente: Cliente
    items: List[OrderItem]


# =========================
# STORAGE TEMPORAL
# =========================
orders_db = []
order_id_counter = 1


def get_next_order_id():
    files = os.listdir(ORDERS_DIR)
    ids = []

    for f in files:
        if f.startswith("order_") and f.endswith(".xlsx"):
            try:
                ids.append(int(f.replace("order_", "").replace(".xlsx", "")))
            except:
                pass

    return max(ids, default=0) + 1

# =========================
# HELPERS
# =========================
def generate_excel(order_id: int, order: Order):
    wb = Workbook()
    ws = wb.active
    ws.title = "Pedido"

    ws.append(["PEDIDO #", order_id])
    ws.append([])
    ws.append(["Nombre", order.cliente.nombre])
    ws.append(["Empresa", order.cliente.empresa])
    ws.append(["Provincia", order.cliente.provincia])
    ws.append(["Ciudad", order.cliente.ciudad])
    ws.append(["CUIT", order.cliente.cuit])
    ws.append(["Teléfono", order.cliente.telefono]) 
    ws.append([])
    ws.append(["Producto", "Color", "Talle", "Cantidad", "Imagen"])

    row = 5 + len(order.cliente.dict()) + 1

    for item in order.items:
        ws.append([
            item.producto,
            item.color,
            item.talle,
            item.cantidad,
            ""  # celda imagen
        ])

    image_path = image_url_to_path(item.imagen)
                print("Insertando imagen:", image_path, "Existe?", os.path.exists(image_path))

        if image_path and os.path.exists(image_path):
            try:
                img = XLImage(image_path)  # debe ser .jpg o .png
                img.width = 80
                img.height = 100
                ws.add_image(img, f"E{row}")
                ws.row_dimensions[row].height = 80
                ws.column_dimensions["E"].width = 25
            except Exception as e:
                print("Error insertando imagen en Excel:", e)

              row += 1

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

def send_order_mail(to_email, excel_path, pdf_path):
    msg = EmailMessage()
    msg["Subject"] = "Nuevo pedido recibido"
    msg["From"] = os.getenv("EMAIL_FROM", "pedidos@tumarca.com")
    msg["To"] = to_email
    msg.set_content("Se adjunta el pedido en Excel y PDF.")

    for file in [excel_path, pdf_path]:
        with open(file, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype="application",
                subtype="octet-stream",
                filename=os.path.basename(file)
            )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(os.getenv("SMTP_USER", "TU_MAIL@gmail.com"), os.getenv("SMTP_PASS", "APP_PASSWORD"))
        smtp.send_message(msg)


# =========================
# ENDPOINTS
# =========================
def generate_pdf(order_id: int, order: Order):
    file_path = os.path.join(ORDERS_DIR, f"pedido_{order_id}.pdf")

    c = canvas.Canvas(file_path, pagesize=A4)
    y = 800

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Pedido #{order_id}")
    y -= 30

    c.setFont("Helvetica", 10)
    for k, v in order.cliente.dict().items():
        c.drawString(50, y, f"{k}: {v}")
        y -= 15

    y -= 20
    c.drawString(50, y, "Detalle:")
    y -= 20

    for item in order.items:
        c.drawString(
            50, y,
            f"{item.producto} | {item.color} | Talle {item.talle} | x {item.cantidad}"
        )
        y -= 15

        if y < 100:
            c.showPage()
            y = 800

    c.save()
    return file_path


 
# ✅ PUNTO 3.4 — HISTORIAL DE PEDIDOS
@app.get("/orders")
def list_orders():
    return orders_db


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

@app.get("/admin/orders")
def admin_list_orders():
    return orders_db


@app.post("/orders")
def create_order(order: Order):
    global order_id_counter

    order_id = get_next_order_id()

    # ✅ Generar archivos y GUARDAR rutas
    excel_path = generate_excel(order_id, order)
    pdf_path = generate_pdf(order_id, order)

    # ✅ Guardar pedido en memoria (admin)
    orders_db.append({
        "order_id": order_id,
        "fecha": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "cliente": order.cliente.dict(),
        "items": [item.dict() for item in order.items]
    })

    # ✅ Envío de mail (no rompe el server si falla)
    try:
        send_order_mail(
            "ventas@tumarca.com",
            excel_path,
            pdf_path
        )
    except Exception as e:
        print("Error enviando email:", e)

    return {
        "order_id": order_id,
        "excel_url": f"/orders/{order_id}/excel"
    }



# =========================
# STATIC (SIEMPRE AL FINAL)
# =========================
app.mount("/", StaticFiles(directory="static", html=True), name="static")
