'use strict';

require('mocha');
var assert = require('assert');
var fs = require('fs');
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

  it('should have a "types" field pointing to "./index.d.ts"', function() {
    assert.equal(pkg.types, './index.d.ts');
  });

  it('should include "index.d.ts" in the "files" array', function() {
    assert.ok(Array.isArray(pkg.files), 'expected package.json to have a "files" array');
    assert.ok(pkg.files.indexOf('index.d.ts') !== -1, 'expected "files" to include "index.d.ts"');
  });
});

describe('index.d.ts', function() {
  var typesPath = path.join(__dirname, '..', 'index.d.ts');

  it('should exist on disk', function() {
    assert.ok(fs.existsSync(typesPath), 'expected index.d.ts to exist on disk');
  });

  it('should declare kindOf', function() {
    var contents = fs.readFileSync(typesPath, 'utf8');
    assert.ok(contents.indexOf('kindOf') !== -1, 'expected index.d.ts text to name kindOf');
  });
});

describe('advertised paths are shipped', function() {
  function normalize(p) {
    return p.replace(/^\.\//, '');
  }

  function collectAdvertisedPaths(manifest) {
    var paths = [];
    if (typeof manifest.main === 'string') paths.push(manifest.main);
    if (typeof manifest.types === 'string') paths.push(manifest.types);
    if (manifest.exports && typeof manifest.exports === 'object') {
      Object.keys(manifest.exports).forEach(function(key) {
        var val = manifest.exports[key];
        if (typeof val === 'string') paths.push(val);
      });
    }
    return paths;
  }

  var files = (pkg.files || []).map(normalize);
  var seen = {};
  var advertised = collectAdvertisedPaths(pkg)
    .map(normalize)
    .filter(function(rel) {
      if (rel === 'package.json') return false;
      if (seen[rel]) return false;
      seen[rel] = true;
      return true;
    });

  advertised.forEach(function(rel) {
    it('should ship "' + rel + '", advertised by main/types/exports, and have it covered by "files"', function() {
      var full = path.join(__dirname, '..', rel);
      assert.ok(fs.existsSync(full), 'expected advertised path "' + rel + '" to exist on disk');
      assert.ok(files.indexOf(rel) !== -1, 'expected "files" to cover advertised path "' + rel + '"');
    });
  });
});
