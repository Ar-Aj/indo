import axios from 'axios';

// Roboflow API configuration for furniture detection
const roboflowAPI = axios.create({
  baseURL: 'https://detect.roboflow.com',
  timeout: 30000
});

// getimg.ai API configuration for inpainting
const getimgAPI = axios.create({
  baseURL: 'https://api.getimg.ai/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Add request interceptor to set authorization header dynamically
getimgAPI.interceptors.request.use((config) => {
  const apiKey = process.env.GETIMG_API_KEY;
  if (apiKey && apiKey !== 'your-getimg-api-key-here') {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

export { roboflowAPI, getimgAPI };