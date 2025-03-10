import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const saveText = async (text) => {
  const response = await axios.post(`${API_URL}/save-text`, { text });
  return response.data;
};

export const retrieveText = async (code) => {
  const response = await axios.get(`${API_URL}/retrieve-text/${code}`);
  return response.data;
};

export const uploadImage = async (formData) => {
  const response = await axios.post(`${API_URL}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const retrieveImage = async (code) => {
  const response = await axios.get(`${API_URL}/retrieve-image/${code}`);
  return response.data;
};

export const retrieveExpiredImages = async () => {
  const response = await axios.get(`${API_URL}/expired-images`);
  return response.data.expiredImages;
};

export const deleteAllExpiredImages = async () => {
  await axios.delete(`${API_URL}/expired-images/delete-all`);
};
