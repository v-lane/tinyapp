const chai = require("chai");
const chaiHttp = require("chai-http");

const serverUrl = "http://localhost:8080";

chai.use(chaiHttp);
const expect = chai.expect;

describe("Login and Access with Session Cookie", () => {
  it("should return status code 403 for unauthorized access", () => {
    const agent = chai.request.agent(serverUrl);


    return agent
      .post("/login")
      .send({
        email: "hello@example.com",
        password: "hello",
      })
      .then((loginRes) => {
        // Assert that login was successful
        expect(loginRes).to.have.status(200);

        // Make GET request with session cookie
        return agent.get("/urls/0sm5xK").then((accessRes) => {
          // Expecting status code 403 for unauthorized access
          expect(accessRes).to.have.status(403);

          // Close the agent to clean up the session
          agent.close();
        });
      });
  });



  it('should redirect to /login with a 302 status code when accessing the root URL when not logged in', function() {
    const agent = chai.request.agent('http://localhost:8080');

    return agent
      .get('/')
      .redirects(0)
      .then(function(res) {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/login');
        agent.close();
      });
  });
  it('should be redirected to /login with a status code of 302 when accessing /urls/new and not logged in', function() {
    const agent = chai.request.agent('http://localhost:8080');

    return agent
      .get('/urls/new')
      .redirects(0)
      .then(function(res) {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/login');

        agent.close();
      });
  });
  it('should return a 404 status code when acessing non-existent URL at /urls/NONEXIST', function() {
    const agent = chai.request.agent('http://localhost:8080');

    // Log in the user
    return agent
      .post('/login')
      .send({ email: 'hello@example.com', password: 'hello' })
      .then(function(loginRes) {
        expect(loginRes).to.have.status(200);

        // Make the GET request after logging in
        return agent.get('/urls/NOTEXISTS');
      })
      .then(function(res) {
        expect(res).to.have.status(404);

        // Cleanup the session
        agent.close();
      });
  });
  it('should return a 403 status code', function() {
    const agent = chai.request.agent('http://localhost:8080');

    // Log in the user with appropriate credentials
    return agent
      .post('/login')
      .send({ email: 'hello@example.com', password: 'hello' })
      .then(function(loginRes) {
        expect(loginRes).to.have.status(200);

        // Make the GET request to the unauthorized URL
        return agent.get('/urls/0sm5xK');
      })
      .then(function(res) {
        expect(res).to.have.status(403);

        // Cleanup the session
        agent.close();
      });
  });
});