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

  // Generate pattern-specific payloads with thoughtful optimization for each pattern
  generatePatternSpecificPayload(cleanImage, cleanMask, colorHex, colorName, pattern, width, height) {
    const basePayload = {
      model: 'realistic-vision-v5-1-inpainting',
      image: cleanImage,
      mask_image: cleanMask,
      width: width,
      height: height,
      output_format: 'jpeg',
      response_format: 'url'
    };

    switch (pattern) {
      case 'plain':
        // 🎯 ORIGINAL PERFECT PAYLOAD - DO NOT CHANGE!
        return {
          ...basePayload,
          prompt: `wall painted in exact ${colorName} color ${colorHex}, flat wall texture, realistic indoor lighting, maintain original room layout`,
          negative_prompt: 'windows, lamps, furniture, decorations, objects, paintings, frames, new items, extra objects, people, text, cartoon, unrealistic colors, color shift, oversaturated, undersaturated, wrong hue, lighting fixtures, architectural changes',
          strength: 0.85,
          guidance: 12.0,
          steps: 35,
          seed: 420
        };

      case 'accent-wall':
        return {
          ...basePayload,
          prompt: `interior room with one dramatic accent wall painted in rich ${colorName} ${colorHex}, other walls neutral off-white, feature wall focal point, professional interior design, realistic lighting, modern residential style`,
          negative_prompt: 'all walls same color, uniform color, no accent, poor contrast, wrong wall selection, text overlays, unrealistic colors, furniture changes, architectural modifications, people, objects',
          strength: 0.82,
          guidance: 14.0,
          steps: 40,
          seed: 1001
        };

      case 'two-tone':
        return {
          ...basePayload,
          prompt: `elegant two-tone wall design, lower section painted ${colorName} ${colorHex}, upper section crisp white, horizontal division with classic chair rail molding at 36 inches, traditional wainscoting style, perfect paint line separation`,
          negative_prompt: 'uneven division, crooked lines, no molding, wrong proportions, color bleeding, messy edges, modern style, gradient, ombre effect, text, objects, furniture',
          strength: 0.88,
          guidance: 16.0,
          steps: 45,
          seed: 2002
        };

      case 'vertical-stripes':
        return {
          ...basePayload,
          prompt: `classic vertical striped wall, alternating ${colorName} ${colorHex} and crisp white vertical stripes, each stripe exactly 4 inches wide, perfectly straight parallel lines, traditional wallpaper style, sharp clean edges`,
          negative_prompt: 'horizontal stripes, uneven widths, crooked lines, wavy stripes, diagonal patterns, color variations, blurred edges, modern geometric, text overlays, furniture changes',
          strength: 0.92,
          guidance: 18.0,
          steps: 50,
          seed: 3003
        };

      case 'horizontal-stripes':
        return {
          ...basePayload,
          prompt: `nautical horizontal striped wall, alternating ${colorName} ${colorHex} and white horizontal bands, each stripe 6 inches tall, perfectly straight horizontal lines, coastal interior design, crisp paint edges`,
          negative_prompt: 'vertical stripes, uneven heights, tilted lines, wavy bands, wrong stripe sizes, color bleeding, rough edges, diagonal patterns, text, objects, architectural changes',
          strength: 0.90,
          guidance: 17.0,
          steps: 48,
          seed: 4004
        };

      case 'geometric':
        return {
          ...basePayload,
          prompt: `modern geometric wall pattern, ${colorName} ${colorHex} triangular shapes on white background, contemporary art deco design, clean geometric forms, symmetrical pattern, sharp angular edges, sophisticated interior`,
          negative_prompt: 'organic shapes, curved lines, random patterns, traditional designs, floral motifs, uneven geometry, color gradients, soft edges, text overlays, furniture, people',
          strength: 0.94,
          guidance: 19.0,
          steps: 55,
          seed: 5005
        };

      case 'ombre':
        return {
          ...basePayload,
          prompt: `stunning ombre gradient wall effect, ${colorName} ${colorHex} at bottom gradually fading to pure white at top, smooth seamless color transition, professional gradient technique, subtle blending, elegant fade effect`,
          negative_prompt: 'harsh transitions, abrupt color changes, striped effect, patchy blending, wrong gradient direction, color bands, uneven fade, text overlays, objects, furniture changes',
          strength: 0.86,
          guidance: 15.0,
          steps: 42,
          seed: 6006
        };

      case 'color-block':
        return {
          ...basePayload,
          prompt: `bold color block wall design, large rectangular sections of ${colorName} ${colorHex} alternating with white blocks, modern minimalist pattern, clean geometric rectangles, contemporary art inspired, precise edges`,
          negative_prompt: 'small blocks, irregular shapes, curved edges, traditional patterns, gradients, color bleeding, uneven rectangles, diagonal blocks, text, furniture, people, objects',
          strength: 0.91,
          guidance: 17.5,
          steps: 47,
          seed: 7007
        };

      case 'wainscoting':
        return {
          ...basePayload,
          prompt: `classic wainscoting design, lower third of wall painted ${colorName} ${colorHex}, upper two-thirds white, traditional chair rail molding, elegant panel details, formal dining room style, precise paint lines`,
          negative_prompt: 'wrong proportions, no molding, modern style, uneven division, color bleeding, missing panels, contemporary design, gradient effects, text overlays, furniture changes',
          strength: 0.87,
          guidance: 16.5,
          steps: 44,
          seed: 8008
        };

      case 'border':
        return {
          ...basePayload,
          prompt: `elegant wall with decorative border frame, ${colorName} ${colorHex} main wall color with crisp white border frame around all edges, 6-inch border width, picture frame effect, sophisticated interior design`,
          negative_prompt: 'no border, uneven frame, wrong border size, color bleeding, rough edges, modern geometric, missing frame sections, text overlays, furniture, architectural changes',
          strength: 0.89,
          guidance: 16.0,
          steps: 43,
          seed: 9009
        };

      case 'textured':
        return {
          ...basePayload,
          prompt: `sophisticated textured wall finish, ${colorName} ${colorHex} with subtle sponge painting technique, elegant texture variation, professional faux finish, organic texture pattern, depth and dimension, matte finish`,
          negative_prompt: 'flat surface, no texture, glossy finish, harsh texture, wrong technique, color variations, uneven application, rough texture, text overlays, objects, furniture changes',
          strength: 0.93,
          guidance: 18.5,
          steps: 52,
          seed: 1010
        };

      default:
        // Fallback to plain if pattern not recognized
        return this.generatePatternSpecificPayload(cleanImage, cleanMask, colorHex, colorName, 'plain', width, height);
    }
  }


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

      // Generate pattern-specific payload with thoughtful optimization
      const payload = this.generatePatternSpecificPayload(cleanImage, cleanMask, colorHex, colorName, pattern, newWidth, newHeight);
      console.log(`Using ${pattern} pattern with optimized payload`);

      console.log(`the ${colorName} has ${colorHex}`);
      console.log(`Sending to getimg.ai: ${newWidth}x${newHeight}`);

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