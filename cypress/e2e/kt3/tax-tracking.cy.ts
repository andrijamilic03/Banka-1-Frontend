// cypress/e2e/kt3/tax-tracking.cy.ts
// KT3 — Portal Porez tracking (Sc. 74-79)

<<<<<<< Updated upstream
const TOKEN_77 = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImlkIjo3N30.mock';

const MOCK_TAX_USERS = {
=======
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';

const SUPERVISOR = {
  email: 'supervisor@bank.com',
  role: 'Supervisor',
  permissions: ['FUND_AGENT_MANAGE'],
};

const MOCK_TAX_DATA = {
>>>>>>> Stashed changes
  content: [
    { firstName: 'Marko', lastName: 'Petrović', userType: 'CLIENT', taxDebtRsd: 5000, currentMonthTaxRsd: 1500, totalPaidTaxRsd: 12000, lastTaxCalculationDate: '2025-04-30T10:00:00', status: 'ACTIVE' },
    { firstName: 'Jelena', lastName: 'Nikolić', userType: 'CLIENT', taxDebtRsd: 0, currentMonthTaxRsd: 300, totalPaidTaxRsd: 8000, lastTaxCalculationDate: '2025-04-30T10:00:00', status: 'PAID' },
    { firstName: 'Ivan', lastName: 'Jovanović', userType: 'ACTUARY', taxDebtRsd: 2000, currentMonthTaxRsd: 600, totalPaidTaxRsd: 5000, lastTaxCalculationDate: '2025-04-30T10:00:00', status: 'PENDING' },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 10,
};

function visitTaxTracking() {
  cy.intercept('GET', /\/order\/tax\/tracking/, {
    statusCode: 200,
    body: MOCK_TAX_DATA,
  }).as('getTaxData');

  cy.visit('/tax-tracking', {
<<<<<<< Updated upstream
    onBeforeLoad: (win) => {
      win.localStorage.setItem('authToken', TOKEN_77);
      win.localStorage.setItem('loggedUser', JSON.stringify(user));
=======
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN);
      win.localStorage.setItem('loggedUser', JSON.stringify(SUPERVISOR));
>>>>>>> Stashed changes
    },
  });

  cy.wait('@getTaxData');
  cy.contains('h1', 'Porez tracking', { timeout: 15000 }).should('be.visible');
}

describe('KT3 — Porez tracking', () => {

  // Sc. 74: Tabelarni prikaz svih korisnika
  it('Sc. 74: Prikazuje tabelu sa klijentima i aktuarima i njihovim dugovanjima', () => {
    visitTaxTracking();

    cy.contains('Marko Petrović').should('be.visible');
    cy.contains('Jelena Nikolić').should('be.visible');
    cy.contains('Ivan Jovanović').should('be.visible');

    // Provera kolona
    cy.contains('th', 'Ime i prezime').should('be.visible');
    cy.contains('th', 'Trenutni dug').should('be.visible');
    cy.contains('th', 'Tekuci mesec').should('be.visible');
  });

  // Sc. 75: Filtriranje po tipu korisnika
  it('Sc. 75: Filtrira po tipu korisnika (Klijent/Aktuar)', () => {
    visitTaxTracking();

    cy.get('#tax-type').select('CLIENT');
    cy.wait('@getTaxData');

    cy.contains('Marko Petrović').should('be.visible');
    cy.contains('Jelena Nikolić').should('be.visible');
    cy.contains('Ivan Jovanović').should('not.exist');
  });

  // Sc. 76: Pretraga po imenu
  it('Sc. 76: Pretražuje korisnike po imenu ili prezimenu', () => {
    visitTaxTracking();

    cy.get('#tax-search').clear().type('Jelena');
    cy.contains('Jelena Nikolić').should('be.visible');
    cy.contains('Marko Petrović').should('not.exist');
    cy.contains('Ivan Jovanović').should('not.exist');
  });

  // Sc. 77: Pokretanje obračuna poreza
  it('Sc. 77: Dugme Pokreni obracun pokreće naplatu poreza', () => {
    cy.intercept('POST', /\/order\/tax\/collect/, {
      statusCode: 200,
      body: {},
    }).as('taxCollect');

    visitTaxTracking();

    cy.contains('button', 'Pokreni obracun').click();
    cy.wait('@taxCollect');

    // Posle uspešnog obračuna, tabela se osvežava
    cy.wait('@getTaxData');
  });

  // Sc. 78: Pokretanje obračuna za tekući mesec
  it('Sc. 78: Dugme Pokreni obracun za ovaj mesec', () => {
    cy.intercept('POST', /\/tax\/collect\/current-month/, {
      statusCode: 200,
      body: {},
    }).as('taxMonthCollect');

    visitTaxTracking();

    cy.contains('button', 'Pokreni obracun za ovaj mesec').click();
    cy.wait('@taxMonthCollect');
    cy.wait('@getTaxData');
  });

  // Sc. 79: Prikaz statusa dugovanja
  it('Sc. 79: Prikazuje statusna dugovanja (Placeno, Na cekanju, Aktivan)', () => {
    visitTaxTracking();

    cy.contains('Placeno').should('be.visible');
    cy.contains('Na cekanju').should('be.visible');
  });
});
