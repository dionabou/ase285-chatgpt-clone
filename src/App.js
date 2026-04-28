import { useState } from "react";
import Dashboard from "./Dashboard/Dashboard";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import "./Auth/auth.css";

function App() {
  const [user, setUser] = useState(sessionStorage.getItem("username"));
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (username, token) => {
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("token", token);
    setUser(username);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  if (!user) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return (
    <div className="App">
      <Dashboard username={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;