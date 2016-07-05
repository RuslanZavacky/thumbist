const sharp = require('sharp');
const winston = require('./logging');

class Resizer {
  resize(body, width, height) {
    return new Promise((resolve, reject) => {
      winston.profile('Resize');
      sharp(body)
        .resize(width, height)
        .max()
        .crop(sharp.strategy.entropy)
        .progressive()
        .background('white')
        .embed()
        .toBuffer((err, outputBuffer, info) => {
          winston.profile('Resize');

          if (err) {
            return reject(err);
          }

          return resolve(outputBuffer, info);
        });
    });
  }
}

module.exports = Resizer;