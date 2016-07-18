const LoaderStaticImage = require('../loaders/static-image');
const LoaderAws = require('../loaders/amazon-s3');

const _splitUrl = function (url) {
  url = String(url).trim('/');

  let parts = url.split('/').filter(Boolean);

  let hash = parts[0];
  let resizeType = parts[1];
  let dimension = String(parts[2]).split('x');
  let width = parseInt(dimension[0]);
  let height = parseInt(dimension[1]);
  let filters = parts[3];
  let path = parts.slice(4).join('/');

  return {
    hash, resizeType, width, height, filters, path
  }
};

class DefaultVoter {
  constructor(config) {
    this.s3 = new LoaderAws(config.get('loaders.s3'));
    this.staticImage = new LoaderStaticImage(config.get('loaders.staticImage'));
  }

  setS3Loader(s3) {
    this.s3 = s3;
  }

  getS3Loader() {
    return this.s3;
  }

  getStaticImageLoader() {
    return this.staticImage;
  }

  validateHash(hash) {
    // TODO: implement hash validation
    return true;
  }

  parseFilters(filters) {
    // TODO: parse filters and return chain of filters
    return [];
  }

  decide(url) {
    // TODO: (1) validate hash, (2) type of resize
    // (3) apply correct filters

    const {width, height, path, hash, filters, resizeType} = _splitUrl(url);

    if (!this.validateHash(hash)) {
      // if hash doesn't match, return empty image
      return [{loader: this.getStaticImageLoader()}];
    }

    const filtersChain = this.parseFilters(filters);

    if (width && height) {
      return [
        {
          loader: this.getS3Loader(),
          args: [
            path,
            {width, height, resizeType, filtersChain}
          ]
        },
        {
          loader: this.getStaticImageLoader()
        }
      ];
    } else {
      return [{loader: this.getStaticImageLoader()}];
    }
  }
}

module.exports = DefaultVoter;