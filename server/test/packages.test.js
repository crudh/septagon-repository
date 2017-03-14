/* eslint import/no-extraneous-dependencies: "off" */
const config = require('config');
const { expect, assert } = require('chai');
const request = require('supertest');
const { app } = require('../server');
const { getServerUrl } = require('../utils/urls');

const serverConfig = config.get('server');
const localUrlRegex = new RegExp(`^${getServerUrl(serverConfig.location)}`, 'g');

const binaryParser = (res, callback) => {
  res.setEncoding('binary');
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    callback(null, new Buffer(data, 'binary'));
  });
};

const fetchMainPackageFile = done => {
  request(app)
    .get('/npm/main/seamless-immutable-mergers')
    .expect(200)
    .expect('Content-Type', 'application/json')
    .end((err, res) => {
      if (err) return done(err);

      const { name, versions } = res.body;
      expect(name).to.equal('seamless-immutable-mergers');
      expect(versions).to.be.an('object');

      Object.keys(versions).forEach(key => {
        const version = versions[key];
        expect(version.dist).to.be.an('object');

        const { tarball } = version.dist;
        expect(tarball).to.be.a('string');
        assert(tarball.search(localUrlRegex) === 0, 'tarball url should point to local repository');
      });

      return done();
    });
};

const fetchMainPackageFileNoUpstream = done => {
  request(app)
    .get('/npm/standalone/seamless-immutable-mergers')
    .expect(404)
    .end(done);
};

const fetchMainPackageFileNonexistingRepo = done => {
  request(app)
    .get('/npm/nonexisting/seamless-immutable-mergers')
    .expect(404)
    .end(done);
};

const fetchVersionedPackageFile = done => {
  request(app)
    .get('/npm/main/seamless-immutable-mergers/5.0.0')
    .expect(200)
    .expect('Content-Type', 'application/json')
    .end((err, res) => {
      if (err) return done(err);

      const { name, version, dist } = res.body;
      expect(name).to.equal('seamless-immutable-mergers');
      expect(version).to.equal('5.0.0');
      expect(dist).to.be.an('object');

      const { tarball } = dist;
      expect(tarball).to.be.a('string');
      assert(tarball.search(localUrlRegex) === 0, 'tarball url should point to local repository');

      return done();
    });
};

const fetchVersionedPackageFileNoUpstream = done => {
  request(app)
    .get('/npm/standalone/seamless-immutable-mergers/5.0.0')
    .expect(404)
    .end(done);
};

const fetchVersionedPackageFileNonexistingRepo = done => {
  request(app)
    .get('/npm/nonexisting/seamless-immutable-mergers/5.0.0')
    .expect(404)
    .end(done);
};

const fetchPackageDistFile = done => {
  request(app)
    .get('/npm/main/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz')
    .expect(200)
    .expect('Content-Type', 'application/octet-stream')
    .parse(binaryParser)
    .end((err, res) => {
      if (err) return done(err);

      assert.ok(Buffer.isBuffer(res.body));

      return done();
    });
};

const fetchPackageDistFileNonexistingRepo = done => {
  request(app)
    .get('/npm/nonexisting/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz')
    .expect(404)
    .end(done);
};

const fetchPackageDistFileNoUpstream = done => {
  request(app)
    .get('/npm/standalone/seamless-immutable-mergers/-/seamless-immutable-mergers-5.0.0.tgz')
    .expect(404)
    .end(done);
};

const searchPackageNoUpstream = done => {
  request(app)
    .get('/npm/standalone/-/all')
    .expect(404)
    .end(done);
};

describe('Packages', () => {
  describe('API', () => {
    describe('Fetch main package file', () => {
      it('should be able to fetch a main package file', fetchMainPackageFile);
      it('should be able to fetch a main package file when it is cached', fetchMainPackageFile);
      it('should return 404 if not stored locally and no upstream is defined', fetchMainPackageFileNoUpstream);
      it('should return 404 if the repo doesn\'t exist', fetchMainPackageFileNonexistingRepo);
    });

    describe('Fetch versioned package file', () => {
      it('should be able to fetch a package file by version', fetchVersionedPackageFile);
      it('should be able to fetch a package file by version when it is cached', fetchVersionedPackageFile);
      it('should return 404 if not stored locally and no upstream is defined', fetchVersionedPackageFileNoUpstream);
      it('should return 404 if the repo doesn\'t exist', fetchVersionedPackageFileNonexistingRepo);
    });

    describe('Fetch package dist file', () => {
      it('should be able to fetch a package distfile', fetchPackageDistFile);
      it('should be able to fetch a package distfile when it is cached', fetchPackageDistFile);
      it('should return 404 if not stored locally and no upstream is defined', fetchPackageDistFileNoUpstream);
      it('should return 404 if the repo doesn\'t exist', fetchPackageDistFileNonexistingRepo);
    });

    describe('Search for package', () => {
      it('should not work if no upstream is defined', searchPackageNoUpstream);
    });
  });
});
