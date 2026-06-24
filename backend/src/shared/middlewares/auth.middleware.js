// Authentication and Role Authorization Middlewares placeholder
module.exports = {
  protect: (req, res, next) => next(),
  restrictTo: (...roles) => (req, res, next) => next(),
};
