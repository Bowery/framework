// Copyright 2013 Bowery Group
/**
 * @fileoverview Models a user.
 */
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
      email: {
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
        default: uuid.v1
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