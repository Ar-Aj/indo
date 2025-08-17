import mongoose from 'mongoose';
import Color from '../models/color.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleColors = [
  // Sherwin-Williams
  { name: 'Agreeable Gray', hexCode: '#D4CFC0', brand: 'Sherwin-Williams', category: 'neutral', finish: 'eggshell', price: 65, popularity: 95 },
  { name: 'Naval', hexCode: '#1F2937', brand: 'Sherwin-Williams', category: 'cool', finish: 'satin', price: 65, popularity: 88 },
  { name: 'Accessible Beige', hexCode: '#E8E0D5', brand: 'Sherwin-Williams', category: 'warm', finish: 'flat', price: 65, popularity: 92 },
  { name: 'Tricorn Black', hexCode: '#000000', brand: 'Sherwin-Williams', category: 'bold', finish: 'semi-gloss', price: 65, popularity: 85 },
  { name: 'Pure White', hexCode: '#FFFFFF', brand: 'Sherwin-Williams', category: 'neutral', finish: 'satin', price: 65, popularity: 98 },
  
  // Benjamin Moore
  { name: 'Cloud White', hexCode: '#F7F4F2', brand: 'Benjamin Moore', category: 'neutral', finish: 'eggshell', price: 70, popularity: 96 },
  { name: 'Hale Navy', hexCode: '#1B2951', brand: 'Benjamin Moore', category: 'cool', finish: 'satin', price: 70, popularity: 90 },
  { name: 'Classic Gray', hexCode: '#B8B5A7', brand: 'Benjamin Moore', category: 'neutral', finish: 'flat', price: 70, popularity: 87 },
  { name: 'Simply White', hexCode: '#F9F9F6', brand: 'Benjamin Moore', category: 'neutral', finish: 'semi-gloss', price: 70, popularity: 94 },
  { name: 'Chantilly Lace', hexCode: '#FFFFFE', brand: 'Benjamin Moore', category: 'neutral', finish: 'satin', price: 70, popularity: 91 },
  
  // Behr
  { name: 'Swiss Coffee', hexCode: '#F7F3E9', brand: 'Behr', category: 'warm', finish: 'flat', price: 45, popularity: 89 },
  { name: 'Polar Bear', hexCode: '#F8F8FF', brand: 'Behr', category: 'cool', finish: 'eggshell', price: 45, popularity: 86 },
  { name: 'Elephant Skin', hexCode: '#B8A992', brand: 'Behr', category: 'neutral', finish: 'satin', price: 45, popularity: 82 },
  { name: 'Back to Black', hexCode: '#0F0F0F', brand: 'Behr', category: 'bold', finish: 'semi-gloss', price: 45, popularity: 78 },
  { name: 'Dynasty Celadon', hexCode: '#7FB069', brand: 'Behr', category: 'cool', finish: 'eggshell', price: 45, popularity: 75 },
  
  // Farrow & Ball
  { name: 'Elephant\'s Breath', hexCode: '#C7B299', brand: 'Farrow & Ball', category: 'neutral', finish: 'estate eggshell', price: 110, popularity: 93 },
  { name: 'Railings', hexCode: '#31363B', brand: 'Farrow & Ball', category: 'cool', finish: 'full gloss', price: 110, popularity: 88 },
  { name: 'Strong White', hexCode: '#F4F2E7', brand: 'Farrow & Ball', category: 'warm', finish: 'modern eggshell', price: 110, popularity: 90 },
  { name: 'Hague Blue', hexCode: '#1E3A5F', brand: 'Farrow & Ball', category: 'cool', finish: 'estate eggshell', price: 110, popularity: 85 },
  { name: 'Cornforth White', hexCode: '#E8E6D9', brand: 'Farrow & Ball', category: 'neutral', finish: 'modern eggshell', price: 110, popularity: 91 },
  
  // Additional Popular Colors
  { name: 'Alabaster', hexCode: '#F2F0E8', brand: 'Sherwin-Williams', category: 'warm', finish: 'satin', price: 65, popularity: 97 },
  { name: 'Revere Pewter', hexCode: '#A6998C', brand: 'Benjamin Moore', category: 'neutral', finish: 'eggshell', price: 70, popularity: 95 },
  { name: 'Sea Salt', hexCode: '#E8F1F0', brand: 'Sherwin-Williams', category: 'cool', finish: 'flat', price: 65, popularity: 89 },
  { name: 'Balanced Beige', hexCode: '#D5C7B8', brand: 'Sherwin-Williams', category: 'warm', finish: 'eggshell', price: 65, popularity: 86 },
  { name: 'Chelsea Gray', hexCode: '#8B8680', brand: 'Benjamin Moore', category: 'neutral', finish: 'satin', price: 70, popularity: 84 },
  
  // Bold & Trendy Colors
  { name: 'Sage Green', hexCode: '#9CAF88', brand: 'Behr', category: 'cool', finish: 'eggshell', price: 45, popularity: 81 },
  { name: 'Terracotta', hexCode: '#C65D07', brand: 'Sherwin-Williams', category: 'warm', finish: 'satin', price: 65, popularity: 76 },
  { name: 'Dusty Rose', hexCode: '#D4A5A5', brand: 'Benjamin Moore', category: 'warm', finish: 'flat', price: 70, popularity: 73 },
  { name: 'Forest Green', hexCode: '#355E3B', brand: 'Behr', category: 'cool', finish: 'semi-gloss', price: 45, popularity: 70 },
  { name: 'Mustard Yellow', hexCode: '#FFDB58', brand: 'Sherwin-Williams', category: 'bold', finish: 'satin', price: 65, popularity: 68 },
  
  // Modern Neutrals
  { name: 'Greige', hexCode: '#C7B299', brand: 'Behr', category: 'neutral', finish: 'eggshell', price: 45, popularity: 88 },
  { name: 'Mushroom', hexCode: '#A0927D', brand: 'Benjamin Moore', category: 'neutral', finish: 'flat', price: 70, popularity: 79 },
  { name: 'Linen White', hexCode: '#FAF0E6', brand: 'Sherwin-Williams', category: 'warm', finish: 'satin', price: 65, popularity: 83 },
  { name: 'Dove Gray', hexCode: '#6D6875', brand: 'Farrow & Ball', category: 'cool', finish: 'estate eggshell', price: 110, popularity: 77 },
  { name: 'Cream', hexCode: '#FFFDD0', brand: 'Behr', category: 'warm', finish: 'flat', price: 45, popularity: 85 }
];

const seedColors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Clear existing colors
    await Color.deleteMany({});
    console.log('Cleared existing colors');
    
    // Insert sample colors
    const insertedColors = await Color.insertMany(sampleColors);
    console.log(`Inserted ${insertedColors.length} colors`);
    
    // Display some stats
    const brands = await Color.distinct('brand');
    const categories = await Color.distinct('category');
    
    console.log('\nSeeding completed successfully!');
    console.log(`Brands: ${brands.join(', ')}`);
    console.log(`Categories: ${categories.join(', ')}`);
    console.log(`Total colors: ${insertedColors.length}`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedColors();
}

export { seedColors, sampleColors };