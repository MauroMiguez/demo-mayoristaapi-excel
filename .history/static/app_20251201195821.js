<script>
let clienteRegistrado = false;
let datosCliente = {};
</script>



function registrarCliente() {
  const nombre = document.getElementById("nombre").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !empresa || !telefono) {
    alert("Completá los datos del cliente");
    return;
  }

  datosCliente = {
    nombre,
    empresa,
    provincia: document.getElementById("provincia").value,
    ciudad: document.getElementById("ciudad").value,
    cuit: document.getElementById("cuit").value,
    telefono,
    observaciones: document.getElementById("observaciones").value
  };

  clienteRegistrado = true;

  alert("✅ Datos del cliente guardados");
}


/* =========================
   ESTADO DEL PEDIDO
========================= */
let pedido = [];

/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarProducto(button) {
  const card = button.closest(".card");

  const producto = card.dataset.producto;
  const color = card.dataset.color || "Default";
  const imagen = card.querySelector(".main-img").src;

  const talles = card.dataset.talles
    ? card.dataset.talles.split(",")
    : [];

  const talleSelect = card.querySelector(".size");
  const talle = talleSelect ? talleSelect.value : "";

  const cantidad = Number(card.querySelector(".qty").value);

  if (!talle) {
    alert("Seleccioná un talle");
    return;
  }

  if (!cantidad || cantidad <= 0) {
    alert("Ingresá una cantidad válida");
    return;
  }

  pedido.push({
    producto,
    color,
    talle,
    cantidad,
    imagen,
    talles
  });

  renderPedido();
}

card.classList.add("added");

setTimeout(() => {
  card.classList.remove("added");
}, 400);


/* =========================
   RENDER PEDIDO (CARRITO)
========================= */
function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  const totalBox = document.getElementById("pedidoTotal");
  if (!ul) return;

  ul.innerHTML = "";
  let total = 0;

  pedido.forEach((item, index) => {
    const precio = 0; // luego real
    const subtotal = item.cantidad * precio;
    total += subtotal;

    ul.innerHTML += `
      <li style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <img src="${item.imagen}" style="width:40px;height:55px;object-fit:cover;border-radius:4px">
        <div style="flex:1">
          <strong>${item.producto}</strong><br>
          ${item.color} · Talle ${item.talle}
        </div>

        <input type="number" min="1" value="${item.cantidad}"
          style="width:60px"
          onchange="actualizarCantidad(${index}, this.value)">

        <button onclick="eliminarItem(${index})">✕</button>
      </li>
    `;
  });

  if (totalBox) {
    totalBox.innerHTML = `<strong>Total:</strong> $ ${total}`;
  }
}

/* =========================
   EDITAR ITEM
========================= */
function actualizarTalle(index, value) {
  pedido[index].talle = value;
}

function actualizarCantidad(index, valor) {
  const qty = Number(valor);
  if (qty > 0) {
    pedido[index].cantidad = qty;
    renderPedido();
  }
}

/* =========================
   ELIMINAR ITEM
========================= */
function eliminarItem(index) {
  pedido.splice(index, 1);
  renderPedido();
}

/* =========================
   ENVIAR PEDIDO → EXCEL
========================= */
async function enviarPedido() {
  const warning = document.getElementById("clienteWarning");

  const cliente = {
    nombre: document.getElementById("nombre").value.trim(),
    empresa: document.getElementById("empresa").value.trim(),
    provincia: document.getElementById("provincia").value.trim(),
    cuit: document.getElementById("cuit").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    observaciones: document.getElementById("observaciones").value.trim()
  };

  // ✅ campos obligatorios reales
  const requiredFields = ["nombre", "empresa", "provincia", "cuit", "telefono"];

  for (let field of requiredFields) {
    if (!cliente[field]) {
      warning.style.display = "block";
      document.querySelector(".cliente").scrollIntoView({ behavior: "smooth" });
      return;
    }
  }

  warning.style.display = "none";

  if (pedido.length === 0) {
    alert("Agregá al menos un producto al pedido");
    return;
  }

  if (!confirm("¿Confirmás el envío del pedido?")) return;

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente,
      items: pedido
    })
  });

  const data = await res.json();

  const link = document.createElement("a");
  link.href = data.excel_url;
  link.download = `pedido_${data.order_id}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("Pedido enviado correctamente ✅");
}


/* =========================
   CAMBIO DE IMAGEN / COLOR
========================= */
function changeImg(el) {
  const card = el.closest(".card");
  const mainImg = card.querySelector(".main-img");
  mainImg.src = el.src;

  card.querySelectorAll(".thumb").forEach(t =>
    t.classList.remove("selected")
  );
  el.classList.add("selected");

  card.dataset.color = el.dataset.color || "Default";
}

<td>${o.fecha}</td>

const mensaje = encodeURIComponent(
  `Nuevo pedido mayorista\n\n` +
  `Cliente: ${cliente.nombre}\n` +
  `Empresa: ${cliente.empresa}\n` +
  `CUIT: ${cliente.cuit}\n\n` +
  pedido.map(p =>
    `• ${p.producto} | ${p.color} | Talle ${p.talle} | x${p.cantidad}`
  ).join("\n") +
  `\n\nDescarga Excel:\n${window.location.origin}${data.excel_url}`
);

window.open(`https://wa.me/5491161736949?text=${mensaje}`, "_blank");
