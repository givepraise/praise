describe('GET /api/auth/nonce', () => {
  it('200 response with json body', function () {
    const ETHEREUM_ADDRESS = '0x1234';

    return this.client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });
  it('404 response when missing ethereumAddress', function () {
    const ETHEREUM_ADDRESS = '';

    return this.client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .expect(404);
  });
});