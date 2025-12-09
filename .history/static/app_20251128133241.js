let pedido = [];

function agregarProducto(button) {
  const card = button.closest(".card");

  const producto = card.dataset.producto;
  const color = card.dataset.color;
  const talle = card.querySelector(".size").value;
  const cantidad = Number(card.querySelector(".qty").value);
  const imagen = card.querySelector(".main-img").src;

  if (!talle || cantidad <= 0) {
    alert("Seleccioná talle y cantidad");
    return;
  }

  pedido.push({ producto, color, talle, cantidad, imagen });
  renderPedido();
}

function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `
      <li>
        ${item.producto} - ${item.color} - ${item.talle}
        <strong>x ${item.cantidad}</strong>
        <button onclick="eliminarItem(${index})">✕</button>
      </li>
    `;
  });
}

function eliminarItem(index) {
  pedido.splice(index, 1);
  renderPedido();
}


function changeImg(el) {
  const card = el.closest('.card');
  const mainImg = card.querySelector('.main-img');
  mainImg.src = el.src;

  card.querySelectorAll('.thumb').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

