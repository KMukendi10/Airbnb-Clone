const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Reservation');
jest.mock('../models/Accommodation');
jest.mock('../models/User');

const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const app = require('../app');
const { chainable } = require('./helpers/chainable');

function tokenFor(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

const fakeListing = {
  _id: 'acc1',
  host: 'host1',
  guests: 4,
  price: 1000,
  weeklyDiscount: 10,
  cleaningFee: 200,
  serviceFee: 150,
  occupancyTaxes: 50,
};

describe('POST /api/reservations', () => {
  beforeEach(() => {
    User.findById.mockResolvedValue({ _id: 'guest1', role: 'user' });
  });
  afterEach(() => jest.clearAllMocks());

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/reservations').send({});
    expect(res.status).toBe(401);
  });

  it('rejects a booking that exceeds the listing\'s guest capacity', async () => {
    Accommodation.findById.mockResolvedValue(fakeListing);

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`)
      .send({
        accommodationId: 'acc1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-03',
        guests: 10, // listing only sleeps 4
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/maximum/i);
  });

  it('returns 404 when the accommodation does not exist', async () => {
    Accommodation.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`)
      .send({ accommodationId: 'missing', checkIn: '2026-09-01', checkOut: '2026-09-03', guests: 2 });

    expect(res.status).toBe(404);
  });

  it('calculates the cost breakdown correctly and applies the weekly discount at 7+ nights', async () => {
    Accommodation.findById.mockResolvedValue(fakeListing);
    Reservation.create.mockImplementation((doc) => Promise.resolve({ _id: 'r1', ...doc }));

    // 7 nights @ R1000 = R7000 subtotal, 10% weekly discount = -R700,
    // + cleaning 200 + service 150 + taxes 50 = R6700 total
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`)
      .send({
        accommodationId: 'acc1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-08',
        guests: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.totalNights).toBe(7);
    expect(res.body.totalCost).toBe(6700);
  });

  it('does not apply the weekly discount for stays under 7 nights', async () => {
    Accommodation.findById.mockResolvedValue(fakeListing);
    Reservation.create.mockImplementation((doc) => Promise.resolve({ _id: 'r1', ...doc }));

    // 3 nights @ R1000 = R3000, no discount, + 200 + 150 + 50 = R3400
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`)
      .send({
        accommodationId: 'acc1',
        checkIn: '2026-09-01',
        checkOut: '2026-09-04',
        guests: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.totalNights).toBe(3);
    expect(res.body.totalCost).toBe(3400);
  });
});

describe('GET /api/reservations/host and /user', () => {
  it("returns the host's incoming reservations", async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    Reservation.find.mockReturnValue(chainable([{ _id: 'r1' }, { _id: 'r2' }]));

    const res = await request(app)
      .get('/api/reservations/host')
      .set('Authorization', `Bearer ${tokenFor('host1')}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("returns the guest's own reservations", async () => {
    User.findById.mockResolvedValue({ _id: 'guest1', role: 'user' });
    Reservation.find.mockReturnValue(chainable([{ _id: 'r1' }]));

    const res = await request(app)
      .get('/api/reservations/user')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('DELETE /api/reservations/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('allows the guest who booked it to cancel', async () => {
    User.findById.mockResolvedValue({ _id: 'guest1', role: 'user' });
    Reservation.findById.mockResolvedValue({
      _id: 'r1',
      user: { toString: () => 'guest1' },
      host: { toString: () => 'host1' },
      deleteOne: jest.fn().mockResolvedValue({}),
    });

    const res = await request(app)
      .delete('/api/reservations/r1')
      .set('Authorization', `Bearer ${tokenFor('guest1')}`);

    expect(res.status).toBe(200);
  });

  it('allows the host who owns the listing to cancel', async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    Reservation.findById.mockResolvedValue({
      _id: 'r1',
      user: { toString: () => 'guest1' },
      host: { toString: () => 'host1' },
      deleteOne: jest.fn().mockResolvedValue({}),
    });

    const res = await request(app)
      .delete('/api/reservations/r1')
      .set('Authorization', `Bearer ${tokenFor('host1')}`);

    expect(res.status).toBe(200);
  });

  it('rejects a third party who is neither the guest nor the host', async () => {
    User.findById.mockResolvedValue({ _id: 'stranger1', role: 'user' });
    Reservation.findById.mockResolvedValue({
      _id: 'r1',
      user: { toString: () => 'guest1' },
      host: { toString: () => 'host1' },
      deleteOne: jest.fn(),
    });

    const res = await request(app)
      .delete('/api/reservations/r1')
      .set('Authorization', `Bearer ${tokenFor('stranger1')}`);

    expect(res.status).toBe(403);
  });
});
