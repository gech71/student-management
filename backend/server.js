const express = require("express");
require("dotenv").config({ quiet: true });
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
  res.send("Student API is running");
});

app.get("/students", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM students ORDER BY id",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get students" });
  }
});

app.post("/students", async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ error: "Student name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO students (name) VALUES ($1) RETURNING id, name",
      [name],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add student" });
  }
});

async function startServer() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Student API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to PostgreSQL:", error.message);
    process.exit(1);
  }
}

// Start the server only when we run "node server.js".
// When a test file loads this file with require(), the server does
// not start, so the tests do not need a database.
if (require.main === module) {
  startServer();
}

module.exports = app;
