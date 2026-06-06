// cypress/e2e/kt5/interbank-otc.cy.ts
// Celina 5 — Međubankarski OTC (Scenariji 4–7)

const TOKEN_77 = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImlkIjo3N30.mock';

const CLIENT_USER = {
  email: 'client@banka.com',
  role: 'Client',
  permissions: ['OTC_TRADE', 'TRADE_UNLIMITED'],
};

const LOCAL_OFFER = {
  id: 1, stockTicker: 'AAPL', buyerId: 77, sellerId: 88, amount: 50,
  pricePerStock: 150.0, premium: 400, settlementDate: '2027-12-31',
  status: 'PENDING_BUYER', modifiedBy: '88', interbank: false, counterpartyBankName: null,
};

// InterbankNegotiationView objects — toOfferFromNegotiation() maps these to OtcOffer with interbank=true
const EXTERNAL_INTERBANK_NEG = {
  localId: 'neg-10',
  remoteForeignBankId: { routingNumber: 222, id: 999 },
  state: {
    stock: { ticker: 'GOOGL' },
    amount: 25,
    pricePerUnit: { amount: 185.0 },
    premium: { amount: 500 },
    settlementDate: '2027-11-30',
    isOngoing: true,
    lastModifiedBy: { routingNumber: 222, id: 999 },
  },
};

const COUNTER_INTERBANK_NEG = {
  localId: 'neg-10',
  remoteForeignBankId: { routingNumber: 222, id: 999 },
  state: {
    stock: { ticker: 'GOOGL' },
    amount: 25,
    pricePerUnit: { amount: 195.0 },
    premium: { amount: 500 },
    settlementDate: '2027-11-30',
    isOngoing: true,
    lastModifiedBy: { routingNumber: 222, id: 999 },
  },
};

const CROSS_BANK_CONTRACT = {
  id: 5, offerId: 10, stockTicker: 'GOOGL', buyerId: 77, sellerId: 999,
  amount: 25, pricePerStock: 185.0, settlementDate: '2027-11-30',
  status: 'ACTIVE', interbank: true, createdAt: '2026-04-01T10:00:00',
};

function interceptAllOtcApis(offers: object[] = [], contracts: object[] = [], interbankNegotiations: object[] = []) {
  cy.intercept('GET', /\/otc\/public-stocks/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/offers\/active/, { statusCode: 200, body: offers }).as('getOffers');
  cy.intercept('GET', /\/otc\/contracts\/my/, { statusCode: 200, body: contracts }).as('getContracts');
  cy.intercept('GET', /\/api\/interbank\/otc\/negotiations/, { statusCode: 200, body: interbankNegotiations });
  cy.intercept('GET', /\/stocks\/price-feed/, { statusCode: 200, body: [] });
}

function visitOtc() {
  cy.visit('/otc', {
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN_77);
      win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT_USER));
    },
  });
}

// ─── Scenario 4: Klijent vidi OTC ponude druge banke ───

describe('Scenario 4: Ponude druge banke', () => {

  it('Prikazuje ponude druge banke sa kolonom Banka prodavca', () => {
    interceptAllOtcApis([LOCAL_OFFER], [], [EXTERNAL_INTERBANK_NEG]);
    visitOtc();

    cy.contains('button', 'Aktivni pregovori').should('be.visible').click();
    cy.wait('@getOffers');

    cy.get('[data-testid="bank-badge-interbank"]').should('be.visible');
    cy.get('[data-testid="bank-badge-local"]').should('be.visible');
    cy.contains('Banka 2').should('be.visible');
    cy.contains('GOOGL').should('be.visible');
  });
});

// ─── Scenario 5: Kreiranje ponude ka klijentu druge banke ───

describe('Scenario 5: Kreiranje cross-bank ponude', () => {

  it('Kreira ponudu za Banka 2 sa cenom, količinom i premiumom', () => {
    cy.intercept('POST', /\/api\/interbank\/otc\/negotiations/, { statusCode: 201, body: { localId: 'neg-11' } }).as('createOffer');

    cy.visit('/otc/create', {
      onBeforeLoad(win: any) {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT_USER));
      },
    });

    cy.get('[data-testid="mode-banka2"]').check();
    cy.get('#otc-ticker').type('GOOGL');
    cy.get('[data-testid="seller-foreign-input"]').type('C-2');
    cy.get('#otc-amount').clear().type('25');
    cy.get('#otc-price').clear().type('185.00');
    cy.get('#otc-premium').clear().type('500');
    cy.get('#otc-settlement').type('2027-11-30');
    cy.get('[data-testid="submit-btn"]').click();

    cy.wait('@createOffer');
    cy.url().should('include', '/otc');
  });
});

// ─── Scenario 6: Kontraponuda iz druge banke ───

describe('Scenario 6: Kontraponuda iz druge banke', () => {

  it('Ponuda sa modifiedBy druge banke se prikazuje', () => {
    interceptAllOtcApis([], [], [COUNTER_INTERBANK_NEG]);
    visitOtc();

    cy.contains('button', 'Aktivni pregovori').should('be.visible').click();
    cy.wait('@getOffers');

    cy.contains('GOOGL').should('be.visible');
    cy.get('[data-testid="offer-row-interbank"]').should('be.visible');
  });
});

// ─── Scenario 7: Izvršavanje cross-bank opcije ───

describe('Scenario 7: Izvršavanje cross-bank opcije', () => {

  it('Izvršavanje opcije sa success odgovorom', () => {
    interceptAllOtcApis([], [CROSS_BANK_CONTRACT]);
    cy.intercept('POST', /\/otc\/contracts\/\d+\/exercise/, {
      statusCode: 200,
      body: { status: 'COMPLETED', message: 'Opcija iskorišćena' },
    }).as('exerciseContract');
    visitOtc();

    cy.contains('button', 'Izvršeni ugovori').should('be.visible').click();
    cy.wait('@getContracts');

    cy.contains('GOOGL').should('be.visible');
    cy.get('[data-testid="contract-row-interbank"]').within(() => {
      cy.get('[data-testid="exercise-btn"]').click();
    });

    cy.wait('@exerciseContract');
  });
});
