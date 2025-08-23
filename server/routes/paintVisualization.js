import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import paintService from '../services/paintVisualization.js';
import Project from '../models/project.js';
import Color from '../models/color.js';

const router = express.Router();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// PROTECTED: Process paint visualization
router.post('/process', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { colorId, projectName, maskingMethod, manualMask, pattern } = req.body;
    const imagePath = req.file.path;
    
    console.log('Starting paint visualization process...');
    console.log('Masking method:', maskingMethod);
    
    // Validate inputs
    if (!colorId) {
      return res.status(400).json({ error: 'Color selection is required' });
    }
    
    if (!maskingMethod) {
      return res.status(400).json({ error: 'Masking method is required' });
    }
    
    if (maskingMethod === 'manual' && !manualMask) {
      return res.status(400).json({ error: 'Manual mask is required when using manual masking' });
    }
    
    // Get selected color from database
    const selectedColor = await Color.findById(colorId);
    if (!selectedColor) {
      return res.status(400).json({ error: 'Invalid color selected' });
    }

    console.log('Selected color:', selectedColor.name);

    let maskPath;
    let detectionResults = { predictions: [] };

    if (maskingMethod === 'manual') {
      // Step 1: Use manual mask provided by user
      console.log('Using manual mask provided by user...');
      maskPath = await paintService.saveManualMask(manualMask, imagePath);
      
      // Create mock detection results for manual masking
      detectionResults = {
        predictions: [{
          class: 'manual_selection',
          confidence: 1.0,
          manual: true
        }]
      };
    } else {
      // Step 1: Detect walls, ceiling, and floor using Roboflow
      console.log('Detecting walls, ceiling, and floor...');
      detectionResults = await paintService.detectWallSurfaces(imagePath);
      
      // Step 2: Create mask from wall detection results
      console.log('Creating mask from wall detection results...');
      maskPath = await paintService.createMaskFromWallDetection(imagePath, detectionResults);
    }
    
    // Step 3: Apply paint color with pattern using getimg.ai
    console.log('Applying paint color with pattern:', pattern || 'plain');
    const paintResult = await paintService.applyPaintColor(
      imagePath, 
      maskPath, 
      selectedColor.hexCode, 
      selectedColor.name,
      pattern || 'plain'
    );
    
    // Step 4: Generate color recommendations
    console.log('Generating color recommendations...');
    const allColors = await Color.find({}).limit(100); // Limit for performance
    const recommendations = paintService.generateColorRecommendations(
      selectedColor.hexCode, 
      allColors
    );
    
    // Step 5: Save project to database
    const project = new Project({
      userId: req.user._id,
      name: projectName || `Project ${Date.now()}`,
      originalImageUrl: `/uploads/${path.basename(imagePath)}`,
      processedImageUrl: paintResult.url,
      plainImageUrl: paintResult.plainUrl || paintResult.url, // Always have plain version
      patternImageUrl: paintResult.patternUrl, // May be undefined for plain patterns
      selectedColors: [colorId],
      detectionResults: detectionResults,
      pattern: pattern || 'plain'
    });
    
    await project.save();
    
    console.log('Paint visualization completed successfully');
    
    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        originalImage: `/uploads/${path.basename(imagePath)}`,
        processedImage: paintResult.url,
        plainImage: paintResult.plainUrl || paintResult.url, // Always include plain version
        patternImage: paintResult.patternUrl, // Include pattern version if exists
        selectedColor: selectedColor,
        recommendations: recommendations,
        maskingMethod: maskingMethod,
        pattern: pattern || 'plain',
        detectedWalls: detectionResults.predictions?.filter(p => p.class.toLowerCase() === 'wall').length || 0,
        detectedSurfaces: detectionResults.predictions?.length || 0,
        isManualMask: maskingMethod === 'manual',
        hasBothVersions: !!(paintResult.plainUrl && paintResult.patternUrl) // Boolean flag for frontend
      }
    });
    
  } catch (error) {
    console.error('Paint visualization error:', error);
    res.status(500).json({ 
      error: 'Paint visualization failed', 
      details: error.message 
    });
  }
});

// PROTECTED: Get user projects
router.get('/projects', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .populate('selectedColors')
      .sort({ createdAt: -1 });
    
    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// PROTECTED: Get single project
router.get('/projects/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('selectedColors');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUBLIC: Get available colors (for color selection)
router.get('/colors', async (req, res) => {
  try {
    const { brand, category, search, limit = 50 } = req.query;
    
    let query = {};
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    
    const colors = await Color.find(query)
      .limit(parseInt(limit))
      .sort({ popularity: -1 });
    
    res.json({ colors });
  } catch (error) {
    console.error('Get colors error:', error);
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

// PUBLIC: Get color brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Color.distinct('brand');
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

export default router;