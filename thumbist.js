const LoaderStaticImage = require('./src/loaders/static-image');
const Resizer = require('./src/resize');
const winston = require('./src/logging');

const staticImage = (new LoaderStaticImage({path: './assets/no_image.png'})).request();

class Router {
  constructor(config, req, res) {
    this._config = config;
    this._request = req;
    this._response = res;

    this._votersChain = [];
  }

  addVoter(router) {
    this._votersChain.push(router);
  }

  _send(buffer, headers = {'Content-Type': null}, code = 200) {
    this._response.writeHead(code, headers);
    this._response.end(buffer, 'binary');
  }

  getLoadersFromVoters(url) {
    let loaders = [];

    for (let i = 0, max = this._votersChain.length; i < max; i++) {
      loaders = loaders.concat(this._votersChain[i].decide(url));
    }

    return loaders;
  }

  getImagesFromLoaders(loaders) {
    const _images = [];

    for (let i = 0, max = loaders.length; i < max; i++) {
      const loader = loaders[i].loader;
      const args = loaders[i].args || [];

      _images.push(loader.request.apply(loader, args));
    }

    return _images;
  }

  resize(image, options) {
    const picture = new Resizer();
    
    return new Promise((resolve, reject) => {
      picture.resize(image, options.width, options.height).then(resolve).catch(reject);
    });
  }

  route(url) {
    const loaders = this.getLoadersFromVoters(url);
    const images = this.getImagesFromLoaders(loaders);

    return Promise.all(images).then(_images => {
      if (!_images.length) {
        return this._send(staticImage.image, {'Content-type': staticImage.contentType}, 404);
      }

      const image = _images[0].image;
      const options = _images[0].options;

      if (options.noResize) {
        this._send(image, {'Content-type': options.contentType});
      } else {
        this.resize(image, options.width, options.height).then(image => {
          this._send(image, {'Content-type': options.contentType})
        }).catch((err) => {
          winston.error(err);
          this._send(staticImage.image, {'Content-type': staticImage.contentType}, 404);
        });
      }
    }).catch(err => {
      winston.error(err);
      this._send(staticImage.image, {'Content-type': staticImage.contentType}, 404);
    });
  }
}

module.exports = Router;