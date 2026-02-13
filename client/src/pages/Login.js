import { useState, useContext } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE, ROUTES } from "../constants/paths";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });

      if (data.user.role !== selectedRole) {
        setError(`This account is '${data.user.role}'. Switch login mode and try again.`);
        return;
      }

      login(data);
      navigate(DEFAULT_ROUTE_BY_ROLE[data.user.role]);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">Smart Request Categorization Tool</h2>

        <div className="role-switch">
          <button
            type="button"
            className={selectedRole === "user" ? "active" : ""}
            onClick={() => setSelectedRole("user")}
          >
            User Login
          </button>
          <button
            type="button"
            className={selectedRole === "admin" ? "active" : ""}
            onClick={() => setSelectedRole("admin")}
          >
            Admin Login
          </button>
        </div>

        <form className="form-grid" onSubmit={handleLogin}>
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

          <button type="submit" className="btn btn-primary">
            Login as {selectedRole}
          </button>
        </form>

        {error && <div className="error-text">{error}</div>}


        <div className="auth-footer">
          Do not have an account?{" "}
          <Link to={ROUTES.REGISTER}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
