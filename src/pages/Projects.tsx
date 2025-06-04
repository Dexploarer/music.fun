import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Calendar, 
  Clock, 
  Filter, 
  Plus, 
  Search, 
  Tag, 
  Users, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Target,
  Activity,
  Eye,
  Settings,
  MoreVertical,
  MessageSquare,
  FileText,
  Star,
  Award,
  Zap,
  Globe,
  RefreshCw,
  Download,
  Upload,
  GitBranch,
  Timer,
  Layers,
  Archive,
  PieChart,
  Grid3x3,
  Calendar as CalendarView,
  List,
  Clock as Timeline
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskFormModal from '../components/projects/TaskFormModal';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { Task } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, differenceInDays, addDays } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart as RechartsPieChart, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

// Enhanced interfaces for project management
interface ProjectAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  teamEfficiency: number;
  upcomingDeadlines: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  productivity: number;
}

interface ProjectTimelineItem {
  id: string;
  title: string;
  date: string;
  type: 'milestone' | 'task' | 'meeting' | 'deadline';
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  assignee?: string;
}

type ViewMode = 'kanban' | 'timeline' | 'calendar' | 'analytics';

// Enhanced TaskCard Component with collaboration features
const EnhancedTaskCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}> = ({ task, onEdit, onDelete, isDragging }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'done' : false;

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 hover:border-amber-500/30 transition-all duration-300 mb-3 ${isDragging ? 'opacity-50' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getPriorityColor()}`}>
              {task.priority}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </span>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-10 min-w-[140px]">
                <button 
                  onClick={() => { onEdit(task); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  <Settings className="h-3 w-3 inline mr-2" />
                  Edit Task
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800">
                  <MessageSquare className="h-3 w-3 inline mr-2" />
                  Add Comment
                </button>
                <button 
                  onClick={() => { onDelete(task.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                >
                  <Archive className="h-3 w-3 inline mr-2" />
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">{task.title}</h3>
        
        {task.description && (
          <p className="text-xs text-gray-300 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="space-y-2">
          {task.dueDate && (
            <div className="flex items-center text-xs">
              <Clock className="h-3 w-3 text-gray-400 mr-1" />
              <span className={isOverdue ? 'text-red-400' : 'text-gray-400'}>
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {task.assignedTo && (
            <div className="flex items-center text-xs">
              <Users className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-gray-300">{task.assignedTo}</span>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="inline-flex items-center rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-gray-300">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{task.tags.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-700/50">
          <div className="flex items-center space-x-1">
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="h-3 w-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <FileText className="h-3 w-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <Star className="h-3 w-3" />
            </button>
          </div>
          
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border border-zinc-700"></div>
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border border-zinc-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const ProjectAnalyticsDashboard: React.FC<{ analytics: ProjectAnalytics; tasks: Task[] }> = ({ analytics, tasks }) => {
  const chartData = [
    { name: 'Mon', completed: 12, created: 8 },
    { name: 'Tue', completed: 15, created: 12 },
    { name: 'Wed', completed: 8, created: 14 },
    { name: 'Thu', completed: 18, created: 10 },
    { name: 'Fri', completed: 22, created: 16 },
    { name: 'Sat', completed: 5, created: 3 },
    { name: 'Sun', completed: 7, created: 4 }
  ];

  const statusData = [
    { name: 'Completed', value: analytics.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: analytics.inProgressTasks, color: '#f59e0b' },
    { name: 'To Do', value: analytics.totalTasks - analytics.completedTasks - analytics.inProgressTasks, color: '#3b82f6' },
    { name: 'Overdue', value: analytics.overdueTasks, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{analytics.totalTasks}</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12% this week</span>
            </div>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Target className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-white">{analytics.completionRate}%</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5.2% this month</span>
            </div>
          </div>
          <div className="bg-green-500/20 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Team Efficiency</p>
            <p className="text-2xl font-bold text-white">{analytics.teamEfficiency}%</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8.1% improvement</span>
            </div>
          </div>
          <div className="bg-purple-500/20 p-3 rounded-full">
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Upcoming Deadlines</p>
            <p className="text-2xl font-bold text-white">{analytics.upcomingDeadlines}</p>
            <div className="flex items-center mt-1">
              <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs text-amber-500">Next 7 days</span>
            </div>
          </div>
          <div className="bg-amber-500/20 p-3 rounded-full">
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Timeline View Component
const TimelineView: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const timelineItems: ProjectTimelineItem[] = tasks
    .filter(task => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .map(task => ({
      id: task.id,
      title: task.title,
      date: task.dueDate!,
      type: task.priority === 'urgent' ? 'deadline' : 'task',
      status: task.status as 'completed' | 'in-progress' | 'upcoming' | 'overdue',
      assignee: task.assignedTo || undefined
    }));

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
        <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
          <Download className="h-4 w-4 inline mr-1" />
          Export Timeline
        </button>
      </div>
      
      <div className="space-y-4">
        {timelineItems.slice(0, 8).map((item, index) => (
          <div key={item.id} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                item.status === 'completed' ? 'bg-green-500' :
                item.status === 'in-progress' ? 'bg-amber-500' :
                item.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <span className="text-xs text-gray-400">
                  {format(new Date(item.date), 'MMM d')}
                </span>
              </div>
              
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.type === 'deadline' ? 'bg-red-500/20 text-red-400' :
                  item.type === 'milestone' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.type}
                </span>
                
                {item.assignee && (
                  <span className="ml-2 text-xs text-gray-400">
                    Assigned to {item.assignee}
                  </span>
                )}
              </div>
            </div>
            
            {index < timelineItems.length - 1 && (
              <div className="absolute left-6 mt-6 w-px h-4 bg-zinc-700"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Kanban Column
const EnhancedKanbanColumn: React.FC<{
  title: string;
  tasks: Task[];
  status: string;
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  provided: any;
  isDraggingOver: boolean;
}> = ({ title, tasks, status, onAddTask, onEditTask, onDeleteTask, provided, isDraggingOver }) => {
  const getColumnStyle = () => {
    switch (status) {
      case 'todo': return 'from-blue-500 to-blue-600';
      case 'in-progress': return 'from-amber-500 to-amber-600';
      case 'review': return 'from-purple-500 to-purple-600';
      case 'done': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`bg-zinc-900/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
      isDraggingOver ? 'border-amber-500 scale-[1.02]' : 'border-zinc-700/50'
    }`}>
      <div className={`bg-gradient-to-r ${getColumnStyle()} px-4 py-3 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">
            {title}
            <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs">
              {tasks.length}
            </span>
          </h3>
          <button
            onClick={() => onAddTask(status)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div
        className="p-3 min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-600"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={provided.draggableProps.style}
              >
                <EnhancedTaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  isDragging={snapshot.isDragging}
                />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
        
        <button
          onClick={() => onAddTask(status)}
          className="w-full py-3 px-4 text-sm text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 border border-dashed border-zinc-600 hover:border-amber-500"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add Task
        </button>
      </div>
    </div>
  );
};

