// Controllers
const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");
const invoiceController = require("../app/http/controllers/customers/invoiceController");

// Middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

function initRoutes(app) {
  // app-object has get method
  // this method has two attributes
  // first is a route/path, second is a function
  app.get("/", homeController().index);

  // Auth routes
  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);
  app.post("/logout", authController().logout);

  // Cart routes
  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
  app.post("/add-cart", cartController().add);
  app.post("/sub-cart", cartController().sub);

  // Customer order routes
  app.post("/orders", auth, orderController().store);
  app.get("/customer/my_orders", auth, orderController().index);
  app.get("/customer/my_orders/:id", auth, orderController().show);

  // Admin routes
  app.get("/admin/orders", admin, adminOrderController().index);
  app.post("/admin/order/status", admin, statusController().update);

  // invoice
  app.post("/invoice", auth, invoiceController().data);
}

module.exports = initRoutes;
