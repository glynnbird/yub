// lookup table for modhex codes
var trans = "cbdefghijklnrtuv";

// convert number to 2 digit hex = 255 --> ff
var toHex = function(n) {
  return ("0" + n.toString(16)).substr(-2);
}

// decode a modhex string to an integer
// see http://static.yubico.com/var/uploads/pdfs/YubiKey_manual-2.2.pdf
var decode = function (src) {
  var b = 0;
  var flag = false;
  var dst = null;
  var hex = "";
  var p1 = null;

  // convert string to hexadecimal string
  for (i=0; i < src.length; i++) {
    p1 = trans.indexOf(src[i]);
    if(p1 == -1) {
      // if a unsupported digit is detected, return null
      return null;
    }
    b = (p1 == -1)?0:p1;
    if ((flag = !flag)) {
      dst = b;
    } else {
      hex += toHex(dst << 4 | b)
	  }
	}
	
	// return as decimal number
	return parseInt(hex,16);
}

module.exports = {
  decode: decode
}