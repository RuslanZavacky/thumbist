const winston = require('../logging');

const LoaderStaticImage = require('../loaders/static-image');
const LoaderAws = require('../loaders/amazon-s3');

class DefaultVoter {
  constructor(config) {
    this._hashAlgorithm = 'sha512';

    this.s3 = new LoaderAws(config.s3);
    this.staticImage = new LoaderStaticImage(config.staticImage);
  }

  setS3Loader(s3) {
    this.s3 = s3;
  }

  getS3Loader() {
    return this.s3;
  }

  setStaticImageLoader(loader) {
    this.staticImage = loader;
  }

  getStaticImageLoader() {
    return this.staticImage;
  }

  splitUrl(url) {
    url = String(url).trim('/');

    let parts = url.split('/').filter(Boolean);

    let hash = parts[0];
    let type = parts[1];
    let dimension = String(parts[2]).split('x');
    let width = parseInt(dimension[0]);
    let height = parseInt(dimension[1]);
    let filters = parts[3];
    let path = parts.slice(4).join('/');

    return {
      hash, type, width, height, filters, path
    }
  }

  decide(url) {
    // TODO: (1) validate hash, (2) type of resize
    // (3) apply correct filters

    let {width, height, path} = this.splitUrl(url);

    if (width && height) {
      return [{loader: this.getS3Loader(), args: [path, {width, height}]}];
    } else {
      return [{loader: this.getStaticImageLoader()}];
    }
  }
}

module.exports = DefaultVoter;