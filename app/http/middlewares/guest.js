// Check if user is authenticated or not
// if authenticated stop him to access login and register page
// and redirect to home page
// else allow login and register page access

function guest(req, res, next) {
  // user is not authenticated
  if (!req.isAuthenticated()) {
    return next();
  }

  // user is authenticated
  return res.redirect("/");
}

module.exports = guest;
