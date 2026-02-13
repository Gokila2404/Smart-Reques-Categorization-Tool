import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES } from "../constants/paths";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [adminDomain, setAdminDomain] = useState("General");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser({
        name,
        email,
        password,
        role,
        adminDomain: role === "admin" ? adminDomain : null,
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">Create an SRCT account</h2>
        <p className="auth-subtitle">Register as user or admin</p>

        <form className="form-grid" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />

        <select value={role} onChange={(e) => setRole(e.target.value)} className="select">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {role === "admin" && (
          <select value={adminDomain} onChange={(e) => setAdminDomain(e.target.value)} className="select">
            <option value="Networking">Networking</option>
            <option value="Fees">Fees</option>
            <option value="Discipline">Discipline</option>
            <option value="General">General</option>
          </select>
        )}

        <button type="submit" className="btn btn-primary">
          Register
        </button>
        </form>

        {error && <div className="error-text">{error}</div>}

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
