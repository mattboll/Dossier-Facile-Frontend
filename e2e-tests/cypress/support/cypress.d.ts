/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    tenantLogin(username: string): Chainable<void>;

    ownerLogin(username: string): Chainable<void>;

    loginWithFC(username: string): Chainable<void>;

    deleteAccount(): Chainable<void>;

    uploadDocument(): Chainable<void>;

    clickOnNext(): Chainable<void>;

    expectPath(path: string): Chainable<void>;

    acceptCookies(): Chainable<void>;

    disableTaxVerification(): Chainable<void>;

    simpleUploadDocumentStep(buttonToSelect: string): Chainable<void>;

    selectProfessionalStatusStep(professionalStatus: string): Chainable<void>;

    addFinancialResource(
      resourceType: string,
      monthlySum: string
    ): Chainable<void>;

    validationStep(): Chainable<void>;
  }
}
