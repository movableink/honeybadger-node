var os = require('os');
var request = require('request');
var parsetrace = require('parsetrace');

// defaults
var conf = {
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: 'development',
  cwd: process.cwd()
};

exports.configure = function(c) {
  for(var key in c) {
    if(c.hasOwnProperty(key)) {
      conf[key] = c[key];
    }
  }
};

exports.notifyError = function(err, data) {
  for(var k in data) {
    if(data.hasOwnKey(k)) {
      err[k] = data[k];
    }
  }

  var trace = parsetrace(err).object();
  if(trace.frames) {
    data.backtrace = [];
    for(var i = 0; i < trace.frames; i++) {
      var frame = trace.frames[i];
      data.backtrace.push({
        method: frame['function'],
        number: frame.line,
        file:   frame.file
      });
    }
  }

  exports.notify(data);
};

exports.notify = function(data) {
  console.log("Exception: " + data.message);

  if (!conf.apiKey) { return; }

  var requestOptions = {
    url: 'https://api.honeybadger.io/v1/notices',
    headers: {
      'content-type': 'application/json',
      'X-API-Key':    conf.apiKey,
      'Accept':       'application/json'
    },
    json: exports.errorPackage(data)
  };

  request.post(requestOptions, function(e,r,body) {
    if(e) { console.log("ERROR posting to honeybadger: " + e); }
    console.log('POST to honeybadger, status=' + r.statusCode + ' message=' + data.message);
  });
};

exports.errorPackage = function (data) {
  return {
    "error": {
      "backtrace": [
        {
          "file": "node",
          "method": "runtime_error",
          "number": "1"
        }
      ],
      "class": "RuntimeError",
      "message": data.message || 'Default message'
    },
    "request":{
      "url": data.url || 'http://localhost',
      "component":"component",
      "action":"action",
      "params":{"_method":"post"},
      "controller":"worker",
      "session":{}
    },
    "notifier": {
      "name": "Node Honeybadger Notifier",
      "url": "http://github.com/movableink/node-honeybadger",
      "version": "1.3.0",
      "language": "javascript"
    },
    "server": {
      "project_root":     conf.cwd,
      "hostname":         os.hostname(),
      "environment_name": conf.environment
    }
  }
}
