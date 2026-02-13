const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const API_BASE_URL = apiBase;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${apiBase}/auth/register`,
    LOGIN: `${apiBase}/auth/login`,
  },
  USER: {
    COMPLAINTS: `${apiBase}/complaints`,
  },
  ADMIN: {
    COMPLAINTS: `${apiBase}/admin/complaints`,
    COMPLAINT_BY_ID: (id) => `${apiBase}/admin/complaint/${id}`,
    REMARKS_BY_ID: (id) => `${apiBase}/admin/complaint/${id}/remarks`,
  },
};
