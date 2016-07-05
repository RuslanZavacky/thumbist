const fs = require('fs');

class LoaderStaticImage {
  constructor(options = {path: null, contentType: 'image/png'}) {
    this._path = options.path;
    this._contentType = options.contentType;

    if (!this._path) {
      throw new Error('path should be specified in config for StaticImageLoader');
    }
  }

  request() {
    return new Promise(resolve => resolve({
        image: fs.readFileSync(this._path),
        options: {
          noResize: true,
          contentType: this._contentType
        }
      })
    );
  }
}

module.exports = LoaderStaticImage;