const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//  @route      GET api/auth
//  @desc       Test route
//  @access     Public
router.get('/', auth, async (req, res) => {
  //  Get the user info from database online
  try {
    const user = await User.findById(req.user.id).select('-password'); //  leave the pasword in the date
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

//  @route      POST api/auth
//  @desc       Authenticate user & get token
//  @access     Public
router.post(
  '/',
  [
    //    'email' must be email format
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //  add "return" to erase red dot error
    }

    const { email, password } = req.body; //  get user's name, email, pswd

    try {
      //  See if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Username or password is not correct' }] });
      }

      //    Make sure pswd matches
      const isMatch = await bcrypt.compare(password, user.password); //  compare pswd typed in and the encrypted pswd in database

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Username or password is not correct' }] });
      }

      //  Return jsonwebtoken

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecure'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //res.send('User registered');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
