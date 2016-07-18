const http = require('http');
const config = require('config');
const Thumbist = require('./src/thumbist');
const DefaultVoter = require('./src/voters/default');
const winston = require('./src/logging');

const LISTEN_PORT = process.env.PORT || 4000;

const LoaderStaticImage = require('./src/loaders/static-image');

http.createServer((req, res) => {
  const router = new Thumbist(config, req, res);
  router.setFallbackImage((new LoaderStaticImage({path: './assets/no_image.png'})).request());
  router.addVoter(new DefaultVoter(config));
  router.route(req.url);
}).listen(LISTEN_PORT, () => {
  winston.info(`Server started on port ${LISTEN_PORT}`);
});
