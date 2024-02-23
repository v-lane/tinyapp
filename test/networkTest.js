const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require('../express_server');

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
        expect(loginRes).to.have.status(200);
        return agent.get("/urls/0sm5xK").then((accessRes) => {
          expect(accessRes).to.have.status(403);
          agent.close();
        });
      });
  });
  it('should redirect to /login with a 302 status code when accessing the root URL when not logged in', () => {
    const agent = chai.request.agent('http://localhost:8080');
    return agent
      .get('/')
      .redirects(0)
      .then((res) => {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/login');
        agent.close();
      });
  });
  it('should be redirected to /login with a status code of 302 when accessing /urls/new and not logged in', () => {
    const agent = chai.request.agent('http://localhost:8080');
    return agent
      .get('/urls/new')
      .redirects(0)
      .then((res) => {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo('/login');
        agent.close();
      });
  });
  it('should return a 404 status code when acessing non-existent URL at /urls/NONEXIST', () => {
    const agent = chai.request.agent('http://localhost:8080');
    return agent
      .post('/login')
      .send({ email: 'hello@example.com', password: 'hello' })
      .then((loginRes) => {
        expect(loginRes).to.have.status(200);
        return agent.get('/urls/NOTEXISTS');
      })
      .then((res) => {
        expect(res).to.have.status(404);
        agent.close();
      });
  });
  it('should return a 403 status code', () => {
    const agent = chai.request.agent('http://localhost:8080');
    return agent
      .post('/login')
      .send({ email: 'hello@example.com', password: 'hello' })
      .then((loginRes) => {
        expect(loginRes).to.have.status(200);
        return agent.get('/urls/0sm5xK');
      })
      .then((res) => {
        expect(res).to.have.status(403);
        agent.close();
      });
  });
});