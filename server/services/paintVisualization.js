import { roboflowAPI, getimgAPI } from '../config/apis.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get current directory for proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

class PaintVisualizationService {
  


  // Generate pattern inpainting payloads using SDXL inpainting with mask (STEP 2)
  generatePatternInpaintingPayload(paintedWallImageBase64, maskBase64, colorHex, colorName, pattern) {
    const basePayload = {
      model: 'realistic-vision-v5-1-inpainting',
      image: paintedWallImageBase64,
      mask_image: maskBase64,
      output_format: 'jpeg',
      response_format: 'url',
      width: 1024,
      height: 768
    };

    switch (pattern) {
      case 'accent-wall':
        return {
          ...basePayload,
          prompt: `dramatic accent wall design, bold ${colorName} wall styling, striking focal point, professional interior design`,
          negative_prompt: 'all walls same color, uniform walls, no accent, poor contrast, different colors, room changes, furniture, objects, people',
          strength: 0.7,
          guidance: 7.5,
          steps: 35,
          seed: 1001
        };

      case 'two-tone':
        return {
          ...basePayload,
          prompt: `wall with two-tone paint design, lower section ${colorName}, upper section white, horizontal division with chair rail molding, traditional wainscoting style`,
          negative_prompt: 'uneven division, crooked lines, no molding, wrong proportions, different colors, room changes, furniture, objects, people',
          strength: 0.8,
          guidance: 8.5,
          steps: 40,
          seed: 2002
        };

      case 'horizontal-stripes':
        return {
          ...basePayload,
          prompt: `wall with horizontal striped pattern, alternating ${colorName} and white horizontal bands, each stripe 6 inches tall, perfectly straight horizontal lines, coastal design`,
          negative_prompt: 'vertical stripes, diagonal stripes, uneven stripes, tilted lines, wavy bands, different colors, room changes, furniture, objects, people',
          strength: 0.85,
          guidance: 9.0,
          steps: 45,
          seed: 4004
        };



      case 'vertical-stripes':
        return {
          ...basePayload,
          prompt: `wall with classic vertical striped pattern, alternating ${colorName} and white vertical stripes, each stripe 4 inches wide, perfectly straight parallel lines, traditional wallpaper style, sharp clean edges`,
          negative_prompt: 'horizontal stripes, diagonal stripes, uneven stripes, crooked lines, wavy lines, different colors, room changes, furniture, objects, people',
          strength: 0.85,
          guidance: 9.0,
          steps: 45,
          seed: 3003
        };

      case 'horizontal-stripes':
        return {
          ...basePayload,
          prompt: `transform this ${colorName} painted wall into nautical horizontal striped pattern, alternating ${colorName} ${colorHex} and white horizontal bands, each stripe 6 inches tall, perfectly straight lines, coastal design`,
          negative_prompt: 'vertical stripes, uneven stripe heights, tilted lines, wavy bands, wrong proportions, rough edges, diagonal patterns, text overlays',
          strength: 0.78,
          guidance: 17.0,
          steps: 48,
          seed: 4004
        };

      case 'geometric':
        return {
          ...basePayload,
          prompt: `transform this ${colorName} painted wall into modern geometric pattern, ${colorName} ${colorHex} triangular shapes on white background, contemporary art deco design, clean geometric forms, symmetrical pattern`,
          negative_prompt: 'organic shapes, curved lines, random patterns, traditional designs, floral motifs, uneven geometry, soft edges, text overlays',
          strength: 0.85,
          guidance: 19.0,
          steps: 55,
          seed: 5005
        };

      case 'ombre':
        return {
          ...basePayload,
          prompt: `wall with stunning ombre gradient effect, ${colorName} at bottom gradually fading to pure white at top, smooth seamless color transition, professional gradient technique`,
          negative_prompt: 'harsh transitions, abrupt color changes, striped effect, color bands, uneven fade, different colors, room changes, furniture, objects, people',
          strength: 0.75,
          guidance: 8.0,
          steps: 40,
          seed: 6006
        };

      case 'color-block':
        return {
          ...basePayload,
          prompt: `transform this ${colorName} painted wall into bold color block design, large rectangular sections of ${colorName} ${colorHex} alternating with white blocks, modern minimalist pattern, clean geometric rectangles`,
          negative_prompt: 'small blocks, irregular shapes, curved edges, traditional patterns, gradients, color bleeding, uneven rectangles, text overlays',
          strength: 0.82,
          guidance: 17.5,
          steps: 47,
          seed: 7007
        };

      case 'wainscoting':
        return {
          ...basePayload,
          prompt: `transform this ${colorName} painted wall into classic wainscoting design, lower third painted ${colorName} ${colorHex}, upper two-thirds white, add traditional chair rail molding, elegant panel details`,
          negative_prompt: 'wrong proportions, no molding, modern style, uneven division, color bleeding, missing panels, contemporary design, text overlays',
          strength: 0.77,
          guidance: 16.5,
          steps: 44,
          seed: 8008
        };

      case 'border':
        return {
          ...basePayload,
          prompt: `transform this ${colorName} painted wall by adding elegant decorative border frame, keep ${colorName} ${colorHex} main color, add crisp white border frame around all edges, 6-inch border width`,
          negative_prompt: 'no border, uneven frame, wrong border size, color bleeding, rough edges, missing frame sections, text overlays',
          strength: 0.73,
          guidance: 16.0,
          steps: 43,
          seed: 9009
        };

      case 'textured':
        return {
          ...basePayload,
          prompt: `${colorName} ${colorHex} wall with flowing wave-like texture pattern, elegant organic wave formations, professional sponge painting technique, gentle undulating three-dimensional texture, soft matte finish`,
          negative_prompt: 'flat wall, no texture, glossy finish, smooth surface, different colors, room changes, furniture, objects, people',
          strength: 0.8,
          guidance: 8.0,
          steps: 40,
          seed: 101000
        };

      default:
        return {
          ...basePayload,
          prompt: `maintain this ${colorName} ${colorHex} painted wall as is`,
          negative_prompt: 'changes, modifications, text overlays',
          strength: 0.3,
          guidance: 10.0,
          steps: 20,
          seed: 420
        };
    }
  }




