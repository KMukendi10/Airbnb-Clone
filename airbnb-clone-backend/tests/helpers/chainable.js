/**
 * Mongoose query methods (find().sort(), findById().populate(), etc.) are
 * chainable and only resolve to a value once awaited. Rather than hand-mock
 * every possible chain shape, this returns a Proxy that:
 *   - answers any method call with another chainable proxy (so any chain
 *     of .populate()/.sort()/.select()/... "just works" regardless of order
 *     or depth), and
 *   - resolves to `value` whenever it's awaited (i.e. whenever `.then` is
 *     accessed), no matter where in the chain that happens.
 *
 * Usage: Accommodation.find.mockReturnValue(chainable(listOfDocs));
 */
function chainable(value) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve) => resolve(value);
        }
        if (prop === 'catch' || prop === 'finally') {
          return () => chainable(value);
        }
        return () => chainable(value);
      },
    }
  );
}

module.exports = { chainable };
