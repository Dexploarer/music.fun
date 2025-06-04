import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, Clock, User, Plus, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { format } from 'date-fns';
import { useEvents } from '../../hooks/useEvents';
import { useArtists } from '../../hooks/useArtists';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task; // For editing existing tasks
  initialStatus?: string; // For setting status when creating from a column
  isSubmitting: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  initialStatus = 'todo',
  isSubmitting
}) => {
  const { events } = useEvents();
  const { artists } = useArtists();
  const [tag, setTag] = useState('');
  
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    status: initialStatus as 'todo' | 'in-progress' | 'review' | 'done',
    priority: 'medium',
    dueDate: null,
    assignedTo: null,
    tags: [],
    relatedEntityId: null,
    relatedEntityType: null,
    position: 0
  });

  // Initialize form with existing task data when editing
  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description,
        status: initialTask.status,
        priority: initialTask.priority,
        dueDate: initialTask.dueDate,
        assignedTo: initialTask.assignedTo,
        tags: initialTask.tags,
        relatedEntityId: initialTask.relatedEntityId,
        relatedEntityType: initialTask.relatedEntityType,
        position: initialTask.position
      });
    } else if (initialStatus) {
      // Reset form but keep provided initial status
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        status: initialStatus as 'todo' | 'in-progress' | 'review' | 'done',
        priority: 'medium',
        dueDate: null,
        assignedTo: null,
        tags: [],
        relatedEntityId: null,
        relatedEntityType: null,
        position: 0
      }));
    }
  }, [initialTask, initialStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRelatedEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      relatedEntityType: value || null,
      relatedEntityId: null // Reset the ID when type changes
    }));
  };

  const handleAddTag = () => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 sm:px-6 py-4">
          <h2 className="font-playfair text-lg sm:text-xl font-semibold text-white">
            {initialTask ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Finalize artist lineup for Summer Jam"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Add details about this task..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">
                Due Date
              </label>
              <div className="mt-1 flex items-center">
                <Calendar size={12} className="mr-2 text-gray-400" />
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300">
                Assigned To
              </label>
              <div className="mt-1 flex items-center">
                <User size={12} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Tags</label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add a tag and press +"
                  className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 font-medium text-white hover:bg-zinc-600"
                >
                  <Plus size={12} />
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-300"
                  >
                    <Tag size={8} className="mr-1 text-amber-500" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-zinc-700 hover:text-white"
                    >
                      <X size={8} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Related To</label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <select
                    value={formData.relatedEntityType || ''}
                    onChange={handleRelatedEntityTypeChange}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">Not related</option>
                    <option value="event">Event</option>
                    <option value="artist">Artist</option>
                  </select>
                </div>
                
                <div>
                  {formData.relatedEntityType === 'event' ? (
                    <select
                      value={formData.relatedEntityId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, relatedEntityId: e.target.value || null }))}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="">Select Event</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  ) : formData.relatedEntityType === 'artist' ? (
                    <select
                      value={formData.relatedEntityId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, relatedEntityId: e.target.value || null }))}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="">Select Artist</option>
                      {artists.map(artist => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-gray-500 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option>Select type first</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={12} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;