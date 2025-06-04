import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Trash, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Music, 
  Save, 
  X,
  Plus,
  UserPlus
} from 'lucide-react';
import { useArtist, useArtists } from '../hooks/useArtists';
import type { Artist } from '../hooks/useArtists';
import { toast } from 'react-hot-toast';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';

const ArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { artist: artistData, isLoading, isError } = useArtist(id || '');
  const { updateArtist, deleteArtist } = useArtists();
  const breadcrumbs = useBreadcrumbs();
  
  // Cast the artist data to the proper type
  const artist = artistData as Artist;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'managers' | 'performances'>('details');

  // Initialize form data when artist data is loaded
  React.useEffect(() => {
    if (artist && !formData) {
      setFormData({
        name: artist.name,
        genre: artist.genre || '',
        location: artist.location || '',
        email: artist.email || '',
        phone: artist.phone || '',
        image: artist.image || '',
        bio: artist.bio || '',
        status: artist.status || 'Inquiry',
        lastPerformance: artist.lastPerformance || '',
        nextPerformance: artist.nextPerformance || '',
        socialMedia: artist.socialMedia || {},
        managers: artist.managers || []
      });
    }
  }, [artist, formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };
  
  // Handle adding a new manager
  const handleAddManager = () => {
    setFormData((prev: any) => ({
      ...prev,
      managers: [
        ...prev.managers || [],
        {
          id: Date.now().toString(),
          name: '',
          title: 'Manager',
          email: '',
          phone: ''
        }
      ]
    }));
  };
  
  // Handle removing a manager
  const handleRemoveManager = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      managers: prev.managers?.filter((manager: any) => manager.id !== id) || []
    }));
  };
  
  // Handle manager field changes
  const handleManagerChange = (id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      managers: prev.managers?.map((manager: any) => 
        manager.id === id ? { ...manager, [field]: value } : manager
      ) || []
    }));
  };

  const handleSave = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateArtist(id, formData);
      setIsEditing(false);
      toast.success('Artist updated successfully');
    } catch (error: any) {
      toast.error(`Error updating artist: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await deleteArtist(id);
      toast.success('Artist deleted successfully');
      navigate('/artists');
    } catch (error: any) {
      toast.error(`Error deleting artist: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <p className="text-lg text-white">Loading artist details...</p>
      </div>
    );
  }

  if (isError || !artist) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">Artist not found</h2>
        <p className="mt-2 text-gray-400">The artist you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate('/artists')}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to Artists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/artists')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Artists
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
            {isEditing ? formData?.name : artist.name}
          </h1>
        </div>
        
        {!isEditing ? (
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
            >
              <Trash size={16} className="mr-2" />
              Delete
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      
      {/* Artist Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Artist Details Card */}
          <div className="rounded-xl bg-zinc-900 overflow-hidden shadow-lg">
            {/* Artist Banner/Image */}
            <div className="relative h-56 w-full">
              {isEditing ? (
                <div className="absolute inset-0 bg-zinc-800 p-4">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                    Artist Image URL
                  </label>
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData?.image || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <>
                  <img 
                    src={artist.image || "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"} 
                    alt={artist.name} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-700">
              <div className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
                    activeTab === 'details' 
                      ? 'border-amber-500 text-amber-500' 
                      : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('managers')}
                  className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
                    activeTab === 'managers' 
                      ? 'border-amber-500 text-amber-500' 
                      : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  Managers
                </button>
                <button
                  onClick={() => setActiveTab('performances')}
                  className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
                    activeTab === 'performances' 
                      ? 'border-amber-500 text-amber-500' 
                      : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  Performance History
                </button>
              </div>
            </div>

            {/* Artist Details Tab */}
            {activeTab === 'details' && (
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData?.bio || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                          Genre
                        </label>
                        <select
                          id="genre"
                          name="genre"
                          value={formData?.genre || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        >
                          <option value="">Select Genre</option>
                          <option value="Blues">Blues</option>
                          <option value="Bluegrass">Bluegrass</option>
                          <option value="Country">Country</option>
                          <option value="Folk">Folk</option>
                          <option value="Jazz">Jazz</option>
                          <option value="Rock">Rock</option>
                          <option value="Americana">Americana</option>
                          <option value="Pop">Pop</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData?.email || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                          Phone
                        </label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData?.phone || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData?.location || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={formData?.status || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        >
                          <option value="Inquiry">Inquiry</option>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center">
                        <Music size={20} className="mr-2 text-amber-500" />
                        <span className="text-lg font-medium text-white">{artist.genre || "No genre specified"}</span>
                      </div>
                    </div>
                  
                    <div className="mb-6">
                      <h3 className="mb-2 text-sm font-medium text-gray-400">Bio</h3>
                      <p className="text-gray-300">{artist.bio || "No bio provided for this artist."}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                      {artist.email && (
                        <div className="flex items-start">
                          <Mail size={16} className="mr-2 mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="text-sm text-white">{artist.email}</p>
                          </div>
                        </div>
                      )}
                      {artist.phone && (
                        <div className="flex items-start">
                          <Phone size={16} className="mr-2 mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="text-sm text-white">{artist.phone}</p>
                          </div>
                        </div>
                      )}
                      {artist.location && (
                        <div className="flex items-start">
                          <MapPin size={16} className="mr-2 mt-0.5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Location</p>
                            <p className="text-sm text-white">{artist.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <Calendar size={16} className="mr-2 mt-0.5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-400">Status</p>
                          <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            artist.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            artist.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            artist.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {artist.status || 'Inquiry'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Managers Tab */}
            {activeTab === 'managers' && (
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-white">Artist Managers</h3>
                      <button 
                        type="button" 
                        onClick={handleAddManager}
                        className="inline-flex items-center rounded-lg bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-700"
                      >
                        <Plus size={12} className="mr-1" />
                        Add Manager
                      </button>
                    </div>
                    
                    {formData.managers && formData.managers.length > 0 ? (
                      <div className="space-y-4">
                        {formData.managers.map((manager: any) => (
                          <div key={manager.id} className="rounded-lg border border-zinc-700 p-4 relative">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveManager(manager.id)}
                              className="absolute top-2 right-2 rounded-full p-1 text-gray-400 hover:bg-zinc-700 hover:text-white"
                            >
                              <Trash size={12} />
                            </button>
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-300">
                                  Manager Name
                                </label>
                                <input
                                  type="text"
                                  value={manager.name}
                                  onChange={(e) => handleManagerChange(manager.id, 'name', e.target.value)}
                                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                                  placeholder="e.g. John Smith"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-300">
                                  Title
                                </label>
                                <select
                                  value={manager.title}
                                  onChange={(e) => handleManagerChange(manager.id, 'title', e.target.value)}
                                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                                >
                                  <option value="Manager">General Manager</option>
                                  <option value="Road Manager">Road Manager</option>
                                  <option value="Tour Manager">Tour Manager</option>
                                  <option value="Booking Agent">Booking Agent</option>
                                  <option value="Financial Manager">Financial Manager</option>
                                  <option value="PR Manager">PR Manager</option>
                                  <option value="Agent">Agent</option>
                                  <option value="Assistant">Assistant</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300">
                                  Manager Email
                                </label>
                                <input
                                  type="email"
                                  value={manager.email}
                                  onChange={(e) => handleManagerChange(manager.id, 'email', e.target.value)}
                                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                                  placeholder="manager@example.com"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-300">
                                  Manager Phone
                                </label>
                                <input
                                  type="text"
                                  value={manager.phone}
                                  onChange={(e) => handleManagerChange(manager.id, 'phone', e.target.value)}
                                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                                  placeholder="(555) 123-4567"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-zinc-800 p-4 text-center text-gray-400">
                        No managers added yet. Click "Add Manager" to add one.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium text-white">Management Team</h3>
                    </div>
                    
                    {formData?.managers && formData.managers.length > 0 ? (
                      <div className="space-y-4">
                        {formData.managers.map((manager: any) => (
                          <div key={manager.id} className="rounded-lg bg-zinc-800 p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-white">{manager.name}</h4>
                              <span className="bg-zinc-700 px-2 py-0.5 rounded-full text-xs text-gray-300">{manager.title}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {manager.email && (
                                <div className="flex items-center">
                                  <Mail size={14} className="mr-1 text-gray-400" />
                                  <span className="text-gray-300">{manager.email}</span>
                                </div>
                              )}
                              {manager.phone && (
                                <div className="flex items-center">
                                  <Phone size={14} className="mr-1 text-gray-400" />
                                  <span className="text-gray-300">{manager.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-zinc-800 p-6 text-center">
                        <UserPlus size={24} className="mx-auto text-gray-500 mb-2" />
                        <p className="text-gray-400">No managers assigned to this artist.</p>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="mt-3 text-xs font-medium text-amber-500 hover:text-amber-400"
                        >
                          Add managers
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Performance History Tab */}
            {activeTab === 'performances' && (
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Performance History</h2>
                
                {artist.performanceHistory && artist.performanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {artist.performanceHistory.map((performance: any, index: number) => (
                      <div key={index} className="rounded-lg bg-zinc-800 p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-white">{new Date(performance.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-400">The Train Station</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">${performance.revenue}</p>
                            <p className="text-xs text-gray-400">{performance.attendance} attendees</p>
                          </div>
                        </div>
                        {performance.notes && (
                          <p className="mt-2 text-sm text-gray-300">{performance.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-800 p-4 text-center">
                    <p className="text-gray-400">No performance history available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Social Media Links */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Social Media</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300">
                    Website
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData?.socialMedia?.website || ''}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-300">
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData?.socialMedia?.instagram || ''}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-300">
                    Facebook
                  </label>
                  <input
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={formData?.socialMedia?.facebook || ''}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-300">
                    Twitter
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData?.socialMedia?.twitter || ''}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="spotify" className="block text-sm font-medium text-gray-300">
                    Spotify
                  </label>
                  <input
                    type="text"
                    id="spotify"
                    name="spotify"
                    value={formData?.socialMedia?.spotify || ''}
                    onChange={handleSocialMediaChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <>
                {artist.socialMedia && Object.keys(artist.socialMedia).some(key => artist.socialMedia?.[key]) ? (
                  <div className="space-y-3">
                    {artist.socialMedia?.website && (
                      <a 
                        href={artist.socialMedia.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-zinc-800 p-3 text-white hover:bg-zinc-700"
                      >
                        <Globe size={18} className="mr-3 text-gray-400" />
                        <span>Website</span>
                      </a>
                    )}
                    {artist.socialMedia?.instagram && (
                      <a 
                        href={artist.socialMedia.instagram.startsWith('http') ? artist.socialMedia.instagram : `https://instagram.com/${artist.socialMedia.instagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-zinc-800 p-3 text-white hover:bg-zinc-700"
                      >
                        <Instagram size={18} className="mr-3 text-gray-400" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {artist.socialMedia?.facebook && (
                      <a 
                        href={artist.socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-zinc-800 p-3 text-white hover:bg-zinc-700"
                      >
                        <Facebook size={18} className="mr-3 text-gray-400" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {artist.socialMedia?.twitter && (
                      <a 
                        href={artist.socialMedia.twitter.startsWith('http') ? artist.socialMedia.twitter : `https://twitter.com/${artist.socialMedia.twitter.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-zinc-800 p-3 text-white hover:bg-zinc-700"
                      >
                        <Twitter size={18} className="mr-3 text-gray-400" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {artist.socialMedia?.spotify && (
                      <a 
                        href={artist.socialMedia.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center rounded-lg bg-zinc-800 p-3 text-white hover:bg-zinc-700"
                      >
                        <Music size={18} className="mr-3 text-gray-400" />
                        <span>Spotify</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-800 p-4 text-center">
                    <p className="text-gray-400">No social media links available.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upcoming Performances */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Upcoming Performances</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="nextPerformance" className="block text-sm font-medium text-gray-300">
                    Next Performance Date
                  </label>
                  <input
                    type="date"
                    id="nextPerformance"
                    name="nextPerformance"
                    value={formData?.nextPerformance || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastPerformance" className="block text-sm font-medium text-gray-300">
                    Last Performance Date
                  </label>
                  <input
                    type="date"
                    id="lastPerformance"
                    name="lastPerformance"
                    value={formData?.lastPerformance || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <>
                {artist.nextPerformance ? (
                  <div className="rounded-lg bg-zinc-800 p-4">
                    <p className="text-sm text-gray-400">Next Performance</p>
                    <p className="text-lg font-medium text-white">
                      {new Date(artist.nextPerformance).toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <button className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-400">
                      View Event Details
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-800 p-4 text-center">
                    <p className="text-gray-400">No upcoming performances scheduled.</p>
                    <button className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-400">
                      Schedule Performance
                    </button>
                  </div>
                )}
                
                {artist.lastPerformance && (
                  <div className="mt-4 rounded-lg bg-zinc-800 p-4">
                    <p className="text-sm text-gray-400">Last Performance</p>
                    <p className="text-base text-white">
                      {new Date(artist.lastPerformance).toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
            <div className="space-y-2">
              <button className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700">
                <span>Schedule Performance</span>
                <Calendar size={16} className="text-gray-400" />
              </button>
              <button className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700">
                <span>Contact Artist</span>
                <Mail size={16} className="text-gray-400" />
              </button>
              <button className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700">
                <span>Add to Event</span>
                <Music size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Confirm Deletion</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-medium text-white">{artist.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-70"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Artist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetail;