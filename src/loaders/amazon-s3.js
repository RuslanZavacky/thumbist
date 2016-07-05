const aws = require('aws-sdk');
const winston = require('../logging');

class S3Loader {
  constructor(options = {
    accessKeyId: null,
    secretAccessKey: null,
    region: 'us-west-2'
  }) {
    aws.config.update({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region
    });

    this.s3 = new aws.S3();
  }

  s3Request(data) {
    return new Promise((resolve, reject) => {
      this.s3.getObject(data, function (err, data) {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      });
    });
  }

  request(path, options = {width: null, height: null}) {
    let parts = path.split('/');
    let bucket = parts[0];
    let filePath = parts.slice(1).join('/');

    return new Promise((resolve, reject) => {
      this.s3Request({Bucket: bucket, Key: filePath}).then((data) => {
        return resolve({
          image: data.Body,
          options: {
            contentType: data.ContentType,
            noResize: false,
            width: options.width,
            height: options.height
          }
        });
      }).catch(reject);
    });
  }
}

module.exports = S3Loader;