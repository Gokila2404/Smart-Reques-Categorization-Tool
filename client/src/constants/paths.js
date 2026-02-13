export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/register",
  USER_DASHBOARD: "/dashboard/user",
  USER_PROFILE: "/user/profile",
  USER_CATEGORIES: "/user/categories",
  ADMIN_DASHBOARD: "/dashboard/admin",
  ADMIN_QUEUE: "/admin/queue",
  ADMIN_ACTIVITY: "/admin/activity",
  USER_NOTIFICATIONS: "/user/notifications",
  USER_REQUEST_GUIDE: "/user/request-guide",
  USER_HELP_CENTER: "/user/help-center",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_REPORTS: "/admin/reports",
};

export const DEFAULT_ROUTE_BY_ROLE = {
  user: ROUTES.USER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
};
