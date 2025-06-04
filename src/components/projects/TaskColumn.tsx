import React from 'react';
import { Task } from '../../types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: string;
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  provided: any; // For drag and drop functionality
  isDraggingOver: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  tasks, 
  status, 
  onAddTask, 
  onEditTask,
  onDeleteTask,
  provided,
  isDraggingOver
}) => {
  // Get column header style based on status
  const getColumnHeaderStyle = () => {
    switch (status) {
      case 'todo':
        return 'bg-blue-500 text-white';
      case 'in-progress':
        return 'bg-amber-500 text-white';
      case 'review':
        return 'bg-purple-500 text-white';
      case 'done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div 
      className={`bg-zinc-900 rounded-lg shadow-md flex flex-col h-full ${
        isDraggingOver ? 'border-2 border-amber-500' : 'border border-zinc-800'
      }`}
    >
      {/* Column header */}
      <div className={`${getColumnHeaderStyle()} px-3 py-2 rounded-t-lg flex justify-between items-center`}>
        <h2 className="font-medium text-sm">
          {title}
          <span className="ml-2 bg-white bg-opacity-20 text-white text-xs rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </h2>
        <button 
          onClick={() => onAddTask(status)}
          className="text-white hover:text-gray-200 p-1 rounded-full"
          aria-label={`Add task to ${title}`}
        >
          <Plus size={12} />
        </button>
      </div>
      
      {/* Tasks container */}
      <div 
        className="flex-1 p-2 overflow-y-auto min-h-[200px]"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {tasks.map((task, index) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEditTask} 
            onDelete={onDeleteTask}
          />
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
};

export default TaskColumn;