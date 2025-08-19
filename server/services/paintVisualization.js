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
      console.log('Detection results:', JSON.stringify(response.data, null, 2));
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

      console.log(`Image dimensions: ${width}x${height}`);
      console.log(`Total predictions: ${detectionResults.predictions?.length || 0}`);

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
        ['wall', 'furniture', 'cabinet', 'door', 'couch', 'sofa', 'chair', 'bed', 'table'].includes(pred.class.toLowerCase())
      ) || [];

      console.log(`Found ${paintableSurfaces.length} paintable surfaces`);
      paintableSurfaces.forEach((surface, index) => {
        console.log(`Surface ${index + 1}: class=${surface.class}, confidence=${surface.confidence}, x=${surface.x}, y=${surface.y}, width=${surface.width}, height=${surface.height}`);
      });

      if (paintableSurfaces.length > 0) {
        // Create white rectangles for detected surfaces
        const surface = paintableSurfaces[0]; // Use first detected surface
        const x = Math.round(surface.x - surface.width / 2);
        const y = Math.round(surface.y - surface.height / 2);

        console.log(`Creating mask for surface: x=${x}, y=${y}, width=${Math.round(surface.width)}, height=${Math.round(surface.height)}`);

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

        console.log('Mask created successfully with white area');
      } else {
        console.warn('No paintable surfaces found, creating a default mask with center rectangle');
        // Create a default mask with a center rectangle if no surfaces detected
        const defaultWidth = Math.round(width * 0.6);
        const defaultHeight = Math.round(height * 0.4);
        const defaultX = Math.round((width - defaultWidth) / 2);
        const defaultY = Math.round((height - defaultHeight) / 2);

        mask = mask.composite([{
          input: {
            create: {
              width: defaultWidth,
              height: defaultHeight,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          },
          top: defaultY,
          left: defaultX
        }]);

        console.log(`Default mask created: ${defaultWidth}x${defaultHeight} at ${defaultX},${defaultY}`);
      }

      const maskPath = path.join(uploadsDir, `mask-${Date.now()}.png`);
      await mask.png().toFile(maskPath);

      console.log(`Mask saved to: ${maskPath}`);
      return maskPath;
    } catch (error) {
      console.error('Mask creation error:', error);
      throw new Error(`Mask creation failed: ${error.message}`);
    }
  }

  // Step 2.5: Resize image and mask for API compatibility
  async resizeForAPI(imagePath, maskPath) {
    try {
      console.log('Resizing images for API compatibility...');

      // Target dimensions (getimg.ai typically accepts up to 1024x1024)
      const maxWidth = 1024;
      const maxHeight = 1024;

      // Get original dimensions
      const originalImage = sharp(imagePath);
      const { width: origWidth, height: origHeight } = await originalImage.metadata();

      console.log(`Original dimensions: ${origWidth}x${origHeight}`);

      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = origWidth / origHeight;
      let newWidth, newHeight;

      if (aspectRatio > 1) {
        // Landscape
        newWidth = Math.min(maxWidth, origWidth);
        newHeight = Math.round(newWidth / aspectRatio);
      } else {
        // Portrait or square
        newHeight = Math.min(maxHeight, origHeight);
        newWidth = Math.round(newHeight * aspectRatio);
      }

      // Ensure dimensions are even numbers (some APIs require this)
      newWidth = Math.floor(newWidth / 2) * 2;
      newHeight = Math.floor(newHeight / 2) * 2;

      console.log(`Resizing to: ${newWidth}x${newHeight}`);

      // Resize original image
      const resizedImagePath = path.join(uploadsDir, `resized-image-${Date.now()}.jpg`);
      await originalImage
        .resize(newWidth, newHeight)
        .jpeg({ quality: 90 })
        .toFile(resizedImagePath);

      // Resize mask
      const resizedMaskPath = path.join(uploadsDir, `resized-mask-${Date.now()}.png`);
      await sharp(maskPath)
        .resize(newWidth, newHeight)
        .png()
        .toFile(resizedMaskPath);

      console.log(`Resized images saved: ${resizedImagePath}, ${resizedMaskPath}`);

      return {
        imagePath: resizedImagePath,
        maskPath: resizedMaskPath,
        width: newWidth,
        height: newHeight
      };
    } catch (error) {
      console.error('Image resizing error:', error);
      throw new Error(`Image resizing failed: ${error.message}`);
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

      // Resize images first for API compatibility
      const resizedImages = await this.resizeForAPI(originalImagePath, maskImagePath);

      // Convert resized images to base64
      const imageBase64 = fs.readFileSync(resizedImages.imagePath, 'base64');
      const maskBase64 = fs.readFileSync(resizedImages.maskPath, 'base64');

      console.log(`Image size: ${Math.round(imageBase64.length / 1024)}KB, Mask size: ${Math.round(maskBase64.length / 1024)}KB`);

      // Ensure base64 strings have no data URL prefix (they should be pure base64)
      const cleanImageBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const cleanMaskBase64 = maskBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const payload = {
        model: "stable-diffusion-xl-v1-0",
        image: cleanImageBase64,
        mask_image: cleanMaskBase64,
        prompt: `paint the wall in ${colorName} color, realistic interior design`,
        width: resizedImages.width,
        height: resizedImages.height
      };

      const response = await getimgAPI.post('/stable-diffusion-xl/inpainting', payload);
console.log('getimg.ai API request successful');
console.log('API Response:', JSON.stringify(response.data, null, 2)); // ADD THIS LINE

return response.data;

      return response.data;

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