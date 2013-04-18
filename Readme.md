# Bowery
The Web Framework.
## Getting Started
The only external dependency is [Node.js](http://nodejs.org/). To get started open your terminal and type:
```
$ npm install bowery -g
$ bowery create projectName
$ bowery server
```
A browser window will open with the starter application running. Any changes made to the application will automatically be updated by the localserver.
When you're ready to push the app to production, run `bowery deploy`. Once you have authenticated, your application will be live on the internet and you will be given a url to access it.

## Structure
In a directory named `projectName` you will see a file structure like this:
```
/assets
/models
/views
/controllers
/helpers
routes.js
package.json
README.md
```
## Scaffolding
Rails style scaffolding is available by running:
```
$ bowery generate scaffold User name:String emails:[String] password:String salt:String
```

## Models

### Format
Models in The Web Framework are just Javascript Objects with optional instance methods. For example, a user object defined in `/models/user.js` might look like:
```javascript
module.exports = function (app) {

  /**
   * @private {function} used as default salt for password hashing 
   */
  var uuid = require('node-uuid'),
      crypto = require('crypto');

  /**
   * @private {function(string, string)} uses the passwordHash 
   * helper to hash passwords.
   * @param {string} password is the string that the user enters.
   * @param {function(string, function)} salt is used to hash password.
   */
  function hash (password, salt) {
    return crypto
          .createHmac('sha256', salt)
          .update(password)
          .digest('hex');
  }

  return {

    /* Public Variables */
    schema: {
      name: {
        type: String,// Type can be strings, numbers, boolean, or sets of the previous types.
        required: true
      },
      emails: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      salt: {
        type: String,
        required: true,
        default: uuid
      }
    },

    /* Public Methods */
    methods: {

      /**
       * Sets the password field as a hash of the given password.
       * @param {string} password is the as the user enters it.
       */
      setPassword: function (password) {
        this.password = hash(password, this.salt)
      },

      /**
       * Checks to see if the user's password is valid.
       * @param {string} password is the as the user enters it.
       * @return {boolean} if the password is valid
       */
      authenticate: function (password) {
        return this.password == hash(password, this.salt)
      }
    },

    /* Static Methods */
    statics: {

      /**
       * Searches for Users by their email
       * @param {string} email of the users you're
       *        searching for.
       * @param {functioncallback(error, users)
       */
      findByEmail: function (email, callback) {
        this.findOne({email: email}, callback);
      },

      /**
       * Lists all of the users.
       * @param {function(Object, Object)}
       */
      all: function (callback) {
        this.find({}, callback);
      }
    }
    
  }
}
```
### Caching
Behind the scenes, The Web Framework's Data Layer is caching query results.

If you want to do manual caching, `app.cache.write('key', 'value')` and `app.cache.read('key')` are available. Inside the models Methods, `this.cacheKey` is available. It generally takes the form `model/id-timestamp` where the timestamp will change each time the instance is updated. 

### Real Time
When a model is updated, a socket.io event will be triggered to subscribing clients. The channel name will follow the convention `model.id.action` where model is the name of the model and action can be `create`, `update`, `destroy`. 

To manually emit events to subscribing clients, use `app.events.emit('channel-name', {some:object})`.

## Controllers

In a controller you will be able to access models via the app variable. For example, `/controllers/users.js` might look like:

```javascript
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
         res.render(err ? 'error' 'users/index', err || { users:users });
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
```

## Routes
The `routes.js` file for the users controller would look like:

```javascript
module.exports = {
  '/': {
    'get': 'auth!users.index'
  },
  '/login': {
    'get': 'auth.login',
    'post': 'auth.connect'
  },
  '/logout': {
    'get': 'auth.logout'
  },
  '/users':{
    'get': 'users.index',
    'post': 'users.create'
  },
  '/users/new':{
    'get': 'users.new'
  },
  '/users/:id':{
    'get': 'users.show',
    'post': 'users.update',
    'del': 'users.delete'
  },
  '/users/:id/edit':{
    'get': 'users.edit'
  }
}


```

### Filters
The filter before `!controller.method` is the name of a function in the controller that will be run before the `controller.method` is called. The third parameter in that function will be a `next()` function that should be called when you want the `controller.method` to be called.

### Parameters
`req.params` is an object containing the parameters in the url. For example, the id in `/users/:id` can be accessed by `req.params.id` in the `users.show` method.

`req.body` is an object containing the body of the request. When the browser makes a POST request to `/users`, the `users.create` method has access to the body of the request via `req.body`.

## Helpers
Helpers are functions that you want to have access to in your controllers, models, & views. You can access them via `app.helpers`.

## Assets
The `assets` directory is the root of a static asset server. In development, everything in there will be served at `http://localhost/assets/`. In production, everything will be minified and put on a CDN. The Web Framework will change the url if you use the proper view helper.

### Images
Images in The Web Framework are responsive by default. The routing layer detects the user agent and send the appropriate image, while javascript is used to resize the images while the window size changes.

You can generate an image tag in the views by using the `imageTag` helper:
```
<%= image('path/in/assets', {class: 'class names', id: 'idName'}) %>
```

### Stylesheets
Stylesheets are written in [LESS](http://lesscss.org/) and should be in the `/assets/stylesheets` directory. In development, you can update them and they will automatically reload on every request that they are changed. In production, they will be minified and put on a CDN. To make sure your link tags automatically take into account the url change between development and production use th `stylesheet` helper:
```
<%= stylesheet('path/in/assets/stylesheets') %>
```

### Client Side Javascript
Client side scripts are also minified and put on a CDN in production. During development, they should be placed in `/assets/javascripts`. To account for the url change between development and production use the `script` helper:
```
<%= script('path/in/assets/javascripts') %>
```

### Prefetch.js
By default, relative links in views will be prefetched once a page is rendered. When the user clicks on the link, the html will be swapped out on the client side and the URL will change via pushState. This significantly improves page load time. Before spending time building a javascript heavy front end, see if Prefetch.js is enough for your needs.



## License

(The MIT License)

Copyright (c) 2009-2012 Bowery Boys &lt;concierge@bowerygroup.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
