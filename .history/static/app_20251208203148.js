let pedido = [];
let datosCliente = null;
let clienteRegistrado = false;

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
  localStorage.setItem("cliente", JSON.stringify(cliente));

  datosCliente = cliente;
  clienteRegistrado = true;

  document.getElementById("clienteSuccess").style.display = "block";
  document.querySelector(".pedido").scrollIntoView({ behavior: "smooth" });
}


function agregarPedido(item) {
  const lista = document.getElementById("pedidoLista");
  const nuevoItem = document.createElement("div");
  nuevoItem.textContent = item;
  lista.appendChild(nuevoItem);

  // Mostrar la sección
  document.getElementById("pedidoSeccion").classList.add("activo");

  actualizarTotal();
}

function actualizarTotal() {
  document.getElementById("pedidoTotal").textContent = "Total de ítems: " + pedido.length;
}

function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  if (!ul) return;

  ul.innerHTML = pedido.map((item, index) => `
    <li style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <img src="${item.imagen}" style="width:40px;height:55px;object-fit:cover;border-radius:4px">
      <div style="flex:1">
        <strong>${item.producto}</strong><br>${item.color}
        <select onchange="actualizarTalle(${index}, this.value)">
          ${item.talles.map(t => `<option value="${t}" ${item.talle == t ? "selected" : ""}>Talle ${t}</option>`).join("")}
        </select>
        x
        <input type="number" min="1" value="${item.cantidad}" onchange="actualizarCantidad(${index}, this.value)" style="width:60px">
      </div>
      <button onclick="eliminarItem(${index})">✕</button>
    </li>
  `).join("");
}

function actualizarTalle(index, value) { pedido[index].talle = value; }
function actualizarCantidad(index, value) { pedido[index].cantidad = Number(value); }
function eliminarItem(index) { pedido.splice(index, 1); renderPedido(); }

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
    body: JSON.stringify({ cliente: datosCliente, items: pedido })
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