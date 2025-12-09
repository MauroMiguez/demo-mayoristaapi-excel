/* =========================
   ESTADO GLOBAL
========================= */
let pedido = [];

let clienteRegistrado = false;
let datosCliente = null;


/* =========================
   REGISTRO DE CLIENTE
========================= */
function registrarCliente() {
  const warning = document.getElementById("clienteWarning");
  const success = document.getElementById("clienteSuccess");

  const cliente = {
    nombre: document.getElementById("nombre").value.trim(),
    empresa: document.getElementById("empresa").value.trim(),
    provincia: document.getElementById("provincia").value.trim(),
    cuit: document.getElementById("cuit").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    observaciones: document.getElementById("observaciones").value.trim()
  };

  const obligatorios = ["nombre", "empresa", "provincia", "cuit", "telefono"];

  for (let key of obligatorios) {
    if (!cliente[key]) {
      warning.style.display = "block";
      return;
    }
  }

  warning.style.display = "none";

  clienteRegistrado = true;
  datosCliente = cliente;

  localStorage.setItem("cliente", JSON.stringify(cliente));

  success.style.display = "block";

  document.querySelector(".pedido").scrollIntoView({ behavior: "smooth" });
}


/* =========================
   CARGA CLIENTE GUARDADO
========================= */
window.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("cliente");
  if (!guardado) return;

  const cliente = JSON.parse(guardado);

  Object.keys(cliente).forEach(k => {
    const input = document.getElementById(k);
    if (input) input.value = cliente[k];
  });

  clienteRegistrado = true;
  datosCliente = cliente;

  document.getElementById("clienteSuccess").style.display = "block";
});


/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarProducto(btn) {
  const card = btn.closest(".card");

  const producto = card.dataset.producto;
  const color = card.dataset.color || "Default";
  const imagen = card.querySelector(".main-img").src;

  const talle = card.querySelector(".size").value;
  const cantidad = parseInt(card.querySelector(".qty").value);

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
    imagen
  });

  card.querySelector(".qty").value = "";
  card.querySelector(".size").value = "";

  actualizarPedidoUI();
}


/* =========================
   MOSTRAR PEDIDO
========================= */
function actualizarPedidoUI() {
  const lista = document.getElementById("pedidoLista");
  lista.innerHTML = "";

  pedido.forEach((item, index) => {
    lista.innerHTML += `
      <div class="pedido-item">
        <img src="${item.imagen}" class="pedido-thumb">

        <div class="pedido-info">
          <strong>${item.producto}</strong><br>
          Color: ${item.color}<br>
          <strong>Talle: ${item.talle}</strong><br>
          Cantidad: ${item.cantidad}
        </div>

        <button class="remove-btn" onclick="eliminarItem(${index})">✖</button>
      </div>
    `;
  });
}


/* =========================
   ELIMINAR ITEM
========================= */
function eliminarItem(index) {
  pedido.splice(index, 1);
  actualizarPedidoUI();
}


/* =========================
   ENVIAR PEDIDO
========================= */
async function enviarPedido() {

  if (!clienteRegistrado || !datosCliente) {
    alert("Primero debés registrar tus datos de cliente");
    document.querySelector(".cliente").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (pedido.length === 0) {
    alert("Agregá al menos un producto al pedido");
    return;
  }

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente: datosCliente,
      items: pedido
    })
  });

  if (!res.ok) {
    alert("Error al generar el pedido");
    return;
  }

  const data = await res.json();

  const link = document.createElement("a");
  link.href = data.excel_url;
  link.download = `pedido_${data.order_id}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  alert("✅ Pedido generado correctamente");
}


/* =========================
   CAMBIO DE IMAGEN / COLOR
========================= */
function changeImg(el) {
  const card = el.closest(".card");
  const mainImg = card.querySelector(".main-img");
  mainImg.src = el.src;

  card.querySelectorAll(".thumb").forEach(t => t.classList.remove("selected"));
  el.classList.add("selected");

  card.dataset.color = el.dataset.color || "Default";
}
