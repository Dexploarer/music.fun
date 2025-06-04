import React, { useState, useEffect } from 'react';
import { X, Image, Save, PlusCircle, Trash, Plus } from 'lucide-react';
import { Artist } from '../../types';

interface ArtistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artist: Omit<Artist, 'id'>) => void;
  isSubmitting: boolean;
}

const ArtistFormModal: React.FC<ArtistFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Artist, 'id'>>({
    name: '',
    genre: '',
    location: '',
    email: '',
    phone: '',
    image: '',
    bio: '',
    status: 'Inquiry',
    socialMedia: {
      website: '',
      facebook: '',
      instagram: '',
      twitter: '',
      spotify: '',
      youtube: ''
    }
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'manager' | 'socials'>('basic');
  const [isMobile, setIsMobile] = useState(false);
  const [genreTags, setGenreTags] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [managers, setManagers] = useState<Array<{
    id: string;
    title: string;
    name: string;
    email: string;
    phone: string;
  }>>([{ id: '1', title: 'Manager', name: '', email: '', phone: '' }]);
  
  // Predefined genre options
  const genreOptions = [
    "Blues", "Bluegrass", "Country", "Folk", "Jazz", "Rock", "Americana", 
    "Pop", "Hip Hop", "R&B", "Soul", "Electronic", "Classical", "Indie",
    "Alternative", "Metal", "Punk", "Reggae", "World"
  ];

  // Predefined manager title options
  const managerTitleOptions = [
    "Manager", "Booking Agent", "Road Manager", "Tour Manager", 
    "Finance Manager", "Publicist", "Label Representative"
  ];

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile(); // Initial check
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleManagerChange = (index: number, field: string, value: string) => {
    const updatedManagers = [...managers];
    updatedManagers[index] = {
      ...updatedManagers[index],
      [field]: value
    };
    setManagers(updatedManagers);
    
    // Update formData with the managers array
    setFormData(prev => ({
      ...prev,
      managers: updatedManagers
    }));
  };
  
  const handleAddManager = () => {
    setManagers([
      ...managers, 
      { 
        id: `manager-${Date.now()}`, 
        title: 'Manager', 
        name: '', 
        email: '', 
        phone: '' 
      }
    ]);
  };
  
  const handleRemoveManager = (index: number) => {
    if (managers.length > 1) {
      const updatedManagers = [...managers];
      updatedManagers.splice(index, 1);
      setManagers(updatedManagers);
      
      // Update formData with the managers array
      setFormData(prev => ({
        ...prev,
        managers: updatedManagers
      }));
    }
  };
  
  const handleAddGenreTag = (genre: string) => {
    if (genre && !genreTags.includes(genre)) {
      const updatedTags = [...genreTags, genre];
      setGenreTags(updatedTags);
      
      // Update formData genre field with comma-separated genres
      setFormData(prev => ({
        ...prev,
        genre: updatedTags.join(', ')
      }));
    }
  };
  
  const handleRemoveGenreTag = (tag: string) => {
    const updatedTags = genreTags.filter(t => t !== tag);
    setGenreTags(updatedTags);
    
    // Update formData genre field with comma-separated genres
    setFormData(prev => ({
      ...prev,
      genre: updatedTags.join(', ')
    }));
  };
  
  const handleCustomGenreAdd = () => {
    if (customGenre.trim() && !genreTags.includes(customGenre.trim())) {
      handleAddGenreTag(customGenre.trim());
      setCustomGenre('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 sm:px-6 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">Add New Artist</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Tabs */}
          <div className="mb-6 flex border-b border-zinc-700 overflow-x-auto">
            <button
              type="button"
              className={`border-b-2 whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium ${
                activeTab === 'basic'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Information
            </button>
            <button
              type="button"
              className={`border-b-2 whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium ${
                activeTab === 'manager'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('manager')}
            >
              Manager Info
            </button>
            <button
              type="button"
              className={`border-b-2 whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium ${
                activeTab === 'socials'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('socials')}
            >
              Social Media
            </button>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Artist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="e.g. River Junction"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Music Genres <span className="text-red-500">*</span>
                </label>
                {genreTags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {genreTags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs font-medium text-white">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveGenreTag(tag)}
                          className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-zinc-600 hover:text-white focus:bg-zinc-600 focus:text-white focus:outline-none"
                        >
                          <span className="sr-only">Remove {tag}</span>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="Add custom genre..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomGenreAdd();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCustomGenreAdd}
                    className="rounded-md bg-zinc-700 p-2 text-white hover:bg-zinc-600"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {genreOptions.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleAddGenreTag(genre)}
                      disabled={genreTags.includes(genre)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium 
                        ${genreTags.includes(genre) 
                          ? 'bg-amber-600 text-white cursor-default' 
                          : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Tell us about the artist..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="artist@example.com"
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
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. Nashville, TN"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                  Artist Image URL
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2">
                    <Image size={18} className="text-gray-400" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || ''}
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
          )}

          {/* Manager Info Tab */}
          {activeTab === 'manager' && (
            <div className="space-y-4">
              {managers.map((manager, index) => (
                <div key={manager.id} className="rounded-lg border border-zinc-700 p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-white">
                      Manager #{index + 1}
                    </h3>
                    {managers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Title
                      </label>
                      <select
                        value={manager.title}
                        onChange={(e) => handleManagerChange(index, 'title', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      >
                        {managerTitleOptions.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Name
                      </label>
                      <input
                        type="text"
                        value={manager.name}
                        onChange={(e) => handleManagerChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={manager.email}
                        onChange={(e) => handleManagerChange(index, 'email', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="manager@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={manager.phone}
                        onChange={(e) => handleManagerChange(index, 'phone', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddManager}
                className="flex items-center text-amber-500 hover:text-amber-400"
              >
                <PlusCircle size={16} className="mr-1" />
                Add Another Manager
              </button>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'socials' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-300">
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.socialMedia?.website || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="https://example.com"
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
                  value={formData.socialMedia?.instagram || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="@username"
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
                  value={formData.socialMedia?.facebook || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="https://facebook.com/pagename"
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
                  value={formData.socialMedia?.twitter || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="@username"
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
                  value={formData.socialMedia?.spotify || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div>
                <label htmlFor="youtube" className="block text-sm font-medium text-gray-300">
                  YouTube
                </label>
                <input
                  type="text"
                  id="youtube"
                  name="youtube"
                  value={formData.socialMedia?.youtube || ''}
                  onChange={handleSocialMediaChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="https://youtube.com/channel/..."
                />
              </div>
            </div>
          )}

          {/* Mobile tab navigation buttons */}
          {isMobile && (
            <div className="mt-4 flex justify-between border-t border-zinc-700 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'basic' ? 'basic' : activeTab === 'manager' ? 'basic' : 'manager')}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                disabled={activeTab === 'basic'}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'basic' ? 'manager' : activeTab === 'manager' ? 'socials' : 'socials')}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                disabled={activeTab === 'socials'}
              >
                Next
              </button>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || genreTags.length === 0}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-1 sm:mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Artist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistFormModal;