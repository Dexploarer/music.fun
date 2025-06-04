/**
 * Inventory Schemas - Train Station Dashboard API Standards
 * Comprehensive validation schemas for Inventory, Categories, and Stock Transactions
 * with business rule enforcement and stock management validation
 */

import { z } from 'zod';

// Base validation schemas
const PositiveNumberSchema = z.number().min(0, 'Value must be positive');
const CurrencySchema = z.number().min(0, 'Price must be positive');

// Inventory Category schemas
const CategoryBaseFields = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)')
    .optional(),
  isActive: z.boolean().default(true)
});

export const CreateCategorySchema = CategoryBaseFields;

export const UpdateCategorySchema = z.object({
  id: z.string().uuid('Invalid category ID')
}).merge(CategoryBaseFields.partial());

// Inventory Item base fields
const InventoryBaseFields = z.object({
  name: z.string()
    .min(1, 'Item name is required')
    .max(150, 'Item name must be less than 150 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .trim()
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  categoryId: z.string().uuid('Invalid category ID'),
  unit: z.enum(['piece', 'box', 'case', 'bottle', 'kg', 'lb', 'liter', 'gallon', 'meter', 'yard'])
    .describe('Unit of measurement for inventory'),
  currentStock: PositiveNumberSchema.describe('Current stock quantity'),
  minStockLevel: PositiveNumberSchema.describe('Minimum stock level before reorder alert'),
  maxStockLevel: PositiveNumberSchema.describe('Maximum stock level for optimal inventory'),
  reorderPoint: PositiveNumberSchema.describe('Stock level that triggers reorder'),
  reorderQuantity: PositiveNumberSchema.describe('Quantity to order when restocking'),
  costPrice: CurrencySchema.describe('Cost price per unit'),
  sellPrice: CurrencySchema.optional().describe('Selling price per unit'),
  supplier: z.string()
    .max(200, 'Supplier name must be less than 200 characters')
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  tags: z.array(z.string().trim().min(1)).max(20, 'Maximum 20 tags allowed').default([]),
  isActive: z.boolean().default(true),
  trackStock: z.boolean().default(true),
  allowNegativeStock: z.boolean().default(false)
});

// Inventory creation with business rules
export const CreateInventorySchema = InventoryBaseFields.refine(
  (data) => data.minStockLevel <= data.currentStock,
  {
    message: 'Current stock cannot be less than minimum stock level',
    path: ['currentStock']
  }
).refine(
  (data) => data.minStockLevel <= data.maxStockLevel,
  {
    message: 'Minimum stock level cannot exceed maximum stock level',
    path: ['minStockLevel']
  }
).refine(
  (data) => data.reorderPoint >= data.minStockLevel,
  {
    message: 'Reorder point should be at or above minimum stock level',
    path: ['reorderPoint']
  }
).refine(
  (data) => data.reorderQuantity > 0,
  {
    message: 'Reorder quantity must be greater than zero',
    path: ['reorderQuantity']
  }
).refine(
  (data) => !data.sellPrice || data.sellPrice > data.costPrice,
  {
    message: 'Selling price should be greater than cost price',
    path: ['sellPrice']
  }
);

// Inventory update schema
export const UpdateInventorySchema = z.object({
  id: z.string().uuid('Invalid inventory ID')
}).merge(InventoryBaseFields.partial().omit({ sku: true })).refine(
  (data) => {
    if (data.minStockLevel !== undefined && data.maxStockLevel !== undefined) {
      return data.minStockLevel <= data.maxStockLevel;
    }
    return true;
  },
  {
    message: 'Minimum stock level cannot exceed maximum stock level',
    path: ['minStockLevel']
  }
);

// Stock transaction schemas
const TransactionBaseFields = z.object({
  inventoryId: z.string().uuid('Invalid inventory ID'),
  type: z.enum(['in', 'out', 'adjustment', 'transfer', 'damaged', 'expired'])
    .describe('Type of stock transaction'),
  quantity: z.number()
    .min(0.01, 'Quantity must be greater than zero')
    .describe('Transaction quantity'),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must be less than 500 characters'),
  reference: z.string()
    .max(100, 'Reference must be less than 100 characters')
    .optional()
    .describe('External reference (PO number, invoice, etc.)'),
  cost: CurrencySchema.optional().describe('Cost per unit for this transaction'),
  staffMember: z.string()
    .max(100, 'Staff member name must be less than 100 characters')
    .optional(),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.enum(['sale', 'purchase', 'event', 'maintenance']).optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
});

export const CreateTransactionSchema = TransactionBaseFields.refine(
  (data) => {
    // For 'out' transactions, ensure we have proper reason
    if (data.type === 'out' && (!data.reason || data.reason.trim().length < 3)) {
      return false;
    }
    return true;
  },
  {
    message: 'Stock out transactions require detailed reason',
    path: ['reason']
  }
).refine(
  (data) => {
    // If relatedEntityId is provided, relatedEntityType must also be provided
    if (data.relatedEntityId && !data.relatedEntityType) {
      return false;
    }
    return true;
  },
  {
    message: 'Related entity type is required when related entity ID is provided',
    path: ['relatedEntityType']
  }
);

// Query schemas
export const InventoryQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  stockStatus: z.enum(['low', 'normal', 'high', 'out']).optional(),
  isActive: z.boolean().optional(),
  trackStock: z.boolean().optional(),
  priceRange: z.object({
    min: CurrencySchema.optional(),
    max: CurrencySchema.optional()
  }).optional(),
  stockRange: z.object({
    min: PositiveNumberSchema.optional(),
    max: PositiveNumberSchema.optional()
  }).optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['name', 'sku', 'currentStock', 'costPrice', 'sellPrice', 'lastUpdated']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const TransactionQuerySchema = z.object({
  inventoryId: z.string().uuid().optional(),
  type: z.enum(['in', 'out', 'adjustment', 'transfer', 'damaged', 'expired']).optional(),
  staffMember: z.string().optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  reference: z.string().optional(),
  relatedEntityType: z.enum(['sale', 'purchase', 'event', 'maintenance']).optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['date', 'type', 'quantity', 'staffMember']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Bulk operations
export const BulkStockAdjustmentSchema = z.object({
  adjustments: z.array(z.object({
    inventoryId: z.string().uuid(),
    newQuantity: PositiveNumberSchema,
    reason: z.string().min(1).max(500)
  })).min(1).max(50, 'Maximum 50 adjustments per batch'),
  staffMember: z.string().max(100).optional()
});

export const StockAlertSchema = z.object({
  inventoryId: z.string().uuid(),
  alertType: z.enum(['low_stock', 'out_of_stock', 'overstock', 'reorder_point']),
  threshold: PositiveNumberSchema.optional(),
  enabled: z.boolean().default(true)
});

// ID validation schemas
export const InventoryIdSchema = z.object({
  id: z.string().uuid('Invalid inventory ID')
});

export const CategoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID')
});

export const TransactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID')
});

