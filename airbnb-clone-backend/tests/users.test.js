const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
const User = require('../models/User');
const app = require('../app');

describe('POST /api/users/register', () => {
  afterEach(() => jest.clearAllMocks());

  it('creates a new user and returns a token', async () => {
    User.findOne.mockResolvedValue(null); // no existing user
    User.create.mockResolvedValue({ _id: 'u1', username: 'newhost', role: 'host' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'newhost', password: 'password123', role: 'host' });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe('newhost');
    expect(res.body.role).toBe('host');
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects when username or password is missing', async () => {
    const res = await request(app).post('/api/users/register').send({ username: 'onlyusername' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it('rejects a duplicate username with 400', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing', username: 'taken' });

    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'taken', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe('POST /api/users/login', () => {
  afterEach(() => jest.clearAllMocks());

  it('logs in with correct credentials and returns a token', async () => {
    const fakeUser = {
      _id: 'u1',
      username: 'JaneDoe',
      role: 'host',
      matchPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'JaneDoe', password: 'password321' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('JaneDoe');
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects an incorrect password with 401', async () => {
    const fakeUser = {
      _id: 'u1',
      username: 'JaneDoe',
      role: 'host',
      matchPassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'JaneDoe', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('rejects a username that does not exist with 401 (not 404 — avoids leaking which usernames are registered)', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'ghost', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/me', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const fakeUser = { _id: 'u1', username: 'JaneDoe', role: 'host' };
    User.findById.mockResolvedValue(fakeUser);
    const token = jwt.sign({ id: 'u1' }, process.env.JWT_SECRET);

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('JaneDoe');
  });
});
