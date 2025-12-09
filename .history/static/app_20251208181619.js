let pedido = [];


function changeImg(el) {
  const card = el.closest('.card');
  const mainImg = card.querySelector('.main-img');
  mainImg.src = el.src;

  card.querySelectorAll('.thumb').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}


function agregarProducto(button) {
  const card = button.closest(".card");

  const producto = card.dataset.producto;
  const color = card.querySelector(".color").value;
  const cantidad = Number(card.querySelector(".qty").value);
  const slug = card.dataset.slug || producto.toLowerCase().replace(/\s+/g,'-');

  // thumbnail actual (si existe)
  const mainImg = card.querySelector('.main-img').src;

  pedido.push({ producto, color, cantidad, image: mainImg, slug });
  renderPedido();
}

function renderPedido() {
  const ul = document.getElementById("pedidoLista");
  ul.innerHTML = "";

  pedido.forEach((item, index) => {
    ul.innerHTML += `<li>
      <img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle;">
      ${item.producto} - ${item.color} x ${item.cantidad}
      <button onclick="eliminar(${index})" style="margin-left:8px">Eliminar</button>
    </li>`;
  });
}

function eliminar(index) {
  pedido.splice(index,1);
  renderPedido();
}

async function enviarPedido() {
  if (pedido.length === 0) {
    alert("Agregá al menos un producto");
    return;
  }

  const body = {
    cliente: "Cliente Demo",
    items: pedido.map(p => ({ producto: p.producto, color: p.color, cantidad: p.cantidad }))
  };

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  const link = document.getElementById("downloadLink");
  link.href = data.excel_url;
  link.style.display = "inline-block";

  alert("Pedido generado correctamente");
}

