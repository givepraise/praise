import app from '../Server';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);

describe('User All Request', () => {
  it('should return unauthorized error', async () => {
    return chai
      .request(app)
      .get('/api/users/all')
      .then((res) => {
        chai.expect(res.text).to.contains('Unauthorized');
        chai.expect(res.unauthorized).to.equals(true);
        chai.expect(res.error.status).to.equals(401);
      });
  });
});
