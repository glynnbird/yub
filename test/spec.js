'use strict';
process.env.NODE_ENV = 'test';
var assert = require('assert');
var yub = require('../index.js');
var qs = require('querystring');
var nock = require('nock');
var clientID = '12345';
var secretKey = 'dEaDBeEf==';

describe('yub', function() {
  before(function(done) {
    yub.init(clientID, secretKey);
    done();
  });

  it('should work offline', function(done) {
    var otp = 'cffcccdebcntjcbuelkbidnitrgidnkhgkehbrlbhtgk';
    yub.verifyOffline(otp, function(err, data) {
      assert.equal(err,  null);
      assert.equal(typeof data, 'object');
      assert.equal(data.status, null);
      assert.equal(data.signatureVerified, false);
      assert.equal(data.identity, otp.slice(0, 12));
      assert.equal(data.valid, false);
      done();
    });
  });

  it('should verify otp online', function(done) {
    var otp = 'cffcccdebcntbilunkhgvehfuigcljjtudrfhgikcirl';
    var pathMatcher = new RegExp('/wsapi/2\\\.0/verify' +
      '\\\?id=' + clientID +
      '&nonce=[0-9a-f]+?' +
      '&otp=' + otp +
      '&h=([a-zA-Z0-9]|%3D|%2B)+');

    // Fake the request
    nock(/https:\/\/api[2-5]?\.yubico\.com/)
      .get(pathMatcher)
      .reply(200, function(uri, _requestBody) {
        var query = qs.parse(uri.split('?')[1]);
        var out = {
          t: new Date().toISOString(),
          status: 'OK',
          nonce: query.nonce
        };
        out.h = yub._calculateHmac(out, secretKey);
        return yub._calculateStringToHash(out).replace(/&/g, '\r\n');
      });

    yub.verify(otp, function(err, data) {
      assert.equal(err, null);
      assert.equal(typeof data, 'object');
      assert.equal(data.status, 'OK');
      assert.equal(data.identity, otp.slice(0, 12));
      assert.equal(data.valid, true);
      done();
    });
  });

  it('should calculate correct HMAC', function() {
    var otp = 'cffcccdebcntbilunkhgvehfuigcljjtudrfhgikcirl';
    var expected = 'qM8ROgn0GATFwGoqqI68Nu4CJA4=';
    var obj = {
      id: clientID,
      nonce: 'abcdefg',
      otp: otp
    };
    var actual = yub._calculateHmac(obj, secretKey);
    assert.equal(actual, expected);
  });

  it('should round-robin through servers', function(done) {
    var otp = 'cffcccdebcntbilunkhgvehfuigcljjtudrfhgikcirl';

    var received = [];
    var servers = yub._servers;

    // Go around twice to ensure round-robin works
    for (var i = 0; i < servers.length * 2; i++) {
      req(i, function(err, data) {
        assert(err === null);
        received.push(data);
        if (received.length === servers.length * 2) {
          assert(received.slice().sort().toString() === servers.concat(servers).sort().toString());
          done();
        }
      });
    }

    function req(idx, finished) {
      // Fake the request
      nock(/https:\/\/api[2-5]?\.yubico\.com/)
        .get(/.*/)
        .reply(200, function(uri, _requestBody) {
          return 'host=' + this.req.headers.host;
        });

      yub.verify(otp, function(err, data) {
        finished(err, data.host);
      });
    }

  });

});