// Export TypeScript types
export type CreateInventoryRequest = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryRequest = z.infer<typeof UpdateInventorySchema>;
export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;
export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;
export type InventoryQueryRequest = z.infer<typeof InventoryQuerySchema>;
export type TransactionQueryRequest = z.infer<typeof TransactionQuerySchema>;
export type BulkStockAdjustmentRequest = z.infer<typeof BulkStockAdjustmentSchema>;
export type StockAlertRequest = z.infer<typeof StockAlertSchema>;

// Enhanced interfaces - Updated to match Supabase database schema
export interface InventoryCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string;
  isActive: boolean;
  created_at: string | null;
  updated_at: string | null;
  // Virtual fields for enhanced functionality
  itemCount?: number;
  totalValue?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  category_id?: string | null;
  category?: InventoryCategory;
  current_stock?: number | null;
  reorder_level?: number | null;
  unit_price?: number | null;
  cost_price?: number | null;
  vendor?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  // Enhanced fields for business logic
  metrics?: {
    stockValue: number;
    turnoverRate: number;
    lastTransaction?: string;
    averageCost: number;
    profitMargin?: number;
    daysOfSupply: number;
    stockStatus: 'low' | 'normal' | 'high' | 'out';
  };
  transactions?: InventoryTransaction[];
  alerts?: StockAlert[];
  // Legacy compatibility fields
  trackStock?: boolean;
  allowNegativeStock?: boolean;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export interface InventoryTransaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  transaction_date?: string | null;
  created_by?: string | null;
  notes?: string | null;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Alias for compatibility with existing code
