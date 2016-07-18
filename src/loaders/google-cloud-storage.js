const gcloud = require('gcloud');

class GoogleCloudStorageLoader {
  constructor(options = {bucket: null, keyFilename: null, projectId: null}) {
    this.bucket = options.bucket;

    this.gcs = gcloud.storage({
      keyFilename: options.keyFilename,
      projectId: options.projectId
    });
  }

  request(path, options = {width: null, height: null}) {
    return new Promise((resolve, reject) => {
      const file = this.gcs.bucket(this.bucket).file(path);

      file.get((err, fileContent, apiResponse) => {
        if (err) {
          return reject(err);
        }

        file.download((err, contents) => {
          if (err) {
            return reject(err);
          }

          return resolve({
            image: contents,
            options: {
              contentType: apiResponse.contentType,
              noResize: false,
              width: options.width,
              height: options.height
            }
          });
        });
      });
    });
  }
}

module.exports = GoogleCloudStorageLoader;