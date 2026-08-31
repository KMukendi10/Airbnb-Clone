const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/Accommodation');
jest.mock('../models/User');

const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const app = require('../app');
const { chainable } = require('./helpers/chainable');

function tokenFor(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

describe('GET /api/accommodations', () => {
  it('returns the list of accommodations (public route)', async () => {
    const listings = [{ _id: 'a1', title: 'Loft' }, { _id: 'a2', title: 'Cabin' }];
    Accommodation.find.mockReturnValue(chainable(listings));

    const res = await request(app).get('/api/accommodations');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(Accommodation.find).toHaveBeenCalled();
  });
});

describe('GET /api/accommodations/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns a single accommodation when found', async () => {
    Accommodation.findById.mockReturnValue(chainable({ _id: 'a1', title: 'Loft' }));

    const res = await request(app).get('/api/accommodations/a1');

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Loft');
  });

  it('returns 404 when the listing does not exist', async () => {
    Accommodation.findById.mockReturnValue(chainable(null));

    const res = await request(app).get('/api/accommodations/does-not-exist');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/accommodations', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/accommodations').send({ title: 'New place' });
    expect(res.status).toBe(401);
  });

  it('rejects a logged-in guest (non-host) with 403', async () => {
    User.findById.mockResolvedValue({ _id: 'user1', role: 'user' });

    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${tokenFor('user1')}`)
      .send({ title: 'New place' });

    expect(res.status).toBe(403);
  });

  it('creates a listing for an authenticated host', async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    Accommodation.create.mockResolvedValue({ _id: 'a1', title: 'New place', host: 'host1' });

    const res = await request(app)
      .post('/api/accommodations')
      .set('Authorization', `Bearer ${tokenFor('host1')}`)
      .field('title', 'New place')
      .field('amenities', JSON.stringify(['Wifi']))
      .field('existingImages', JSON.stringify(['https://example.com/a.jpg']));

    expect(res.status).toBe(201);
    expect(Accommodation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New place',
        host: 'host1',
        images: ['https://example.com/a.jpg'],
      })
    );
  });
});

describe('PUT /api/accommodations/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects updating another host's listing with 403", async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    Accommodation.findById.mockResolvedValue({
      _id: 'a1',
      host: { toString: () => 'someone-else' },
      save: jest.fn(),
    });

    const res = await request(app)
      .put('/api/accommodations/a1')
      .set('Authorization', `Bearer ${tokenFor('host1')}`)
      .field('title', 'Hijacked title');

    expect(res.status).toBe(403);
  });

  it('allows the owning host to update their listing', async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    const save = jest.fn().mockResolvedValue({ _id: 'a1', title: 'Updated title' });
    Accommodation.findById.mockResolvedValue({
      _id: 'a1',
      host: { toString: () => 'host1' },
      save,
    });

    const res = await request(app)
      .put('/api/accommodations/a1')
      .set('Authorization', `Bearer ${tokenFor('host1')}`)
      .field('title', 'Updated title');

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
  });
});

describe('DELETE /api/accommodations/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects deleting another host's listing with 403", async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    Accommodation.findById.mockResolvedValue({
      _id: 'a1',
      host: { toString: () => 'someone-else' },
      deleteOne: jest.fn(),
    });

    const res = await request(app)
      .delete('/api/accommodations/a1')
      .set('Authorization', `Bearer ${tokenFor('host1')}`);

    expect(res.status).toBe(403);
  });

  it('allows the owning host to delete their listing', async () => {
    User.findById.mockResolvedValue({ _id: 'host1', role: 'host' });
    const deleteOne = jest.fn().mockResolvedValue({});
    Accommodation.findById.mockResolvedValue({
      _id: 'a1',
      host: { toString: () => 'host1' },
      deleteOne,
    });

    const res = await request(app)
      .delete('/api/accommodations/a1')
      .set('Authorization', `Bearer ${tokenFor('host1')}`);

    expect(res.status).toBe(200);
    expect(deleteOne).toHaveBeenCalled();
  });
});
