import { expect, assert } from 'chai';
import request from 'supertest';
import app from '../../server/server_';

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
          expect(err).to.equal(null);
          expect(res.body.name).to.equal('seamless-immutable-mergers');
          expect(res.body.versions).to.be.an('object');
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
          expect(err).to.equal(null);
          expect(res.body.name).to.equal('seamless-immutable-mergers');
          expect(res.body.version).to.equal('5.0.0');
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
          expect(err).to.equal(null);

          assert.ok(Buffer.isBuffer(res.body));

          return done();
        });
    });
  });
});
