var crypto = require('crypto');
var request = require('request');

// stored client credentials
var clientID = null;
var secretKey = null;

// list of valid servers
var servers = ["api.yubico.com", "api2.yubico.com", "api3.yubico.com", "api4.yubico.com", "api5.yubico.com"];
var nonceLength = 40;

// pick a random server
var pickServer = function() {
  var len = servers.length;
  var r = Math.random();
  return servers[Math.floor(r * len)];
};

// store the client credentials
// Apply here https://upgrade.yubico.com/getapikey/
var init = function (client_id, secretkey) {
  clientID = client_id;
  secretKey = secretkey;
};

// parse the returned date which is CR/LF delimited string with key/value pairs
// separated by '='
var parse = function (data) {
  var obj = data.split("\r\n"),
    retval = {};
  Object.keys(obj).map(function(key) {
    var kv = obj[key].split("=", 2);
    if (kv[0].length > 0) {
      retval[kv[0]] = kv[1];
    }
  });
  return retval;
};

// extract the identity portion of the Yubikey OTP i.e.
//  the string with last 32 characters removed
var calculateIdentity = function(otp) {
  var len = otp.length;
  return (len > 32) ? otp.substring(0, len - 32) : null;
};

// calculate the string that is required to be hashed i.e.
//  keys in alphabetical order, separated from values by '='  
//  and by each other by '&' (like querystrings, but without the escaping)
var calculateStringToHash = function (obj) {
  return Object
    .keys(obj)
    .sort()
    .map(function(key) {
      return key + '=' + obj[key];
    })
    .join('&');
};

// calculate the Hmac signature of an object
// according to instructions here: https://code.google.com/p/yubikey-val-server-php/wiki/ValidationProtocolV20
var calculateHmac = function (obj) {
  var str = calculateStringToHash(obj);
  var buf = new Buffer(secretKey, 'base64').toString('binary');
  var hmac = crypto.createHmac('sha1', buf);
  return hmac.update(str).digest('base64');
};

// verify that the supplie one-time-password is valid or not
// calls back with (err,data). If err is not null, then you have
// an object in data to work with
var verify = function (otp, callback) {
  
  // create 40 character random string
  crypto.randomBytes(nonceLength, function (err, buf) {
    
    // turn it to hex
    var nonce = buf.toString('hex').slice(0, 40);
    
    // create parameters to send to web service
    var params = {
      id: clientID,
      nonce: nonce,
      otp: otp
    };
    
    // calculate sha1 signature
    params.h = calculateHmac(params);
    
    // calculate url
    var uri = 'https://' + pickServer() + '/wsapi/2.0/verify';

    // to https request
    request({ uri: uri, qs: params} , function (err, res, body) {
      
      // error
      if (res.statusCode !== 200) {
        return callback(true, null);
      }
      
      // parse the return value
      body = parse(body);

      // check whether the signature of the reply 
       var bodyh = body.h;
      delete body.h;
      var h = calculateHmac(body);
      body.signatureVerified = (bodyh === h.replace("=", ''));
      
      // check whether the nonce is the same as the one we gave it
      body.nonceVerified = (nonce === body.nonce);
      
      // calculate the key's identity
      if (typeof body.status != "undefined" && body.status === "OK") {
        body.identity = calculateIdentity(otp);
      }
      callback(null, body);

    });
  });
};

module.exports = {
  init: init,
  verify: verify
};