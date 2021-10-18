function cartController() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },

    update(req, res) {
      // we will create a cart in session

      // if cart does not exist from before

      // cart = {
      //   items : {
      //     id: {item (type: Object), qty: 0}
      //   },
      //   totalQty: 0,
      //   totalPrice: 0
      // }

      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;

      // Check if item does not exist in cart
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };

        cart.totalQty += 1;
        cart.totalPrice += req.body.price;
      }
      // item already exists in cart
      else {
        cart.items[req.body._id].qty += 1;
        cart.totalQty += 1;
        cart.totalPrice += req.body.price;
      }

      return res.json({ totalQty: req.session.cart.totalQty });
    },

    //increment Pizza Btn
    add(req, res) {
      let cart = req.session.cart;

      cart.items[req.body.pizzaid].qty += 1;
      cart.totalQty += 1;
      cart.totalPrice =
        req.session.cart.totalPrice + cart.items[req.body.pizzaid].item.price;

      return res.json({ totalQty: req.session.cart.totalQty });
    },

    //decrement Pizza Btn
    sub(req, res) {
      let cart = req.session.cart;

      cart.items[req.body.pizzaid].qty -= 1;

      cart.totalQty -= 1;
      cart.totalPrice =
        req.session.cart.totalPrice - cart.items[req.body.pizzaid].item.price;

      if (cart.items[req.body.pizzaid].qty === 0)
        delete cart.items[req.body.pizzaid];

      return res.json({ totalQty: req.session.cart.totalQty });
    },
  };
}

module.exports = cartController;
