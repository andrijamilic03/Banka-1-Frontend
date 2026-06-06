// cypress/e2e/kt3/orders-approval.cy.ts
// KT3 — Portal Pregled ordera (Sc. 48-58)

<<<<<<< Updated upstream
const TOKEN_77 = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksImlkIjo3N30.mock';

const MOCK_PENDING_ORDER = {
  orderId: 1,
  agentName: 'Marko Petrovic',
  orderType: 'MARKET',
  listingType: 'STOCK',
  quantity: 10,
  contractSize: 1,
  pricePerUnit: 185.5,
  direction: 'BUY',
  remainingPortions: 10,
  status: 'PENDING',
  settlementDate: '2099-12-31',
};
=======
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
>>>>>>> Stashed changes

const SUPERVISOR = {
  email: 'supervisor@bank.com',
  role: 'Supervisor',
  permissions: ['TRADE_UNLIMITED'],
};

const MOCK_ORDERS = {
  content: [
    { orderId: 1, agentName: 'Petar Petrović', orderType: 'MARKET', listingType: 'STOCK', quantity: 10, contractSize: 1, pricePerUnit: 185.5, direction: 'BUY', remainingPortions: 10, status: 'PENDING' },
    { orderId: 2, agentName: 'Ana Anić', orderType: 'LIMIT', listingType: 'STOCK', quantity: 5, contractSize: 1, pricePerUnit: 420.0, direction: 'SELL', remainingPortions: 5, status: 'PENDING' },
    { orderId: 3, agentName: 'Jovan Jovanović', orderType: 'STOP', listingType: 'FUTURES', quantity: 3, contractSize: 10, pricePerUnit: 19000.0, direction: 'BUY', remainingPortions: 3, status: 'APPROVED' },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 10,
};

function visitOrdersOverview() {
  cy.intercept('GET', /\/order\/orders/, {
    statusCode: 200,
    body: MOCK_ORDERS,
  }).as('getOrders');

  cy.visit('/orders-overview', {
<<<<<<< Updated upstream
    onBeforeLoad: (win: any) => {
      win.localStorage.setItem('authToken', TOKEN_77);
      win.localStorage.setItem('loggedUser', JSON.stringify(user));
=======
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN);
      win.localStorage.setItem('loggedUser', JSON.stringify(SUPERVISOR));
>>>>>>> Stashed changes
    },
  });

  cy.wait('@getOrders');
  cy.contains('h1', 'Pregled ordera', { timeout: 15000 }).should('be.visible');
}

describe('KT3 — Pregled ordera', () => {

  // Sc. 48: Prikaz svih ordera
  it('Sc. 48: Prikazuje tabelu sa svim orderima', () => {
    visitOrdersOverview();

    cy.contains('td', 'Petar Petrović').should('be.visible');
    cy.contains('td', 'Ana Anić').should('be.visible');
    cy.contains('td', 'Jovan Jovanović').should('be.visible');
    cy.contains('th', 'Agent').should('be.visible');
    cy.contains('th', 'Order type').should('be.visible');
    cy.contains('th', 'Direction').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
  });

  // Sc. 49: Filter — samo Pending
  it('Sc. 49: Filtrira ordere po statusu Pending', () => {
    visitOrdersOverview();

<<<<<<< Updated upstream
// Scenario 52: Supervizor odobrava pending order
describe('Scenario 52: Odobravanje pending ordera', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/order\/orders(\?.*)?$/, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { content: [MOCK_PENDING_ORDER], totalElements: 1, totalPages: 1, number: 0, size: 10 },
    }).as('getOrders');

    cy.intercept('PUT', '**/order/orders/*/approve*', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ...MOCK_PENDING_ORDER, status: 'APPROVED' },
    }).as('approveOrder');

    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
    });

    cy.wait('@getOrders');
  });

  it('red ordera se prikazuje u tabeli', () => {
    cy.get('tbody').contains('td', 'Marko Petrovic').should('be.visible');
  });

  it('dugme Approve je vidljivo za pending order', () => {
    cy.get('tbody').contains('button', 'Approve').should('be.visible');
  });

  it('klik na Approve poziva API i order menja status', () => {
    cy.get('tbody').contains('button', 'Approve').click();
    cy.wait('@approveOrder');
    cy.get('@approveOrder').its('response.statusCode').should('eq', 200);
  });
});

// Scenario 53: Supervizor odbija pending order
describe('Scenario 53: Odbijanje pending ordera', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/order\/orders(\?.*)?$/, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { content: [MOCK_PENDING_ORDER], totalElements: 1, totalPages: 1, number: 0, size: 10 },
    }).as('getOrders');

    cy.intercept('PUT', '**/order/orders/*/decline*', {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { ...MOCK_PENDING_ORDER, status: 'DECLINED' },
    }).as('declineOrder');

    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
    });

    cy.wait('@getOrders');
  });

  it('dugme Decline je vidljivo za pending order', () => {
    cy.get('tbody').contains('button', 'Decline').should('be.visible');
  });

  it('klik na Decline poziva API za odbijanje', () => {
    cy.get('tbody').contains('button', 'Decline').click();
    cy.wait('@declineOrder');
    cy.get('@declineOrder').its('response.statusCode').should('eq', 200);
  });
});

