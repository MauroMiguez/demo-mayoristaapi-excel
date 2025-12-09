/* =========================
   ESTADO GLOBAL
========================= */
let pedido = [];
let clienteRegistrado = false;
let datosCliente = null;

/* =========================
   REGISTRAR CLIENTE
========================= */
function registrarCliente() {
  const warning = document.getElementById("clienteWarning");
  const success = document.getElementById("clienteSuccess");

  const cliente = {
    nombre: nombre.value.trim(),
    empresa: empresa.value.trim(),
    provincia: provincia.value.trim(),
    cuit: cuit.value.trim(),
    telefono: telefono.value.trim(),
    observaciones: observaciones.value.trim()
  };

  for (let key in cliente) {
    if (!cliente[key] && key !== "observaciones") {
      warning.style.display = "block";
      return;
    }
  }

  warning.style.display = "none";
  success.style.display = "block";

  clienteRegistrado = true;
  datosCliente = cliente;

  localStorage.setItem("cliente", JSON.stringify(cliente));
}

/* =========================
   RESTAURAR CLIENTE
========================= */
window.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("cliente");
  if (!guardado) return;

  datosCliente = JSON.parse(guardado);
  clienteRegistrado = true;

  for (let key in datosCliente) {
    if (document.getElementById(key)) {
      document.getElementById(key).value = datosCliente[key];
    }
  }

  document.getElementById("clienteSuccess").style.display = "block";
});

/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarProducto(btn) {
  const card = btn.closest(".card");

  const producto = card.dataset.producto;
  const color = card.dataset.color;
  const imagen = card.querySelector(".main-img").src;
  const talle = card.querySelector(".size").value;
  const cantidad = Number(card.querySelector(".qty").value);

  if (!talle) return alert("Seleccioná un talle");
  if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");

  pedido.push({ producto, color, talle, cantidad, imagen });

  card.querySelector(".qty").value = "";
  card.querySelector(".size").value = "";

  renderPedido();
}

/* =========================
   RENDER PEDIDO
========================= */
function renderPedido() {
  const lista = document.getElementById("pedidoLista");
  lista.innerHTML = "";

  pedido.forEach((item, i) => {
    lista.innerHTML += `
      <div class="pedido-item">
        <img src="${item.imagen}" class="pedido-thumb">
        <div>
          <strong>${item.producto}</strong><br>
          Color: ${item.color}<br>
          <strong>Talle:</strong> ${item.talle}<br>
          <strong>Cantidad:</strong> ${item.cantidad}
        </div>
        <button onclick="eliminarItem(${i})">✖</button>
      </div>
    `;
  });
}

/* =========================
   ELIMINAR ITEM
========================= */
function eliminarItem(i) {
  pedido.splice(i, 1);
  renderPedido();
}

/* =========================
   ENVIAR PEDIDO
========================= */
async function enviarPedido() {

  if (!clienteRegistrado) {
    alert("Primero registrá tus datos");
    return;
  }

  if (pedido.length === 0) {
    alert("Agregá productos al pedido");
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
    alert("Error al generar pedido");
    return;
  }

  const data = await res.json();
  window.open(data.excel_url, "_blank");

  alert("✅ Pedido generado correctamente");
}
