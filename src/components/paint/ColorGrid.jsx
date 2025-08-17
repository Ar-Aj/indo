import { useState, useMemo } from 'react';
import { Search, Filter, Heart, Check } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Mock color data - in real app this would come from API
const generateMockColors = () => {
  const categories = ['Neutrals', 'Blues', 'Greens', 'Reds', 'Yellows', 'Purples', 'Browns', 'Grays'];
  const finishes = ['Matte', 'Satin', 'Semi-Gloss', 'Gloss'];
  const colors = [];

  const colorSets = {
    'Neutrals': ['#F8F8FF', '#F5F5DC', '#FAEBD7', '#FFFACD', '#FFF8DC', '#F0F8FF', '#F5FFFA', '#F0FFF0'],
    'Blues': ['#000080', '#0000CD', '#0000FF', '#1E90FF', '#00BFFF', '#87CEEB', '#87CEFA', '#4169E1'],
    'Greens': ['#006400', '#008000', '#228B22', '#32CD32', '#00FF00', '#7FFF00', '#9AFF9A', '#98FB98'],
    'Reds': ['#8B0000', '#DC143C', '#B22222', '#FF0000', '#FF6347', '#FF4500', '#FF1493', '#FF69B4'],
    'Yellows': ['#FFD700', '#FFFF00', '#FFFFE0', '#FFFACD', '#F0E68C', '#BDB76B', '#DAA520', '#B8860B'],
    'Purples': ['#4B0082', '#8B008B', '#9400D3', '#9932CC', '#BA55D3', '#DA70D6', '#EE82EE', '#DDA0DD'],
    'Browns': ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F'],
    'Grays': ['#2F4F4F', '#696969', '#708090', '#778899', '#B0C4DE', '#D3D3D3', '#DCDCDC', '#F5F5F5']
  };

  let id = 1;
  categories.forEach(category => {
    const baseColors = colorSets[category] || ['#CCCCCC'];
    
    baseColors.forEach((baseHex, index) => {
      finishes.forEach(finish => {
        colors.push({
          id: id++,
          name: `${category} ${finish} ${index + 1}`,
          hexCode: baseHex,
          category,
          family: category === 'Neutrals' || category === 'Grays' ? 'Neutral' : 'Color',
          finish,
          productCode: `PV-${id.toString().padStart(4, '0')}`,
          isPopular: Math.random() > 0.8
        });
      });
    });
  });

  return colors.slice(0, 2500); // Limit to 2500 colors
};

const ColorGrid = ({ selectedColors = [], onColorSelect, maxSelections = 5 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFinish, setSelectedFinish] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());

  const colors = useMemo(() => generateMockColors(), []);
  const categories = ['All', ...new Set(colors.map(c => c.category))];
  const finishes = ['All', ...new Set(colors.map(c => c.finish))];
  
  const colorsPerPage = 48;

  const filteredColors = useMemo(() => {
    return colors.filter(color => {
      const matchesSearch = color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           color.hexCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || color.category === selectedCategory;
      const matchesFinish = selectedFinish === 'All' || color.finish === selectedFinish;
      const matchesFavorites = !showFavorites || favorites.has(color.id);

      return matchesSearch && matchesCategory && matchesFinish && matchesFavorites;
    });
  }, [colors, searchTerm, selectedCategory, selectedFinish, showFavorites, favorites]);

  const totalPages = Math.ceil(filteredColors.length / colorsPerPage);
  const currentColors = filteredColors.slice(
    (currentPage - 1) * colorsPerPage,
    currentPage * colorsPerPage
  );

  const toggleFavorite = (colorId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(colorId)) {
      newFavorites.delete(colorId);
    } else {
      newFavorites.add(colorId);
    }
    setFavorites(newFavorites);
  };

  const isSelected = (color) => selectedColors.some(c => c.id === color.id);
  const canSelectMore = selectedColors.length < maxSelections;

  const handleColorClick = (color) => {
    if (isSelected(color)) {
      onColorSelect(selectedColors.filter(c => c.id !== color.id));
    } else if (canSelectMore) {
      onColorSelect([...selectedColors, color]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <input
              type="text"
              placeholder="Search colors by name or hex code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] text-primary-text bg-secondary-bg border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-colors duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-primary-text mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 min-h-[44px] text-primary-text bg-secondary-bg border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-primary-text mb-1">
                Finish
              </label>
              <select
                value={selectedFinish}
                onChange={(e) => {
                  setSelectedFinish(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 min-h-[44px] text-primary-text bg-secondary-bg border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-color"
              >
                {finishes.map(finish => (
                  <option key={finish} value={finish}>{finish}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant={showFavorites ? 'primary' : 'secondary'}
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setCurrentPage(1);
                }}
                className="min-h-[44px]"
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            </div>
          </div>

          {/* Results info */}
          <div className="flex justify-between items-center text-sm text-secondary-text">
            <span>
              Showing {currentColors.length} of {filteredColors.length} colors
            </span>
            {selectedColors.length > 0 && (
              <span className="text-accent-color">
                {selectedColors.length}/{maxSelections} colors selected
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Selected Colors */}
      {selectedColors.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Selected Colors ({selectedColors.length})</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {selectedColors.map((color) => (
                <div key={color.id} className="group relative">
                  <div
                    className="aspect-square rounded-lg border-2 border-accent-color cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: color.hexCode }}
                    onClick={() => handleColorClick(color)}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-accent-color rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium text-primary-text truncate">
                      {color.name}
                    </p>
                    <p className="text-xs text-secondary-text">{color.hexCode}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
        {currentColors.map((color) => {
          const selected = isSelected(color);
          const canSelect = canSelectMore || selected;
          
          return (
            <div key={color.id} className="group relative">
              <div
                className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
                  selected
                    ? 'border-accent-color shadow-lg scale-105'
                    : canSelect
                    ? 'border-transparent hover:border-accent-color/50 cursor-pointer hover:scale-105'
                    : 'border-transparent opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: color.hexCode }}
                onClick={() => canSelect && handleColorClick(color)}
              >
                {/* Favorite button */}
                <button
                  className="absolute top-1 right-1 p-1 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(color.id);
                  }}
                >
                  <Heart
                    className={`w-3 h-3 ${
                      favorites.has(color.id) ? 'text-red-500 fill-current' : 'text-white'
                    }`}
                  />
                </button>

                {/* Selected indicator */}
                {selected && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-accent-color rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Popular badge */}
                {color.isPopular && (
                  <div className="absolute top-1 left-1 px-1 py-0.5 bg-warning-color text-white text-xs rounded font-medium">
                    Popular
                  </div>
                )}
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-primary-text truncate" title={color.name}>
                  {color.name}
                </p>
                <p className="text-xs text-secondary-text">{color.hexCode}</p>
                <p className="text-xs text-secondary-text">{color.finish}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {filteredColors.length === 0 && (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-secondary-text mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                No colors found
              </h3>
              <p className="text-secondary-text">
                Try adjusting your search terms or filters
              </p>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default ColorGrid;