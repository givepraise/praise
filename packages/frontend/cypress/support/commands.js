// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
Cypress.Commands.add('setToken', () => {
  const Web3 = require('web3');
  var web3 = new Web3(Web3.ExternalProvider);
  const ethAddress = Cypress.env('ethAddress');
  const privateKey = Cypress.env('privateKey');

  cy.log(Cypress.env());
  cy.request('GET', 'api/auth/nonce?ethereumAddress=' + ethAddress).then(
    (nonceResponse) => {
      expect(nonceResponse.body).to.have.property('nonce');

      const message =
        'SIGN THIS MESSAGE TO LOGIN TO PRAISE.ADDRESS:' +
        ethAddress +
        'NONCE:' +
        nonceResponse.body.nonce;
      const signature = web3.eth.accounts.sign(message, privateKey);

      cy.request('POST', 'api/auth/', {
        ethereumAddress: ethAddress,
        message: message,
        signature: signature.signature,
      }).then((authResponse) => {
        expect(authResponse.body).to.have.property('accessToken');

        window.localStorage.setItem(
          `jwt_${authResponse.body.ethereumAddress}`,
          `${authResponse.body.accessToken}`
        );
      });
    }
  );
});
