import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiPaths";

const client = axios.create({ timeout: 15000 });

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const registerUser = async (data) => {
  const res = await client.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await client.post(API_ENDPOINTS.AUTH.LOGIN, data);
  return res.data;
};

export const getUserComplaints = async (token) => {
  const res = await client.get(API_ENDPOINTS.USER.COMPLAINTS, authHeaders(token));
  return res.data;
};

export const createComplaint = async (data, token) => {
  const res = await client.post(API_ENDPOINTS.USER.COMPLAINTS, data, authHeaders(token));
  return res.data;
};

export const getAdminComplaints = async (token) => {
  const res = await client.get(API_ENDPOINTS.ADMIN.COMPLAINTS, authHeaders(token));
  return res.data;
};

export const updateComplaintStatus = async (id, status, token) => {
  const res = await client.put(API_ENDPOINTS.ADMIN.COMPLAINT_BY_ID(id), { status }, authHeaders(token));
  return res.data;
};

export const addAdminRemarks = async (id, remarks, token) => {
  const res = await client.put(API_ENDPOINTS.ADMIN.REMARKS_BY_ID(id), { remarks }, authHeaders(token));
  return res.data;
};
