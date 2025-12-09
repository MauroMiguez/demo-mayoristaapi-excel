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
  if (pedido.length === 0) {
    alert("Agregá productos al pedido");
    return;
  }

  try {
    const res = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente: "Cliente Demo",
        items: pedido
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(txt);
      alert("Error al generar el pedido");
      return;
    }

    // ESPERAMOS EXCEL DIRECTO
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pedido.xlsx";
    a.click();

    // Reset
    pedido = [];
    renderPedido();

  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
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
