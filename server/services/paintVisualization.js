import { roboflowAPI, getimgAPI } from '../config/apis.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get current directory for proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

class PaintVisualizationService {
  
  // Step 1: Detect furniture and surfaces using Roboflow
  async detectFurnitureSurfaces(imagePath) {
    try {
      // Check if API key is configured and valid
      const apiKey = process.env.ROBOFLOW_API_KEY;
      if (!apiKey || apiKey === 'your-roboflow-api-key-here') {
        console.log('Roboflow API key not configured, using mock detection');
        // Return mock detection data for development
        return {
          predictions: [{
            class: 'wall',
            x: 512,
            y: 384,
            width: 800,
            height: 600,
            confidence: 0.85
          }]
        };
      }

      console.log('Detecting furniture and surfaces using Roboflow API...');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      
      const response = await roboflowAPI.post(
        `/furniture-detection-2kump/1?api_key=${apiKey}`, 
        formData,
        {
          headers: formData.getHeaders()
        }
      );
      
      console.log('Roboflow API request successful');
      return response.data;
    } catch (error) {
      const errorInfo = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      };
      console.error('Furniture detection error:', errorInfo);
      
      if (error.response?.status === 401) {
        console.warn('Roboflow API authentication failed - check your API key');
      } else {
        console.warn('Roboflow API request failed');
      }
      
      console.log('Falling back to mock detection');
      
      // Fallback to mock data if API fails
      return {
        predictions: [{
          class: 'wall',
          x: 512,
          y: 384,
          width: 800,
          height: 600,
          confidence: 0.85
        }]
      };
    }
  }

  // Step 2: Create mask from Roboflow detection results
  async createMaskFromDetection(imagePath, detectionResults) {
    try {
      const image = sharp(imagePath);
      const { width, height } = await image.metadata();
      
      // Create a black mask
      let mask = sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      });

      // Find walls or paintable surfaces from detection
      const paintableSurfaces = detectionResults.predictions?.filter(pred => 
        ['wall', 'furniture', 'cabinet', 'door'].includes(pred.class.toLowerCase())
      ) || [];

      if (paintableSurfaces.length > 0) {
        // Create white rectangles for detected surfaces
        const surface = paintableSurfaces[0]; // Use first detected surface
        const x = Math.round(surface.x - surface.width / 2);
        const y = Math.round(surface.y - surface.height / 2);
        
        mask = mask.composite([{
          input: {
            create: {
              width: Math.round(surface.width),
              height: Math.round(surface.height),
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          },
          top: Math.max(0, y),
          left: Math.max(0, x)
        }]);
      }

      const maskPath = path.join(uploadsDir, `mask-${Date.now()}.png`);
      await mask.png().toFile(maskPath);
      
      return maskPath;
    } catch (error) {
      console.error('Mask creation error:', error);
      throw new Error(`Mask creation failed: ${error.message}`);
    }
  }

  // Step 3: Apply paint color using getimg.ai Stable Diffusion XL Inpainting
  async applyPaintColor(originalImagePath, maskImagePath, colorHex, colorName) {
    try {
      // Check if API key is configured and valid
      const apiKey = process.env.GETIMG_API_KEY;
      if (!apiKey || apiKey === 'your-getimg-api-key-here') {
        console.log('getimg.ai API key not configured, using original image as result');
        return {
          url: `/uploads/${path.basename(originalImagePath)}`,
          message: 'Development mode - API key not configured'
        };
      }

      console.log('Applying paint color using getimg.ai API...');
      
      // Convert images to base64 (but don't log them to avoid console spam)
      const imageBase64 = fs.readFileSync(originalImagePath, 'base64');
      const maskBase64 = fs.readFileSync(maskImagePath, 'base64');
      
      console.log(`Image size: ${Math.round(imageBase64.length / 1024)}KB, Mask size: ${Math.round(maskBase64.length / 1024)}KB`);
      
      const payload = {
        prompt: `realistic interior wall painted in ${colorName} color ${colorHex}, professional lighting, high quality, photorealistic`,
        negative_prompt: "blurry, low quality, distorted, unrealistic colors, cartoon, painting, illustration",
        image: imageBase64,
        mask: maskBase64,
        width: 1024,
        height: 1024,
        steps: 25,
        guidance_scale: 7.5,
        strength: 0.8
      };

      const response = await getimgAPI.post('/essential-v1/inpaint', payload);
      console.log('getimg.ai API request successful');
      
      return response.data;
    } catch (error) {
      // Log error details without the huge base64 data
      const errorInfo = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data // This will show the specific API error message
      };
      console.error('Paint application error:', errorInfo);
      
      if (error.response?.status === 401) {
        console.warn('getimg.ai API authentication failed - check your API key');
      } else if (error.response?.status === 429) {
        console.warn('getimg.ai API rate limit exceeded');
      } else {
        console.warn('getimg.ai API request failed');
      }
      
      console.log('Falling back to original image');
      
      // Fallback to original image if API fails
      return {
        url: `/uploads/${path.basename(originalImagePath)}`,
        message: 'API unavailable - showing original image'
      };
    }
  }

  // Step 4: Generate color recommendations based on color theory
  generateColorRecommendations(baseColorHex, paintColorsDatabase) {
    try {
      const hsl = this.hexToHsl(baseColorHex);
      const recommendations = [];
      
      // Complementary color (180° hue shift)
      const complementaryHue = (hsl.h + 180) % 360;
      const complementary = this.findClosestColor(complementaryHue, hsl.s, hsl.l, paintColorsDatabase);
      if (complementary) recommendations.push(complementary);
      
      // Analogous colors (±30° hue shift)
      const analogous1Hue = (hsl.h + 30) % 360;
      const analogous2Hue = (hsl.h - 30 + 360) % 360;
      
      const analogous1 = this.findClosestColor(analogous1Hue, hsl.s, hsl.l, paintColorsDatabase);
      const analogous2 = this.findClosestColor(analogous2Hue, hsl.s, hsl.l, paintColorsDatabase);
      
      if (analogous1) recommendations.push(analogous1);
      if (analogous2) recommendations.push(analogous2);
      
      return recommendations.slice(0, 3);
    } catch (error) {
      console.error('Color recommendation error:', error);
      return [];
    }
  }

  hexToHsl(hex) {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  findClosestColor(targetHue, targetSat, targetLight, colorsDatabase) {
    if (!colorsDatabase || colorsDatabase.length === 0) return null;
    
    return colorsDatabase.find(color => {
      const colorHsl = this.hexToHsl(color.hexCode);
      const hueDiff = Math.abs(colorHsl.h - targetHue);
      return hueDiff < 45;
    }) || colorsDatabase[Math.floor(Math.random() * Math.min(10, colorsDatabase.length))];
  }
}

export default new PaintVisualizationService();