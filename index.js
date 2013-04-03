
module.exports = process.env.EXPRESS_COV
  ? require('./lib-cov/bowery')
  : require('./lib/bowery');