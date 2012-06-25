var fs = require('fs')
, httpProxy = require('http-proxy')
, http = require('http')
, url = require('url')
, utils = require('./utils');


var config_file = "/Users/rampr/work/hashcube/tools/rproxy/config.json";
var backends = {};
var config = new utils.Config().get(config_file);
var log_data = new utils.LogData();
var server = http.createServer();

/* Load and parse Config file */
function loadConfig() {
  // Parsing and setting up backends from the config file
  for(i in config.backends) {
    backends[i] = new httpProxy.HttpProxy({
      target: {
        host : config.backends[i].host,
        port : config.backends[i].port
      }
    });
    // Catch proxy errors and send 500
    backends[i].on('proxyError', function(err, req, res) {
      console.error(err);
      if(err.code == 'ECONNREFUSED') {
        console.error('Unable to proxy to target server. This probably means the target server '+
                    'is not listening on the given port or host');
      }
      res.writeHead(500, {'Content-type': 'text/html'});
      res.end('<h3> Internal Server Error </h3> Well this is embarrassing. Please try again.');
    });
  }
}

/* Setup proxy rules for backends from config file */
var setupServer = function (server) {
  server.on('request', function(req, res) {
    var matched = false;
    for(i in config.router) {
      if(req.url.match(i)) {
        log_data.logProxyData(req, config.router[i]);
        backends[config.router[i]].proxyRequest(req, res);
        matched = true;
        break;
      }
    }
    if(!matched) {
      log_data.logProxyData(req, 'default backend');
      backends.default_backend.proxyRequest(req, res);
    }
  });

  server.on('upgrade', function(req, socket, head) {
    console.log('UPGRADING HEADER FOUND!');
    log_data.logUpgradeData(req, config.onUpgrade);
    backends[config.onUpgrade].proxyWebSocketRequest(req, socket, head);
  });

  // Error Handling
  server.on('uncaughtException', function(err) {
    console.error('uncaughtException: ', err.message);
    console.error(err.stack);
  });

  server.on('error', function(err) {
    console.error('Server encountered error: ', err.message);
    console.error(err.stack);
  });
};

loadConfig();
setupServer(server);

module.exports = server;
