let pedido = [];

function agregarProducto(button) {
  const card = button.closest(".card");

  const producto = card.dataset.producto;
  const color = card.querySelector(".color").value;
  const cantidad = Number(card.querySelector(".qty").value);

  pedido.push({ {
  producto,
  color,
  talle,
  cantidad,
  imagen
}
     });
  renderPedido();
}

function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `<li>${item.producto} - ${item.color} x ${item.cantidad}</li>`;
  });
}

async function enviarPedido() {
  if (pedido.length === 0) {
    alert("Agregá al menos un producto");
    return;
  }

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cliente: "Cliente Demo",
      items: pedido
    })
  });

  const data = await res.json();

  const link = document.getElementById("downloadLink");
  link.href = data.excel_url;
  link.style.display = "inline-block";

  alert("Pedido generado correctamente");
}

function changeImg(el) {
  const card = el.closest('.card');
  const mainImg = card.querySelector('.main-img');
  mainImg.src = el.src;

  card.querySelectorAll('.thumb').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

