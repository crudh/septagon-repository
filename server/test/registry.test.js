/* eslint import/no-extraneous-dependencies: "off" */
import { expect } from 'chai';
import request from 'supertest';
import { app } from '../server';

describe('Registry', () => {
  describe('API', () => {
    describe('Fetch registry info', () => {
      it('should give back basic info on success', done => {
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

      it('should answer with 404 if the repo doesn\'t exist', done => {
        request(app)
          .get('/npm/nonexisting')
          .expect(404)
          .end(done);
      });
    });

    describe('Ping', () => {
      it('should respond to ping', done => {
        request(app)
          .get('/npm/-/ping')
          .expect(200)
          .end(err => {
            if (err) return done(err);
            expect(err).to.equal(null);
            return done();
          });
      });
    });
  });
});
