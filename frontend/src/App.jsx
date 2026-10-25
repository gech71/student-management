import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load students");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setError("");
      })
      .catch(() => {
        setError("Cannot connect to the backend. Is it running?");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function addStudent(event) {
    event.preventDefault();

    if (!name.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not add student");
      }

      setStudents((current) => [...current, result]);
      setName("");
      setError("");
    } catch (err) {
      setError(err.message || "Could not connect to the backend");
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1>Student Management System</h1>
        <p>Add students and view the student list.</p>

        <form onSubmit={addStudent} style={styles.form}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter student name"
            aria-label="Student name"
          />
          <button type="submit">Add Student</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <h2>Students</h2>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length === 0 ? (
          <p>No students added yet.</p>
        ) : (
          <ol>
            {students.map((student) => (
              <li key={student.id}>{student.name}</li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 4px 15px #00000015",
  },
  form: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  error: {
    color: "red",
  },
};

export default App;
