// ============================================================
// __tests__/server.test.js - unit tests for our Student API
// ------------------------------------------------------------
// We use the same tools as in the Backend testing module:
//   Jest      -> runs the tests and checks the results (expect)
//   Supertest -> sends HTTP requests to our Express app,
//                without starting a real server
//
// Run the tests with:
//   npm test
// The CI pipeline (.github/workflows/ci-cd.yml) runs the same
// command on every push. If a test fails, the pipeline stops.
//
// We do NOT use a real database here. jest.mock() replaces the
// "pg" package with a fake one, and each test decides what the
// fake database returns. So these tests check only OUR code.
// ============================================================

const request = require("supertest");

// The fake "query" function of our fake database.
// (Inside jest.mock() Jest only allows variables whose name
// starts with "mock", so we call it mockQuery.)
const mockQuery = jest.fn();

// Replace the "pg" package. When server.js runs "new Pool(...)",
// it gets this fake pool instead of a real PostgreSQL connection.
jest.mock("pg", () => ({
  Pool: jest.fn(() => ({ query: mockQuery })),
}));

// Load our Express app AFTER the mock, so it uses the fake pool.
// The server does not start by itself here (see the end of server.js).
const app = require("../server");

// Forget the calls from the previous test, so every test starts clean.
beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /", () => {
  it("says the API is running", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Student API is running");
  });
});

describe("GET /students", () => {
  it("returns the students from the database", async () => {
    // Scenario control: the fake database returns two students.
    mockQuery.mockResolvedValue({
      rows: [
        { id: 1, name: "Abebe" },
        { id: 2, name: "Selam" },
      ],
    });

    const response = await request(app).get("/students");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      { id: 1, name: "Abebe" },
      { id: 2, name: "Selam" },
    ]);
  });
});

describe("POST /students", () => {
  it("adds a new student", async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 3, name: "Abebe" }] });

    const response = await request(app)
      .post("/students")
      .send({ name: "  Abebe  " });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ id: 3, name: "Abebe" });

    // Security check: the name goes to the database as a separate
    // value (the $1 in the SQL), not glued into the SQL text.
    // This is what protects us from SQL injection.
    // (The API also removed the extra spaces around the name.)
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ["Abebe"]);
  });

  it("rejects an empty name and never touches the database", async () => {
    const response = await request(app)
      .post("/students")
      .send({ name: "   " });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "Student name is required" });
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------
// TRY THIS IN CLASS:
//   1. In server.js, remove the "Student name is required" check.
//   2. Run "npm test": the last test turns red.
//   3. Push the change: the CI pipeline turns red and the Docker
//      images are NOT built. Broken code never reaches the users.
// ------------------------------------------------------------
