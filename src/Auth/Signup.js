import { useState } from "react";

function Signup({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setMessage("Account created. You can now log in.");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Cannot connect to server. Make sure backend is running.");
    }
  };

  return (
    <div className="auth_page">
      <form className="auth_form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        {error && <p className="auth_error">{error}</p>}
        {message && <p className="auth_success">{message}</p>}

        <input
          type="text"
          placeholder="Create username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Create password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign Up</button>

        <p>
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Signup;