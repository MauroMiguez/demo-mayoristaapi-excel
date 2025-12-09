let pedido = [];

/* =========================
   AGREGAR PRODUCTO
========================= */
function agregarProducto(button) {
  const card = button.closest(".card");

  const producto = card.dataset.producto;
  const color = card.dataset.color || "Default";
  const talle = card.querySelector(".size").value;
  const cantidad = Number(card.querySelector(".qty").value);
  const imagen = card.querySelector(".main-img").src;

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

  renderPedido();
}

/* =========================
   RENDER PEDIDO (FRONT)
========================= */
function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  if (!ul) return;

  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `
      <li style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <img src="${item.imagen}" style="width:40px;height:55px;object-fit:cover;border-radius:4px">
        <div style="flex:1">
          <strong>${item.producto}</strong><br>
          ${item.color} | ${item.talle} | x ${item.cantidad}
        </div>
        <button onclick="eliminarItem(${index})">✕</button>
      </li>
    `;
  });
}

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
    ciudad: document.getElementById("ciudad").value.trim(),
    cuit: document.getElementById("cuit").value.trim(),
    telefono: document.getElementById("telefono").value.trim()
  };

  // Validar datos cliente primero
  for (let key in cliente) {
    if (!cliente[key]) {
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

  alert("Pedido enviado correctamente");
}



/* =========================
   CAMBIO DE IMAGEN
========================= */
function changeImg(el) {
  const card = el.closest(".card");
  const mainImg = card.querySelector(".main-img");
  mainImg.src = el.src;

  card.querySelectorAll(".thumb").forEach(t => t.classList.remove("selected"));
  el.classList.add("selected");

  // Guardar color actual en data-color
  card.dataset.color = el.dataset.color || "Default";
}
