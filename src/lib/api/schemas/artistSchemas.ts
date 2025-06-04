import { z } from 'zod';

// Base Artist schema for common validations (without refine to allow extend/partial)
const ArtistBaseFields = z.object({
  name: z.string()
    .min(1, 'Artist name is required')
    .max(100, 'Artist name must not exceed 100 characters')
    .trim(),
  
  genre: z.string()
    .max(50, 'Genre must not exceed 50 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  bio: z.string()
    .max(2000, 'Bio must not exceed 2000 characters')
    .optional(),
  
  image: z.string()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  status: z.enum(['Confirmed', 'Pending', 'Inquiry', 'Cancelled'])
    .optional()
    .default('Inquiry'),
  
  lastPerformance: z.string()
    .optional(),
  
  nextPerformance: z.string()
    .optional(),
});

// Export base schema with business rule validation
export const ArtistBaseSchema = ArtistBaseFields
.refine((data: {email?: string; phone?: string}) => {
  // Business rule: Artist must have at least one contact method
  return data.email || data.phone;
}, {
  message: 'Artist must have at least one contact method (email or phone)',
  path: ['email']
});

// Social media schema
export const SocialMediaSchema = z.object({
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  youtube: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
  spotify: z.string().url('Invalid Spotify URL').optional().or(z.literal('')),
}).optional();

// Manager schema
export const ManagerSchema = z.object({
  id: z.string().uuid('Invalid manager ID format'),
  title: z.string().min(1, 'Manager title is required').max(100, 'Title must be less than 100 characters'),
  name: z.string().min(1, 'Manager name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
});

// Performance history schema
export const PerformanceHistorySchema = z.object({
  date: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid performance date'),
  venueId: z.string().uuid('Invalid venue ID format'),
  revenue: z.number()
    .min(0, 'Revenue cannot be negative'),
  attendance: z.number()
    .int('Attendance must be a whole number')
    .min(0, 'Attendance cannot be negative'),
  notes: z.string()
    .max(500, 'Performance notes must not exceed 500 characters')
    .optional(),
});

// Create Artist Schema
export const CreateArtistSchema = ArtistBaseFields.extend({
  socialMedia: SocialMediaSchema,
  managers: z.array(ManagerSchema)
    .max(5, 'Maximum 5 managers allowed')
    .optional()
    .default([]),
  performanceHistory: z.array(PerformanceHistorySchema)
    .optional()
    .default([]),
})
.refine((data: {email?: string; phone?: string}) => {
  // Business rule: Artist must have at least one contact method
  return data.email || data.phone;
}, {
  message: 'Artist must have at least one contact method (email or phone)',
  path: ['email']
})
.refine((data: {status?: string; managers?: unknown[]}) => {
  // Business rule: Artist must have at least one manager
  return data.managers && data.managers.length > 0;
}, {
  message: 'Artist must have at least one manager',
  path: ['managers']
});

// Update Artist Schema (all fields optional except business rules)
export const UpdateArtistSchema = ArtistBaseFields.partial().extend({
  id: z.string().uuid('Invalid artist ID format'),
  socialMedia: SocialMediaSchema,
  managers: z.array(ManagerSchema)
    .max(5, 'Maximum 5 managers allowed')
    .optional(),
  performanceHistory: z.array(PerformanceHistorySchema)
    .optional(),
})
.refine((data: {email?: string; phone?: string}) => {
  // Only validate contact requirement if both email and phone are provided as empty
  if (data.email === '' && data.phone === '') {
    return false;
  }
  return true;
}, {
  message: 'Artist must have at least one contact method (email or phone)',
  path: ['email']
})
.refine((data: {status?: string; managers?: unknown[]}) => {
  // Only validate manager requirement if status is being set to 'Confirmed'
  if (data.status === 'Confirmed' && data.managers && data.managers.length === 0) {
    return false;
  }
  return true;
}, {
  message: 'Confirmed artists must have at least one manager',
  path: ['managers']
});

// Artist Query Schema (for filtering and pagination)
export const ArtistQuerySchema = z.object({
  limit: z.number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  
  offset: z.number()
    .int('Offset must be a whole number')
    .min(0, 'Offset cannot be negative')
    .optional()
    .default(0),
  
  status: z.enum(['Confirmed', 'Pending', 'Inquiry', 'Cancelled'])
    .optional(),
  
  genre: z.string()
    .max(50, 'Genre filter must not exceed 50 characters')
    .optional(),
  
  location: z.string()
    .max(100, 'Location filter must not exceed 100 characters')
    .optional(),
  
  hasUpcomingPerformances: z.boolean()
    .optional(),
  
  search: z.string()
    .max(100, 'Search term must not exceed 100 characters')
    .optional(),
});

// Artist ID Parameter Schema
export const ArtistIdSchema = z.object({
  id: z.string().uuid('Invalid artist ID format'),
});

// Manager validation schema for adding/updating managers
export const AddManagerSchema = z.object({
  artistId: z.string().uuid('Invalid artist ID format'),
  manager: ManagerSchema.omit({ id: true }),
});

// Performance booking schema
export const BookPerformanceSchema = z.object({
  artistId: z.string().uuid('Invalid artist ID format'),
  venueId: z.string().uuid('Invalid venue ID format'),
  eventId: z.string().uuid('Invalid event ID format'),
  performanceDate: z.string()
    .refine((date) => {
      const perfDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return perfDate >= today;
    }, 'Performance date must be today or in the future'),
  fee: z.number()
    .min(0, 'Performance fee cannot be negative')
    .max(1000000, 'Performance fee cannot exceed $1,000,000'),
});

// TypeScript types derived from schemas
export type CreateArtistRequest = z.infer<typeof CreateArtistSchema>;
export type UpdateArtistRequest = z.infer<typeof UpdateArtistSchema>;
export type ArtistQueryRequest = z.infer<typeof ArtistQuerySchema>;
export type ArtistIdRequest = z.infer<typeof ArtistIdSchema>;
export type AddManagerRequest = z.infer<typeof AddManagerSchema>;
export type BookPerformanceRequest = z.infer<typeof BookPerformanceSchema>;

// Enhanced Artist type (what we return from API)
export interface Artist {
  id: string;
  name: string;
  genre?: string;
  location?: string;
  email?: string;
  phone?: string;
  bio?: string;
  image?: string;
  status: 'Confirmed' | 'Pending' | 'Inquiry' | 'Cancelled';
  lastPerformance?: string;
  nextPerformance?: string;
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
  performanceHistory?: Array<{
    date: string;
    venueId: string;
    revenue: number;
    attendance: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  metrics?: {
    totalPerformances: number;
    totalRevenue: number;
    averageAttendance: number;
    lastPerformanceDate?: string;
    nextPerformanceDate?: string;
  };
}

// Business rule validation utilities
export const validateArtistBusinessRules = {
  /**
   * Check if an artist can be booked for performances
   */
  canBook: (): { valid: boolean; reason?: string } => {
    // Always allow booking - this could be extended with specific business logic
    return { valid: true };
  },

  /**
   * Check if an artist can be edited
   */
  canEdit: (artist: Artist): { valid: boolean; reason?: string } => {
    // Artists can generally be edited unless they have an upcoming confirmed performance

    if (artist.status === 'Confirmed' && artist.nextPerformance) {
      const nextPerfDate = new Date(artist.nextPerformance);
      const now = new Date();

      // Restrict edits if the next performance is within the next 7 days
      if (nextPerfDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return {
          valid: false,
          reason: 'Artist with an imminent performance cannot be edited'
        };
      }
    }

    return { valid: true };
  },

  /**
   * Check if an artist can be deleted
   */
  canDelete: (artist: Artist): { valid: boolean; reason?: string } => {
    if (artist.metrics && artist.metrics.totalPerformances > 0) {
      return {
        valid: false,
        reason: 'Cannot delete artist with performance history'
      };
    }
    return { valid: true };
  },

  /**
   * Check if an artist can have their status changed
   */
  canChangeStatus: (artist: Artist, newStatus: string): { valid: boolean; reason?: string } => {
    if (newStatus === 'Confirmed' && (!artist.managers || artist.managers.length === 0)) {
      return { 
        valid: false, 
        reason: 'Artist must have at least one manager to be confirmed' 
      };
    }
    
    if (newStatus === 'Cancelled' && artist.nextPerformance) {
      const nextPerfDate = new Date(artist.nextPerformance);
      const now = new Date();
      if (nextPerfDate > now) {
        return { 
          valid: false, 
          reason: 'Cannot cancel artist with upcoming performances' 
        };
      }
    }
    
    return { valid: true };
  },

  /**
   * Check if an artist has complete profile information
   */
  hasCompleteProfile: (artist: Artist): { valid: boolean; missing?: string[] } => {
    const missing: string[] = [];
    
    if (!artist.email && !artist.phone) {
      missing.push('contact information');
    }
    
    if (!artist.genre) {
      missing.push('genre');
    }
    
    if (!artist.bio || artist.bio.length < 50) {
      missing.push('detailed bio');
    }
    
    if (!artist.image) {
      missing.push('profile image');
    }
    
    if (!artist.managers || artist.managers.length === 0) {
      missing.push('manager information');
    }
    
    return {
      valid: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined
    };
  }
}; 