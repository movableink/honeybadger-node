var os = require ('os');
var request = require ('request');

var HONEYBADGER_API_KEY = process.env.HONEYBADGER_API_KEY;

exports.notify = function(data) {
  console.log("Exception: " + data.message);
  var requestOptions = {
      url:'https://api.honeybadger.io/v1/notices',
      headers:{
        'content-type':'application/json',
        'X-API-Key':HONEYBADGER_API_KEY,
        'Accept':'application/json'
      },
      json:exports.errorPackage(data)
  };
  request.post(
    requestOptions,
    function(e,r,body) {
      console.log('POST to honeybadger, status=' + r.statusCode + ' message=' + data.message);
    }
  );
}

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
      "url": "github/something",
      "version": "1.3.0"
    },
    "server": {
      "hostname": os.hostname()
    }
  }
}
