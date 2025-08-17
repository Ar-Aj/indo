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
    'Authorization': `Bearer ${process.env.GETIMG_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

export { roboflowAPI, getimgAPI };