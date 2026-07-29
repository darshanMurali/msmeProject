import axios from "axios";

export const submitComplaint = async (data) => {
  const baseURL = process.env.REACT_APP_API_URL || '/api';
  const response = await axios.post(
    `${baseURL}/complaints`,
    data
  );

  return response.data;
};