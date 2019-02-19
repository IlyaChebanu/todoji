/*
  When it comes to unit tests, we want to isolate the SUT (System under test)
  from other dependencies. By definition, a unit test tests a single unit
  of code, usually a function, and therefore if our function relies on some
  data returned from another function etc, then it's not a unit test anymore.

  There are different libraries available to replace dependencies with
  "spies", "stubs" or "mocks". We will be using the testdouble.js library
  as it is one of the simplest libraries to use, and is more than enough
  for our needs.

  The reason replacing dependencies with test doubles is so important is,
  that if the function/code that our SUT depends on fails, the whole test
  will fail, even though there might not be a problem with our actual SUT.
  Having isolated unit tests allows us to pinpoint where a bug occurs.

  All methods available to us can be found in the `jest` and `testdouble`
  documentation online.
*/

/*
  We replace the post_user_schema function with a testdouble to be able to
  alter what is returned by it, and allow us to fake a validation pass or fail.
*/
const post_user_schema = td.replace('../../../helpers/validators/post-user');
// Require the SUT
const user_controller = require('../../../controllers/user');
/*
  We need to require user_model to be able to replace createUser with a
  testdouble.
*/
const user_model = require('../../../models/user');

/*
  The describe statement allows us to group things together in the output.
  Any string can be supplied, and doesn't have to be the function name.
*/
describe('createUser', () => {
  /*
    We declare req, res, and next outside the scope of the function to be
    able to use them inside our tests
  */
  let req, res, next;
  /*
    Everything in beforeEach() runs before every single test inside the
    describe() block it is declared in
  */
  beforeEach(() => {
    /*
      Replacing the user_model.createUser means that when it is called by
      our user_controller.createUser function, nothing actually happens and
      we are not relying on a database connection for the test to pass.
    */
    td.replace(user_model, 'createUser');
    /*
      We replace the output of post_user_schema with an empty string, that
      way in the general case we don't throw a status 400, but we can
      override this return value inside a specific test if we need to.
    */
    td.when(post_user_schema(), anyArgs).thenReturn('');
    /*
      Before each test we generate a new request object with data we know
      the SUT should successfully complete with.
    */
    req = {
      body: {
        name: 'Test User',
        email: 'test@test.com',
        password: 'test'
      },
    };
    /*
      The `node-mocks-http` provides us with a convenient way of accessing
      the response data, status code, and makes our SUT run without crashing
      when trying to call res.status() or res.json().
    */
    res = httpMocks.createResponse();
    /*
      A td.function() allows us to track how many times it was called and
      with what arguments.
    */
    next = td.function();
  });

  /*
    After each test runs, we reset our testdoubles to start with fresh
    stats about how many times the testdoubles were called, etc.
  */
  afterEach(td.reset);

  it('rejects on schema error', async () => {
    /*
      Since we want our controller function to respond with an error when
      post_user_schema complains, we tell our testdouble to return a string
      containing a fake error, the contents of the string don't really matter
      as long as it's not empty.
    */
    td.when(post_user_schema(), anyArgs).thenReturn('Fake error');

    await user_controller.createUser(req, res, next);

    /*
      Verify that the error was caught and passed to next(), and that the
      error contains the status code 400.
    */
    td.verify(next(td.matchers.contains({ status: 400 })));
  });

  it('succeeds', async () => {
    /*
      Here we don't change anything, and call the function straight away as
      what we defined in beforeEach() should be correct information that
      allows it to pass.
    */
    await user_controller.createUser(req, res, next);

    expect(res.statusCode).toBe(200);
  });
});
