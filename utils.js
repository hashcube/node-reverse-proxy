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
}

module.exports = Config;
