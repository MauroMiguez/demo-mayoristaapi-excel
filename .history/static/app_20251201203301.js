
let clienteRegistrado = false;
let datosCliente = null;



const obligatorios = ["nombre", "empresa", "provincia", "cuit", "telefono"];

for (let key of obligatorios) {
  if (!cliente[key]) {
    warning.style.display = "block";
    document.querySelector(".cliente").scrollIntoView({ behavior: "smooth" });
    return;
  }
}

warning.style.display = "none";


function registrarCliente() {
  const warning = document.getElementById("clienteWarning");

  const cliente = {
    nombre: nombre.value.trim(),
    empresa: empresa.value.trim(),
    provincia: provincia.value.trim(),
    cuit: cuit.value.trim(),
    telefono: telefono.value.trim(),
    observaciones: observaciones.value.trim()
  };

  for (let k in cliente) {
    if (!cliente[k] && k !== "observaciones") {
      warning.style.display = "block";
      document.querySelector(".cliente").scrollIntoView({ behavior: "smooth" });
      return;
    }
  }

  warning.style.display = "none";

  clienteRegistrado = true;
  datosCliente = cliente;

  localStorage.setItem("cliente", JSON.stringify(cliente));
  document.getElementById("clienteSuccess").style.display = "block";

  document.querySelector(".pedido").scrollIntoView({ behavior: "smooth" });
}


window.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("cliente");
  if (!guardado) return;

  datosCliente = JSON.parse(guardado);
  clienteRegistrado = true;

  for (let k in datosCliente) {
    if (document.getElementById(k)) {
      document.getElementById(k).value = datosCliente[k];
    }
  }

  document.getElementById("clienteSuccess").style.display = "block";
});


/* =========================
   ESTADO DEL PEDIDO
========================= */
let pedido = [];

/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarProducto(btn) {
  const card = btn.closest(".card");

  const talle = card.querySelector(".size").value;
  const cantidad = parseInt(card.querySelector(".qty").value);

  if (!talle || !cantidad || cantidad <= 0) {
    alert("Completá talle y cantidad");
    return;
  }

  pedido.push({
    producto: card.dataset.producto,
    color: card.dataset.color,
    talle,
    cantidad,
    imagen: card.querySelector(".main-img").src
  });

  actualizarPedidoUI();

  card.classList.add("added");
  setTimeout(() => card.classList.remove("added"), 300);
}



function actualizarPedidoUI() {
  const lista = document.getElementById("pedidoLista");
  lista.innerHTML = "";

  pedido.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "pedido-item";

    div.innerHTML = `
      <img src="${item.imagen}" class="pedido-thumb">

      <div class="pedido-info">
        <strong>${item.producto}</strong><br>
        Color: ${item.color}<br>
        <strong>Talle:</strong> ${item.talle} <br>
        <strong>Cantidad:</strong> ${item.cantidad}
      </div>

      <button onclick="eliminarItem(${index})">✖</button>
    `;

    lista.appendChild(div);
  });
}


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
  if (!clienteRegistrado) {
    alert("Registrá tus datos primero");
    return;
  }

  if (!pedido.length) {
    alert("El pedido está vacío");
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
    alert("Error al generar pedido");
    return;
  }

  window.location.href = data.excel_url;
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
