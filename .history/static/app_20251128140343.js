// app.js completo (solución A)
let pedido = [];

function agregarProducto(button) {
  const card = button.closest(".card");
  const producto = card.dataset.producto;
  const color = card.querySelector(".color").value;
  const talleEl = card.querySelector(".size") || card.querySelector(".talle");
  const talle = talleEl ? talleEl.value : "";
  const cantidad = Number(card.querySelector(".qty").value);
  const imagen = card.querySelector(".main-img") ? card.querySelector('.main-img').src : "";

  if (!cantidad || cantidad <= 0) {
    alert("Ingresá una cantidad válida");
    return;
  }
  if (!talle) {
    alert("Seleccioná un talle");
    return;
  }

  pedido.push({ producto, color, talle, cantidad, imagen });
  renderPedido();
}

function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  if (!ul) return;
  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `
      <li style="margin-bottom:8px">
        <img src="${item.imagen}" style="width:36px;height:48px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px;">
        ${item.producto} — ${item.color} — ${item.talle} 
        <strong>x ${item.cantidad}</strong>
        <button style="margin-left:8px" onclick="eliminarItem(${index})">Eliminar</button>
      </li>`;
  });
}

function eliminarItem(index) {
  pedido.splice(index, 1);
  renderPedido();
}

async function enviarPedido() {
  if (pedido.length === 0) {
    alert("Agregá al menos un producto");
    return;
  }

  try {
    // 1) POST para crear pedido y generar excel
    const postRes = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente: "Cliente Demo", items: pedido })
    });

    if (!postRes.ok) {
      const txt = await postRes.text();
      console.error("POST /
