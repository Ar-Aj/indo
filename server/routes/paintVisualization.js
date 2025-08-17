import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import paintService from '../services/paintVisualization.js';
import Project from '../models/Project.js';
import Color from '../models/Color.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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
    const { colorId, projectName } = req.body;
    const imagePath = req.file.path;
    
    console.log('Starting paint visualization process...');
    
    // Validate inputs
    if (!colorId) {
      return res.status(400).json({ error: 'Color selection is required' });
    }
    
    // Get selected color from database
    const selectedColor = await Color.findById(colorId);
    if (!selectedColor) {
      return res.status(400).json({ error: 'Invalid color selected' });
    }

    console.log('Selected color:', selectedColor.name);

    // Step 1: Detect surfaces using Roboflow
    console.log('Detecting furniture and surfaces...');
    const detectionResults = await paintService.detectFurnitureSurfaces(imagePath);
    
    // Step 2: Create mask from detection results
    console.log('Creating mask from detection results...');
    const maskPath = await paintService.createMaskFromDetection(imagePath, detectionResults);
    
    // Step 3: Apply paint color using getimg.ai
    console.log('Applying paint color...');
    const paintResult = await paintService.applyPaintColor(
      imagePath, 
      maskPath, 
      selectedColor.hexCode, 
      selectedColor.name
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
      originalImageUrl: imagePath,
      processedImageUrl: paintResult.url || paintResult.image,
      selectedColors: [colorId],
      detectionResults: detectionResults
    });
    
    await project.save();
    
    console.log('Paint visualization completed successfully');
    
    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        originalImage: `/uploads/${path.basename(imagePath)}`,
        processedImage: paintResult.url || paintResult.image,
        selectedColor: selectedColor,
        recommendations: recommendations,
        detectedSurfaces: detectionResults.predictions?.length || 0
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