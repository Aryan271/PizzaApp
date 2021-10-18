const Order = require("../../../models/order");

function orderController() {
  return {
    index(req, res) {
      // fetch only placed/active orders (completed orders should not be fetched)
      Order.find({ status: { $ne: "completed" } }, null, {
        sort: { createdAt: -1 },
      })
        .populate("customerId", "-password")
        .exec((err, orders) => {
          if (req.xhr) {
            return res.json(orders);
          }

          return res.render("admin/orders");
        });
    },
  };
}

module.exports = orderController;
