import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paintAPI } from '../services/api';
import { 
  FolderOpen, 
  Camera, 
  Calendar, 
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Grid,
  List,
  Clock
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await paintAPI.getProjects();
      setProjects(response.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProjects = () => {
    let filtered = projects;
    
    // Filter by search term
    if (searchTerm) {
      filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.selectedColors?.some(color => 
          color.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort projects
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ProjectCard = ({ project }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-video mb-4 relative group">
        <img 
          src={project.processedImage || project.originalImage} 
          alt={project.name}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 flex space-x-2 transition-all duration-200">
            <button className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <a
              href={project.processedImage || project.originalImage}
              download={`${project.name}.jpg`}
              className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {project.name}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(project.createdAt)}
        </div>

        {project.selectedColors && project.selectedColors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Colors Used:</p>
            <div className="flex flex-wrap gap-2">
              {project.selectedColors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.detectedSurfaces && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{project.detectedSurfaces}</span> surfaces detected
          </div>
        )}
      </div>
    </div>
  );

  const ProjectListItem = ({ project }) => (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0">
          <img 
            src={project.processedImage || project.originalImage} 
            alt={project.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {project.name}
              </h3>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(project.createdAt)}
              </div>

              {project.selectedColors && project.selectedColors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.selectedColors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {color.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {color.brand}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {project.detectedSurfaces && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{project.detectedSurfaces}</span> surfaces detected
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button className="btn-secondary flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              <a
                href={project.processedImage || project.originalImage}
                download={`${project.name}.jpg`}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My Projects
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your paint visualization projects
          </p>
        </div>
        
        <Link
          to="/paint-your-wall"
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Filters and Controls */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchProjects();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      )}

      {/* Projects Display */}
      {!loading && !error && (
        <>
          {filteredAndSortedProjects().length > 0 ? (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {filteredAndSortedProjects().length} of {projects.length} projects
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>

              {/* Projects Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedProjects().map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAndSortedProjects().map((project) => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No projects match your search "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn-secondary"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first paint visualization project
                  </p>
                  <Link to="/paint-your-wall" className="btn-primary flex items-center justify-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Projects;