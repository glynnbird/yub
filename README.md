# YUB

## Introduction

What is Yub? It's a simple Yubico Yubikey API client that

* authenticates a Yubkiey's OTP (one time password) using the Yubico API
* signs the outgoing data
* checks the incoming data's signature
* extracts the Yubkey's unique identifier if the OTP is valid

## Installation

'''
  npm install yub
'''

You'll also need a Yubico API Key from here: https://upgrade.yubico.com/getapikey/

## Example code

```
var yub = require('yub');

// initialise the yub library
yub.init("<client id here>", "<secret here>");

// attempt to verify the key
yub.verify("<otp here>", function(err,data) {
  console.log(err, data)
});
```

## Further examples

Further examples can be found in the examples directory.

