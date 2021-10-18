const Order = require("../../../models/order");

function invoiceController() {
  return {
    async data(req, res) {
      const order = await Order.find({ _id: req.body.orderid }, null).populate(
        "customerId",
        "-password"
      );

      return res.json(order);
    },
  };
}

module.exports = invoiceController;
