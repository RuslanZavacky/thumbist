const Resizer = require('./resize');
const winston = require('./logging');

const _getImagesFromLoaders = function(loaders) {
  const _images = [];

  for (let i = 0, max = loaders.length; i < max; i++) {
    const loader = loaders[i].loader;
    const args = loaders[i].args || [];

    _images.push(loader.request.apply(loader, args));
  }

  return _images;
};

class Thumbist {
  constructor(config, req, res) {
    this._config = config;
    this._request = req;
    this._response = res;

    this._fallbackImage = null;

    this._votersChain = [];
  }

  addVoter(voter) {
    this._votersChain.push(voter);
  }

  getLoadersFromVoters(url) {
    let loaders = [];

    for (let i = 0, max = this._votersChain.length; i < max; i++) {
      loaders = loaders.concat(this._votersChain[i].decide(url));
    }

    return loaders;
  }

  setFallbackImage(image) {
    this._fallbackImage = image;
  }

  _send(buffer, headers = {'Content-Type': null}, code = 200) {
    this._response.writeHead(code, headers);
    this._response.end(buffer, 'binary');
  }

  _sendFallbackResponse() {
    if (this._fallbackImage) {
      this._fallbackImage.then(image => this._send(image.image, {'Content-type': image.contentType}, 404));
    } else {
      this._send(null, {}, 404);
    }
  }
  
  resize(image, options) {
    const picture = new Resizer();
    
    return new Promise((resolve, reject) => {
      picture.resize(image, options.width, options.height).then(resolve).catch(reject);
    });
  }

  route(url) {
    const loaders = this.getLoadersFromVoters(url);
    const images = _getImagesFromLoaders(loaders);

    return Promise.all(images).then(_images => {
      if (!_images.length) {
        return this._sendFallbackResponse();
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
          return this._sendFallbackResponse();
        });
      }
    }).catch(err => {
      winston.error(err);

      return this._sendFallbackResponse();
    });
  }
}

module.exports = Thumbist;