interface ProjectDashboardProps {
  children?: React.ReactNode;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = () => {
  const navigate = useNavigate();
  const { tasks, isLoading, createTask, updateTask, moveTask, reorderTasks, deleteTask, isCreating, isUpdating } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('todo');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const breadcrumbs = useBreadcrumbs();

  // Generate analytics data
  const analytics: ProjectAnalytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
    ).length;
    const upcomingDeadlines = tasks.filter(task =>
      task.dueDate && differenceInDays(new Date(task.dueDate), new Date()) <= 7 && task.status !== 'done'
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      averageCompletionTime: 3.2,
      teamEfficiency: 87,
      upcomingDeadlines
    };
  }, [tasks]);

  // Enhanced filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;
      
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchTerm, filterPriority, filterAssignee]);

  // Group tasks by status
  const getTasksByStatus = (status: string) => {
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const todoTasks = getTasksByStatus('todo');
  const inProgressTasks = getTasksByStatus('in-progress');
  const reviewTasks = getTasksByStatus('review');
  const doneTasks = getTasksByStatus('done');

  // Handle adding a new task
  const handleAddTask = (status: string) => {
    setSelectedTask(undefined);
    setSelectedStatus(status);
    setIsTaskModalOpen(true);
  };

  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle saving a task
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedTask) {
      updateTask({
        id: selectedTask.id,
        updates: taskData
      });
    } else {
      createTask(taskData);
    }
    setIsTaskModalOpen(false);
  };

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    if (destination.droppableId === source.droppableId) {
      const columnTasks = getTasksByStatus(source.droppableId);
      const newTasksOrder = Array.from(columnTasks);
      const [movedTask] = newTasksOrder.splice(source.index, 1);
      newTasksOrder.splice(destination.index, 0, movedTask);
      
      const updates = newTasksOrder.map((task, index) => ({
        id: task.id,
        position: index
      }));
      
      reorderTasks(updates);
    } else {
      const destColumnTasks = getTasksByStatus(destination.droppableId);
      const newPosition = destination.index === 0 ? 0 : 
        destination.index === destColumnTasks.length ? 
        (destColumnTasks[destColumnTasks.length - 1]?.position || 0) + 1 : 
        (destColumnTasks[destination.index - 1]?.position || 0) + 1;
      
      moveTask({
        id: draggableId,
        newStatus: destination.droppableId,
        newPosition: newPosition
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
      <div className="space-y-6 p-6">
      <Breadcrumbs items={breadcrumbs} />
      
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Project Management
            </h1>
            <p className="text-gray-400 mt-1">
              Kanban boards, timeline views, and team collaboration
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-zinc-800 rounded-lg p-1 flex">
              {[
                { mode: 'kanban' as ViewMode, icon: Grid3x3, label: 'Kanban' },
                { mode: 'timeline' as ViewMode, icon: Timeline, label: 'Timeline' },
                { mode: 'calendar' as ViewMode, icon: CalendarView, label: 'Calendar' },
                { mode: 'analytics' as ViewMode, icon: BarChart3, label: 'Analytics' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
            
          <button 
            onClick={() => handleAddTask('todo')}
              className="flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
              <Plus className="h-4 w-4 mr-2" />
              New Task
          </button>
        </div>
      </div>

        {/* Analytics Dashboard */}
        <ProjectAnalyticsDashboard analytics={analytics} tasks={tasks} />

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Search tasks, descriptions, or assignees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Assignees</option>
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Mike Johnson">Mike Johnson</option>
          </select>
      </div>

        {/* Main Content Area */}
        {viewMode === 'timeline' ? (
          <TimelineView tasks={filteredTasks} />
        ) : viewMode === 'analytics' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Task Completion Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Mon', completed: 12, created: 8 },
                  { name: 'Tue', completed: 15, created: 12 },
                  { name: 'Wed', completed: 8, created: 14 },
                  { name: 'Thu', completed: 18, created: 10 },
                  { name: 'Fri', completed: 22, created: 16 },
                  { name: 'Sat', completed: 5, created: 3 },
                  { name: 'Sun', completed: 7, created: 4 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
                </div>
                
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: analytics.completedTasks, color: '#10b981' },
                      { name: 'In Progress', value: analytics.inProgressTasks, color: '#f59e0b' },
                      { name: 'To Do', value: analytics.totalTasks - analytics.completedTasks - analytics.inProgressTasks, color: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[
                      { name: 'Completed', value: analytics.completedTasks, color: '#10b981' },
                      { name: 'In Progress', value: analytics.inProgressTasks, color: '#f59e0b' },
                      { name: 'To Do', value: analytics.totalTasks - analytics.completedTasks - analytics.inProgressTasks, color: '#3b82f6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
                                    </div>
                                  </div>
        ) : (
          /* Enhanced Kanban Board */
          isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="mr-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              <p className="text-xl text-white">Loading project data...</p>
                                </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Droppable droppableId="todo">
                  {(provided, snapshot) => (
                    <EnhancedKanbanColumn
                      title="To Do"
                      tasks={todoTasks}
                      status="todo"
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTask}
                      provided={provided}
                      isDraggingOver={snapshot.isDraggingOver}
                    />
                  )}
                </Droppable>

                <Droppable droppableId="in-progress">
                  {(provided, snapshot) => (
                    <EnhancedKanbanColumn
                      title="In Progress"
                      tasks={inProgressTasks}
                      status="in-progress"
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTask}
                      provided={provided}
                      isDraggingOver={snapshot.isDraggingOver}
                    />
                  )}
                </Droppable>

                <Droppable droppableId="review">
                  {(provided, snapshot) => (
                    <EnhancedKanbanColumn
                      title="In Review"
                      tasks={reviewTasks}
                      status="review"
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTask}
                      provided={provided}
                      isDraggingOver={snapshot.isDraggingOver}
                    />
                  )}
                </Droppable>

                <Droppable droppableId="done">
                  {(provided, snapshot) => (
                    <EnhancedKanbanColumn
                      title="Done"
                      tasks={doneTasks}
                      status="done"
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={deleteTask}
                      provided={provided}
                      isDraggingOver={snapshot.isDraggingOver}
                    />
                  )}
                </Droppable>
              </div>
          </DragDropContext>
          )
      )}
      
      {/* Task Form Modal */}
      {isTaskModalOpen && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          initialTask={selectedTask}
          initialStatus={selectedStatus}
          isSubmitting={isCreating || isUpdating}
        />
      )}
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProjectDashboard />} />
    </Routes>
  );
};

export default Projects;