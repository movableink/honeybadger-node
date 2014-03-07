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

exports.notifyError = function(err, data, callback) {
  data = data || {};

  for(var k in data) {
    if(data.hasOwnKey(k)) {
      err[k] = data[k];
    }
  }

  var trace = parsetrace(err).object();
  if(trace.frames) {
    err.backtrace = [];
    for(var i = 0; i < trace.frames.length; i++) {
      var frame = trace.frames[i];
      err.backtrace.push({
        method: frame['function'],
        number: frame.line,
        file:   frame.file
      });
    }
  }

  exports.notify(err, callback);
};

exports.notify = function(data, callback) {
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

    callback() if callback
  });
};

exports.errorPackage = function (data) {
  return {
    "error": {
      "backtrace": data.backtrace,
      "class":     data.name,
      "message":   data.message || 'Default message'
    },
    "request":{
      "url":        data.url        || 'http://localhost',
      "component":  data.component  || 'component',
      "action":     data.action     || 'action',
      "params":     data.params     || {},
      "controller": data.controller || 'worker',
      "session":    data.session    || {}
    },
    "notifier": {
      "name":     "Node Honeybadger Notifier",
      "url":      "http://github.com/movableink/honeybadger-node",
      "version":  "1.3.0",
      "language": "javascript"
    },
    "server": {
      "project_root":     conf.cwd,
      "hostname":         os.hostname(),
      "environment_name": conf.environment
    }
  }
}
