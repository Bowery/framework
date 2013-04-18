// Copyright 2013 Bowery Group
/**
 * @fileoverview The users controllers provides an
 *    API for managing users.
 */
module.exports = function (app) {
  var User = app.models.user;

  return  {

    /**
     * Lists all of the users.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    index: function (req, res) {
      User.all(function (err, users) {
         res.render(err ? 'error' :'users/index', err || { users:users });
      });
    },

    /**
     * Renders a template for creating a new user.
     * new Users.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    new: function (req, res) {
      res.render('users/new');
    },

    /**
     * Accepts a new user object from a POST request
     * creates a new user and redirects to the index.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    create: function (req, res) {
      var a = new User(req.body);
      a.save(function (err) {
        err ? res.render('error', err) : res.redirect('/users')
      });
    },

    /**
     * Shows the user with the id given in the url.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    show: function (req, res) {
      User.findOne({ _id: req.params.id }, function (err, user) {
        res.render(err ? 'error': 'users/show', err || user);
      });
    },

    /**
     * Updates the user object that is send via a POST request.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    update: function (req, res) {
      User.update({ id: req.params.id}, req.body, function (err, user) {
        err ? res.render('error', err) : res.redirect('/users/' + user.id);
      });
    },

    /**
     * Deletes the user object of the ID and is DELETEed
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    delete: function (req, res) {
      User.findOneAndRemove({ _id: req.params.id }, function (err) {
        res.json(err || { success: true });
      });
    },

    /**
     * Renders an edit form for the user with the id in the url.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     */
    edit: function (req, res) {
      User.findOne({ _id: req.params.id }, function (err, user) {
        res.render(err ? 'error' : 'users/edit', err || user);
      });
    },

    /**
     * Checks to see if the request is coming from a user.
     * @param {Request} req is the Request variable.
     * @param {Response} res is the Response variable.
     * @param next is the function that will send the
     *        request to the next method.
     */
    auth: function (req, res, next) {
      req.session && req.session.user ? next() : res.redirect('/login');
    }
  }
}