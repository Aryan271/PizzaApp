const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  const _getRedirectedUrl = (req) => {
    let returnTo;

    if (req.user.role === "customer") {
      console.log(req.session.returnTo);
      returnTo = req.session.returnTo || "/";
      delete req.session.returnTo;
    } else {
      returnTo = "/admin/orders";
    }

    return returnTo;
  };

  return {
    login(req, res) {
      res.render("auth/login");
    },

    postLogin(req, res, next) {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "All fields are required");
        req.flash("email", email);
        return res.redirect("/login");
      }

      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }

        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }

        req.logIn(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect(_getRedirectedUrl(req));
        });
      })(req, res, next);
    },

    register(req, res) {
      res.render("auth/register");
    },

    async postRegister(req, res) {
      const { name, email, password } = req.body;

      // vALIDATE REQUEST
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // CHECK IF EMAIL ALREADY EXISTS IN DATABASE
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash("error", "Email Already taken");
          req.flash("name", name);
          req.flash("email", email);
          return res.redirect("/register");
        }
      });

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // CREATE USER
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      user
        .save()
        .then((user) => {
          // LOGIN
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }

            return res.redirect("/");
          });

          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/register");
        });
    },

    logout(req, res) {
      req.logout();
      return res.redirect("/");
    },
  };
}

module.exports = authController;
