import axios from "axios";
import moment from "moment";
import { Notyf } from "notyf";
import { initAdmin } from "./admin";
import { initStripe } from "./stripe";
import easyinvoice from "easyinvoice";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  position: {
    x: "right",
    y: "bottom",
  },
});

let addToCartBtn = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");
let AddBtn = document.querySelectorAll(".btn-add");
let SubBtn = document.querySelectorAll(".btn-sub");

function updateCart(pizza) {
  // ajax call to update cart
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      notyf.success("Pizza Added to Cart!");
    })
    .catch((err) => {
      console.log(err);
      notyf.error("Something went Wrong");
    });
}

addToCartBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  });
});

// add Pizza btn Axios post
function addPizza(pizza) {
  // ajax call to add Pizza
  axios
    .post("/add-cart", pizza)
    .then((res) => {
      setTimeout(() => {
        location.reload();
      }, 700);

      notyf.success("Pizza Added to Cart!");
    })
    .catch((err) => {
      notyf.error("Something went Wrong");
      console.log(err);
    });
}

AddBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    console.log("clicked");
    let pizzaId = btn.dataset;
    addPizza(pizzaId);
  });
});

function subPizza(pizza) {
  // ajax call to add Pizza
  axios
    .post("/sub-cart", pizza)
    .then((res) => {
      setTimeout(() => {
        location.reload();
      }, 700);
      notyf.success("Pizza Removed to Cart!");
    })
    .catch((err) => {
      notyf.error("Something went Wrong");
    });
}

SubBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizzaId = btn.dataset;
    subPizza(pizzaId);
  });
});

const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2500);
}

// orderstatus
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;

order = JSON.parse(order);

let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });

  let stepCompleted = true;

  statuses.forEach((status) => {
    let dataProp = status.dataset.status;

    if (stepCompleted) {
      status.classList.add("step-completed");
    }

    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

initStripe();

// Socket
let socket = io();

// Take the order id create room and join the user
if (order) socket.emit("join", `order_${order._id}`);

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;

  if (data.status === "confirmed")
    notyf.success("Your order has been confirmed");
  else if (data.status === "prepared")
    notyf.success("Your Pizza has been prepared");
  else if (data.status === "delivered")
    notyf.success("Your Pizza is out for delivery");
  else if (data.status === "completed")
    notyf.success("Your order has been delivered");

  updateStatus(updatedOrder);
});

// invoice
// invoice list products
let render_btn = document.querySelectorAll(".view_btn");

function generateProducts(items) {
  let invoiceProducts = [];
  for (let [id, product] of Object.entries(items)) {
    let singleProduct = {};
    singleProduct.description =
      product.item.name + " (" + product.item.size + ")";
    singleProduct.quantity = product.qty;
    singleProduct.price = product.item.price;

    invoiceProducts.push(singleProduct);
  }

  data.products = invoiceProducts;
}

// invoice other data
function generateData(orderData) {
  data.client.company = orderData.customerId.name;
  data.client.zip = orderData.phone;
  data.client.address = orderData.address;
  data.invoiceNumber = orderData._id;
  data.invoiceDate = moment(orderData.createdAt).format("MMMM Do YYYY");

  generateProducts(orderData.items);
}

function invoiceData(orderId) {
  axios
    .post("/invoice", orderId)
    .then(async (res) => {
      generateData(res.data[0]);

      console.log(res);

      const result = await easyinvoice.createInvoice(data);
      easyinvoice.download("invoice.pdf", result.pdf);
    })
    .catch((err) => {
      console.log(err);
      notyf.error("Something Went Wrong!");
    });
}

if (render_btn) {
  render_btn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      let orderId = btn.dataset;
      invoiceData(orderId);
    });
  });
}

let data = {
  documentTitle: "INVOICE", //Defaults to INVOICE
  locale: "de-DE", //Defaults to en-US, used for number formatting (see docs)
  currency: "INR", //See documentation 'Locales and Currency' for more info
  taxNotation: "gst", //or gst
  marginTop: 25,
  marginRight: 25,
  marginLeft: 25,
  marginBottom: 25,
  logo:
    "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",
  background: "", //or base64 //img or pdf
  sender: {
    company: "PizzaApp",
    address: "1k hostel, NITW",
    zip: "560864",
    city: "Warangal",
    country: "India",
  },
  client: {
    company: "",
    zip: "",
    city: "",
    country: "",
    address: "",
  },
};
