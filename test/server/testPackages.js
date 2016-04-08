import { expect, assert } from 'chai';
import request from 'supertest';
import app from '../../server/server_';
import config from '../../server/config';

const localUrlRegex = new RegExp(`^${config.url}`, 'g');

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

describe('Packages', () => {
  describe('API', () => {
    it('should be able to fetch a main package file', done => {
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
    });

    it('should be able to fetch a package file by version', done => {
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
    });

    it('should be able to fetch a package distfile', done => {
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
    });
  });
});
