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
  it("visits the periods page, creates a period, visits it and changes the name", () => {
      cy.visit(
        'http://localhost:3000/periods'
      )
      cy.get('h3').should('have.text', 'Quantification periods')
      cy.get('#create-period-button').click()

      cy.get('#input-period-name').type("never")
      cy.get('#input-period-date').click()
      cy.get('.DayPicker-Month').within(() => {
        cy.get('[aria-label*="16"]').click()  // Choosing the 16th day arbitrarily
      }) 
      cy.get('#submit-button').click()

      cy.get('#period-never').click()
  })
})
