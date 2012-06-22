var fs = require('fs');

var Config = function() {

  var config;

  this.get= function(config_file) {
    try {
      this.config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));
    } catch(err) {
      if(err.errno == 34) {
        console.error("FATAL ERROR: Can't find config file ", config_file);
        process.exit(1);
      }
      else {
        console.error(err);
      }
    }
    return this.config;
  }
};

var LogData = function() {
  this.logProxyData = function(req, proxied_to) {
    var date = this.getFormattedDate();
    var log_data = req.headers.host + ' - '  + '[' + date + ']' + ' "' + req.method + ' ' + 
      req.url + ' HTTP/' + req.httpVersion +'" "' + req.headers.referer + '" "' + 
      req.headers['user-agent'] +  '" ' + ' proxied_to: ' + proxied_to;
    console.log(log_data);
  };

  this.logUpgradeData = function(req, proxied_to) {
    var date = this.getFormattedDate();
    console.log(req.headers.host + ' - ' + '[' + date + ']' + ' "' + req.url + ' proxied_to: ' + proxied_to);
  };

  this.pad = function(n) {
    return n < 10 ? '0' + n : n;
  };

  this.getFormattedDate = function() {
    var date = new Date();
    var formatted_date = this.pad(date.getDate()) + '/' + this.pad(date.getMonth() + 1) + '/' +
      date.getFullYear() + ':' + this.pad(date.getHours()) + ':'  +   
      this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds());
    return formatted_date;
  };
};

exports.Config = Config;
exports.LogData = LogData;
