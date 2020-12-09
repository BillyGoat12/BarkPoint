/* eslint-disable no-underscore-dangle */
const { Router } = require('express');
const passport = require('passport');
const { User } = require('../db/models/models');

const authRouter = Router();

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  }
  res.status(200).send('not logged in');
};

authRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

/**
 * If google authentication is successful, the user will be sent to a form page where
 * they can input information about their pet dog
 */
authRouter.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    res.cookie('Barkpark', req.user);
    const { _json } = req.user;
    User.findUser(_json.email)
      .then((result) => {
        if (result) {
          res.redirect('/profile');
        } else {
          User.createUser(_json).then(() => {
            res.redirect('/form');
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  },
);

/**
 * If the user is already logged in, don't send them to the form page
 */
authRouter.get('/', isLoggedIn, (req, res) => {
  res.send('this is the profile');
});

/**
 * Upon logout destroy the current session and send user back to the sign-in page
 */
authRouter.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('Barkpark');
  req.logOut();
  res.redirect('/logout');
});

/**
 * Once a session is registered, a user is then recorded as an instance.
 * sends the user session data from request.
 */
authRouter.get('/session', ({ cookies }, res) => {
  // const { _json } = user;
  // console.log('here', _json);
  // console.log('two', cookies.Barkpark._json);
  // res.status(200).send(cookies.Barkpark._json);
  if (cookies.Barkpark) {
    res.status(200).send(cookies.Barkpark._json);
  } else {
    res.sendStatus(500);
  }
});

module.exports = authRouter;
