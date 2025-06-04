export interface Artist {
  id: string;
  name: string;
  genre: string;
  location: string;
  lastPerformance?: string;
  nextPerformance?: string;
  status: 'Confirmed' | 'Pending' | 'Inquiry' | 'Cancelled';
  email: string;
  phone: string;
  image: string;
  bio?: string;
  socialMedia?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
  managers?: Array<{
    id: string;
    title: string;
    name: string;
    email: string;
    phone: string;
  }>;
  performanceHistory?: {
    date: string;
    venueId: string;
    revenue: number;
    attendance: number;
    notes?: string;
  }[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  artistIds: string[];
  ticketsSold: number;
  totalCapacity: number;
  ticketPrice: number | {
    general: number;
    vip?: number;
    earlyBird?: number;
  };
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  genre?: string;
  revenue?: {
    tickets: number;
    bar: number;
    merchandise: number;
    other: number;
  };
  expenses?: {
    artists: number;
    staff: number;
    marketing: number;
    other: number;
  };
}

export interface EventRevenue {
  id?: string;
  eventId: string;
  tickets: number;
  bar: number;
  merchandise: number;
  other: number;
}

export interface EventExpenses {
  id?: string;
  eventId: string;
  artists: number;
  staff: number;
  marketing: number;
  other: number;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  description: string;
  date: string;
  platforms: string[];
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  eventId?: string;
  content?: {
    text?: string;
    images?: string[];
    videos?: string[];
  };
  performance?: {
    reach: number;
    engagement: number;
    clicks: number;
    conversions: number;
  };
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  eventId?: string;
  artistId?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  purchaseDate: string;
  purchaserName: string;
  purchaserEmail: string;
  price: number;
  type: 'general' | 'vip' | 'earlyBird';
  status: 'valid' | 'used' | 'refunded' | 'cancelled';
  scannedAt?: string;
}

export interface AIPrompt {
  id: string;
  category: 'marketing' | 'event' | 'artist' | 'financial' | 'general';
  prompt: string;
  createdAt: string;
  response?: string;
  userId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  description: string | null;
  content: string | null;
  fileType: string | null;
  fileSize: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isTemplate: boolean;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  file?: File; // Used for file upload but not stored in database
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  assignedTo: string | null;
  tags: string[];
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// Customer Relationship Management types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  birthday: string | null;
  customerSince: string;
  lastVisit: string | null;
  tags: string[];
  marketingPreferences: {
    emailPromotions: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
    specialEvents: boolean;
    unsubscribed: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'event' | 'purchase' | 'note' | 'other';
  date: string;
  description: string | null;
  staffMember: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdAt: string;
  updatedAt: string;
}

// Inventory Management types
export interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  categoryId: string | null;
  unitPrice: number | null;
  costPrice: number | null;
  currentStock: number;
  reorderLevel: number;
  vendor: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  transactionType: 'purchase' | 'sale' | 'waste' | 'adjustment_add' | 'adjustment_remove';
  quantity: number;
  transactionDate: string;
  notes: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Square integration types
export interface SquareIntegration {
  id: string;
  provider: 'square';
  merchantId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  scope: string[];
  metadata: {
    environment: 'sandbox' | 'production';
    tokenType: string;
    subscriptionId?: string;
    planId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Event Review and Feedback types
export interface EventReview {
  id: string;
  eventId: string;
  customerId: string | null;
  rating: number;
  reviewText: string | null;
  attendanceConfirmed: boolean;
  reviewDate: string;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackQuestion {
  id: string;
  questionText: string;
  questionType: 'rating' | 'text' | 'multiple_choice';
  options: string[];
  isRequired: boolean;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id: string;
  reviewId: string;
  questionId: string;
  responseText: string | null;
  responseRating: number | null;
  responseOption: string | null;
  createdAt: string;
}

// Artist Royalties and Payment Tracking types
export interface ArtistContract {
  id: string;
  artistId: string;
  contractName: string;
  contractType: 'performance' | 'recording' | 'residency' | string;
  startDate: string;
  endDate: string | null;
  paymentType: 'flat_fee' | 'percentage' | 'hybrid' | string;
  flatFeeAmount: number | null;
  percentageRate: number | null;
  minimumGuarantee: number | null;
  paymentSchedule: 'single' | 'installment' | 'post_event' | string;
  status: 'draft' | 'active' | 'expired' | 'cancelled' | string;
  contractDocumentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistPayment {
  id: string;
  artistId: string;
  contractId: string | null;
  eventId: string | null;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'other' | string;
  referenceNumber: string | null;
  status: 'pending' | 'paid' | 'cancelled' | string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltyReport {
  id: string;
  artistId: string;
  eventId: string | null;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  royaltyPercentage: number;
  royaltyAmount: number;
  status: 'draft' | 'final' | 'paid' | string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Advanced Analytics types
export interface AnalyticsMetric {
  id: string;
  metricName: string;
  category: string;
  timePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | string;
  date: string;
  value: number;
  comparisonValue: number | null;
  targetValue: number | null;
  isCumulative: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string | null;
  layout: Record<string, any>;
  isDefault: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  widgetType: 'chart' | 'metric' | 'table' | string;
  title: string;
  dataSource: string | null;
  chartType: 'line' | 'bar' | 'pie' | 'area' | string | null;
  timeRange: 'last_7_days' | 'last_30_days' | 'current_month' | 'current_year' | string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Loyalty Program types
export interface LoyaltyTier {
  id: string;
  name: string;
  pointThreshold: number;
  benefits: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  points: number;
  tierId: string;
  lastUpdated: string;
  lastPointsAdded: number;
  lastPointsReason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointMultiplier {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  requiredTierId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RewardRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsSpent: number;
  redemptionDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Staff Management types
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  position: string;
  department: string;
  hourlyRate?: number | null;
  isActive: boolean;
  hireDate: string;
  skills: string[];
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  eventId?: string | null;
  startTime: string;
  endTime: string;
  position: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeEntry {
  id: string;
  staffId: string;
  shiftId?: string | null;
  clockInTime: string;
  clockOutTime?: string | null;
  totalHours?: number | null;
  approved: boolean;
  approvedBy?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Equipment Management types
export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'out-of-service';
  location: string;
  notes?: string | null;
  lastMaintenance?: string | null;
  nextMaintenance?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceDate: string;
  maintenanceType: 'routine' | 'repair' | 'inspection';
  performedBy: string;
  cost?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  eventId?: string | null;
  startDate: string;
  endDate: string;
  reservedBy: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Predictive Analytics types
export interface PredictiveModel {
  id: string;
  name: string;
  type: 'attendance' | 'revenue' | 'pricing' | 'inventory';
  description?: string | null;
  parameters: Record<string, any>;
  accuracy?: number | null;
  lastTrained?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prediction {
  id: string;
  modelId: string;
  eventId?: string | null;
  predictionDate: string;
  targetMetric: string;
  predictedValue: number;
  confidenceScore?: number | null;
  actualValue?: number | null;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}