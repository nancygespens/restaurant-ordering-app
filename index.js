import { menuArray } from "./data.js";

// Global order list (keyed by dish id)
let orderList = {};

// Generate menu HTML for each dish and return it.
function getMenuHtml() {
  return menuArray
    .map((item) => `
      <section class="item-content" data-id="${item.id}">
        <div class="dish">
          <div>
            <img src="${item.pic}" alt="${item.name}" class="item-img">
          </div>
          <div>
            <h2 class="text">${item.name}</h2>
            <p class="text">${item.ingredients.join(", ")}</p>
            ${getStarRatingHtml(item.id)}
            <p class="text price">$${item.price}</p>
          </div>
        </div>
        <div class="num-btn">
          <button class="minus btn">-</button>
          <input type="number" value="0" class="num-input" readonly>
          <button class="plus btn">+</button>
        </div>
      </section>
    `)
    .join("<hr>") + getMenuBackgroundHtml();
}

// Generate star rating HTML for a dish
function getStarRatingHtml(dishId) {
  return `
    <div class="star-rating">
      ${[5, 4, 3, 2, 1].map((rating) => `
        <input type="radio" id="star${rating}-${dishId}" name="rating-${dishId}" value="${rating}">
        <label for="star${rating}-${dishId}" title="${rating} stars">
          <i class="fas fa-star"></i>
        </label>
      `).join('')}
    </div>
  `;
}

// Generate the background HTML for the menu section
function getMenuBackgroundHtml() {
  return `
    <div class="menu-bg">
      <img src="img/items-bg-elements/el_1.png" alt="background elements" class="bg-elements-menu">
    </div>
  `;
}

// Render the entire menu and set up event listeners
function render() {
  document.getElementById("main-content").innerHTML = getMenuHtml();
  attachEventListeners();
  attachStarRatingListeners(); // Set up star rating listeners.
}

render();

// Attach event listeners for plus/minus buttons and item quantity updates
function attachEventListeners() {
  document.querySelectorAll(".item-content").forEach((dish) => {
    const dishId = parseInt(dish.getAttribute("data-id"));
    const plusBtn = dish.querySelector(".plus");
    const minusBtn = dish.querySelector(".minus");
    const numInput = dish.querySelector(".num-input");

    plusBtn.addEventListener("click", () => updateDishQuantity(dishId, numInput, 1));
    minusBtn.addEventListener("click", () => updateDishQuantity(dishId, numInput, -1));
  });
}

// Update the quantity of a dish and the global order list
function updateDishQuantity(dishId, numInput, change) {
  let count = parseInt(numInput.value);
  count = Math.max(0, Math.min(3, count + change)); // Limit quantity between 0 and 3
  numInput.value = count;
  updateOrder(dishId, count);
}

// Update the order list and render the updated order
function updateOrder(dishId, count) {
  const dish = menuArray.find((item) => item.id === dishId);
  if (count > 0) {
    orderList[dishId] = { name: dish.name, price: dish.price, quantity: count };
  } else {
    delete orderList[dishId];
  }
  renderOrderList();
}

// Render the order list showing items, total price, and complete order button
function renderOrderList() {
  const orderListContainer = document.getElementById("order-list");
  let orderContent = `<section class="order-content"><h2>Your order</h2>`;
  let totalPrice = 0;

  if (Object.keys(orderList).length === 0) {
    orderContent += `<p>No items ordered yet.</p>`;
  } else {
    for (let id in orderList) {
      const item = orderList[id];
      totalPrice += item.price * item.quantity;
      orderContent += getOrderItemHtml(id, item);
    }
  }

  orderContent += `
    <hr class="order-hr">
    <div class="total-price">
      <h3>Total price:</h3>
      <p>$${totalPrice}</p>
    </div>
    <button class="complete-order">Complete order</button>
    </section>
  `;

  orderListContainer.innerHTML = `
    <div class="order-bg">
      <img src="img/items-bg-elements/el_2.png" alt="background elements" class="bg-elements-order">
    </div>
    ${orderContent}
  `;
  
  attachDeleteListeners();
  attachCompleteOrderListener();
}

// Generate HTML for an order item
function getOrderItemHtml(id, item) {
  return `
    <div class="order-dish">
      <div class="order-delete">
        <ul>
          <li>${item.name} x ${item.quantity}</li>
        </ul>
        <i class="fa-solid fa-trash" data-id="${id}"></i>
      </div>
      <p>$${item.price * item.quantity}</p>
    </div>
  `;
}

// Attach event listeners for delete buttons in the order list
function attachDeleteListeners() {
  document.querySelectorAll(".order-delete i.fa-trash").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const dishId = parseInt(e.target.getAttribute("data-id"));
      delete orderList[dishId];
      resetDishQuantityInput(dishId);
      renderOrderList();
    });
  });
}

// Reset the quantity input of a dish to 0 when it's removed from the order
function resetDishQuantityInput(dishId) {
  const dishElement = document.querySelector(`.item-content[data-id="${dishId}"]`);
  if (dishElement) {
    dishElement.querySelector(".num-input").value = 0;
  }
}

// Attach event listener for the "Complete order" button
function attachCompleteOrderListener() {
  const completeBtn = document.querySelector(".complete-order");
  const modal = document.getElementById("modal");

  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
  }
}

// Attach event listener for closing the modal
function attachModalCloseListener() {
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modal = document.getElementById("modal");

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      modal.style.display = "none";
      resetOrderList();
    });
  }
}

// Reset the order list and all input fields after order completion
function resetOrderList() {
  document.getElementById("order-list").innerHTML = "";
  orderList = {};
  resetMenuInputs();
}

// Reset all dish quantity inputs in the menu
function resetMenuInputs() {
  document.querySelectorAll(".item-content").forEach((dish) => {
    dish.querySelector(".num-input").value = 0;
  });
}

attachModalCloseListener();

// Attach event listeners for star ratings and load saved ratings from localStorage
function attachStarRatingListeners() {
  document.querySelectorAll(".item-content").forEach((dish) => {
    const dishId = dish.getAttribute("data-id");
    const radios = dish.querySelectorAll(`input[name="rating-${dishId}"]`);

    // Load saved rating from localStorage
    const savedRating = localStorage.getItem(`rating-${dishId}`);
    if (savedRating) {
      radios.forEach((radio) => {
        if (radio.value === savedRating) {
          radio.checked = true;
        }
      });
    }

    // Save rating to localStorage when a new rating is selected
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        localStorage.setItem(`rating-${dishId}`, e.target.value);
      });
    });
  });
}

// Handle payment consent form submission
const consentForm = document.getElementById("consent-form");
const modalInner = document.getElementById("modal-inner");
const modalCloseBtn = document.getElementById("modal-close-btn");

consentForm.addEventListener("submit", function (e) {
  e.preventDefault();

  modalCloseBtn.disabled = true;
  const consentFormData = new FormData(consentForm);
  const fullName = consentFormData.get("fullName");

  modalInner.innerHTML = `
    <div class="modal-inner-loading">
      <img src="img/loading/bouncing-squares.svg" class="loading">
      <p id="upload-text">Check your payment...</p>
    </div>
  `;

  setTimeout(function () {
    document.getElementById("upload-text").innerText = "Processing payment...";
  }, 1500);

  setTimeout(function () {
    modalInner.innerHTML = `
      <h2 class="modal-title">Thanks, <span class="modal-display-name">${fullName}</span>!<br>Your order is on its way!</h2>
      <div class="delivery">
        <img class="modal-pic" src="img/modal/modal_1.png" alt="Delivery image">
      </div>
    `;
    modalCloseBtn.disabled = false;
  }, 3000);
});
