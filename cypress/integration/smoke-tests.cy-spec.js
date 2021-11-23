/// <reference types="cypress" />
import { EthConnection } from "@/components/EthConnection";

describe("Smoke tests", () => {
  beforeEach(() => {
    cy.setToken()
  })
  it("visits the pool page ", () => {
      cy.visit(
        'http://localhost:3000/pool'
      )
      cy.get('h3').should('have.text', 'Quantifier pool')
  })
  it("visits the periods page", () => {
      cy.visit(
        'http://localhost:3000/periods'
      )
      cy.get('h3').should('have.text', 'Quantification periods')
  })
})
