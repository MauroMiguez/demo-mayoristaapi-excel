function registrarDatos() {
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
      document.getElementById("clienteWarning").style.display = "block";
      return;
    }
  }

  document.getElementById("clienteWarning").style.display = "none";

  // ✔ Guardamos datos (para reutilizarlos)
  localStorage.setItem("cliente", JSON.stringify(cliente));

  // ✅ Mostramos mensaje de éxito
  const ok = document.getElementById("clienteSuccess");
  ok.style.display = "block";

  // Scroll sutil hacia el pedido
  document.querySelector(".pedido").scrollIntoView({ behavior: "smooth" });
}

function mostrarMensajeCliente() {
  document.getElementById("clienteOK").style.display = "block";
}

/* =========================
   ESTADO DEL PEDIDO
========================= */
let pedido = [];

/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarPedido(item) {
  const lista = document.getElementById("pedidoLista");
  const nuevoItem = document.createElement("div");
  nuevoItem.textContent = item;
  lista.appendChild(nuevoItem);

  // Mostrar la sección solo cuando hay pedidos
  document.getElementById("pedidoSeccion").classList.add("activo");

  // Actualizar total (ejemplo simple)
  actualizarTotal();
}

function actualizarTotal() {
  const lista = document.getElementById("pedidoLista").children;
  const total = lista.length; // aquí podrías sumar precios en vez de contar
  document.getElementById("pedidoTotal").textContent = "Total de ítems: " + total;
}

function enviarPedido() {
  alert("Pedido generado correctamente");
}

/* =========================
   RENDER PEDIDO (CARRITO)
========================= */
function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  if (!ul) return;

  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `
      <li style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <img src="${item.imagen}"
             style="width:40px;height:55px;object-fit:cover;border-radius:4px">

        <div style="flex:1">
          <strong>${item.producto}</strong><br>
          ${item.color}

          <select onchange="actualizarTalle(${index}, this.value)">
            ${item.talles.map(t =>
              `<option value="${t}" ${item.talle == t ? "selected" : ""}>
                Talle ${t}
              </option>`
            ).join("")}
          </select>

          x
          <input type="number" min="1" value="${item.cantidad}"
                 onchange="actualizarCantidad(${index}, this.value)"
                 style="width:60px">
        </div>

        <button onclick="eliminarItem(${index})">✕</button>
      </li>
    `;
  });
}

/* =========================
   EDITAR ITEM
========================= */
function actualizarTalle(index, value) {
  pedido[index].talle = value;
}

function actualizarCantidad(index, value) {
  pedido[index].cantidad = Number(value);
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

  const data = await res.json();

  if (!res.ok) {
    alert("Error al generar el pedido");
    return;
  }

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

  card.querySelectorAll(".thumb").forEach(t =>
    t.classList.remove("selected")
  );
  el.classList.add("selected");

  card.dataset.color = el.dataset.color || "Default";
}

