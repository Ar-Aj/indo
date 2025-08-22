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

  // Generate enhanced prompts that work better with inpainting for patterns
  generatePatternInpaintingPrompt(colorHex, colorName, pattern) {
    const baseColorDesc = `${colorName} ${colorHex}`;
    
    const patternPrompts = {
      'plain': `wall painted with exact ${baseColorDesc}, solid uniform flat color, matte finish, precise color match, no patterns or texture`,
      
      'accent-wall': `room interior with one feature accent wall painted ${baseColorDesc}, other walls neutral cream, focal wall design, realistic lighting`,
      
      'two-tone': `room interior wall with two-tone paint design, lower section ${baseColorDesc}, upper section white, chair rail molding, traditional style`,
      
      'vertical-stripes': `wall painted with ${baseColorDesc} and white vertical stripes pattern, alternating stripes, each stripe 4 inches wide, classic striped design`,
      
      'horizontal-stripes': `wall painted with ${baseColorDesc} and white horizontal stripes, alternating horizontal bands, nautical stripe pattern`,
      
      'geometric': `wall with geometric pattern using ${baseColorDesc} and white, triangular geometric design, modern pattern`,
      
      'ombre': `wall with ombre gradient effect, ${baseColorDesc} at bottom fading to white at top, smooth gradient transition`,
      
      'color-block': `wall with color block pattern, large ${baseColorDesc} rectangular sections alternating with white blocks`,
      
      'wainscoting': `wall with wainscoting design, lower third painted ${baseColorDesc}, upper wall white, chair rail molding`,
      
      'border': `wall painted ${baseColorDesc} with white decorative border frame around the edges`,
      
      'textured': `wall painted ${baseColorDesc} with subtle textured finish, sponge paint technique, textured surface`
    };

    return patternPrompts[pattern] || patternPrompts['plain'];
  }

  // Generate prompts for pattern overlay on painted walls


  // Step 1: Detect walls, ceiling, and floor using Roboflow Wall-Ceiling-Floor model
  async detectWallSurfaces(imagePath) {
    try {
      // Check if API key is configured and valid
      const apiKey = process.env.ROBOFLOW_API_KEY;
      if (!apiKey || apiKey === 'your-roboflow-api-key-here') {
        console.log('Roboflow API key not configured, using mock wall detection');
        return {
          predictions: [
            {
              class: 'wall',
              x: 300,
              y: 200,
              width: 400,
              height: 300,
              confidence: 0.92
            },
            {
              class: 'wall',
              x: 800,
              y: 250,
              width: 300,
              height: 400,
              confidence: 0.88
            }
          ]
        };
      }

      console.log('Detecting walls, ceiling, and floor using Roboflow Wall-Ceiling-Floor model...');

      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));

      const response = await roboflowAPI.post(
        `/wall-ceiling-floor-m6bao/1?api_key=${apiKey}`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      console.log('Roboflow Wall Detection API request successful');
      console.log('Wall detection results:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Wall detection error:', error);
      console.log('Falling back to mock wall detection');
      return {
        predictions: [
          {
            class: 'wall',
            x: 300,
            y: 200,
            width: 400,
            height: 300,
            confidence: 0.92
          }
        ]
      };
    }
  }

  // Step 1.5: Save manual mask provided by user
  async saveManualMask(manualMaskBase64, originalImagePath) {
    try {
      console.log('Saving manual mask provided by user...');

      // Get image dimensions
      const image = sharp(originalImagePath);
      const { width, height } = await image.metadata();

      // Convert base64 to buffer
      const maskBuffer = Buffer.from(manualMaskBase64, 'base64');

      // Generate unique filename
      const maskPath = path.join(uploadsDir, `manual-mask-${Date.now()}.png`);

      // Resize mask to match original image dimensions
      await sharp(maskBuffer)
        .resize(width, height)
        .png()
        .toFile(maskPath);

      console.log(`Manual mask saved to: ${maskPath}`);
      return maskPath;
    } catch (error) {
      console.error('Manual mask saving error:', error);
      throw new Error(`Manual mask saving failed: ${error.message}`);
    }
  }

  // Step 2: Create mask from Wall-Ceiling-Floor detection results
  async createMaskFromWallDetection(imagePath, detectionResults) {
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

      // Find walls
      const wallSurfaces = detectionResults.predictions?.filter(pred =>
        pred.class.toLowerCase() === 'wall'
      ) || [];

      console.log(`Found ${wallSurfaces.length} walls`);

      if (wallSurfaces.length > 0) {
        // Create white rectangles for detected walls
        const wallComposites = wallSurfaces.map(wall => {
          const x = Math.round(wall.x - wall.width / 2);
          const y = Math.round(wall.y - wall.height / 2);

          console.log(`Creating mask for wall: x=${x}, y=${y}, width=${Math.round(wall.width)}, height=${Math.round(wall.height)}`);

          return {
            input: {
              create: {
                width: Math.round(wall.width),
                height: Math.round(wall.height),
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
              }
            },
            top: Math.max(0, y),
            left: Math.max(0, x)
          };
        });

        mask = mask.composite(wallComposites);
        console.log(`Successfully created masks for ${wallComposites.length} wall(s)`);
      } else {
        // Default mask if no walls detected
        console.warn('No walls detected, creating default center mask');
        const defaultWidth = Math.round(width * 0.7);
        const defaultHeight = Math.round(height * 0.5);
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

  // Step 2.5: Resize images for getimg.ai API (max 1024x1024)
  async resizeForApi(imagePath, maskPath) {
    const maxDim = 1024;

    const origImage = sharp(imagePath);
    const { width, height } = await origImage.metadata();

    console.log(`Original dimensions: ${width}x${height}`);

    let newWidth = width;
    let newHeight = height;

    if (width > maxDim || height > maxDim) {
      const ratio = width / height;
      if (ratio > 1) {
        newWidth = maxDim;
        newHeight = Math.round(maxDim / ratio);
      } else {
        newHeight = maxDim;
        newWidth = Math.round(maxDim * ratio);
      }
    }

    console.log(`Resizing to: ${newWidth}x${newHeight}`);

    const resizedImagePath = imagePath.replace(/(\.[^.]*)$/, `-resized$1`);
    const resizedMaskPath = maskPath.replace(/(\.[^.]*)$/, `-resized$1`);

    await origImage.resize(newWidth, newHeight).toFile(resizedImagePath);
    await sharp(maskPath).resize(newWidth, newHeight).toFile(resizedMaskPath);

    return { resizedImagePath, resizedMaskPath, newWidth, newHeight };
  }


  // Step 3: Apply paint color (SIMPLIFIED SINGLE-STEP APPROACH)
  async applyPaintColor(originalImagePath, maskImagePath, colorHex, colorName, pattern = 'plain') {
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

      console.log(`Applying paint color with pattern: ${pattern}...`);
      
      // Resize images first for API compatibility
      const { resizedImagePath, resizedMaskPath, newWidth, newHeight } = await this.resizeForApi(originalImagePath, maskImagePath);

      // Convert resized images to base64
      const imageBase64 = fs.readFileSync(resizedImagePath, 'base64');
      const maskBase64 = fs.readFileSync(resizedMaskPath, 'base64');

      // Remove any data URL prefix (clean base64)
      const cleanImage = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const cleanMask = maskBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      // Generate pattern-specific prompt
      const patternPrompt = this.generatePatternInpaintingPrompt(colorHex, colorName, pattern);
      console.log(`Using pattern prompt for ${pattern}: ${patternPrompt}`);

      console.log(`the ${colorName} has ${colorHex}`);
      console.log(`Sending to getimg.ai: ${newWidth}x${newHeight}`);

      // Single API call with pattern-specific prompt and parameters
      const payload = {
        model: 'realistic-vision-v5-1-inpainting',
        image: cleanImage,
        mask_image: cleanMask,
        prompt: patternPrompt,
        negative_prompt: pattern === 'plain' 
          ? 'wrong color, color shift, color variations, oversaturated, undersaturated, glossy finish, texture, patterns, shadows on paint, color bleeding, uneven coverage, blurry, low quality, artifacts, color gradients, off-color'
          : 'text overlays, watermarks, labels, words, letters, wrong colors, unrealistic lighting, blurry, low quality, distorted, people, extra furniture, new objects, poor pattern execution',
        strength: pattern === 'plain' ? 0.85 : 0.95,  // Higher strength for patterns
        guidance: pattern === 'plain' ? 12.0 : 18.0,  // Higher guidance for patterns
        steps: pattern === 'plain' ? 35 : 50,         // More steps for patterns
        width: newWidth,
        height: newHeight,
        output_format: 'jpeg',
        response_format: 'url',
        seed: 420
      };

      const response = await getimgAPI.post('/stable-diffusion/inpaint', payload);

      console.log('getimg.ai API request successful');

      // Clean up temporary resized files
      try {
        if (fs.existsSync(resizedImagePath)) fs.unlinkSync(resizedImagePath);
        if (fs.existsSync(resizedMaskPath)) fs.unlinkSync(resizedMaskPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp files:', cleanupError.message);
      }

      return {
        url: response.data.url,
        originalUrl: response.data.url,
        message: `${pattern} visualization successful`
      };

    } catch (error) {
      console.error('Paint application error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });

      console.log('Falling back to original image');
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