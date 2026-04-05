export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/register",
  USER_DASHBOARD: "/dashboard/user",
  USER_REQUEST_DETAILS: (id = ":id") => `/user/request/${id}`,
  USER_PROFILE: "/user/profile",
  USER_CATEGORIES: "/user/categories",
  ADMIN_DASHBOARD: "/dashboard/admin",
  ADMIN_REQUEST_DETAILS: (id = ":id") => `/admin/request/${id}`,
  USER_REQUEST_GUIDE: "/user/request-guide",
  USER_HELP_CENTER: "/user/help-center",
  ADMIN_REPORTS: "/admin/reports",
};

export const DEFAULT_ROUTE_BY_ROLE = {
  user: ROUTES.USER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
};
