const winston = require('winston');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: 'info',
  prettyPrint: false,
  colorize: true,
  silent: false,
  timestamp: true
});

module.exports = winston;