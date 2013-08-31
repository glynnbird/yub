# YUB

## Introduction

What is Yub? It's a simple Yubico Yubikey API client that

* authenticates a Yubkiey's OTP (one time password) using the Yubico API
* signs the outgoing data
* checks the incoming data's signature
* extracts the Yubkey's unique identifier if the OTP is valid

## Installation

Yub is published as an NPM module for your convenience:

```
  npm install yub
```

You'll also need a Yubico API Key from here: https://upgrade.yubico.com/getapikey/. This gives you the
client_id and secret_key that must be passed to "yub.init()", see below.

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

## What's in the 'data' returned by yub.verify?

A typical 'data' return from yub.verify looks like this:

```
{
    t: '2013-08-31T07: 13: 27Z0111',
    otp: 'cccaccbtbvkwjjirhcctvdgbahdbijduldcjdurgjgfi',
    nonce: '50fb8a88a327b4af16e6e7bd9ec4e4e6c692f2e5',
    sl: '25',
    status: 'OK',
    signatureVerified: true,
    nonceVerified: true,
    identity: 'cccaccbtbvkw'
}
```

* t - the timestamp of the interaction
* otp - the supplied one-time-password
* nonce - a unique piece of information provided by the client to the server
* sl - the percentage of servers responding. This library only picks one (of the 5) Yubico server to authenticate with, so this value should be 20 (percent)
* status - whether the supplied one-time-password was valid or not. Common return values 
** 'OK' - everything's fine
** 'BAD_OTP' - invalid password supplied
** 'REPLAYED_OTP' - the password has been used before
** further return values documented here https://code.google.com/p/yubikey-val-server-php/wiki/ValidationProtocolV20
* signatureVerified - whether the reply from the Yubico server was correctly signed
* nonceVerified - whether the reply 'nonce' was the same as the outgoing 'nonce'
* identity - the unique identifier of the Yubikey that generated the password. If you want to write software the detects the presence of a specific Yubikey (not just any Yubikey), then data.identity is your friend.

## Further examples

In the 'example' directory is an example command-line utility (test.js) which exits with a different return code, depending
on whether the supplied OTP was valid or not. This could easily be plumbed into a command-line script to only allow execution
to proceed with a valid OTP.

It takes the OTP as a command-line parameter i.e. type "node test.js ", insert your Yubikey and press the gold button:

```
> node test.js cccaccbtbvkwjjirhcctvdgbahdbijduldcjdurgjgfi
{   t: '2013-08-31T07: 13: 27Z0111',
    otp: 'cccaccbtbvkwjjirhcctvdgbahdbijduldcjdurgjgfi',
    nonce: '50fb8a88a327b4af16e6e7bd9ec4e4e6c692f2e5',
    sl: '25',
    status: 'OK',
    signatureVerified: true,
    nonceVerified: true,
    identity: 'cccaccbtbvkw'}
```

## References

* https://code.google.com/p/yubikey-val-server-php/wiki/GettingStartedWritingClients
* https://code.google.com/p/yubikey-val-server-php/wiki/ValidationProtocolV20

## Disclaimer

This software is open-source and is a personal project, not officially endorsed by Yubico in any way.

