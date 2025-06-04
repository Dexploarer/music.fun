import { SupabaseAdapter, type QueryOptions } from '../adapters/supabaseAdapter';
import { validateQuery, validateParams } from '../validation';
import { UserRole } from '../auth';
import type { ApiResponse } from '../types';
import {
  CreateInventorySchema,
  UpdateInventorySchema,
  InventoryQuerySchema,
  InventoryIdSchema,
  CreateTransactionSchema,
  CreateCategorySchema,
  AlertConfigSchema,
  validateInventoryBusinessRules,
  type CreateInventoryRequest,
  type UpdateInventoryRequest,
  type InventoryQueryRequest,
  type InventoryItem,
  type StockTransaction,
  type CreateTransactionRequest,
  type InventoryCategory,
  type CreateCategoryRequest,
  type StockAlert,
  type BulkStockAdjustmentRequest,
  type StockAlertRequest,
  type EnhancedInventoryItem,
} from '../schemas/inventorySchemas';
import { ValidationError } from '../errors';

export class InventoryService {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = new SupabaseAdapter();
  }

  /**
   * Get all inventory items with filtering and pagination
   */
  async getInventoryItems(query: Partial<InventoryQueryRequest> = {}): Promise<ApiResponse<InventoryItem[]>> {
    // 1. Validate query parameters with defaults
    const queryWithDefaults = {
      limit: 20,
      offset: 0,
      ...query
    };
    
    const validationResult = validateQuery(InventoryQuerySchema, queryWithDefaults);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { limit, offset, category, status, supplier, lowStock, search } = validationResult.data;

    // 2. Build query options
    const queryOptions: QueryOptions = {
      select: `
        *,
        inventory_categories(*),
        inventory_transactions(*)
      `,
      orderBy: { column: 'name', ascending: true },
      limit,
      offset,
      filters: {}
    };

    // Apply filters
    if (category) queryOptions.filters!.category = category;
    if (status) queryOptions.filters!.status = status;
    if (supplier) queryOptions.filters!.supplier = supplier;

    // 3. Execute query with adapter
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_items',
        rateLimitKey: 'inventory:read',
        enableLogging: true,
      },
      async () => {
        let query = this.adapter.buildQuery('inventory_items', queryOptions);
        
        // Add search filter if provided
        if (search) {
          query = query.or(`name.ilike.%${search}%, sku.ilike.%${search}%, description.ilike.%${search}%`);
        }

        // Add low stock filter if requested
        if (lowStock) {
          query = query.lt('current_stock', 'reorder_point');
        }
        
        return query;
      },
      'read'
    );

    if (response.success) {
      // Transform data to our InventoryItem format
      const items = Array.isArray(response.data) ? response.data : [response.data];
      const transformedItems = items.map(item => this.transformInventoryItemFromDb(item as Record<string, unknown>));
      
      return {
        ...response,
        data: transformedItems
      };
    }
    return response as ApiResponse<InventoryItem[]>;
  }

  /**
   * Get enhanced inventory items with calculated metrics
   */
  async getEnhancedInventoryItems(query: Partial<InventoryQueryRequest> = {}): Promise<ApiResponse<EnhancedInventoryItem[]>> {
    const itemsResponse = await this.getInventoryItems(query);
    if (!itemsResponse.success) {
      return itemsResponse as ApiResponse<EnhancedInventoryItem[]>;
    }

    const enhancedItems = await Promise.all(
      itemsResponse.data.map(async (item) => {
        const metrics = await this.calculateItemMetrics(item.id);
        return {
          ...item,
          metrics: metrics.success ? metrics.data : undefined
        } as EnhancedInventoryItem;
      })
    );

    return {
      ...itemsResponse,
      data: enhancedItems
    };
  }

  /**
   * Get a single inventory item by ID
   */
  async getInventoryItemById(id: string): Promise<ApiResponse<InventoryItem>> {
    // 1. Validate ID
    const validationResult = validateParams(InventoryIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_items',
        rateLimitKey: 'inventory:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('inventory_items', {
          select: `
            *,
            inventory_categories(*),
            inventory_transactions(*)
          `,
          filters: { id }
        });
      },
      'read'
    );

    if (response.success) {
      return {
        ...response,
        data: this.transformInventoryItemFromDb(response.data as Record<string, unknown>)
      };
    }
    return response as ApiResponse<InventoryItem>;
  }

  /**
   * Create a new inventory item
   */
  async createInventoryItem(itemData: CreateInventoryRequest): Promise<ApiResponse<InventoryItem>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateInventorySchema, itemData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Apply business rules
    const businessRuleCheck = validateInventoryBusinessRules.validateStockLevels(validatedData);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Inventory item data violates business rules',
          instance: '/api/inventory',
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Execute with appropriate permissions
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_items',
        requiredRole: UserRole.STAFF, // Staff and above can create inventory items
        rateLimitKey: 'inventory:create',
        enableLogging: true,
      },
      async () => {
        // Convert to database format
        const dbData = this.adapter.toSnakeCase({
          name: validatedData.name,
          description: validatedData.description,
          sku: validatedData.sku,
          category: validatedData.category,
          currentStock: validatedData.currentStock,
          minStock: validatedData.minStock,
          maxStock: validatedData.maxStock,
          reorderPoint: validatedData.reorderPoint,
          reorderQuantity: validatedData.reorderQuantity,
          unitOfMeasurement: validatedData.unitOfMeasurement,
          costPrice: validatedData.costPrice,
          sellPrice: validatedData.sellPrice,
          supplier: validatedData.supplier,
          supplierSku: validatedData.supplierSku,
          location: validatedData.location,
          status: validatedData.status || 'active',
          notes: validatedData.notes,
          tags: validatedData.tags || [],
        });

        return this.adapter.buildQuery('inventory_items')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const itemArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformInventoryItemFromDb(itemArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<InventoryItem>;
  }

  /**
   * Update an existing inventory item
   */
  async updateInventoryItem(id: string, updates: Omit<UpdateInventoryRequest, 'id'>): Promise<ApiResponse<InventoryItem>> {
    // 1. Validate ID and updates
    const idValidation = validateParams(InventoryIdSchema, { id });
    if (!idValidation.success) {
      return idValidation.error;
    }

    const updateValidation = validateParams(
      UpdateInventorySchema.omit({ id: true }), 
      updates
    );
    if (!updateValidation.success) {
      return updateValidation.error;
    }

    // 2. Check if item exists and can be edited
    const existingItemResponse = await this.getInventoryItemById(id);
    if (!existingItemResponse.success) {
      return existingItemResponse;
    }

    const existingItem = existingItemResponse.data;
    const businessRuleCheck = validateInventoryBusinessRules.canEdit(existingItem);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Cannot edit this inventory item',
          instance: `/api/inventory/${id}`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Execute update
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_items',
        requiredRole: UserRole.STAFF,
        rateLimitKey: 'inventory:update',
        enableLogging: true,
      },
      async () => {
        // Convert updates to database format
        const dbUpdates = this.adapter.toSnakeCase({
          ...updateValidation.data,
          updated_at: new Date().toISOString()
        });

        return this.adapter.buildQuery('inventory_items')
          .update(dbUpdates)
          .eq('id', id)
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const itemArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformInventoryItemFromDb(itemArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<InventoryItem>;
  }

  /**
   * Delete an inventory item (soft delete by default, hard delete for admins)
   */
  async deleteInventoryItem(id: string, hardDelete = false): Promise<ApiResponse<{ deleted: boolean }>> {
    // 1. Validate ID
    const validationResult = validateParams(InventoryIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Check if item can be deleted
    const existingItemResponse = await this.getInventoryItemById(id);
    if (!existingItemResponse.success) {
      return existingItemResponse;
    }

    const existingItem = existingItemResponse.data;
    const businessRuleCheck = validateInventoryBusinessRules.canDelete(existingItem);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Cannot Delete Item',
          status: 400,
          detail: businessRuleCheck.reason || 'Inventory item cannot be deleted',
          instance: `/api/inventory/${id}`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    if (hardDelete) {
      // 3. Hard delete (admin only)
      const response = await this.adapter.executeQuery(
        {
          tableName: 'inventory_items',
          requiredRole: UserRole.ADMIN,
          rateLimitKey: 'inventory:delete',
          enableLogging: true,
        },
        async () => {
          return this.adapter.buildQuery('inventory_items')
            .delete()
            .eq('id', id);
        },
        'write'
      );

      if (response.success) {
        return {
          ...response,
          data: { deleted: true }
        };
      }
      return response as ApiResponse<{ deleted: boolean }>;
    } else {
      // 4. Soft delete (set status to discontinued)
      const updateResponse = await this.updateInventoryItem(id, { status: 'discontinued' });
      if (updateResponse.success) {
        return {
          success: true,
          data: { deleted: true },
          meta: updateResponse.meta
        };
      }
      return updateResponse as ApiResponse<{ deleted: boolean }>;
    }
  }

  /**
   * Create an inventory transaction
   */
  async createTransaction(transactionData: CreateTransactionRequest): Promise<ApiResponse<StockTransaction>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateTransactionSchema, transactionData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Verify inventory item exists
    const itemResponse = await this.getInventoryItemById(validatedData.itemId);
    if (!itemResponse.success) {
      return itemResponse as ApiResponse<StockTransaction>;
    }

    const item = itemResponse.data;

    // 3. Apply business rules
    const businessRuleCheck = validateInventoryBusinessRules.validateTransaction(item, validatedData);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Invalid Transaction',
          status: 400,
          detail: businessRuleCheck.reason || 'Transaction violates business rules',
          instance: '/api/inventory/transactions',
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 4. Execute transaction in a database transaction
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_transactions',
        requiredRole: UserRole.STAFF,
        rateLimitKey: 'inventory:transactions:create',
        enableLogging: true,
      },
      async () => {
        // Create transaction record
        const dbData = this.adapter.toSnakeCase({
          itemId: validatedData.itemId,
          type: validatedData.type,
          quantity: validatedData.quantity,
          reason: validatedData.reason,
          reference: validatedData.reference,
          unitCost: validatedData.unitCost,
          totalCost: validatedData.totalCost,
          staffId: validatedData.staffId,
          notes: validatedData.notes,
          metadata: validatedData.metadata,
        });

        // Calculate new stock level
        let newStock = item.currentStock;
        if (['in', 'adjustment_positive'].includes(validatedData.type)) {
          newStock += validatedData.quantity;
        } else if (['out', 'adjustment_negative', 'damaged', 'expired'].includes(validatedData.type)) {
          newStock -= validatedData.quantity;
        } else if (validatedData.type === 'transfer') {
          // For transfers, this would need additional logic for destination tracking
          newStock -= validatedData.quantity;
        }

        // Update inventory item stock level
        await this.adapter.buildQuery('inventory_items')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', validatedData.itemId);

        return this.adapter.buildQuery('inventory_transactions')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const transactionArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformTransactionFromDb(transactionArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<StockTransaction>;
  }

  /**
   * Get inventory transactions for an item
   */
  async getItemTransactions(itemId: string): Promise<ApiResponse<StockTransaction[]>> {
    // 1. Validate item ID
    const validationResult = validateParams(InventoryIdSchema, { id: itemId });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_transactions',
        rateLimitKey: 'inventory:transactions:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('inventory_transactions', {
          select: '*',
          filters: { item_id: itemId },
          orderBy: { column: 'created_at', ascending: false }
        });
      },
      'read'
    );

    if (response.success) {
      const transactions = Array.isArray(response.data) ? response.data : [response.data];
      const transformedTransactions = transactions.map(transaction => 
        this.transformTransactionFromDb(transaction as Record<string, unknown>)
      );
      
      return {
        ...response,
        data: transformedTransactions
      };
    }
    return response as ApiResponse<StockTransaction[]>;
  }

  /**
   * Get inventory categories
   */
  async getCategories(): Promise<ApiResponse<InventoryCategory[]>> {
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_categories',
        rateLimitKey: 'inventory:categories:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('inventory_categories', {
          select: '*',
          orderBy: { column: 'name', ascending: true }
        });
      },
      'read'
    );

    if (response.success) {
      const categories = Array.isArray(response.data) ? response.data : [response.data];
      const transformedCategories = categories.map(category => 
        this.transformCategoryFromDb(category as Record<string, unknown>)
      );
      
      return {
        ...response,
        data: transformedCategories
      };
    }
    return response as ApiResponse<InventoryCategory[]>;
  }

  /**
   * Create inventory category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<InventoryCategory>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateCategorySchema, categoryData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Execute creation
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_categories',
        requiredRole: UserRole.MANAGER, // Manager role required for categories
        rateLimitKey: 'inventory:categories:create',
        enableLogging: true,
      },
      async () => {
        const dbData = this.adapter.toSnakeCase({
          name: validatedData.name,
          description: validatedData.description,
          color: validatedData.color,
          parentId: validatedData.parentId,
        });

        return this.adapter.buildQuery('inventory_categories')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const categoryArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformCategoryFromDb(categoryArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<InventoryCategory>;
  }

  /**
   * Get inventory alerts
   */
  async getAlerts(): Promise<ApiResponse<StockAlert[]>> {
    const response = await this.adapter.executeQuery(
      {
        tableName: 'inventory_items',
        rateLimitKey: 'inventory:alerts:read',
        enableLogging: true,
      },
      async () => {
        // Get items that trigger alerts
        return this.adapter.buildQuery('inventory_items', {
          select: '*',
          orderBy: { column: 'name', ascending: true }
        }).or('current_stock.lte.reorder_point,current_stock.eq.0,current_stock.gte.max_stock');
      },
      'read'
    );

    if (response.success) {
      const items = Array.isArray(response.data) ? response.data : [response.data];
      const alerts: StockAlert[] = items.map(item => {
        const camelItem = this.adapter.toCamelCase(item as Record<string, unknown>);
        
        let type: 'low_stock' | 'out_of_stock' | 'reorder_point' | 'overstock' = 'low_stock';
        let message = '';
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

        if (camelItem.currentStock === 0) {
          type = 'out_of_stock';
          message = `${camelItem.name} is out of stock`;
          severity = 'critical';
        } else if (camelItem.currentStock <= camelItem.reorderPoint) {
          type = 'reorder_point';
          message = `${camelItem.name} has reached reorder point (${camelItem.currentStock} remaining)`;
          severity = 'high';
        } else if (camelItem.currentStock >= camelItem.maxStock) {
          type = 'overstock';
          message = `${camelItem.name} is overstocked (${camelItem.currentStock}/${camelItem.maxStock})`;
          severity = 'low';
        }

        return {
          id: crypto.randomUUID(),
          itemId: camelItem.id as string,
          type,
          message,
          severity,
          threshold: camelItem.reorderPoint as number,
          currentValue: camelItem.currentStock as number,
          createdAt: new Date().toISOString(),
        };
      });
      
      return {
        ...response,
        data: alerts
      };
    }
    return response as ApiResponse<StockAlert[]>;
  }

  /**
   * Calculate item metrics
   */
  async calculateItemMetrics(itemId: string): Promise<ApiResponse<any>> {
    // This would typically involve complex calculations across transactions
    // For now, return a placeholder structure
    return {
      success: true,
      data: {
        turnoverRate: 0,
        averageCost: 0,
        profitMargin: 0,
        daysOfSupply: 0,
        lastRestockDate: null,
        totalValueOnHand: 0
      },
      meta: {
        requestId: crypto.randomUUID(),
        source: 'calculation'
      }
    };
  }

  /**
   * Transform database inventory item to API format
   */
  private transformInventoryItemFromDb(dbItem: Record<string, unknown>): InventoryItem {
    const camelCaseItem = this.adapter.toCamelCase(dbItem);
    
    return {
      id: camelCaseItem.id as string,
      name: camelCaseItem.name as string,
      description: camelCaseItem.description as string || undefined,
      sku: camelCaseItem.sku as string,
      category: camelCaseItem.category as string,
      currentStock: camelCaseItem.currentStock as number,
      minStock: camelCaseItem.minStock as number,
      maxStock: camelCaseItem.maxStock as number,
      reorderPoint: camelCaseItem.reorderPoint as number,
      reorderQuantity: camelCaseItem.reorderQuantity as number,
      unitOfMeasurement: camelCaseItem.unitOfMeasurement as string,
      costPrice: camelCaseItem.costPrice as number,
      sellPrice: camelCaseItem.sellPrice as number || undefined,
      supplier: camelCaseItem.supplier as string || undefined,
      supplierSku: camelCaseItem.supplierSku as string || undefined,
      location: camelCaseItem.location as string || undefined,
      status: camelCaseItem.status as 'active' | 'inactive' | 'discontinued',
      notes: camelCaseItem.notes as string || undefined,
      tags: camelCaseItem.tags as string[] || [],
      createdAt: camelCaseItem.createdAt as string,
      updatedAt: camelCaseItem.updatedAt as string,
      lastStockUpdate: camelCaseItem.lastStockUpdate as string || undefined,
    };
  }

  /**
   * Transform database transaction to API format
   */
  private transformTransactionFromDb(dbTransaction: Record<string, unknown>): StockTransaction {
    const camelCaseTransaction = this.adapter.toCamelCase(dbTransaction);
    
    return {
      id: camelCaseTransaction.id as string,
      itemId: camelCaseTransaction.itemId as string,
      type: camelCaseTransaction.type as 'in' | 'out' | 'adjustment_positive' | 'adjustment_negative' | 'transfer' | 'damaged' | 'expired',
      quantity: camelCaseTransaction.quantity as number,
      reason: camelCaseTransaction.reason as string || undefined,
      reference: camelCaseTransaction.reference as string || undefined,
      unitCost: camelCaseTransaction.unitCost as number || undefined,
      totalCost: camelCaseTransaction.totalCost as number || undefined,
      staffId: camelCaseTransaction.staffId as string,
      notes: camelCaseTransaction.notes as string || undefined,
      metadata: camelCaseTransaction.metadata as Record<string, unknown> || undefined,
      createdAt: camelCaseTransaction.createdAt as string,
    };
  }

  /**
   * Transform database category to API format
   */
  private transformCategoryFromDb(dbCategory: Record<string, unknown>): InventoryCategory {
    const camelCaseCategory = this.adapter.toCamelCase(dbCategory);
    
    return {
      id: camelCaseCategory.id as string,
      name: camelCaseCategory.name as string,
      description: camelCaseCategory.description as string || undefined,
      color: camelCaseCategory.color as string,
      parentId: camelCaseCategory.parentId as string || undefined,
      createdAt: camelCaseCategory.createdAt as string,
      updatedAt: camelCaseCategory.updatedAt as string,
    };
  }
}

// Export a singleton instance
export const inventoryService = new InventoryService(); 