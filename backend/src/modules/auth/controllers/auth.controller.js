// Auth Controller Placeholder
exports.login = async (req, res, next) => {
  try {
    res.status(200).json({ status: 'success', message: 'Logged in successfully' });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    res.status(201).json({ status: 'success', message: 'Registered successfully' });
  } catch (err) {
    next(err);
  }
};
