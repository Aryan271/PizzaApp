const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_KEY);

function orderController() {
  return {
    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });

      res.header(
        "Cache-control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );

      res.render("customers/orders", { orders, moment });
    },

    store(req, res) {
      const { phone, address, stripeToken, paymentType } = req.body;

      // Validate request
      if (!phone || !address) {
        return res.status(422).json({ message: "All fields are required" });
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });

      order
        .save()
        .then((result) => {
          // populate customer data
          Order.populate(result, { path: "customerId" }, (err, placedOrder) => {
            if (paymentType === "card") {
              stripe.charges
                .create({
                  amount: req.session.cart.totalPrice * 100,
                  source: stripeToken,
                  currency: "inr",
                  description: `Pizza OrderId: ${placedOrder._id}`,
                })
                .then(() => {
                  placedOrder.paymentStatus = true;
                  placedOrder.paymentType = paymentType;

                  placedOrder
                    .save()
                    .then((ord) => {
                      delete req.session.cart;
                      req.flash("success", "Order placed succesfully");
                      // Emit event for admin's page
                      const eventEmitter = req.app.get("eventEmitter");
                      eventEmitter.emit("orderPlaced", ord);

                      return res.json({
                        message: "Payment Successful.Order placed successfully",
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  delete req.session.cart;
                  // Emit event for admin's page
                  req.flash("success", "Order placed succesfully");
                  const eventEmitter = req.app.get("eventEmitter");
                  eventEmitter.emit("orderPlaced", placedOrder);
                  return res.json({
                    messgae: "Payment Failed, You can pay Cash On Delivery.",
                  });
                });
            } else {
              delete req.session.cart;
              req.flash("success", "Order placed succesfully");
              // Emit event for admin's page
              const eventEmitter = req.app.get("eventEmitter");
              eventEmitter.emit("orderPlaced", placedOrder);

              return res.json({
                message: "Order placed successfully",
              });
            }

            // return res.redirect("/customer/my_orders");
          });
        })
        .catch((err) => {
          return res.status(500).json({
            messgae: "Something Went Wrong.",
          });
        });
    },

    async show(req, res) {
      const order = await Order.findById(req.params.id);

      // check if there exists an order of that Id
      // Authorize if order fetched is of that perticular user;
      if (order && req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order });
      }

      // 404 page
      return res.redirect("/customer/my_orders");
    },
  };
}

module.exports = orderController;
