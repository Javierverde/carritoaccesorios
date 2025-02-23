
// Cargar productos
let productos = [];

const body = document.body;

// Contenedor principal
const container = document.createElement("div");
container.classList.add("container");
document.body.appendChild(container);

// Botón para abrir/cerrar carrito
const toggleCartButton = document.createElement("button");
toggleCartButton.textContent = "🛒 Ver Carrito";
toggleCartButton.id = "toggle-cart";
document.body.appendChild(toggleCartButton);

// Crear grilla de productos
const productGrid = document.createElement("div");
productGrid.classList.add("grid");
container.appendChild(productGrid);

// Panel lateral del carrito (inicialmente oculto)
const sidebar = document.createElement("div");
sidebar.id = "cart-sidebar";
sidebar.classList.add("hidden");  // Se oculta por defecto
sidebar.innerHTML = `
  <h2>Carrito</h2>
  <div id="cart-items"></div>
  <div class="total">Total: $<span id="total-price">0</span></div>
  <button id="clear-cart">Vaciar Carrito</button>
  <button id="checkout">Finalizar Compra</button>
`;
document.body.appendChild(sidebar);

async function cargarProductos() {
  try {
    const response = await fetch("json/productos.json");  
    productos = await response.json();  
    mostrarProductos();  
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

function mostrarProductos() {
  productGrid.innerHTML = "";

  productos.forEach(producto => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    productDiv.innerHTML = `
      <img src="${producto.img}" alt="${producto.name}">
      <span>${producto.name}</span>
      <button class="add-to-cart" data-name="${producto.name}" data-price="${producto.price}">Agregar ($${producto.price})</button>
    `;

    productGrid.appendChild(productDiv);
  });

  asignarEventosBotones();
}

// Elementos del carrito
const cartItems = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const clearCartButton = document.getElementById("clear-cart");
const checkoutButton = document.getElementById("checkout");

let totalPrice = 0;

const updateLocalStorage = () => {
  const cartItemsArray = Array.from(cartItems.children).map(item => {
    const name = item.querySelector(".cart-name").textContent;
    const price = parseInt(item.querySelector(".cart-price").textContent.replace("$", ""));
    return { name, price };
  });

  localStorage.setItem("cart", JSON.stringify(cartItemsArray));
};

const loadCartFromLocalStorage = () => {
  const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
  savedCart.forEach(product => {
    addProductToCart(product.name, product.price, false);
  });
};

const addProductToCart = (name, price) => {
  const cartItem = document.createElement("div");
  cartItem.classList.add("cart-item");
  cartItem.innerHTML = `<span class="cart-name">${name}</span><span class="cart-price">$${price}</span>`;
  cartItems.appendChild(cartItem);

  totalPrice += price;
  totalPriceElement.textContent = totalPrice;
  updateLocalStorage();

  Swal.fire({
    position: "top",
    icon: "success",
    title: "Producto agregado al carrito",
    showConfirmButton: false,
    timer: 1500,
    customClass: {
      popup: "small-toast",
      title: "small-toast-title"
    }
  });
 }

const asignarEventosBotones = () => {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const price = parseInt(button.getAttribute("data-price"));
      const productName = button.getAttribute("data-name");
      addProductToCart(productName, price);
    });
  });
};

// Evento para abrir/cerrar el carrito
toggleCartButton.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});


// Vaciar carrito
clearCartButton.addEventListener("click", () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminarán todos los productos del carrito.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, vaciar carrito",
    cancelButtonText: "Cancelar"
  }).then((result) => {
    if (result.isConfirmed) {
      cartItems.innerHTML = "";
      totalPrice = 0;
      totalPriceElement.textContent = totalPrice;
      localStorage.removeItem("cart");

      Swal.fire({
        title: "Carrito vaciado",
        text: "Tu carrito ha sido vaciado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
});

// Finalizar compra
checkoutButton.addEventListener("click", () => {
  if (cartItems.innerHTML === "") {
    Swal.fire({
      icon: "warning",
      title: "El carrito está vacío",
      text: "Agrega productos antes de finalizar la compra.",
    });
    return;
  }

  Swal.fire({
    icon: "success",
    title: "¡Compra realizada!",
    text: "Gracias por tu compra 🎉",
    confirmButtonText: "Aceptar"
  });

  cartItems.innerHTML = "";
  totalPrice = 0;
  totalPriceElement.textContent = totalPrice;
  localStorage.removeItem("cart");
});



loadCartFromLocalStorage();
cargarProductos();
