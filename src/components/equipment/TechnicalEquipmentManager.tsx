import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Speakers, 
  Mic, 
  Music, 
  Calendar, 
  AlertTriangle, 
  PlusCircle,
  Trash,
  Edit,
  Search,
  RefreshCw,
  Download,
  Filter,
  Save,
  X
} from 'lucide-react';
import { useEquipmentManagement } from '../../hooks/useEquipmentManagement';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { Equipment, MaintenanceRecord } from '../../types';

interface EquipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialEquipment?: Equipment;
  isSubmitting: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEquipment,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialEquipment?.name || '',
    category: initialEquipment?.category || 'sound',
    serialNumber: initialEquipment?.serialNumber || null,
    manufacturer: initialEquipment?.manufacturer || null,
    model: initialEquipment?.model || null,
    purchaseDate: initialEquipment?.purchaseDate || null,
    purchasePrice: initialEquipment?.purchasePrice || null,
    condition: initialEquipment?.condition || 'good',
    location: initialEquipment?.location || 'Main Stage',
    notes: initialEquipment?.notes || null,
    lastMaintenance: initialEquipment?.lastMaintenance || null,
    nextMaintenance: initialEquipment?.nextMaintenance || null,
    isActive: initialEquipment?.isActive ?? true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="text-xl font-semibold text-white font-playfair">
            {initialEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Equipment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="sound">Sound</option>
                  <option value="lighting">Lighting</option>
                  <option value="instruments">Instruments</option>
                  <option value="av">AV Equipment</option>
                  <option value="staging">Staging</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="Main Stage">Main Stage</option>
                  <option value="Side Stage">Side Stage</option>
                  <option value="Storage Room">Storage Room</option>
                  <option value="Tech Booth">Tech Booth</option>
                  <option value="Bar Area">Bar Area</option>
                  <option value="Entrance">Entrance</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300">
                  Manufacturer
                </label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-300">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-300">
                  Serial Number
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300">
                  Purchase Price
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-300">
                  Last Maintenance
                </label>
                <input
                  type="date"
                  id="lastMaintenance"
                  name="lastMaintenance"
                  value={formData.lastMaintenance || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-300">
                  Next Scheduled Maintenance
                </label>
                <input
                  type="date"
                  id="nextMaintenance"
                  name="nextMaintenance"
                  value={formData.nextMaintenance || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-300">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-zinc-700 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                Equipment is Active and Available
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialEquipment ? 'Update' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  equipment: Equipment[];
  selectedEquipmentId?: string;
  initialRecord?: MaintenanceRecord;
  isSubmitting: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  isOpen,
  onClose,
  onSave,
  equipment,
  selectedEquipmentId,
  initialRecord,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    equipmentId: initialRecord?.equipmentId || selectedEquipmentId || '',
    maintenanceDate: initialRecord?.maintenanceDate || format(new Date(), 'yyyy-MM-dd'),
    maintenanceType: initialRecord?.maintenanceType || 'routine',
    performedBy: initialRecord?.performedBy || '',
    cost: initialRecord?.cost || null,
    notes: initialRecord?.notes || null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="text-xl font-semibold text-white font-playfair">
            {initialRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-300">
                Equipment <span className="text-red-500">*</span>
              </label>
              <select
                id="equipmentId"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleInputChange}
                required
                disabled={!!selectedEquipmentId}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">Select Equipment</option>
                {equipment.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-300">
                Maintenance Type <span className="text-red-500">*</span>
              </label>
              <select
                id="maintenanceType"
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="routine">Routine Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="maintenanceDate" className="block text-sm font-medium text-gray-300">
                Maintenance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="maintenanceDate"
                name="maintenanceDate"
                value={formData.maintenanceDate}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label htmlFor="performedBy" className="block text-sm font-medium text-gray-300">
                Performed By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="performedBy"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Name or company"
              />
            </div>
            
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-300">
                Cost ($)
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Details of maintenance performed"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialRecord ? 'Update' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TechnicalEquipmentManager: React.FC = () => {
  const { 
    equipment, 
    maintenanceRecords, 
    isLoading, 
    isLoadingMaintenanceRecords, 
    createEquipment,
    updateEquipment,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    isCreating,
    isUpdating
  } = useEquipmentManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>(undefined);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | undefined>(undefined);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter(item => {
    const searchMatch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const categoryMatch = !categoryFilter || item.category === categoryFilter;
    const locationMatch = !locationFilter || item.location === locationFilter;
    
    return searchMatch && categoryMatch && locationMatch;
  });
  
  // Get unique categories and locations for filtering
  const categories = Array.from(new Set(equipment.map(item => item.category)));
  const locations = Array.from(new Set(equipment.map(item => item.location)));
  
  // Get maintenance records for specific equipment
  const getMaintenanceRecordsForEquipment = (equipmentId: string) => {
    return maintenanceRecords
      .filter(record => record.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime());
  };
  
  // Get equipment that need maintenance soon
  const needsMaintenance = equipment.filter(item => 
    item.nextMaintenance && 
    new Date(item.nextMaintenance) <= addDays(new Date(), 30)
  ).sort((a, b) => 
    new Date(a.nextMaintenance!).getTime() - new Date(b.nextMaintenance!).getTime()
  );
  
  // Handle adding or updating equipment
  const handleSaveEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedEquipment) {
        await updateEquipment(selectedEquipment.id, equipmentData);
        setIsEquipmentModalOpen(false);
        setSelectedEquipment(undefined);
        toast.success('Equipment updated successfully');
      } else {
        await createEquipment(equipmentData);
        setIsEquipmentModalOpen(false);
        toast.success('Equipment added successfully');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Failed to save equipment');
    }
  };
  
  // Handle adding or updating maintenance record
  const handleSaveMaintenanceRecord = async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedRecord) {
        await updateMaintenanceRecord(selectedRecord.id, recordData);
        setIsMaintenanceModalOpen(false);
        setSelectedRecord(undefined);
        toast.success('Maintenance record updated successfully');
      } else {
        await createMaintenanceRecord(recordData);
        setIsMaintenanceModalOpen(false);
        toast.success('Maintenance record added successfully');
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error('Failed to save maintenance record');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Technical Equipment</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsMaintenanceModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
          >
            <Calendar size={16} className="mr-2" />
            Log Maintenance
          </button>
          <button 
            onClick={() => {
              setSelectedEquipment(undefined);
              setIsEquipmentModalOpen(true);
            }}
            className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Equipment
          </button>
        </div>
      </div>
      
      {/* Maintenance Alerts */}
      {needsMaintenance.length > 0 && (
        <div className="rounded-lg bg-red-900/20 p-4 border border-red-700">
          <div className="flex items-start">
            <AlertTriangle size={20} className="mr-3 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-medium text-red-400">Maintenance Due</h3>
              <p className="text-sm text-gray-300 mb-3">
                The following equipment {needsMaintenance.length === 1 ? 'is' : 'are'} due for maintenance soon.
              </p>
              <div className="space-y-2">
                {needsMaintenance.slice(0, 3).map(item => (
                  <div key={item.id} className="rounded-lg bg-zinc-900/50 p-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        Due: {format(new Date(item.nextMaintenance!), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedEquipment(item);
                        setIsMaintenanceModalOpen(true);
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      Log Maintenance
                    </button>
                  </div>
                ))}
                
                {needsMaintenance.length > 3 && (
                  <p className="text-sm text-gray-300">
                    +{needsMaintenance.length - 3} more {needsMaintenance.length - 3 === 1 ? 'item' : 'items'} due for maintenance
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filters */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={14} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 bg-zinc-800 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 sm:text-sm"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={categoryFilter || ""}
          onChange={(e) => setCategoryFilter(e.target.value || null)}
          className="rounded-lg border-0 bg-zinc-800 py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-amber-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        
        <select
          value={locationFilter || ""}
          onChange={(e) => setLocationFilter(e.target.value || null)}
          className="rounded-lg border-0 bg-zinc-800 py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-amber-500 sm:text-sm"
        >
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>
      
      {/* Equipment List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          <p className="text-lg text-white">Loading equipment...</p>
        </div>
      ) : filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredEquipment.map(item => (
            <div 
              key={item.id} 
              className={`rounded-lg bg-zinc-900 border ${
                item.condition === 'out-of-service' ? 'border-red-700' :
                item.condition === 'poor' ? 'border-orange-700' :
                showDetails === item.id ? 'border-amber-700' : 'border-zinc-800'
              }`}
            >
              <div className="p-4">
                {/* Header with icon and name */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="rounded-full bg-zinc-800 p-2">
                      {item.category === 'sound' ? <Speakers size={16} className="text-blue-500" /> :
                       item.category === 'lighting' ? <Monitor size={16} className="text-amber-500" /> :
                       item.category === 'instruments' ? <Music size={16} className="text-green-500" /> :
                       <Mic size={16} className="text-purple-500" />}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-white">{item.name}</h3>
                      <p className="text-xs text-gray-400">
                        {item.manufacturer} {item.model}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Equipment details */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Location:</span>
                    <span className="text-xs text-white">{item.location}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Condition:</span>
                    <span className={`text-xs ${
                      item.condition === 'excellent' ? 'text-green-400' :
                      item.condition === 'good' ? 'text-blue-400' :
                      item.condition === 'fair' ? 'text-amber-400' :
                      item.condition === 'poor' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                    </span>
                  </div>
                  
                  {item.lastMaintenance && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Last Maintenance:</span>
                      <span className="text-xs text-white">
                        {format(new Date(item.lastMaintenance), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  
                  {item.nextMaintenance && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Next Maintenance:</span>
                      <span className={`text-xs ${
                        new Date(item.nextMaintenance) < new Date() ? 'text-red-400' :
                        new Date(item.nextMaintenance) < addDays(new Date(), 14) ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        {format(new Date(item.nextMaintenance), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => {
                      setShowDetails(prev => prev === item.id ? null : item.id);
                    }}
                    className="text-xs text-amber-500 hover:text-amber-400"
                  >
                    {showDetails === item.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setIsMaintenanceModalOpen(true);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-400"
                      title="Log Maintenance"
                    >
                      <Calendar size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEquipment(item);
                        setIsEquipmentModalOpen(true);
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Expanded details */}
              {showDetails === item.id && (
                <div className="border-t border-zinc-800 bg-zinc-900/50 p-4">
                  {/* Additional details */}
                  <div className="mb-4 space-y-2">
                    {item.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Serial Number:</span>
                        <span className="text-xs text-white">{item.serialNumber}</span>
                      </div>
                    )}
                    
                    {item.purchaseDate && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Purchase Date:</span>
                        <span className="text-xs text-white">
                          {format(new Date(item.purchaseDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    {item.purchasePrice && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Purchase Price:</span>
                        <span className="text-xs text-white">
                          ${item.purchasePrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-400">Notes:</span>
                        <p className="mt-1 text-xs text-white">{item.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Maintenance history */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Maintenance History</h4>
                    {isLoadingMaintenanceRecords ? (
                      <div className="flex justify-center py-2">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                        <p className="text-xs text-gray-400">Loading records...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getMaintenanceRecordsForEquipment(item.id).length > 0 ? (
                          getMaintenanceRecordsForEquipment(item.id).map(record => (
                            <div key={record.id} className="rounded-lg bg-zinc-800 p-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-white">
                                  {format(new Date(record.maintenanceDate), 'MMM d, yyyy')} - {record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)}
                                </span>
                                <span className="text-gray-400">By {record.performedBy}</span>
                              </div>
                              {record.notes && (
                                <p className="mt-1 text-xs text-gray-300">{record.notes}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-2">No maintenance records found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-zinc-900 p-6 text-center">
          <Speakers size={32} className="mx-auto text-amber-500 opacity-50" />
          <h2 className="mt-4 text-xl font-semibold text-white">No equipment found</h2>
          <p className="mt-1 text-gray-400">
            {searchTerm || categoryFilter || locationFilter ? 
              'No equipment matches your search criteria.' : 
              'Add your first piece of equipment to get started.'}
          </p>
          <button
            onClick={() => {
              setSelectedEquipment(undefined);
              setIsEquipmentModalOpen(true);
            }}
            className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <PlusCircle size={14} className="mr-2" />
            Add Equipment
          </button>
        </div>
      )}
      
      {/* Equipment Stats */}
      {filteredEquipment.length > 0 && (
        <div className="rounded-lg bg-zinc-900 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Equipment Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-zinc-800 p-4">
              <h4 className="text-sm text-gray-400">Total Equipment</h4>
              <p className="text-2xl font-semibold text-white">{equipment.length}</p>
              <p className="text-xs text-gray-400 mt-1">
                {equipment.filter(e => e.isActive).length} active items
              </p>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <h4 className="text-sm text-gray-400">Total Value</h4>
              <p className="text-2xl font-semibold text-white">
                ${equipment
                  .filter(e => e.purchasePrice)
                  .reduce((sum, item) => sum + (item.purchasePrice || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Based on purchase prices</p>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <h4 className="text-sm text-gray-400">Maintenance Due</h4>
              <p className="text-2xl font-semibold text-amber-500">
                {needsMaintenance.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Items requiring attention</p>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <h4 className="text-sm text-gray-400">Out of Service</h4>
              <p className="text-2xl font-semibold text-red-500">
                {equipment.filter(e => e.condition === 'out-of-service').length}
              </p>
              <p className="text-xs text-gray-400 mt-1">Items needing repair</p>
            </div>
          </div>
          
          <div className="mt-4 rounded-lg bg-zinc-800 p-4">
            <div className="flex items-start">
              <Calendar size={16} className="text-amber-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Maintenance Schedule</p>
                <p className="mt-1 text-xs text-gray-300">
                  Regular maintenance helps prevent equipment failures during events. Schedule maintenance at least 
                  quarterly for critical equipment and monthly inspections for heavily used items.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Equipment Form Modal */}
      {isEquipmentModalOpen && (
        <EquipmentForm
          isOpen={isEquipmentModalOpen}
          onClose={() => {
            setIsEquipmentModalOpen(false);
            setSelectedEquipment(undefined);
          }}
          onSave={handleSaveEquipment}
          initialEquipment={selectedEquipment}
          isSubmitting={isCreating || isUpdating}
        />
      )}
      
      {/* Maintenance Form Modal */}
      {isMaintenanceModalOpen && (
        <MaintenanceForm
          isOpen={isMaintenanceModalOpen}
          onClose={() => {
            setIsMaintenanceModalOpen(false);
            setSelectedRecord(undefined);
            setSelectedEquipment(undefined);
          }}
          onSave={handleSaveMaintenanceRecord}
          equipment={equipment}
          selectedEquipmentId={selectedEquipment?.id}
          initialRecord={selectedRecord}
          isSubmitting={isCreating || isUpdating}
        />
      )}
    </div>
  );
};

export default TechnicalEquipmentManager;