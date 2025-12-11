let productosCache = [];
let carrito = [];

const API_URL = "productos.json";

document.addEventListener("DOMContentLoaded", () => {
  cargarCarritoDesdeStorage();
  cargarProductosDesdeAPI();
  actualizarContadorCarrito();
  configurarValidacionFormulario();

  const btnVaciar = document.getElementById("carrito-vaciar");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", vaciarCarrito);
  }
});

// ---------------- API ----------------

function cargarProductosDesdeAPI() {
  fetch(API_URL)
    .then(res => res.json())
    .then(datos => {
      productosCache = datos;
      renderProductos(datos);
    })
    .catch(error => console.error("Error cargando productos:", error));
}

// ---------------- Render de productos ----------------

function renderProductos(productos) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta");

    tarjeta.innerHTML = `
      <img src="${producto.image}" alt="Portada del libro ${producto.title}">
      <h3>${producto.title}</h3>
      <p>${producto.description}</p>
      <span class="precio">$${producto.price.toFixed(2)}</span>
      <button class="btn-agregar" data-id="${producto.id}">
        <i class="fas fa-cart-plus"></i> Agregar al carrito
      </button>
    `;

    tarjeta.querySelector(".btn-agregar").addEventListener("click", () => {
      agregarProductoAlCarrito(producto.id);
    });

    contenedor.appendChild(tarjeta);
  });
}

// ---------------- Carrito ----------------

function cargarCarritoDesdeStorage() {
  const guardado = localStorage.getItem("carrito");
  carrito = guardado ? JSON.parse(guardado) : [];
}

function guardarCarritoEnStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function agregarProductoAlCarrito(idProducto) {
  const producto = productosCache.find(p => p.id === idProducto);
  const existente = carrito.find(x => x.id === idProducto);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      titulo: producto.title,
      precio: producto.price,
      imagen: producto.image,
      cantidad: 1
    });
  }

  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const totalSpan = document.getElementById("carrito-total");

  contenedor.innerHTML = "";
  let total = 0;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalSpan.textContent = "0";
    return;
  }

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const div = document.createElement("div");
    div.classList.add("carrito-item");

    div.innerHTML = `
      <div class="carrito-detalle">
        <img src="${item.imagen}" alt="Portada del libro ${item.titulo}">
        <div>
          <h4>${item.titulo}</h4>
          <p>Precio: $${item.precio.toFixed(2)}</p>
          <p>Subtotal: $${subtotal.toFixed(2)}</p>
        </div>
      </div>

      <div class="carrito-controles">
        <button class="btn-menos" data-id="${item.id}">-</button>
        <span>${item.cantidad}</span>
        <button class="btn-mas" data-id="${item.id}">+</button>
        <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
      </div>
    `;

    contenedor.appendChild(div);
  });

  totalSpan.textContent = total.toFixed(2);

  document.querySelectorAll(".btn-mas").forEach(btn =>
    btn.addEventListener("click", () =>
      cambiarCantidadProducto(Number(btn.dataset.id), +1)));

  document.querySelectorAll(".btn-menos").forEach(btn =>
    btn.addEventListener("click", () =>
      cambiarCantidadProducto(Number(btn.dataset.id), -1)));

  document.querySelectorAll(".btn-eliminar").forEach(btn =>
    btn.addEventListener("click", () =>
      eliminarProductoDelCarrito(Number(btn.dataset.id))));
}

function cambiarCantidadProducto(id, cambio) {
  const item = carrito.find(x => x.id === id);

  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    eliminarProductoDelCarrito(id);
  } else {
    guardarCarritoEnStorage();
    renderCarrito();
    actualizarContadorCarrito();
  }
}

function eliminarProductoDelCarrito(id) {
  carrito = carrito.filter(x => x.id !== id);
  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
}

function vaciarCarrito() {
  if (confirm("¿Seguro que deseas vaciar el carrito?")) {
    carrito = [];
    guardarCarritoEnStorage();
    renderCarrito();
    actualizarContadorCarrito();
  }
}

function actualizarContadorCarrito() {
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.getElementById("carrito-count").textContent = totalItems;
}

// ---------------- Formulario ----------------

function configurarValidacionFormulario() {
  const formulario = document.getElementById("contact-form");
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const mensajeInput = document.getElementById("mensaje");
  const estado = document.getElementById("estado-formulario");

  formulario.addEventListener("submit", event => {
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    if (nombre.length < 2) {
      estado.textContent = "El nombre debe tener al menos 2 caracteres.";
      estado.style.color = "red";
      event.preventDefault();
      return;
    }

    if (!validarEmail(email)) {
      estado.textContent = "Correo electrónico inválido.";
      estado.style.color = "red";
      event.preventDefault();
      return;
    }

    if (mensaje.length < 10) {
      estado.textContent = "El mensaje debe tener al menos 10 caracteres.";
      estado.style.color = "red";
      event.preventDefault();
      return;
    }

    estado.textContent = "Mensaje enviado correctamente ✔";
    estado.style.color = "green";

    setTimeout(() => {
      formulario.reset();
      estado.textContent = "";
    }, 500);
  });
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
