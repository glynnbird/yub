var assert = require('assert');
var yub = require('../index.js');
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

describe('template', function() {
  before(function(done) {
    yub.init(username, password);
    done();
  });

  it('should work offline', function(done) {
    yub.verifyOffline('cffcccdebcntjcbuelkbidnitrgidnkhgkehbrlbhtgk', function(err, data) {
      assert.equal(err,  null);
      assert.equal(typeof data, 'object');
      assert.equal(data.status, null);
      assert.equal(data.signatureVerified, false);
      assert.equal(data.identity, 'cffcccdebcnt');
      assert.equal(data.valid, false);
      done();
    });
  });

  it('should detect invalid otp online', function(done) {
    yub.verify('cffcccdebcntbilunkhgvehfuigcljjtudrfhgikcirl', function(err, data) {
      assert.equal(err,  null);
      assert.equal(typeof data, 'object');
      assert.equal(data.status, 'BAD_OTP');
      assert.equal(data.identity, null);
      assert.equal(data.valid, false);
      done();
    });
  });


});