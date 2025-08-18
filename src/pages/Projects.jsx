import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paintAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
  Clock,
  ArrowLeft,
  Star,
  Filter,
  SortAsc,
  Share2,
  Heart,
  MoreVertical,
  Edit3,
  Copy
} from 'lucide-react';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await paintAPI.getProjects();
      setProjects(response.projects || []);
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
          color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          color.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return `${Math.floor(diffInHours / 168)} weeks ago`;
  };

  const ProjectCard = ({ project }) => (
    <div className="card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="aspect-video relative group">
        <img 
          src={project.processedImage || project.originalImage} 
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setSelectedProject(project);
                  setShowProjectModal(true);
                }}
                className="btn-primary text-sm px-3 py-2 bg-white text-gray-900 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <a
                href={project.processedImage || project.originalImage}
                download={`${project.name}.jpg`}
                className="btn-secondary text-sm px-3 py-2 bg-white text-gray-900 hover:bg-gray-100"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </a>
              <button className="btn-secondary text-sm px-3 py-2 bg-white text-gray-900 hover:bg-gray-100">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Time badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {getTimeAgo(project.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
            {project.name}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(project.createdAt)}
          </div>
        </div>

        {project.selectedColors && project.selectedColors.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Colors Used:</p>
            <div className="flex flex-wrap gap-2">
              {project.selectedColors.map((color, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border">
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{color.name}</p>
                    <p className="text-xs text-gray-500">{color.brand}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {project.detectedSurfaces && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-blue-600">{project.detectedSurfaces}</span> surfaces detected
            </span>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-gray-600">AI Processed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ProjectListItem = ({ project }) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-6">
        <div className="flex-shrink-0 relative group">
          <img 
            src={project.processedImage || project.originalImage} 
            alt={project.name}
            className="w-32 h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <button 
              onClick={() => {
                setSelectedProject(project);
                setShowProjectModal(true);
              }}
              className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 p-2 rounded-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">
                {project.name}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(project.createdAt)}
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4 mr-1" />
                {getTimeAgo(project.createdAt)}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setSelectedProject(project);
                  setShowProjectModal(true);
                }}
                className="btn-primary text-sm px-4 py-2 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <a
                href={project.processedImage || project.originalImage}
                download={`${project.name}.jpg`}
                className="btn-secondary text-sm px-4 py-2 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          </div>

          {project.selectedColors && project.selectedColors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Colors Used:</p>
              <div className="flex flex-wrap gap-2">
                {project.selectedColors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{color.name}</p>
                      <p className="text-xs text-gray-500">{color.brand} • {color.hexCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            {project.detectedSurfaces && (
              <span>
                <span className="font-semibold text-blue-600">{project.detectedSurfaces}</span> surfaces detected by AI
              </span>
            )}
            <div className="flex items-center space-x-4">
              <button className="hover:text-blue-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="hover:text-red-600 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Paint Projects
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your paint visualization projects
              </p>
            </div>
            
            <div className="text-right">
              <Link
                to="/paint-your-wall"
                className="btn-primary text-lg px-6 py-3 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Link>
              {user && (
                <p className="text-sm text-gray-600 mt-2">
                  {projects.length} total projects
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects by name or color..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12 py-3"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <SortAsc className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field py-3"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Clear Search */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary px-4 py-3 flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredAndSortedProjects().length} of {projects.length} projects
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            
            {projects.length > 0 && (
              <span>
                Last updated: {getTimeAgo(projects[0]?.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card p-12 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchProjects();
              }}
              className="btn-primary px-6 py-3"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading your projects...
            </h3>
            <p className="text-gray-600">Please wait while we fetch your paint visualizations</p>
          </div>
        )}

        {/* Projects Display */}
        {!loading && !error && (
          <>
            {filteredAndSortedProjects().length > 0 ? (
              <>
                {/* Projects Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProjects().map((project) => (
                      <ProjectCard key={project._id || project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAndSortedProjects().map((project) => (
                      <ProjectListItem key={project._id || project.id} project={project} />
                    ))}
                  </div>
                )}

                {/* Load More / Pagination could go here */}
                {filteredAndSortedProjects().length >= 12 && (
                  <div className="text-center mt-12">
                    <button className="btn-secondary px-8 py-3">
                      Load More Projects
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                {searchTerm ? (
                  <>
                    <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      No projects found
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      No projects match your search "{searchTerm}". Try adjusting your search terms.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setSearchTerm('')}
                        className="btn-secondary px-6 py-3"
                      >
                        Clear Search
                      </button>
                      <Link to="/paint-your-wall" className="btn-primary px-6 py-3 flex items-center justify-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Project
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FolderOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      No projects yet
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                      Start by creating your first paint visualization project. Upload a room photo and see the magic happen!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to="/paint-your-wall" 
                        className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
                      >
                        <Camera className="w-6 h-6 mr-3" />
                        Create Your First Project
                      </Link>
                      <Link 
                        to="/colors" 
                        className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
                      >
                        <Palette className="w-5 h-5 mr-2" />
                        Browse Colors First
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Quick Actions */}
        {!loading && projects.length > 0 && (
          <div className="mt-12 text-center">
            <div className="card p-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Ready for Your Next Project?
              </h3>
              <p className="text-gray-600 mb-6">
                Create another stunning paint visualization with our AI technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/paint-your-wall"
                  className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start New Project
                </Link>
                <Link
                  to="/colors"
                  className="btn-secondary text-lg px-8 py-3 flex items-center justify-center"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Explore Colors
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;