export type StockTransaction = InventoryTransaction;

export interface StockAlert {
  id: string;
  inventoryId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder_point';
  threshold?: number;
  currentValue: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

// Business rule validation utilities
export const validateInventoryBusinessRules = {
  canDelete: (item: InventoryItem): { valid: boolean; reason?: string } => {
    const currentStock = item.current_stock ?? 0;
    if (currentStock > 0) {
      return {
        valid: false,
        reason: 'Cannot delete item with current stock. Adjust stock to zero first.'
      };
    }
    return { valid: true };
  },

  canAdjustStock: (item: InventoryItem, newQuantity: number): { valid: boolean; reason?: string } => {
    const trackStock = item.trackStock ?? true;
    const allowNegativeStock = item.allowNegativeStock ?? false;
    
    if (!trackStock) {
      return {
        valid: false,
        reason: 'Cannot adjust stock for non-tracked items'
      };
    }
    
    if (newQuantity < 0 && !allowNegativeStock) {
      return {
        valid: false,
        reason: 'Negative stock not allowed for this item'
      };
    }
    
    return { valid: true };
  },

  canProcessTransaction: (item: InventoryItem, transaction: { type: string; quantity: number }): { valid: boolean; reason?: string } => {
    const trackStock = item.trackStock ?? true;
    const allowNegativeStock = item.allowNegativeStock ?? false;
    const currentStock = item.current_stock ?? 0;
    
    if (!trackStock && transaction.type !== 'adjustment') {
      return {
        valid: false,
        reason: 'Cannot process stock transactions for non-tracked items'
      };
    }
    
    if (transaction.type === 'out' && 
        currentStock < transaction.quantity && 
        !allowNegativeStock) {
      return {
        valid: false,
        reason: 'Insufficient stock for transaction'
      };
    }
    
    return { valid: true };
  },

  needsReorder: (item: InventoryItem): { valid: boolean; reason?: string } => {
    const trackStock = item.trackStock ?? true;
    const currentStock = item.current_stock ?? 0;
    const reorderLevel = item.reorder_level ?? 0;
    
    if (!trackStock) {
      return { valid: false, reason: 'Item does not track stock' };
    }
    
    if (currentStock <= reorderLevel) {
      return {
        valid: true,
        reason: `Stock level (${currentStock}) at or below reorder point (${reorderLevel})`
      };
    }
    
    return { valid: false };
  },

  getStockStatus: (item: InventoryItem): 'low' | 'normal' | 'high' | 'out' => {
    const trackStock = item.trackStock ?? true;
    const currentStock = item.current_stock ?? 0;
    const reorderLevel = item.reorder_level ?? 0;
    const maxStockLevel = item.maxStockLevel ?? Number.MAX_SAFE_INTEGER;
    
    if (!trackStock) return 'normal';
    if (currentStock === 0) return 'out';
    if (currentStock <= reorderLevel) return 'low';
    if (currentStock >= maxStockLevel) return 'high';
    return 'normal';
  },

  validateStockLevels: (item: Partial<InventoryItem>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const reorderLevel = item.reorder_level ?? 0;
    const maxStockLevel = item.maxStockLevel ?? Number.MAX_SAFE_INTEGER;
    const unitPrice = item.unit_price ?? 0;
    const costPrice = item.cost_price ?? 0;
    
    if (item.reorder_level !== undefined && item.maxStockLevel !== undefined) {
      if (reorderLevel > maxStockLevel) {
        errors.push('Minimum stock level cannot exceed maximum stock level');
      }
    }
    
    if (item.reorder_level !== undefined) {
      if (reorderLevel < 0) {
        errors.push('Reorder level must be greater than or equal to zero');
      }
    }
    
    if (item.unit_price !== undefined && item.cost_price !== undefined) {
      if (unitPrice <= costPrice && costPrice > 0) {
        errors.push('Selling price should be greater than cost price');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// Legacy compatibility type aliases
export type CreateInventoryItemRequest = CreateInventoryRequest;
export type UpdateInventoryItemRequest = UpdateInventoryRequest;
export type CreateInventoryCategoryRequest = CreateCategoryRequest;
export type UpdateInventoryCategoryRequest = UpdateCategoryRequest;
export type CreateInventoryTransactionRequest = CreateTransactionRequest; 