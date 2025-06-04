import React, { useRef } from 'react';
import { MoreVertical, Calendar, Tag, AlertCircle, Clock, User, Pencil } from 'lucide-react';
import { Task } from '../../types';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  dragRef?: React.RefObject<HTMLDivElement>;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, dragRef, isDragging }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks for the dropdown menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format due date and check if overdue
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), 'MMM d, yyyy')
    : null;
    
  const isOverdue = task.dueDate 
    ? isPast(new Date(task.dueDate)) && task.status !== 'done'
    : false;
    
  // Get priority style
  const getPriorityStyle = () => {
    switch (task.priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle edit task
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(task);
  };
  
  // Handle delete task
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className={`bg-zinc-800 rounded-lg shadow mb-2 select-none ${isDragging ? 'opacity-50' : ''}`}
      ref={dragRef}
    >
      <div className="p-3">
        {/* Header with title and menu */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm text-white">{task.title}</h3>
          <div className="relative" ref={menuRef}>
            <button 
              className="text-gray-400 hover:text-white p-1 rounded-full"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Task options"
            >
              <MoreVertical size={10} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-zinc-900 rounded-lg shadow-lg overflow-hidden z-10 w-32">
                <button 
                  className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-white"
                  onClick={handleEditClick}
                >
                  <Pencil size={10} className="inline mr-2" />
                  Edit
                </button>
                <button 
                  className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-red-400"
                  onClick={handleDeleteClick}
                >
                  <Trash size={10} className="inline mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Task description */}
        {task.description && (
          <p className="text-gray-400 text-xs mb-3">{task.description}</p>
        )}
        
        {/* Task metadata */}
        <div className="space-y-2">
          {/* Priority badge */}
          <div className="flex items-center">
            <span className={`rounded-full text-xs px-2 py-0.5 font-medium ${getPriorityStyle()}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            
            {/* Due date with overdue indicator */}
            {task.dueDate && (
              <div className="ml-2 flex items-center">
                {isOverdue ? (
                  <AlertCircle size={10} className="text-red-500 mr-1" />
                ) : (
                  <Calendar size={10} className="text-gray-400 mr-1" />
                )}
                <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {formattedDueDate}
                </span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <div key={index} className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5">
                  <Tag size={8} className="mr-1 text-gray-400" />
                  <span className="text-xs text-gray-300">{tag}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Assigned to */}
          {task.assignedTo && (
            <div className="flex items-center">
              <User size={10} className="text-gray-400 mr-1" />
              <span className="text-xs text-gray-300">{task.assignedTo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

// Import Trash icon here to avoid circular imports from lucide-react
function Trash(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}