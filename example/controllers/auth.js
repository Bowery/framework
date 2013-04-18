// Copyright 2013 Bowery Group
/**
 * @fileoverview The auth controller provides an
 *    API for authenticating users.
 */
module.exports = function (app) {
  var User = app.models.user;

  return  {

    /**
     * Renders a login screen.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    login: function (req, res) {
      res.render('auth/login');
    },

    /**
     * Logs the user out and redirects to Login page.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    logout: function (req, res) {
      req.session.destroy();
      res.redirect('/login');
    },

    /**
     * Accepts a credentials from a POST request and
     * authenticates the session.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    connect: function (req, res) {
      User.findByEmail(req.body.email, function (err, user) {
        if (err) res.render('error', err);
        else if (user && user.authenticate(req.body.password)) req.session.user = user;
        else res.render('login');
      });
    }
  }
}