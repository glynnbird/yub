var crypto = require('crypto');
var request = require('request');
var modhex = require('./modhex.js');

// stored client credentials
var clientID = null;
var secretKey = null;

// list of valid servers
var servers = ["api.yubico.com", "api2.yubico.com", "api3.yubico.com", "api4.yubico.com", "api5.yubico.com"];
var nonceLength = 40;

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
    retval = {},
    kv = [];
  Object.keys(obj).map(function(key) {
    kv = obj[key].split("=", 2);
    if (kv[0].length > 0) {
      retval[kv[0]] = kv[1];
    }
  });
  return retval;
};

// extract the identity portion of the Yubikey OTP i.e.
//  the string with last 32 characters removed
var calculateIdentity = function (otp) {
  var len = otp.length;
  return (len > 32) ? otp.substring(0, len - 32) : null;
};

// extract the encrypted portion of the Yubikey OTP i.e.
//  the last 32 characters 
var calculateEncrypted = function (otp) {
  var len = otp.length;
  return (len > 32) ? otp.substring(len - 32, len) : null;
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

// verify that the supplied one-time-password is valid or not
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
    var server = servers[Math.floor(Math.random() * servers.length)];
    var uri = 'https://' + server + '/wsapi/2.0/verify';

    // to https request
    request({ uri: uri, qs: params}, function (err, res, body) {
      
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
      body.identity = null;
      body.encrypted = null;
      body.encryptedHex = null;
      body.serial = null;
      if (typeof body.status != "undefined" && body.status === "OK") {
        body.identity = calculateIdentity(otp);
        body.encrypted = calculateEncrypted(otp);
        body.encryptedHex = modhex.decode(body.encrypted);
        body.serial = modhex.decodeInt(body.identity);
        body.valid = (body.signatureVerified && body.nonceVerified)
      } else {
        body.valid = false;
      }
      
      callback(null, body);

    });
  });
};

// if we have no network connectivity, we still may wish to extract the
// identity from the OTP, but handy for offline applications
var verifyOffline = function (otp, callback) {
      
  var identity = calculateIdentity(otp);
  var encrypted = calculateEncrypted(otp);
  
  var body = {
      t: null,
      otp: otp,
      nonce: null,
      sl: '0',
      status: null,
      signatureVerified: false,
      nonceVerified: false,
      identity: identity,
      encrypted: encrypted,
      encryptedHex: modhex.decode(encrypted),
      serial: modhex.decodeInt(identity)
  };    
      
  callback(null,  body);
};


module.exports = {
  init: init,
  verify: verify,
  verifyOffline: verifyOffline
};