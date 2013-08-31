
var yub = require('../index.js');

var key = process.argv.length - 1;
var otp = process.argv[key];

// initialise the yub library
yub.init("12893", "B5igHDG7W4RiPDW2Bu2L4Rl/S5U=");

// attempt to verify the key
yub.verify(otp, function(err,data) {
  if(err) {
    console.log("Error");
    process.exit(-1);
  }
  if (data.signatureVerified && data.nonceVerified && data.status == "OK") {
    console.log(data);
    process.exit(0);
  } else {
    console.log("Invalid OTP");
    process.exit(-2);
  }
});
