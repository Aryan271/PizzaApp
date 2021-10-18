const Menu = require("../../models/menu");

function homeController() {
  return {
    async index(req, res) {
      const pizzas = await Menu.find();
      return res.render("home", { pizzas: pizzas });
    },
  };
}

// this exports a function to webjs i.e for eg. index function in homecontroller
module.exports = homeController;
