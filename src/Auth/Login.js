import { useState } from "react";

function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      onLogin(data.username, data.token);
    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to server. Make sure backend is running.");
    }
  };

  return (
    <div className="auth_page">
      <form className="auth_form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p className="auth_error">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p>
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToSignup}>
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;