  // Step 1: Detect walls using Roboflow - SIMPLE APPROACH
  async detectWallSurfaces(imagePath) {
    try {
      // Try Wall-Wasil model first
      console.log('Detecting walls using Wall-Wasil model...');
      
      const apiKey = 'hqkeI7fba9NgZle7Ju5y';
      
      // CRITICAL: Resize image to 640x640 as required by the models
      const imageBuffer = fs.readFileSync(imagePath);
      const resizedBuffer = await sharp(imageBuffer)
        .resize(640, 640)
        .jpeg({ quality: 90 })
        .toBuffer();
      const image = resizedBuffer.toString('base64');

      const response = await roboflowAPI.post(
        `/wall-wasil-1/2?api_key=${apiKey}&confidence=0.3`,
        image,
        {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded" 
          }
        }
      );

      console.log('Wall-Wasil API request successful');
      console.log('Wall detection results:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Wall-Wasil model failed:', error.response?.data || error.message);
      
      try {
        // Try Wall-Ceiling-Floor model as backup
        console.log('Trying Wall-Ceiling-Floor model as backup...');
        
        const apiKey = 'hqkeI7fba9NgZle7Ju5y';
        
        // CRITICAL: Resize image to 640x640 as required by the models
        const imageBuffer = fs.readFileSync(imagePath);
        const resizedBuffer = await sharp(imageBuffer)
          .resize(640, 640)
          .jpeg({ quality: 90 })
          .toBuffer();
        const image = resizedBuffer.toString('base64');

        const response = await roboflowAPI.post(
          `/wall-ceiling-floor-m6bao/1?api_key=${apiKey}&confidence=0.3`,
          image,
          {
            headers: { 
              "Content-Type": "application/x-www-form-urlencoded" 
            }
          }
        );

        console.log('Wall-Ceiling-Floor API request successful');
        console.log('Wall detection results:', JSON.stringify(response.data, null, 2));
        return response.data;
      } catch (backupError) {
        console.error('Both models failed. Wall-Ceiling-Floor error:', backupError.response?.data || backupError.message);
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

  // Step 2: Create mask from Wall Segmentation detection results
  async createMaskFromWallDetection(imagePath, detectionResults) {
    try {
      const image = sharp(imagePath);
      const { width, height } = await image.metadata();

      console.log(`Image dimensions: ${width}x${height}`);

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
        pred.class && pred.class.toLowerCase().includes('wall')
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

      mask = mask.grayscale();
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


  // Step 3: Apply paint color (TWO-STEP BULLETPROOF APPROACH)
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

      console.log(`Starting BULLETPROOF two-step process for pattern: ${pattern}...`);
      
      // STEP 1: ALWAYS generate plain painted wall first (Your perfect system)
      console.log('STEP 1: Generating plain painted wall...');
      const plainResult = await this.generatePlainPaintedWall(originalImagePath, maskImagePath, colorHex, colorName);
      
      // If pattern is plain, return the plain result
      if (pattern === 'plain') {
        console.log('Pattern is plain - returning plain painted wall');
        return {
          url: plainResult.url,
          originalUrl: plainResult.url,
          message: 'Plain color visualization successful',
          plainUrl: plainResult.url  // For frontend reference
        };
      }

      // STEP 2: Apply pattern to the plain painted wall using same mask
      console.log(`STEP 2: Applying ${pattern} pattern to plain painted wall...`);
      const patternResult = await this.applyPatternToPlainWall(plainResult.url, colorHex, colorName, pattern, plainResult.resizedMaskPath);

      return {
        url: patternResult.url,
        originalUrl: patternResult.url,
        message: `${pattern} pattern visualization successful`,
        plainUrl: plainResult.url,    // Always include plain version
        patternUrl: patternResult.url // Pattern version
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

  // STEP 1: Generate plain painted wall (RESTORE ORIGINAL PERFECT SYSTEM)
  async generatePlainPaintedWall(originalImagePath, maskImagePath, colorHex, colorName) {
    // Resize images first for API compatibility
    const { resizedImagePath, resizedMaskPath, newWidth, newHeight } = await this.resizeForApi(originalImagePath, maskImagePath);

    // Convert resized images to base64
    const imageBase64 = fs.readFileSync(resizedImagePath, 'base64');
    const maskBase64 = fs.readFileSync(resizedMaskPath, 'base64');

    // Remove any data URL prefix (clean base64)
    const cleanImage = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const cleanMask = maskBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // 🎯 RESTORE YOUR ORIGINAL PERFECT PAYLOAD THAT WAS WORKING!
    const plainPayload = {
      model: 'realistic-vision-v5-1-inpainting',
      image: cleanImage,
      mask_image: cleanMask,
      prompt: `wall painted in exact ${colorName} color ${colorHex}, flat wall texture, realistic indoor lighting, maintain original room layout`,
      negative_prompt: 'windows, lamps, furniture, decorations, objects, paintings, frames, new items, extra objects, people, text, cartoon, unrealistic colors, color shift, oversaturated, undersaturated, wrong hue, lighting fixtures, architectural changes',
      strength: 0.99,
      guidance: 12.0,
      steps: 35,
      width: newWidth,
      height: newHeight,
      output_format: 'jpeg',
      response_format: 'url',
      seed: 986700
    };

    console.log(`the ${colorName} has ${colorHex}`);
    console.log(`Sending to getimg.ai: ${newWidth}x${newHeight}`);
    const response = await getimgAPI.post('/stable-diffusion/inpaint', plainPayload);

    // Clean up ONLY the resized image, keep mask for Step 2
    try {
      if (fs.existsSync(resizedImagePath)) fs.unlinkSync(resizedImagePath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp image file:', cleanupError.message);
    }

    console.log('STEP 1 COMPLETE: Plain painted wall generated successfully');
    return {
      url: response.data.url,
      message: 'Plain paint successful',
      resizedMaskPath: resizedMaskPath
    };
  }

  // STEP 2: Apply pattern to ONLY the painted wall area using SAME MASK
  async applyPatternToPlainWall(plainPaintedImageUrl, colorHex, colorName, pattern, resizedMaskPath) {
    try {
      console.log(`Applying ${pattern} pattern to only the painted wall area...`);
      
      // Download the plain painted image
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(plainPaintedImageUrl);
      const imageBuffer = await response.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');

      // Use the SAME mask from Step 1 to ensure pattern only applies to painted area
      const maskBase64 = fs.readFileSync(resizedMaskPath, 'base64');
      const cleanMask = maskBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      // Generate pattern-specific payload using INPAINTING with mask
      const patternPayload = this.generatePatternInpaintingPayload(imageBase64, cleanMask, colorHex, colorName, pattern);
      
      console.log(`Applying ${pattern} pattern using SDXL inpainting with mask...`);
      const patternResponse = await getimgAPI.post('/stable-diffusion/inpaint', patternPayload);

      // Clean up temp mask file
      try {
        if (fs.existsSync(resizedMaskPath)) fs.unlinkSync(resizedMaskPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up mask file:', cleanupError.message);
      }

      console.log('STEP 2 COMPLETE: Pattern applied successfully to painted area only');
      return {
        url: patternResponse.data.url,
        message: 'Pattern application successful'
      };

    } catch (error) {
      console.error('Pattern application error:', error);
      console.log('Pattern failed, returning plain painted wall');
      return {
        url: plainPaintedImageUrl,
        message: 'Pattern failed - showing plain version'
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