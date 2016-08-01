'use strict';
/* eslint-disable no-console */
var yub = require('../index.js');

var key = process.argv.length - 1;
var otp = process.argv[key];

var clientId = process.env.CLIENT_ID || process.env.USER;
var secretKey = process.env.SECRET_KEY || process.env.PASSWORD;

// initialise the yub library
yub.init(clientId, secretKey);

// attempt to verify the key
yub.verifyOffline(otp, function(err,data) {
  if(err) {
    console.log('Error');
    process.exit(-1);
  }
  if (data.identity && data.serial) {
    console.log(data);
    process.exit(0);
  } else {
    console.log('Invalid OTP');
    process.exit(-2);
  }
});
