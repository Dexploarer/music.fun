/**
 * Venue Service - Implementing API Standards
 * Demonstrates proper use of validation, error handling, and typing
 */

import { supabase } from '../../supabase';
import { VenueSchema, ValidationMiddleware } from '../validation';
import { ApiErrorBase, NotFoundError, ValidationErrorClass } from '../errors';
import { ApiResponse, buildSuccessResponse, buildPaginationMeta } from '../types';
import { generateRequestId } from '../types';

// Basic venue interface
export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  capacity: number;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueListResponse {
  venues: Venue[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export class VenueService {
  /**
   * Get all venues with basic pagination
   */
  async getVenues(page = 1, per_page = 20): Promise<ApiResponse<VenueListResponse>> {
    const requestId = generateRequestId();
    
    try {
      // Build query with pagination
      const from = (page - 1) * per_page;
      const to = from + per_page - 1;
      
      const { data, error, count } = await supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .order('name')
        .range(from, to);

      if (error) {
        throw new ApiErrorBase('EXTERNAL_SERVICE_ERROR', `Database error: ${error.message}`);
      }

      const total = count || 0;
      const total_pages = Math.ceil(total / per_page);

      const responseData: VenueListResponse = {
        venues: data || [],
        total,
        page,
        per_page,
        total_pages
      };

      return buildSuccessResponse(responseData, requestId, {
        message: 'Venues retrieved successfully',
        pagination: buildPaginationMeta(page, per_page, total),
        cache: { cache_hit: false }
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to fetch venues');
    }
  }

  /**
   * Get a single venue by ID
   */
  async getVenue(id: string): Promise<ApiResponse<Venue>> {
    const requestId = generateRequestId();

    try {
      // Validate UUID format
      if (!this.isValidUuid(id)) {
        throw new ValidationErrorClass([{
          field: 'id',
          code: 'invalid_format',
          message: 'Invalid venue ID format',
          value: id
        }]);
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('venue');
        }
        throw new ApiErrorBase('EXTERNAL_SERVICE_ERROR', `Database error: ${error.message}`);
      }

      return buildSuccessResponse(data, requestId, {
        message: 'Venue retrieved successfully'
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to fetch venue');
    }
  }

  /**
   * Create a new venue
   */
  async createVenue(venueData: unknown): Promise<ApiResponse<Venue>> {
    const requestId = generateRequestId();

    try {
      // Validate input data using our API standards
      const validatedData = ValidationMiddleware.validateBody(VenueSchema, venueData);

      // Check for duplicate venue name in same city
      const { data: existingVenue } = await supabase
        .from('venues')
        .select('id')
        .eq('name', validatedData.name)
        .eq('city', validatedData.city)
        .single();

      if (existingVenue) {
        throw new ValidationErrorClass([{
          field: 'name',
          code: 'duplicate_value',
          message: 'A venue with this name already exists in this city',
          value: validatedData.name
        }]);
      }

      // Insert with timestamps
      const { data, error } = await supabase
        .from('venues')
        .insert({
          ...validatedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new ApiErrorBase('EXTERNAL_SERVICE_ERROR', `Database error: ${error.message}`);
      }

      return buildSuccessResponse(data, requestId, {
        message: 'Venue created successfully'
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to create venue');
    }
  }

  /**
   * Update an existing venue
   */
  async updateVenue(id: string, venueData: unknown): Promise<ApiResponse<Venue>> {
    const requestId = generateRequestId();

    try {
      // Validate UUID format
      if (!this.isValidUuid(id)) {
        throw new ValidationErrorClass([{
          field: 'id',
          code: 'invalid_format',
          message: 'Invalid venue ID format',
          value: id
        }]);
      }

      // Validate input data (allow partial updates)
      const partialVenueSchema = VenueSchema.partial();
      const validatedData = ValidationMiddleware.validateBody(partialVenueSchema, venueData);

      // Check if venue exists
      await this.getVenue(id); // This will throw if not found

      // Check for duplicate name if name is being updated
      if (validatedData.name) {
        const { data: existingVenue } = await supabase
          .from('venues')
          .select('id')
          .eq('name', validatedData.name)
          .eq('city', validatedData.city || '')
          .neq('id', id)
          .single();

        if (existingVenue) {
          throw new ValidationErrorClass([{
            field: 'name',
            code: 'duplicate_value',
            message: 'A venue with this name already exists in this city',
            value: validatedData.name
          }]);
        }
      }

      // Prepare update data
      const updateData: Venue = {
        ...validatedData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('venues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new ApiErrorBase('EXTERNAL_SERVICE_ERROR', `Database error: ${error.message}`);
      }

      return buildSuccessResponse(data, requestId, {
        updated: true
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to update venue');
    }
  }

  /**
   * Delete a venue
   */
  async deleteVenue(id: string): Promise<ApiResponse<null>> {
    const requestId = generateRequestId();

    try {
      // Validate UUID format
      if (!this.isValidUuid(id)) {
        throw new ValidationErrorClass([{
          field: 'id',
          code: 'invalid_format',
          message: 'Invalid venue ID format',
          value: id
        }]);
      }

      // Check if venue exists
      await this.getVenue(id); // This will throw if not found

      // Check for dependent records (events)
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('venue_id', id)
        .limit(1);

      if (events && events.length > 0) {
        throw new ValidationErrorClass([{
          field: 'id',
          code: 'has_dependencies',
          message: 'Cannot delete venue that has associated events',
          value: id
        }]);
      }

      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (error) {
        throw new ApiErrorBase('EXTERNAL_SERVICE_ERROR', `Database error: ${error.message}`);
      }

      return buildSuccessResponse(null, requestId, {
        deleted: true
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to delete venue');
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateVenues(updates: Array<{ id: string; data: unknown }>): Promise<ApiResponse<Venue[]>> {
    const requestId = generateRequestId();

    try {
      if (updates.length === 0) {
        throw new ValidationErrorClass([{
          field: 'updates',
          code: 'required',
          message: 'At least one update is required',
          value: updates
        }]);
      }

      if (updates.length > 100) {
        throw new ValidationErrorClass([{
          field: 'updates',
          code: 'too_many',
          message: 'Maximum 100 updates allowed',
          value: updates.length
        }]);
      }

      const results: Venue[] = [];

      // Process updates sequentially to maintain consistency
      for (const update of updates) {
        try {
          const result = await this.updateVenue(update.id, update.data);
          results.push(result.data);
        } catch (error) {
          // Continue with other updates but log the error
          console.error(`Failed to update venue ${update.id}:`, error);
        }
      }

      return buildSuccessResponse(results, requestId, {
        processed: updates.length,
        successful: results.length,
        failed: updates.length - results.length
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to bulk update venues');
    }
  }

  /**
   * Get venue statistics
   */
  async getVenueStats(): Promise<ApiResponse<{
    total_venues: number;
    active_venues: number;
    inactive_venues: number;
    average_capacity: number;
    top_cities: Array<{ city: string; count: number }>;
  }>> {
    const requestId = generateRequestId();

    try {
      // Get basic counts
      const { data: totalCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

      const { data: activeCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get average capacity
      const { data: capacityData } = await supabase
        .from('venues')
        .select('capacity');

      const averageCapacity = capacityData?.length 
        ? capacityData.reduce((sum, venue) => sum + (venue.capacity || 0), 0) / capacityData.length
        : 0;

      // Get top cities
      const { data: cityData } = await supabase
        .from('venues')
        .select('city')
        .not('city', 'is', null);

      const cityCounts: Record<string, number> = {};
      cityData?.forEach(venue => {
        if (venue.city) {
          cityCounts[venue.city] = (cityCounts[venue.city] || 0) + 1;
        }
      });

      const topCities = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const stats = {
        total_venues: totalCount?.length || 0,
        active_venues: activeCount?.length || 0,
        inactive_venues: (totalCount?.length || 0) - (activeCount?.length || 0),
        average_capacity: Math.round(averageCapacity),
        top_cities: topCities
      };

      return buildSuccessResponse(stats, requestId, {
        cache_recommended: true,
        cache_ttl: 300000 // 5 minutes
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        throw error;
      }
      throw new ApiErrorBase('INTERNAL_SERVER_ERROR', 'Failed to get venue statistics');
    }
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

// Export singleton instance for easy use
export const venueService = new VenueService(); 