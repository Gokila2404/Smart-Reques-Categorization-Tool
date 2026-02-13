import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AppHeader from "./components/AppHeader";
import { ROUTES } from "./constants/paths";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import AdminQueue from "./pages/AdminQueue";
import AdminActivity from "./pages/AdminActivity";
import RequestGuide from "./pages/RequestGuide";
import Categories from "./pages/Categories";
import HelpCenter from "./pages/HelpCenter";
import UserNotifications from "./pages/UserNotifications";
import AdminNotifications from "./pages/AdminNotifications";
import AdminReports from "./pages/AdminReports";

const PrivateRoute = ({ children, role }) => {
  const { auth } = React.useContext(AuthContext);

  if (!auth?.token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (role && auth?.user?.role !== role) return <Navigate to={ROUTES.LOGIN} replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppHeader />
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
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
            path={ROUTES.USER_PROFILE}
            element={
              <PrivateRoute role="user">
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_CATEGORIES}
            element={
              <PrivateRoute role="user">
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_NOTIFICATIONS}
            element={
              <PrivateRoute role="user">
                <UserNotifications />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_REQUEST_GUIDE}
            element={
              <PrivateRoute role="user">
                <RequestGuide />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.USER_HELP_CENTER}
            element={
              <PrivateRoute role="user">
                <HelpCenter />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_QUEUE}
            element={
              <PrivateRoute role="admin">
                <AdminQueue />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_ACTIVITY}
            element={
              <PrivateRoute role="admin">
                <AdminActivity />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_NOTIFICATIONS}
            element={
              <PrivateRoute role="admin">
                <AdminNotifications />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_REPORTS}
            element={
              <PrivateRoute role="admin">
                <AdminReports />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
