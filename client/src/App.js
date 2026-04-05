import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE, ROUTES } from "./constants/paths";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequestDetails from "./pages/AdminRequestDetails";
import UserRequestDetails from "./pages/UserRequestDetails";

const PrivateRoute = ({ children, role }) => {
  const { auth } = React.useContext(AuthContext);

  if (!auth?.token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (role && auth?.user?.role !== role) return <Navigate to={ROUTES.LOGIN} replace />;

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { auth } = React.useContext(AuthContext);

  if (auth?.token) {
    const destination = DEFAULT_ROUTE_BY_ROLE[auth?.user?.role] || ROUTES.LOGIN;
    return <Navigate to={destination} replace />;
  }

  return children;
};

const FallbackRoute = () => {
  const { auth } = React.useContext(AuthContext);
  const destination = auth?.token
    ? DEFAULT_ROUTE_BY_ROLE[auth?.user?.role] || ROUTES.LOGIN
    : ROUTES.LOGIN;

  return <Navigate to={destination} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.USER_DASHBOARD}
            element={
              <PrivateRoute role="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to={ROUTES.USER_DASHBOARD} replace />} />
          <Route path="/admindashboard" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route
            path={ROUTES.USER_REQUEST_DETAILS()}
            element={
              <PrivateRoute role="user">
                <UserRequestDetails />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_REQUEST_DETAILS()}
            element={
              <PrivateRoute role="admin">
                <AdminRequestDetails />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
