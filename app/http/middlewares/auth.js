function auth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  return res.redirect("/login");
}

module.exports = auth;
