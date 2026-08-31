const jwt = require('jsonwebtoken');

jest.mock('../models/User');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// `protect` is wrapped in asyncHandler, which fires next() asynchronously
// without returning its internal promise chain — so `await protect(...)`
// doesn't actually wait for the work to finish. This tracker resolves once
// next() is actually called, whatever args it's called with.
function nextTracker() {
  let resolveFn;
  const promise = new Promise((resolve) => {
    resolveFn = resolve;
  });
  const next = jest.fn((...args) => resolveFn(args));
  return { next, promise };
}

describe('auth middleware — protect', () => {
  afterEach(() => jest.clearAllMocks());

  it('rejects requests with no Authorization header', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const { next, promise } = nextTracker();

    protect(req, res, next);
    await promise;

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects an invalid/garbage token', async () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const { next, promise } = nextTracker();

    protect(req, res, next);
    await promise;

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('rejects a valid token whose user no longer exists', async () => {
    const token = jwt.sign({ id: 'deleted-user' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue(null);

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const { next, promise } = nextTracker();

    protect(req, res, next);
    await promise;

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next.mock.calls[0][0].message).toMatch(/no longer exists/i);
  });

  it('attaches req.user and calls next() with no error for a valid token', async () => {
    const fakeUser = { _id: 'user1', username: 'Jane', role: 'host' };
    const token = jwt.sign({ id: 'user1' }, process.env.JWT_SECRET);
    User.findById.mockResolvedValue(fakeUser);

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const { next, promise } = nextTracker();

    protect(req, res, next);
    await promise;

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith(); // called with no arguments = success
  });
});

describe('auth middleware — authorize', () => {
  it('calls next() when the user has an allowed role', () => {
    const req = { user: { role: 'host' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('host')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects with 403 when the user role is not permitted', () => {
    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = jest.fn();

    expect(() => authorize('host')(req, res, next)).toThrow(/not permitted/i);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
