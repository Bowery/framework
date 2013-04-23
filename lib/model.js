// Copyright 2013 The Bowery Group

/**
 * @fileoverview creates a Model constructor
 * given the name of the model. It make ths
 * assumption that your models are stored in 
 * the /models directory.
 */

var db = require('mongoose')
db.connect('mongodb://localhost/bowery' + process.env.BOWERY_ID)

module.exports = function (name) {

  /* Private Variables */
  var input = require('./models/' + name.toLowerCase())(),
      schema = new db.Schema(input.schema)

  for (var key in input.statics)
    schema.statics[key] = input.statics[key]

  for (var key in input.methods)
    schema.methods[key] = input.methods[key]

  return db.model(name, schema);
}
