/// <reference types="cypress" />
import { EthConnection } from "@/components/EthConnection";

const Web3 = require('web3');
var web3 = new Web3(Web3.ExternalProvider) 
const ethAddress = Cypress.env('ethAddress')
const privateKey = Cypress.env('privateKey')
let JWT

describe("Smoke tests", () => {
  beforeEach(() => {
    cy.log(Cypress.env())
    cy.request('GET', 'api/auth/nonce?ethereumAddress=' + ethAddress
    ).then(
      (nonceResponse) => {
        expect(nonceResponse.body).to.have.property('nonce')

        const message = "SIGN THIS MESSAGE TO LOGIN TO PRAISE.ADDRESS:" + ethAddress + "NONCE:" + nonceResponse.body.nonce
        const signature = web3.eth.accounts.sign(message, privateKey)

        cy.request('POST', 'api/auth/', {
          "ethereumAddress": ethAddress,
          "message": message,
          "signature": signature.signature
        }
        ).then(
          (authResponse) => {
            expect(authResponse.body).to.have.property('accessToken')

            window.localStorage.setItem(`jwt_${authResponse.body.ethereumAddress}`, `${authResponse.body.accessToken}`)
          }
        )
      })
  })
  it("visits the dashboard ", () => {
      cy.visit(
        'http://localhost:3000/pool'
      )
      cy.get('#periods-nav-button').should('be.visible')
  })
  it.only("visits the dashboard with a stubbed eth state", () => {
      const spy = cy.spy(EthConnection)
  })
})
