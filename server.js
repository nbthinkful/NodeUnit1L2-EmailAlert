'use strict';

const express = require('express');
const morgan = require('morgan');
const {sendEmail} = require('./emailer');

// this will load our .env file if we're
// running locally. On Gomix, .env files
// are automatically loaded.
require('dotenv').config();

const {logger} = require('./utilities/logger');
// these are custom errors we've created
const {FooError, BarError, BizzError} = require('./errors');

const app = express();

// this route handler randomly throws one of `FooError`,
// `BarError`, or `BizzError`
const russianRoulette = (req, res) => {
  const errors = [FooError, BarError, BizzError];
  throw new errors[
    Math.floor(Math.random() * errors.length)]('It blew up!');
};


app.use(morgan('common', {stream: logger.stream}));

// for any GET request, we'll run our `russianRoulette` function
app.get('*', russianRoulette);

// YOUR MIDDLEWARE FUNCTION should be activated here using
// `app.use()`. It needs to come BEFORE the `app.use` call
// below, which sends a 500 and error message to the client
app.use((err, req, res, next) => {
  switch (err.name) {
    case 'FooError':
    case 'BarError':
      let emailData = {
        from: `${process.env.ALERT_FROM_NAME}<${process.env.ALERT_FROM_EMAIL}>`,
        to: process.env.ALERT_TO_EMAIL,
        subject: `Alert: A ${err.name} occurred`,
        text: `An Error [${err.message}] Occurred. Trace: ${err.stack}`,
        html: `<h1>Error!!</h1>An Error <b>${err.message}</b> Occurred.<h2>Trace:</h2><p>${err.stack}</p>`
      };
      sendEmail(emailData);
      break;
  };

  next();
});

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

const port = process.env.PORT || 8080;

const listener = app.listen(port, function () {
  logger.info(`Your app is listening on port ${port}`);
});
