// cypress/e2e/kt3/securities-search.cy.ts
// KT3 — Portal Hartije od vrednosti (Sc. 10-18)

<<<<<<< Updated upstream
const TOKEN_77 = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImlkIjo3N30.mock';

const MOCK_STOCKS = [
  { id: 1, ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 185.5, volume: 1000000, change: 1.2, changePercent: 0.65 },
  { id: 2, ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 420.0, volume: 900000, change: -0.5, changePercent: -0.12 },
];
=======
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
>>>>>>> Stashed changes

const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['SECURITIES_TRADE_LIMITED'] };
const AGENT = { email: 'a@b.com', role: 'Agent', permissions: ['SECURITIES_TRADE_UNLIMITED'] };

const MOCK_STOCKS = {
  content: [
    { id: 1, ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 185.5, volume: 1000000, change: 1.2, changePercent: 0.65 },
    { id: 2, ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 420.0, volume: 900000, change: -0.5, changePercent: -0.12 },
    { id: 3, ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: 250.0, volume: 2000000, change: 5.0, changePercent: 2.0 },
  ],
  totalElements: 3,
};

function visitSecurities(user: object) {
  cy.intercept('GET', /\/stock\/api\/listings\/stocks/, {
    statusCode: 200,
    body: MOCK_STOCKS,
  }).as('getStocks');
  cy.intercept('GET', /\/stock\/api\/listings\/forex/, { statusCode: 200, body: { content: [] } });
  cy.intercept('GET', /\/stock\/api\/stock-exchanges/, { statusCode: 200, body: [] });

  cy.visit('/securities', {
<<<<<<< Updated upstream
    onBeforeLoad: (win: any) => {
      win.localStorage.setItem('authToken', TOKEN_77);
=======
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN);
>>>>>>> Stashed changes
      win.localStorage.setItem('loggedUser', JSON.stringify(user));
    },
  });

  cy.contains('button', 'Akcije', { timeout: 15000 }).should('be.visible');
  cy.wait('@getStocks');
  cy.contains('AAPL').should('be.visible');
}

describe('KT3 — Hartije od vrednosti', () => {

  // Sc. 10: Klijent vidi samo Akcije i Fjučerse
  it('Sc. 10: Klijent vidi Akcije i Fjučerse, ne vidi Forex', () => {
    visitSecurities(CLIENT);
    cy.contains('button', 'Fjučersi').should('be.visible');
    cy.contains('button', 'Forex parovi').should('not.exist');
  });

  // Sc. 11: Aktuar vidi sve tabove
  it('Sc. 11: Aktuar vidi Akcije, Fjučerse i Forex', () => {
    visitSecurities(AGENT);
    cy.contains('button', 'Fjučersi').should('be.visible');
    cy.contains('button', 'Forex parovi').should('be.visible');
  });

  // Sc. 12: Pretraga po ticker-u
  it('Sc. 12: Pretraga po ticker-u MSFT filtrira listu', () => {
    visitSecurities(AGENT);
    cy.get('input[placeholder*="tikeru"]').should('be.visible').clear().type('MSFT');
    cy.contains('MSFT').should('be.visible');
    cy.contains('AAPL').should('not.exist');
  });

  // Sc. 15: Filter panel — opseg cene
  it('Sc. 15: Filter panel sa opsegom cene', () => {
    visitSecurities(AGENT);
    cy.contains('button', 'Filteri').click();
    cy.contains('label', 'Cena od').should('be.visible');
    cy.contains('label', 'Cena do').should('be.visible');
  });

  // Sc. 18: Detaljan prikaz hartije
  it('Sc. 18: Detaljni prikaz hartije AAPL', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/AAPL/, {
      statusCode: 200,
      body: { ...MOCK_STOCKS.content[0], history: [], listingType: 'STOCK', exchangeMICCode: 'NASDAQ', bid: 185.4, ask: 185.6, change: 1.2, changePercent: 0.65, maintenanceMargin: 0, initialMarginCost: 0, contractSize: 1, lastRefresh: '2026-06-01' },
    });
    cy.intercept('GET', /\/stock\/api\/stock-exchanges/, { statusCode: 200, body: [] });

    cy.visit('/securities/stock/AAPL', {
<<<<<<< Updated upstream
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(actuaryUser));
=======
      onBeforeLoad(win: any) {
        win.localStorage.setItem('authToken', TOKEN);
        win.localStorage.setItem('loggedUser', JSON.stringify(AGENT));
>>>>>>> Stashed changes
      },
    });

    cy.contains('AAPL', { timeout: 15000 }).should('be.visible');
  });
});
