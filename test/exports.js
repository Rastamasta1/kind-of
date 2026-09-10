'use strict';

require('mocha');
var assert = require('assert');
var path = require('path');
var pkg = require(path.join('..', 'package.json'));

describe('package.json exports', function() {
  it('should have a "main" field pointing to index.js', function() {
    assert.equal(pkg.main, 'index.js');
  });

  it('should map "." to "./index.js"', function() {
    assert.ok(pkg.exports, 'expected package.json to have an "exports" field');
    assert.equal(pkg.exports['.'], './index.js');
  });

  it('should map "./package.json" to "./package.json"', function() {
    assert.ok(pkg.exports, 'expected package.json to have an "exports" field');
    assert.equal(pkg.exports['./package.json'], './package.json');
  });
});
