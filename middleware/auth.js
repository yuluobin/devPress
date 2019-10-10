const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  //  Get token from header
  const token = req.header('x-auth-token'); //  header key send along with token

  //  Check if no token
  if (!token) {
    res.status(401).json({ msg: 'No token, authrization denied' });
  }

  //  Verify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecure'));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
