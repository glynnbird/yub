
var yub = require('../index.js');

var key = process.argv.length - 1;
var otp = process.argv[key];

// initialise the yub library
yub.init(process.env.USERNAME, process.env.PASSWORD);

// attempt to verify the key
yub.verify(otp, function(err,data) {
  if(err) {
    console.log("Error");
    process.exit(-1);
  }
  console.log(data);
  if (data.valid) {
    console.log(data);
    process.exit(0);
  } else {
    console.log("Invalid OTP");
    process.exit(-2);
  }
});