// Scenario 54: Order sa isteklim settlement date-om – samo Decline
describe('Scenario 54: Istekli order – samo Decline', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/order\/orders(\?.*)?$/, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { content: [MOCK_EXPIRED_ORDER], totalElements: 1, totalPages: 1, number: 0, size: 10 },
    }).as('getOrders');

    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
    });

    cy.wait('@getOrders');
  });

  it('za istekli order Approve dugme nije prikazano', () => {
    cy.get('tbody').contains('button', 'Approve').should('not.exist');
  });

  it('za istekli order Decline dugme je dostupno', () => {
    cy.get('tbody').contains('button', 'Decline').should('be.visible');
  });
});

// Scenario 56: Filtriranje ordera po statusu Pending
describe('Scenario 56: Filter Pending', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/order\/orders(\?.*)?$/, (req) => {
      const hasPending = req.url.includes('status=PENDING');
      const orders = hasPending ? [MOCK_PENDING_ORDER] : [MOCK_PENDING_ORDER, MOCK_DONE_ORDER];
      req.reply({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { content: orders, totalElements: orders.length, totalPages: 1, number: 0, size: 10 },
      });
    }).as('getOrders');

    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
    });

    cy.wait('@getOrders');
  });

  it('klik na filter Pending filtrira ordere', () => {
=======
>>>>>>> Stashed changes
    cy.contains('button', 'Pending').click();
    cy.wait('@getOrders');

    cy.contains('td', 'Petar Petrović').should('be.visible');
    cy.contains('td', 'Ana Anić').should('be.visible');
    cy.contains('td', 'Jovan Jovanović').should('not.exist');
  });

<<<<<<< Updated upstream
// Scenario 57: Filtriranje ordera po statusu Done
describe('Scenario 57: Filter Done', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/order\/orders(\?.*)?$/, (req) => {
      const hasDone = req.url.includes('status=DONE') || req.url.includes('isDone=true');
      const orders = hasDone ? [MOCK_DONE_ORDER] : [MOCK_PENDING_ORDER, MOCK_DONE_ORDER];
      req.reply({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { content: orders, totalElements: orders.length, totalPages: 1, number: 0, size: 10 },
      });
    }).as('getOrders');

    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
    });
=======
  // Sc. 50: Filter — Approved
  it('Sc. 50: Filtrira ordere po statusu Approved', () => {
    visitOrdersOverview();
>>>>>>> Stashed changes

    cy.contains('button', 'Approved').click();
    cy.wait('@getOrders');

    cy.contains('td', 'Jovan Jovanović').should('be.visible');
    cy.contains('td', 'Petar Petrović').should('not.exist');
  });

  // Sc. 51: Filter — All (vraća sve)
  it('Sc. 51: Filter All prikazuje sve ordere', () => {
    visitOrdersOverview();

    cy.contains('button', 'Pending').click();
    cy.wait('@getOrders');
    cy.contains('button', 'All').click();
    cy.wait('@getOrders');

    cy.contains('td', 'Petar Petrović').should('be.visible');
    cy.contains('td', 'Ana Anić').should('be.visible');
    cy.contains('td', 'Jovan Jovanović').should('be.visible');
  });

  // Sc. 53: Approve ordera
  it('Sc. 53: Odobrava pending order', () => {
    cy.intercept('PUT', /\/order\/orders\/\d+\/approve/, {
      statusCode: 200,
      body: {},
    }).as('approveOrder');

<<<<<<< Updated upstream
    cy.visit('/orders-overview', {
      onBeforeLoad: (win: any) => {
        win.localStorage.setItem('authToken', TOKEN_77);
        win.localStorage.setItem('loggedUser', JSON.stringify(supervisorUser));
      },
=======
    visitOrdersOverview();

    cy.contains('tr', 'Petar Petrović').within(() => {
      cy.contains('button', 'Approve').click();
>>>>>>> Stashed changes
    });

    cy.wait('@approveOrder');
    cy.wait('@getOrders');  // reload posle akcije
  });

  // Sc. 54: Decline ordera
  it('Sc. 54: Odbija pending order', () => {
    cy.intercept('PUT', /\/order\/orders\/\d+\/decline/, {
      statusCode: 200,
      body: {},
    }).as('declineOrder');

    visitOrdersOverview();

    cy.contains('tr', 'Ana Anić').within(() => {
      cy.contains('button', 'Decline').click();
    });

    cy.wait('@declineOrder');
    cy.wait('@getOrders');
  });

  // Sc. 56: Cancel ordera — otvara dijalog
  it('Sc. 56: Otvara dijalog za otkazivanje ordera', () => {
    visitOrdersOverview();

    cy.contains('tr', 'Jovan Jovanović').within(() => {
      cy.get('[data-cy="cancel-order-btn"]').click();
    });

    cy.contains('Otkazivanje naloga').should('be.visible');
    cy.contains('button', 'Potvrdi otkazivanje').should('be.visible');
  });

  // Sc. 57: Cancel — potvrda u dijalogu
  it('Sc. 57: Potvrđuje otkazivanje ordera', () => {
    cy.intercept('POST', /\/order\/orders\/\d+\/cancel/, {
      statusCode: 200,
      body: {},
    }).as('cancelOrder');

    visitOrdersOverview();

    cy.contains('tr', 'Jovan Jovanović').within(() => {
      cy.get('[data-cy="cancel-order-btn"]').click();
    });

    cy.contains('button', 'Potvrdi otkazivanje').click();

    cy.wait('@cancelOrder');
    cy.wait('@getOrders');
  });
});
