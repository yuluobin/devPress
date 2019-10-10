const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User'); //  get User Info

//  @route      POST api/users
//  @desc       Register Usr
//  @access     Public
router.post(
  '/',
  [
    //    use express-validator
    check('name', 'Name is Required')
      .not()
      .isEmpty(),
    //    'email' must be email format
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({
      min: 6
    })
  ],
  async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //  add "return" to erase red dot error
    }

    const { name, email, password } = req.body; //  get user's name, email, pswd

    try {
      //  See if the user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //  Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg', //  pg you know
        d: 'mm' //  default avatar
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });
      //  Encrypt password  // Since we use "async" here, "await" is used to make sure every step is completed
      const salt = await bcrypt.genSalt(10); //  use bcrypt, longer is the salt, safer is the pswd

      user.password = await bcrypt.hash(password, salt); //  get pswd and generate hash

      await user.save();

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
