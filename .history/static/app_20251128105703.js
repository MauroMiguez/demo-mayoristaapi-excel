async function enviarPedido() {
  const color = document.getElementById("color").value;
  const qty = document.getElementById("qty").value;

  const pedido = {
    cliente: "Cliente Demo",
    items: [
      {
        producto: "Remera Lisa",
        color: color,
        cantidad: Number(qty)
      }
    ]
  };

  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });

  const data = await res.json();
  document.getElementById("resultado").innerText =
    "Pedido creado.\nDescargar Excel:\n" + data.excel_url;
}
    