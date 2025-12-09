let pedido = [];
let datosCliente = null;
let clienteRegistrado = false;

function registrarDatos() {
  const cliente = {
    nombre: document.getElementById("nombre").value.trim(),
    empresa: document.getElementById("empresa").value.trim(),
    provincia: document.getElementById("provincia").value.trim(),
    ciudad:document.getElementById("ciudad").value.trim(),
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

function agregarProducto(el) {
  const card = el.closest(".card"); // la tarjeta del producto

  const producto = {
    producto: card.dataset.producto,
    color: card.dataset.color,
    imagen: card.querySelector(".main-img").src,
    talle: card.querySelector(".size").value,
    cantidad: Number(card.querySelector(".qty").value) || 1,
    talles: Array.from(card.querySelector(".size").options)
                 .map(o => o.value)
                 .filter(v => v) // lista de talles disponibles
  };

  // Guardar en el array global
  pedido.push(producto);

  // Renderizar en pantalla
  renderPedido();

  // Mostrar la sección
  document.getElementById("pedidoSeccion").classList.add("activo");

  // Actualizar total
  actualizarTotal();
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
  try {
    const res = await fetch("/orders", {   // ✅ ruta relativa
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente: datosCliente, items: pedido })
    });

    // Leer la respuesta una sola vez
    const raw = await res.text();

    let data;
    try {
      data = JSON.parse(raw); // intentar parsear como JSON
    } catch (err) {
      console.error("Respuesta no JSON del servidor:", raw);
      alert("Error al generar el pedido (ver consola)");
      return;
    }

    if (!res.ok) {
      console.error("Error del servidor:", data);
      alert("Error al generar el pedido: " + (data.error || "ver consola"));
      return;
    }

    alert("✅ Pedido generado correctamente");
    console.log("Pedido enviado:", data);

    // Descargar el Excel automáticamente
    if (data.excel_url) {
      const link = document.createElement("a");
      link.href = data.excel_url;   // ✅ Render lo resuelve al mismo dominio
      link.download = `pedido_${data.order_id}.xlsx`;
      link.click();
    }

  } catch (err) {
    console.error("Error en fetch:", err);
    alert("Error de conexión con el servidor");
  }
}

function changeImg(el) {
  const card = el.closest(".card");
  const mainImg = card.querySelector(".main-img");

  // Cambiar imagen principal
  mainImg.src = el.src;

  // Quitar selección previa y marcar la nueva
  card.querySelectorAll(".thumb").forEach(t => t.classList.remove("selected"));
  el.classList.add("selected");

  // Actualizar el color en la card
  card.dataset.color = el.dataset.color || "Default";
}

