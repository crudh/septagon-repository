import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../server/server';

describe('Registry', () => {
  describe('API', () => {
    it('should give back basic info', done => {
      request(app)
        .get('/npm/main')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(err).to.equal(null);
          expect(res.body.registry_name).to.equal('main');
          return done();
        });
    });

    it('should respond to ping', done => {
      request(app)
        .get('/npm/-/ping')
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          expect(err).to.equal(null);
          return done();
        });
    });
  });
});
