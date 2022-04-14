import supertest from 'supertest';

const request = supertest('https://airportgap.dev-tester.com/api');

describe('EXAMPLE TEST', () => {
  it('401 upon calling random 3rd party api', () => {
    return request
      .post('/favorites')
      .send({
        airport_id: 'JFK',
      })
      .expect(401);
  });
});
