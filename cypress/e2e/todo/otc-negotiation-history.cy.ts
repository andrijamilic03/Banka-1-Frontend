// cypress/e2e/todo/otc-negotiation-history.cy.ts
// TODO — OTC Istorija pregovora (Scenariji 5–8)

const TOKEN_77 = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImlkIjo3N30.mock';

const CLIENT_USER = {
  email: 'client@banka.com',
  role: 'Client',
  permissions: ['OTC_TRADE'],
};

// OtcOfferHistoryEvent format (matches backend response shape)
const AAPL_EVENTS = [
  {
    id: 1, offerId: 1, buyerId: 77, sellerId: 88,
    actorId: 77, actorName: 'Klijent #77',
    eventType: 'CREATE', stockTicker: 'AAPL',
    oldAmount: null, newAmount: 50,
    oldPricePerStock: null, newPricePerStock: 150.0,
    oldPremium: null, newPremium: 400,
    oldSettlementDate: null, newSettlementDate: '2027-12-31',
    oldStatus: null, newStatus: 'PENDING_SELLER',
    changedAt: '2026-05-15T10:00:00',
  },
  {
    id: 2, offerId: 1, buyerId: 77, sellerId: 88,
    actorId: 88, actorName: 'Klijent #88',
    eventType: 'COUNTER', stockTicker: 'AAPL',
    oldAmount: 50, newAmount: 40,
    oldPricePerStock: 150.0, newPricePerStock: 160.0,
    oldPremium: 400, newPremium: 400,
    oldSettlementDate: '2027-12-31', newSettlementDate: '2027-12-31',
    oldStatus: 'PENDING_SELLER', newStatus: 'PENDING_BUYER',
    changedAt: '2026-05-18T14:00:00',
  },
  {
    id: 3, offerId: 1, buyerId: 77, sellerId: 88,
    actorId: 77, actorName: 'Klijent #77',
    eventType: 'ACCEPT', stockTicker: 'AAPL',
    oldAmount: 40, newAmount: 50,
    oldPricePerStock: 160.0, newPricePerStock: 150.0,
    oldPremium: 400, newPremium: 400,
    oldSettlementDate: '2027-12-31', newSettlementDate: '2027-12-31',
    oldStatus: 'PENDING_BUYER', newStatus: 'ACCEPTED',
    changedAt: '2026-05-20T15:30:00',
  },
];

const MSFT_EVENTS = [
  {
    id: 4, offerId: 2, buyerId: 77, sellerId: 99,
    actorId: 77, actorName: 'Klijent #77',
    eventType: 'CREATE', stockTicker: 'MSFT',
    oldAmount: null, newAmount: 100,
    oldPricePerStock: null, newPricePerStock: 310.0,
    oldPremium: null, newPremium: 800,
    oldSettlementDate: null, newSettlementDate: '2027-06-15',
    oldStatus: null, newStatus: 'REJECTED',
    changedAt: '2026-04-05T09:00:00',
  },
];

const ALL_EVENTS = [...AAPL_EVENTS, ...MSFT_EVENTS];

function interceptAllOtcApis(historyHandler: (req: any) => void) {
  cy.intercept('GET', /\/otc\/public-stocks/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/offers\/active/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/contracts\/my/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/api\/interbank\/otc/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/stocks\/price-feed/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/offers\/history/, historyHandler).as('getHistory');
}

function visitOtc() {
  cy.visit('/otc', {
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN_77);
      win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT_USER));
    },
  });
}

// ─── Scenario 5: Prikaz istorije pregovora ───

describe('Scenario 5: Prikaz istorije pregovora', () => {

  it('Tabela sa akcijom, količinom, statusom i drugom stranom', () => {
    interceptAllOtcApis((req) => req.reply({ statusCode: 200, body: ALL_EVENTS }));
    visitOtc();

    cy.contains('button', 'Istorija pregovora').should('be.visible').click();
    cy.wait('@getHistory');

    cy.contains('AAPL').should('be.visible');
    cy.contains('MSFT').should('be.visible');
    cy.contains('ACCEPTED').should('be.visible');
    cy.contains('REJECTED').should('be.visible');
  });
});

// ─── Scenario 6: Filter – prihvaćeni ───

describe('Scenario 6: Filtriranje – prihvaćeni', () => {

  it('Filter "Prihvaćeno" prikazuje samo prihvaćene', () => {
    interceptAllOtcApis((req) => {
      const status = req.query?.['status'];
      const body = status === 'ACCEPTED' ? AAPL_EVENTS : ALL_EVENTS;
      req.reply({ statusCode: 200, body });
    });
    visitOtc();

    cy.contains('button', 'Istorija pregovora').should('be.visible').click();
    cy.wait('@getHistory');

    cy.contains('label', 'Status').siblings('select').select('ACCEPTED');
    cy.contains('button', 'Primeni filtere').click();
    cy.wait('@getHistory');

    cy.contains('AAPL').should('be.visible');
    cy.contains('MSFT').should('not.exist');
  });
});

// ─── Scenario 7: Filter – odbijeni ───

describe('Scenario 7: Filtriranje – odbijeni', () => {

  it('Filter "Odbijeno" prikazuje samo odbijene', () => {
    interceptAllOtcApis((req) => {
      const status = req.query?.['status'];
      const body = status === 'REJECTED' ? MSFT_EVENTS : ALL_EVENTS;
      req.reply({ statusCode: 200, body });
    });
    visitOtc();

    cy.contains('button', 'Istorija pregovora').should('be.visible').click();
    cy.wait('@getHistory');

    cy.contains('label', 'Status').siblings('select').select('REJECTED');
    cy.contains('button', 'Primeni filtere').click();
    cy.wait('@getHistory');

    cy.contains('MSFT').should('be.visible');
    cy.contains('AAPL').should('not.exist');
  });
});

// ─── Scenario 8: Detaljna istorija kontraponuda ───

describe('Scenario 8: Istorija kontraponuda za pregovor', () => {

  it('Lista kontraponuda sa starim i novim vrednostima', () => {
    interceptAllOtcApis((req) => req.reply({ statusCode: 200, body: ALL_EVENTS }));
    visitOtc();

    cy.contains('button', 'Istorija pregovora').should('be.visible').click();
    cy.wait('@getHistory');

    cy.contains('tr', 'AAPL').click();

    cy.contains('Istorija kontraponuda').should('be.visible');
    cy.contains('Cena (Stara').should('be.visible');
    cy.contains('Količina (Stara').should('be.visible');
    cy.contains('Klijent #88').should('be.visible');
  });
});
