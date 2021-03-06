var test = require('tape'),
    fs = require('fs'),
    path = require('path'),
    normalize = require('../');
    cases = [];

fs.readdirSync(__dirname + '/json').forEach(function(file) {
  cases.push(JSON.parse(fs.readFileSync(__dirname + '/json/' + file)));
});

test('undefined is returned when invalid', function(t) {
  t.ok(typeof normalize({}) === 'undefined');
  t.end();
});

test('appropriate properties are extracted', function(t) {
  cases.forEach(function(c) {
    var n = normalize(c);
    t.equal(n.id, 'vec2');
    t.equal(n.name, 'vec2');
    t.equal(n.description, 'Library for manipulating 2d vectors');
    t.ok(n.readme);
    t.ok(n.created);
    t.ok(n.modified);
    t.equal(n.version, '1.2.0');
    t.ok(n.license && typeof n.license.join === 'function');
    t.ok(n.homepage && typeof n.homepage === 'string');
    t.ok(n.repository && typeof n.repository === 'string');
    t.equal(n.author, 'tmpvar');

    t.ok(
      !n.times ||
      (n.times && Object.keys(n.times).length === 10)
    );

    t.ok(Array.isArray(n.dependencies));
    t.ok(Array.isArray(n.devDependencies));
    t.ok(Array.isArray(n.maintainers));
    t.ok(Array.isArray(n.users));
    t.ok(Array.isArray(n.license));
  });
  t.end();
});

test('devDependencies and dependencies should work', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        dependencies : { a: 1, b: 2 },
        devDependencies : {
          x : 1,
          y : 2
        }
      }
    }
  })
  t.equal(2, out.dependencies.length);
  t.equal('a', out.dependencies[0]);
  t.equal('b', out.dependencies[1]);
  t.equal(2, out.dependencies.length);
  t.end();
});

test('double slash in url (homepage)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        homepage : 'https://test//something'
      }
    }
  })
  t.equal(out.homepage, 'https://test/something');
  t.end();
});

test('double slash in url (repo)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        repository : 'git://test//something'
      }
    }
  })
  t.equal(out.homepage, 'http://test/something');
  t.end();
});

test('weird/invalid github format (repo=github:user/repo)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        repository : 'github:user/something.git'
      }
    }
  })
  t.equal(out.homepage, 'https://github.com/user/something');
  t.end();
});

test('weird/invalid github format (homepage=github:user/repo)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        homepage : 'github:user/something.git'
      }
    }
  })
  t.equal(out.homepage, 'https://github.com/user/something');
  t.end();
});

test('weird/invalid github format (homepage=github:user/repo)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        homepage : 'http://github.com/user/something.git'
      }
    }
  })
  t.equal(out.homepage, 'https://github.com/user/something');
  t.end();
});

test('homepage array (repository)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        repository : ['http://github.com/user/something.git']
      }
    }
  })
  t.equal(out.homepage, 'https://github.com/user/something');
  t.end();
});

test('homepage array (homepage)', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        homepage : ['http://github.com/user/something.git']
      }
    }
  })
  t.equal(out.homepage, 'https://github.com/user/something');
  t.end();
});

test('invalid license format', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        license : { type : "", url: "" }
      }
    }
  })
  t.deepEqual(out.license, []);
  t.end();
});

test('license dash', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        license : "CC-BY-4.0"
      }
    }
  })
  t.deepEqual(out.license, ['CC-BY-4.0']);
  t.end();
});

test('license underscore', function(t) {
  var out = normalize({
    versions: {
      "0.0.0" : {
        license : "CC_BY_4.0"
      }
    }
  })
  t.deepEqual(out.license, ['CC_BY_4.0']);
  t.end();
});

test('license mispelled', function(t) {
  var mispellings = ['lisence', 'licence', 'lisense']
  mispellings.forEach(function(key) {
    var version = {}
    version[key] =  "CC_BY_4.0"
    var out = normalize({
      versions: {
        "0.0.0" : version
      }
    })
    t.deepEqual(out.license, ['CC_BY_4.0']);
  })
  t.end();
});
