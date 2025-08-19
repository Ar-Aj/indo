import { roboflowAPI, getimgAPI } from '../config/apis.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';
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

      // Find walls specifically, not furniture
      const wallSurfaces = detectionResults.predictions?.filter(pred =>
        ['wall', 'door'].includes(pred.class.toLowerCase())
      ) || [];

      console.log(`Found ${wallSurfaces.length} wall surfaces`);
      
      // If no walls detected, create a background mask (everything except detected furniture)
      const furnitureSurfaces = detectionResults.predictions?.filter(pred =>
        ['couch', 'sofa', 'chair', 'bed', 'table', 'cabinet', 'furniture'].includes(pred.class.toLowerCase())
      ) || [];

      console.log(`Found ${furnitureSurfaces.length} furniture surfaces`);
      furnitureSurfaces.forEach((surface, index) => {
        console.log(`Furniture ${index + 1}: class=${surface.class}, confidence=${surface.confidence}, x=${surface.x}, y=${surface.y}, width=${surface.width}, height=${surface.height}`);
      });

      if (wallSurfaces.length > 0) {
        // Create white rectangles for detected walls
        const surface = wallSurfaces[0]; // Use first detected wall
        const x = Math.round(surface.x - surface.width / 2);
        const y = Math.round(surface.y - surface.height / 2);

        console.log(`Creating mask for wall: x=${x}, y=${y}, width=${Math.round(surface.width)}, height=${Math.round(surface.height)}`);

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

        console.log('Wall mask created successfully');
      } else if (furnitureSurfaces.length > 0) {
        // No walls detected, create inverse mask (paint background, avoid furniture)
        console.log('No walls detected, creating background mask (avoiding furniture)');
        
        // Start with white background (everything paintable)
        mask = sharp({
          create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        });

        // Create black rectangles for furniture (areas to avoid)
        const furnitureComposites = furnitureSurfaces.map(furniture => {
          const x = Math.round(furniture.x - furniture.width / 2);
          const y = Math.round(furniture.y - furniture.height / 2);
          
          console.log(`Masking out furniture: ${furniture.class} at x=${x}, y=${y}, width=${Math.round(furniture.width)}, height=${Math.round(furniture.height)}`);
          
          return {
            input: {
              create: {
                width: Math.round(furniture.width),
                height: Math.round(furniture.height),
                channels: 3,
                background: { r: 0, g: 0, b: 0 }
              }
            },
            top: Math.max(0, y),
            left: Math.max(0, x)
          };
        });

        if (furnitureComposites.length > 0) {
          mask = mask.composite(furnitureComposites);
        }

        console.log('Background mask created successfully (furniture areas masked out)');
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

  // Step 3.5: Download and save the generated image locally
  async downloadGeneratedImage(imageUrl) {
    try {
      console.log('Downloading generated image from:', imageUrl);
      
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const localImagePath = path.join(uploadsDir, `generated-${Date.now()}.jpg`);
      
      const writer = fs.createWriteStream(localImagePath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log('Generated image saved locally:', localImagePath);
          resolve(localImagePath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Error downloading generated image:', error);
      throw new Error(`Failed to download generated image: ${error.message}`);
    }
  }

  // Step 3.6: Save base64 image data locally
  async saveBase64Image(base64Data) {
    try {
      console.log('Saving base64 image data locally...');
      console.log('Original data length:', base64Data.length);
      
      // Remove data URL prefix if present
      let cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Remove any whitespace or newlines
      cleanBase64 = cleanBase64.replace(/\s/g, '');
      
      console.log('Clean base64 length:', cleanBase64.length);
      console.log('Base64 starts with:', cleanBase64.substring(0, 20));
      
      // Validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleanBase64)) {
        throw new Error('Invalid base64 format detected');
      }
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      console.log('Buffer created, size:', imageBuffer.length, 'bytes');
      
      // Determine file extension based on image signature
      let extension = 'jpg';
      if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
        extension = 'png';
      } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
        extension = 'jpg';
      }
      
      // Generate unique filename
      const localImagePath = path.join(uploadsDir, `generated-${Date.now()}.${extension}`);
      
      // Write buffer to file
      fs.writeFileSync(localImagePath, imageBuffer);
      
      console.log('Base64 image saved locally:', localImagePath);
      console.log('Image size:', Math.round(imageBuffer.length / 1024), 'KB');
      console.log('Image format:', extension.toUpperCase());
      
      return localImagePath;
    } catch (error) {
      console.error('Error saving base64 image:', error);
      console.error('Base64 data preview:', base64Data.substring(0, 100) + '...');
      throw new Error(`Failed to save base64 image: ${error.message}`);
    }
  }

  // Step 3: Apply paint color using getimg.ai Stable Diffusion XL Inpainting
  async applyPaintColor(originalImagePath, maskImagePath, colorHex, colorName) {
    let resizedImages = null;
    
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
      resizedImages = await this.resizeForAPI(originalImagePath, maskImagePath);

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
        prompt: `paint the walls and background in ${colorName} color, avoid painting furniture, realistic interior design, high quality, detailed`,
        width: resizedImages.width,
        height: resizedImages.height,
        num_inference_steps: 25,
        guidance_scale: 7.5,
        strength: 0.8
      };

      const response = await getimgAPI.post('/stable-diffusion-xl/inpaint', payload);
      console.log('getimg.ai API request successful');
      
      // Log only essential response info to avoid huge console output
      console.log('Response type:', typeof response.data);
      console.log('Response is string:', typeof response.data === 'string');
      
      if (typeof response.data === 'object' && response.data !== null) {
        console.log('Response keys:', Object.keys(response.data));
        if (response.data.id) console.log('Generation ID:', response.data.id);
        if (response.data.generationTime) console.log('Generation time:', response.data.generationTime);
      } else if (typeof response.data === 'string') {
        console.log('Response string length:', response.data.length);
        console.log('Response starts with:', response.data.substring(0, 20) + '...');
      }

      // Handle different possible response formats
      let imageData = null;
      let localImagePath = null;

      // Check for base64 image data in various response formats
      if (response.data.image) {
        // Response contains base64 image data in 'image' field
        console.log('Received base64 image data in image field, saving locally...');
        imageData = response.data.image;
        localImagePath = await this.saveBase64Image(imageData);
      } else if (response.data.output && response.data.output.length > 0) {
        // Response contains URL(s) in output array
        const generatedImageUrl = response.data.output[0];
        console.log('Generated image URL:', generatedImageUrl);
        localImagePath = await this.downloadGeneratedImage(generatedImageUrl);
      } else if (response.data.images && response.data.images.length > 0) {
        // Response contains base64 images in 'images' array
        console.log('Received base64 image data in images array, saving locally...');
        imageData = response.data.images[0];
        localImagePath = await this.saveBase64Image(imageData);
      } else if (typeof response.data === 'string' && response.data.length > 1000) {
        // Response is likely base64 image data (large string)
        console.log('Response appears to be base64 image data (large string), saving locally...');
        console.log('String length:', response.data.length, 'characters');
        imageData = response.data;
        localImagePath = await this.saveBase64Image(imageData);
      } else if (typeof response.data === 'string' && (response.data.startsWith('/9j/') || response.data.startsWith('iVBORw0KGgo'))) {
        // Response is directly base64 image data (JPEG starts with /9j/, PNG starts with iVBORw0KGgo)
        console.log('Response is direct base64 image data (detected by prefix), saving locally...');
        imageData = response.data;
        localImagePath = await this.saveBase64Image(imageData);
      } else {
        console.error('No image found in response');
        console.error('Response structure:', {
          hasImage: !!response.data?.image,
          hasOutput: !!response.data?.output,
          hasImages: !!response.data?.images,
          isString: typeof response.data === 'string',
          dataLength: typeof response.data === 'string' ? response.data.length : 'N/A',
          keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A',
          stringPreview: typeof response.data === 'string' ? response.data.substring(0, 50) + '...' : 'N/A'
        });
        throw new Error('No image generated - invalid API response format');
      }

      if (localImagePath) {
        // Clean up temporary files after successful processing
        try {
          if (fs.existsSync(resizedImages.imagePath)) {
            fs.unlinkSync(resizedImages.imagePath);
          }
          if (fs.existsSync(resizedImages.maskPath)) {
            fs.unlinkSync(resizedImages.maskPath);
          }
          console.log('Temporary files cleaned up successfully');
        } catch (cleanupError) {
          console.warn('Failed to clean up temporary files:', cleanupError.message);
        }
        
        return {
          url: `/uploads/${path.basename(localImagePath)}`,
          id: response.data.id,
          generationTime: response.data.generationTime,
          message: 'Paint visualization successful'
        };
      } else {
        throw new Error('Failed to save generated image');
      }
    } catch (error) {
      // Log error details without the huge base64 data
      const errorInfo = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      };
      
      // Only log response data if it's not huge base64 data
      if (error.response?.data && typeof error.response.data === 'object') {
        errorInfo.data = error.response.data;
      } else if (error.response?.data && typeof error.response.data === 'string' && error.response.data.length < 1000) {
        errorInfo.data = error.response.data;
      } else if (error.response?.data) {
        errorInfo.dataType = typeof error.response.data;
        errorInfo.dataLength = error.response.data.length;
        errorInfo.dataPreview = error.response.data.substring(0, 100) + '...';
      }
      
      console.error('Paint application error:', errorInfo);

      if (error.response?.status === 401) {
        console.warn('getimg.ai API authentication failed - check your API key');
      } else if (error.response?.status === 429) {
        console.warn('getimg.ai API rate limit exceeded');
      } else {
        console.warn('getimg.ai API request failed');
      }

      console.log('Falling back to original image');

      // Clean up temporary files in case of error
      try {
        if (resizedImages) {
          if (fs.existsSync(resizedImages.imagePath)) {
            fs.unlinkSync(resizedImages.imagePath);
          }
          if (fs.existsSync(resizedImages.maskPath)) {
            fs.unlinkSync(resizedImages.maskPath);
          }
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary files:', cleanupError.message);
      }

      // Fallback to original image if API fails
      return {
        url: `/uploads/${path.basename(originalImagePath)}`,
        message: 'API unavailable - showing original image',
        error: errorInfo
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