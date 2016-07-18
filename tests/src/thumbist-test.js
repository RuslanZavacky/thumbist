const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const assert = chai.assert;
const Thumbist = require('../../src/thumbist');
const DefaultVoter = require('../../src/voters/default');
const LoaderAws = require('../../src/loaders/amazon-s3');
const config = require('config');

describe('Thumbist', function() {
  it('receive no_image response if URL do not match any loaders', function(done) {
    const thumbist = new Thumbist(config, {}, {
      writeHead: (code, headers) => {
        assert.equal(code, 404, "Response equal 404");
      },
      end: (buffer, type) => {
        // done();
      }
    });

    thumbist.route('/unknown_image').then(() => done());
  });

  it('populates S3Loader from default voter with correct URL', function(done) {
    const thumbist = new Thumbist(config, {}, {});

    thumbist.addVoter(new DefaultVoter(config));

    const loaders = thumbist.getLoadersFromVoters('/hash_goes_here/fit-in/800x600/filters:fill(white)/bucket_name/image_name.png');
    assert.equal(loaders.length, 2, '2 Loaders should be returned from default voter');
    assert.equal(loaders[0].loader.constructor.name, 'S3Loader', 'Loader should be S3Loader');
    assert.equal(loaders[1].loader.constructor.name, 'LoaderStaticImage', 'Loader should be LoaderStaticImage');

    done();
  });

  it('loads image from S3', function(done) {
    const thumbist = new Thumbist(config, {}, {
      writeHead: (code, headers) => {
        assert.equal(code, 200, "Response equal 200");
      },
      end: (buffer, type) => {
        assert.equal(buffer, "<image buffer>", "Content of the image equals to <image buffer>");
        done();
      }
    });

    let voter = new DefaultVoter(config);

    let s3 = new LoaderAws({});

    sinon.stub(s3, "s3Request", function() {
      return new Promise((resolve) => {
        return resolve({
          image: '<body>',
          options: {
            contentType: 'image/png',
            noResize: false,
            width: 100,
            height: 100
          }
        });
      })
    });

    voter.setS3Loader(s3);

    sinon.stub(thumbist, 'resize', function(image) {
      return new Promise(resolve => resolve('<image buffer>'));
    });

    thumbist.addVoter(voter);

    thumbist
      .route('/hash_goes_here/fit-in/100x100/filters:fill(white)/bucket_name/image_name.png')
      .then();
  });
});