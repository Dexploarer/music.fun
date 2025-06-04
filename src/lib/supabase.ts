import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import type { 
  Event, 
  Artist, 
  MarketingCampaign, 
  Ticket, 
  FinancialTransaction, 
  EventRevenue, 
  EventExpenses,
  Document,
  Task,
  Customer,
  CustomerInteraction,
  InventoryCategory,
  InventoryItem,
  InventoryTransaction,
  EventReview,
  FeedbackResponse,
  FeedbackQuestion,
  ArtistContract,
  ArtistPayment,
  RoyaltyReport,
  AnalyticsMetric,
  CustomDashboard,
  DashboardWidget
} from '../types/index';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Add console logging for debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables', { 
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Events API
export const eventsApi = {
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
    return data;
  },

  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_revenue(*),
        event_expenses(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createEvent(event: Omit<Event, 'id'>) {
    // Check auth status before making the request
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log authentication status for debugging
    if (!session) {
      console.warn('No active session found, user is not authenticated');
      throw new Error('Authentication required to create events. Please log in.');
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        description: event.description,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        artist_ids: event.artistIds || [],
        tickets_sold: event.ticketsSold || 0,
        total_capacity: event.totalCapacity,
        ticket_price: event.ticketPrice,
        status: event.status || 'upcoming',
        image: event.image,
        genre: event.genre
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    return data;
  },

  async updateEvent(id: string, updates: Partial<Event>) {
    // Check auth status before making the request
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log authentication status for debugging
    if (!session) {
      console.warn('No active session found, user is not authenticated');
      throw new Error('Authentication required to update events. Please log in.');
    }
    
    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEvent(id: string) {
    // Check auth status before making the request
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log authentication status for debugging
    if (!session) {
      console.warn('No active session found, user is not authenticated');
      throw new Error('Authentication required to delete events. Please log in.');
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Artists API
export const artistsApi = {
  async getArtists() {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getArtistById(id: string) {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createArtist(artist: Omit<Artist, 'id'>) {
    const { data, error } = await supabase
      .from('artists')
      .insert([{
        name: artist.name,
        genre: artist.genre,
        location: artist.location,
        email: artist.email,
        phone: artist.phone,
        image: artist.image,
        bio: artist.bio,
        last_performance: artist.lastPerformance,
        next_performance: artist.nextPerformance,
        status: artist.status,
        social_media: artist.socialMedia || {}
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateArtist(id: string, updates: Partial<Artist>) {
    // Convert from camelCase to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.genre) dbUpdates.genre = updates.genre;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.image) dbUpdates.image = updates.image;
    if (updates.bio) dbUpdates.bio = updates.bio;
    if (updates.lastPerformance) dbUpdates.last_performance = updates.lastPerformance;
    if (updates.nextPerformance) dbUpdates.next_performance = updates.nextPerformance;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.socialMedia) dbUpdates.social_media = updates.socialMedia;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('artists')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteArtist(id: string) {
    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Marketing API
export const marketingApi = {
  async getCampaigns() {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*, events(title)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getCampaignById(id: string) {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*, events(title)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createCampaign(campaign: Omit<MarketingCampaign, 'id'>) {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert([{
        title: campaign.title,
        description: campaign.description,
        date: campaign.date,
        platforms: campaign.platforms,
        status: campaign.status,
        event_id: campaign.eventId,
        content: campaign.content,
        performance: campaign.performance
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCampaign(id: string, updates: Partial<MarketingCampaign>) {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Ticketing API
export const ticketingApi = {
  async getTickets(eventId?: string) {
    let query = supabase
      .from('tickets')
      .select('*, events(title)')
      .order('purchase_date', { ascending: false });
      
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getTicketById(id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTicket(ticket: Omit<Ticket, 'id'>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        event_id: ticket.eventId,
        purchase_date: ticket.purchaseDate || new Date().toISOString(),
        purchaser_name: ticket.purchaserName,
        purchaser_email: ticket.purchaserEmail,
        price: ticket.price,
        type: ticket.type || 'general',
        status: ticket.status || 'valid'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTicket(id: string, updates: Partial<Ticket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async scanTicket(id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        status: 'used',
        scanned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTicket(id: string) {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Finances API
export const financesApi = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*, events(title), artists(name)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getTransactionById(id: string) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*, events(title), artists(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<FinancialTransaction, 'id'>) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([{
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        event_id: transaction.eventId,
        artist_id: transaction.artistId,
        notes: transaction.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: Partial<FinancialTransaction>) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async getEventRevenue(eventId: string) {
    const { data, error } = await supabase
      .from('event_revenue')
      .select('*')
      .eq('event_id', eventId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateEventRevenue(eventId: string, updates: Partial<EventRevenue>) {
    // Check if revenue record exists
    const existingRevenue = await this.getEventRevenue(eventId);
    
    if (existingRevenue) {
      // Update existing record
      const { data, error } = await supabase
        .from('event_revenue')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('event_revenue')
        .insert([{
          event_id: eventId,
          tickets: updates.tickets || 0,
          bar: updates.bar || 0,
          merchandise: updates.merchandise || 0,
          other: updates.other || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async getEventExpenses(eventId: string) {
    const { data, error } = await supabase
      .from('event_expenses')
      .select('*')
      .eq('event_id', eventId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateEventExpenses(eventId: string, updates: Partial<EventExpenses>) {
    // Check if expenses record exists
    const existingExpenses = await this.getEventExpenses(eventId);
    
    if (existingExpenses) {
      // Update existing record
      const { data, error } = await supabase
        .from('event_expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('event_expenses')
        .insert([{
          event_id: eventId,
          artists: updates.artists || 0,
          staff: updates.staff || 0,
          marketing: updates.marketing || 0,
          other: updates.other || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

// Documents API
export const documentsApi = {
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    // Handle file upload if present
    let content = document.content;
    
    if (document.file) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .upload(`${Date.now()}-${document.file.name}`, document.file);
      
      if (fileError) throw fileError;
      
      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(fileData.path);
      
      content = urlData.publicUrl;
    }
    
    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        name: document.name,
        type: document.type,
        description: document.description,
        content: content,
        file_type: document.fileType,
        file_size: document.fileSize,
        created_by: document.createdBy,
        tags: document.tags || [],
        is_template: document.isTemplate || false,
        related_entity_id: document.relatedEntityId,
        related_entity_type: document.relatedEntityType
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateDocument(id: string, updates: Partial<Document>) {
    // Convert from camelCase to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.fileType !== undefined) dbUpdates.file_type = updates.fileType;
    if (updates.fileSize !== undefined) dbUpdates.file_size = updates.fileSize;
    if (updates.tags) dbUpdates.tags = updates.tags;
    if (updates.isTemplate !== undefined) dbUpdates.is_template = updates.isTemplate;
    if (updates.relatedEntityId !== undefined) dbUpdates.related_entity_id = updates.relatedEntityId;
    if (updates.relatedEntityType !== undefined) dbUpdates.related_entity_type = updates.relatedEntityType;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('documents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDocument(id: string) {
    // First get the document to check if there's a file to delete
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('content')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If there's a file in storage, delete it
    if (document.content && document.content.includes('storage.supabase.co')) {
      const path = document.content.split('/').pop();
      if (path) {
        const { error: deleteFileError } = await supabase.storage
          .from('documents')
          .remove([path]);
          
        if (deleteFileError) throw deleteFileError;
      }
    }
    
    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get template documents
  async getTemplates(type?: string) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('is_template', true)
      .order('name', { ascending: true });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }
};

// Tasks API for Kanban board
export const tasksApi = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    // Get the maximum position for the current status to place the new task at the end
    const { data: tasksInStatus, error: positionError } = await supabase
      .from('tasks')
      .select('position')
      .eq('status', task.status)
      .order('position', { ascending: false })
      .limit(1);
    
    const nextPosition = tasksInStatus && tasksInStatus.length > 0
      ? (tasksInStatus[0].position + 1)
      : 0;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.dueDate,
        assigned_to: task.assignedTo,
        tags: task.tags || [],
        related_entity_id: task.relatedEntityId,
        related_entity_type: task.relatedEntityType,
        position: nextPosition
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    // Convert from camelCase to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.relatedEntityId !== undefined) dbUpdates.related_entity_id = updates.relatedEntityId;
    if (updates.relatedEntityType !== undefined) dbUpdates.related_entity_type = updates.relatedEntityType;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  async reorderTasks(tasks: { id: string, position: number }[]) {
    // Use upsert to update multiple tasks at once
    const updates = tasks.map(task => ({
      id: task.id,
      position: task.position,
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('tasks')
      .upsert(updates);
    
    if (error) throw error;
    return true;
  },
  
  async moveTask(id: string, newStatus: string, newPosition: number) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        position: newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Customer Relationship Management API
export const crmApi = {
  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(customer => ({
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      notes: customer.notes,
      birthday: customer.birthday,
      customerSince: customer.customer_since,
      lastVisit: customer.last_visit,
      tags: customer.tags || [],
      marketingPreferences: {
        emailPromotions: customer.marketing_preferences.email_promotions,
        smsNotifications: customer.marketing_preferences.sms_notifications,
        newsletter: customer.marketing_preferences.newsletter,
        specialEvents: customer.marketing_preferences.special_events,
        unsubscribed: customer.marketing_preferences.unsubscribed
      },
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    }));
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      notes: data.notes,
      birthday: data.birthday,
      customerSince: data.customer_since,
      lastVisit: data.last_visit,
      tags: data.tags || [],
      marketingPreferences: {
        emailPromotions: data.marketing_preferences.email_promotions,
        smsNotifications: data.marketing_preferences.sms_notifications,
        newsletter: data.marketing_preferences.newsletter,
        specialEvents: data.marketing_preferences.special_events,
        unsubscribed: data.marketing_preferences.unsubscribed
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        notes: customer.notes,
        birthday: customer.birthday,
        customer_since: customer.customerSince || new Date().toISOString().split('T')[0],
        last_visit: customer.lastVisit,
        tags: customer.tags || [],
        marketing_preferences: {
          email_promotions: customer.marketingPreferences?.emailPromotions ?? true,
          sms_notifications: customer.marketingPreferences?.smsNotifications ?? false,
          newsletter: customer.marketingPreferences?.newsletter ?? true,
          special_events: customer.marketingPreferences?.specialEvents ?? true,
          unsubscribed: customer.marketingPreferences?.unsubscribed ?? false
        }
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      notes: data.notes,
      birthday: data.birthday,
      customerSince: data.customer_since,
      lastVisit: data.last_visit,
      tags: data.tags || [],
      marketingPreferences: {
        emailPromotions: data.marketing_preferences.email_promotions,
        smsNotifications: data.marketing_preferences.sms_notifications,
        newsletter: data.marketing_preferences.newsletter,
        specialEvents: data.marketing_preferences.special_events,
        unsubscribed: data.marketing_preferences.unsubscribed
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const dbUpdates: any = {};
    
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.zip !== undefined) dbUpdates.zip = updates.zip;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.birthday !== undefined) dbUpdates.birthday = updates.birthday;
    if (updates.customerSince !== undefined) dbUpdates.customer_since = updates.customerSince;
    if (updates.lastVisit !== undefined) dbUpdates.last_visit = updates.lastVisit;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    
    // Handle marketing preferences
    if (updates.marketingPreferences) {
      const marketingPreferences: any = {};
      
      if (updates.marketingPreferences.emailPromotions !== undefined) 
        marketingPreferences.email_promotions = updates.marketingPreferences.emailPromotions;
      
      if (updates.marketingPreferences.smsNotifications !== undefined) 
        marketingPreferences.sms_notifications = updates.marketingPreferences.smsNotifications;
      
      if (updates.marketingPreferences.newsletter !== undefined) 
        marketingPreferences.newsletter = updates.marketingPreferences.newsletter;
      
      if (updates.marketingPreferences.specialEvents !== undefined) 
        marketingPreferences.special_events = updates.marketingPreferences.specialEvents;
      
      if (updates.marketingPreferences.unsubscribed !== undefined) 
        marketingPreferences.unsubscribed = updates.marketingPreferences.unsubscribed;
      
      // Get existing preferences to merge with updates
      const { data: currentCustomer } = await supabase
        .from('customers')
        .select('marketing_preferences')
        .eq('id', id)
        .single();
        
      if (currentCustomer) {
        dbUpdates.marketing_preferences = {
          ...currentCustomer.marketing_preferences,
          ...marketingPreferences
        };
      }
    }
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('customers')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      notes: data.notes,
      birthday: data.birthday,
      customerSince: data.customer_since,
      lastVisit: data.last_visit,
      tags: data.tags || [],
      marketingPreferences: {
        emailPromotions: data.marketing_preferences.email_promotions,
        smsNotifications: data.marketing_preferences.sms_notifications,
        newsletter: data.marketing_preferences.newsletter,
        specialEvents: data.marketing_preferences.special_events,
        unsubscribed: data.marketing_preferences.unsubscribed
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Customer Interactions
  async getCustomerInteractions(customerId?: string) {
    let query = supabase
      .from('customer_interactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(interaction => ({
      id: interaction.id,
      customerId: interaction.customer_id,
      type: interaction.type as 'call' | 'email' | 'meeting' | 'event' | 'purchase' | 'note' | 'other',
      date: interaction.date,
      description: interaction.description,
      staffMember: interaction.staff_member,
      relatedEntityId: interaction.related_entity_id,
      relatedEntityType: interaction.related_entity_type,
      createdAt: interaction.created_at,
      updatedAt: interaction.updated_at
    }));
  },

  async createInteraction(interaction: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert([{
        customer_id: interaction.customerId,
        type: interaction.type,
        date: interaction.date || new Date().toISOString(),
        description: interaction.description,
        staff_member: interaction.staffMember,
        related_entity_id: interaction.relatedEntityId,
        related_entity_type: interaction.relatedEntityType
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      customerId: data.customer_id,
      type: data.type as 'call' | 'email' | 'meeting' | 'event' | 'purchase' | 'note' | 'other',
      date: data.date,
      description: data.description,
      staffMember: data.staff_member,
      relatedEntityId: data.related_entity_id,
      relatedEntityType: data.related_entity_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteInteraction(id: string) {
    const { error } = await supabase
      .from('customer_interactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Inventory Management API
export const inventoryApi = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }));
  },

  async createCategory(category: Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert([{
        name: category.name,
        description: category.description
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateCategory(id: string, updates: Partial<InventoryCategory>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Inventory Items
  async getInventoryItems() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, inventory_categories(name, description)')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description,
      categoryId: item.category_id,
      categoryName: item.inventory_categories?.name,
      unitPrice: item.unit_price,
      costPrice: item.cost_price,
      currentStock: item.current_stock,
      reorderLevel: item.reorder_level,
      vendor: item.vendor,
      imageUrl: item.image_url,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async getInventoryItemById(id: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, inventory_categories(name, description)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      description: data.description,
      categoryId: data.category_id,
      categoryName: data.inventory_categories?.name,
      unitPrice: data.unit_price,
      costPrice: data.cost_price,
      currentStock: data.current_stock,
      reorderLevel: data.reorder_level,
      vendor: data.vendor,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: item.name,
        sku: item.sku,
        description: item.description,
        category_id: item.categoryId,
        unit_price: item.unitPrice,
        cost_price: item.costPrice,
        current_stock: item.currentStock || 0,
        reorder_level: item.reorderLevel || 10,
        vendor: item.vendor,
        image_url: item.imageUrl,
        is_active: item.isActive !== undefined ? item.isActive : true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      description: data.description,
      categoryId: data.category_id,
      unitPrice: data.unit_price,
      costPrice: data.cost_price,
      currentStock: data.current_stock,
      reorderLevel: data.reorder_level,
      vendor: data.vendor,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
    if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
    if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock;
    if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel;
    if (updates.vendor !== undefined) dbUpdates.vendor = updates.vendor;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      description: data.description,
      categoryId: data.category_id,
      unitPrice: data.unit_price,
      costPrice: data.cost_price,
      currentStock: data.current_stock,
      reorderLevel: data.reorder_level,
      vendor: data.vendor,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteInventoryItem(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Inventory Transactions
  async getInventoryTransactions(itemId?: string) {
    let query = supabase
      .from('inventory_transactions')
      .select('*, inventory_items(name)')
      .order('transaction_date', { ascending: false });
      
    if (itemId) {
      query = query.eq('item_id', itemId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(transaction => ({
      id: transaction.id,
      itemId: transaction.item_id,
      itemName: transaction.inventory_items?.name,
      transactionType: transaction.transaction_type as 'purchase' | 'sale' | 'waste' | 'adjustment_add' | 'adjustment_remove',
      quantity: transaction.quantity,
      transactionDate: transaction.transaction_date,
      notes: transaction.notes,
      relatedEntityId: transaction.related_entity_id,
      relatedEntityType: transaction.related_entity_type,
      createdBy: transaction.created_by,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    }));
  },

  async createInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert([{
        item_id: transaction.itemId,
        transaction_type: transaction.transactionType,
        quantity: transaction.quantity,
        transaction_date: transaction.transactionDate || new Date().toISOString(),
        notes: transaction.notes,
        related_entity_id: transaction.relatedEntityId,
        related_entity_type: transaction.relatedEntityType,
        created_by: transaction.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      itemId: data.item_id,
      transactionType: data.transaction_type as 'purchase' | 'sale' | 'waste' | 'adjustment_add' | 'adjustment_remove',
      quantity: data.quantity,
      transactionDate: data.transaction_date,
      notes: data.notes,
      relatedEntityId: data.related_entity_id,
      relatedEntityType: data.related_entity_type,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Get low stock items
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*, inventory_categories(name)')
      .filter('current_stock', 'lt', 'reorder_level')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description,
      categoryId: item.category_id,
      categoryName: item.inventory_categories?.name,
      unitPrice: item.unit_price,
      costPrice: item.cost_price,
      currentStock: item.current_stock,
      reorderLevel: item.reorder_level,
      vendor: item.vendor,
      imageUrl: item.image_url,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }
};

// Event Reviews API
export const reviewsApi = {
  async getEventReviews(eventId?: string) {
    let query = supabase
      .from('event_reviews')
      .select('*, events(title), customers(first_name, last_name)')
      .order('review_date', { ascending: false });
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(review => ({
      id: review.id,
      eventId: review.event_id,
      eventTitle: review.events?.title,
      customerId: review.customer_id,
      customerName: review.customer_id ? 
        `${review.customers?.first_name} ${review.customers?.last_name}` : null,
      rating: review.rating,
      reviewText: review.review_text,
      attendanceConfirmed: review.attendance_confirmed,
      reviewDate: review.review_date,
      sentiment: review.sentiment,
      tags: review.tags || [],
      createdAt: review.created_at,
      updatedAt: review.updated_at
    }));
  },

  async getReviewById(id: string) {
    const { data, error } = await supabase
      .from('event_reviews')
      .select('*, events(title), customers(first_name, last_name), feedback_responses(*, feedback_questions(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      eventId: data.event_id,
      eventTitle: data.events?.title,
      customerId: data.customer_id,
      customerName: data.customer_id ? 
        `${data.customers?.first_name} ${data.customers?.last_name}` : null,
      rating: data.rating,
      reviewText: data.review_text,
      attendanceConfirmed: data.attendance_confirmed,
      reviewDate: data.review_date,
      sentiment: data.sentiment,
      tags: data.tags || [],
      responses: data.feedback_responses,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createEventReview(review: Omit<EventReview, 'id' | 'createdAt' | 'updatedAt'>, responses?: Omit<FeedbackResponse, 'id' | 'reviewId' | 'createdAt'>[]) {
    const { data, error } = await supabase
      .from('event_reviews')
      .insert([{
        event_id: review.eventId,
        customer_id: review.customerId,
        rating: review.rating,
        review_text: review.reviewText,
        attendance_confirmed: review.attendanceConfirmed,
        review_date: review.reviewDate || new Date().toISOString(),
        sentiment: review.sentiment,
        tags: review.tags || []
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // If there are responses, add them
    if (responses && responses.length > 0 && data) {
      const responsesWithReviewId = responses.map(response => ({
        review_id: data.id,
        question_id: response.questionId,
        response_text: response.responseText,
        response_rating: response.responseRating,
        response_option: response.responseOption
      }));
      
      const { error: responseError } = await supabase
        .from('feedback_responses')
        .insert(responsesWithReviewId);
      
      if (responseError) throw responseError;
    }
    
    return data;
  },

  async updateEventReview(id: string, updates: Partial<EventReview>) {
    const dbUpdates: any = {};
    
    if (updates.eventId !== undefined) dbUpdates.event_id = updates.eventId;
    if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId;
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
    if (updates.reviewText !== undefined) dbUpdates.review_text = updates.reviewText;
    if (updates.attendanceConfirmed !== undefined) dbUpdates.attendance_confirmed = updates.attendanceConfirmed;
    if (updates.reviewDate !== undefined) dbUpdates.review_date = updates.reviewDate;
    if (updates.sentiment !== undefined) dbUpdates.sentiment = updates.sentiment;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('event_reviews')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  async deleteEventReview(id: string) {
    // Note: Responses will be deleted automatically due to ON DELETE CASCADE
    const { error } = await supabase
      .from('event_reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Feedback Questions
  async getFeedbackQuestions() {
    const { data, error } = await supabase
      .from('feedback_questions')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    return data.map(question => ({
      id: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      options: question.options || [],
      isRequired: question.is_required,
      active: question.active,
      displayOrder: question.display_order,
      createdAt: question.created_at,
      updatedAt: question.updated_at
    }));
  },

  async createFeedbackQuestion(question: Omit<FeedbackQuestion, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('feedback_questions')
      .insert([{
        question_text: question.questionText,
        question_type: question.questionType,
        options: question.options,
        is_required: question.isRequired,
        active: question.active,
        display_order: question.displayOrder
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      questionText: data.question_text,
      questionType: data.question_type,
      options: data.options || [],
      isRequired: data.is_required,
      active: data.active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// Artist Contracts and Payments API
export const artistContractsApi = {
  // Contracts
  async getArtistContracts(artistId?: string) {
    let query = supabase
      .from('artist_contracts')
      .select('*, artists(name), documents(name)')
      .order('start_date', { ascending: false });
    
    if (artistId) {
      query = query.eq('artist_id', artistId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(contract => ({
      id: contract.id,
      artistId: contract.artist_id,
      artistName: contract.artists?.name,
      contractName: contract.contract_name,
      contractType: contract.contract_type,
      startDate: contract.start_date,
      endDate: contract.end_date,
      paymentType: contract.payment_type,
      flatFeeAmount: contract.flat_fee_amount,
      percentageRate: contract.percentage_rate,
      minimumGuarantee: contract.minimum_guarantee,
      paymentSchedule: contract.payment_schedule,
      status: contract.status,
      contractDocumentId: contract.contract_document_id,
      contractDocumentName: contract.documents?.name,
      notes: contract.notes,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at
    }));
  },

  async getContractById(id: string) {
    const { data, error } = await supabase
      .from('artist_contracts')
      .select('*, artists(name), documents(name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      artistId: data.artist_id,
      artistName: data.artists?.name,
      contractName: data.contract_name,
      contractType: data.contract_type,
      startDate: data.start_date,
      endDate: data.end_date,
      paymentType: data.payment_type,
      flatFeeAmount: data.flat_fee_amount,
      percentageRate: data.percentage_rate,
      minimumGuarantee: data.minimum_guarantee,
      paymentSchedule: data.payment_schedule,
      status: data.status,
      contractDocumentId: data.contract_document_id,
      contractDocumentName: data.documents?.name,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createArtistContract(contract: Omit<ArtistContract, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('artist_contracts')
      .insert([{
        artist_id: contract.artistId,
        contract_name: contract.contractName,
        contract_type: contract.contractType,
        start_date: contract.startDate,
        end_date: contract.endDate,
        payment_type: contract.paymentType,
        flat_fee_amount: contract.flatFeeAmount,
        percentage_rate: contract.percentageRate,
        minimum_guarantee: contract.minimumGuarantee,
        payment_schedule: contract.paymentSchedule,
        status: contract.status,
        contract_document_id: contract.contractDocumentId,
        notes: contract.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  async updateArtistContract(id: string, updates: Partial<ArtistContract>) {
    const dbUpdates: any = {};
    
    if (updates.artistId !== undefined) dbUpdates.artist_id = updates.artistId;
    if (updates.contractName !== undefined) dbUpdates.contract_name = updates.contractName;
    if (updates.contractType !== undefined) dbUpdates.contract_type = updates.contractType;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.paymentType !== undefined) dbUpdates.payment_type = updates.paymentType;
    if (updates.flatFeeAmount !== undefined) dbUpdates.flat_fee_amount = updates.flatFeeAmount;
    if (updates.percentageRate !== undefined) dbUpdates.percentage_rate = updates.percentageRate;
    if (updates.minimumGuarantee !== undefined) dbUpdates.minimum_guarantee = updates.minimumGuarantee;
    if (updates.paymentSchedule !== undefined) dbUpdates.payment_schedule = updates.paymentSchedule;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.contractDocumentId !== undefined) dbUpdates.contract_document_id = updates.contractDocumentId;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('artist_contracts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  async deleteArtistContract(id: string) {
    const { error } = await supabase
      .from('artist_contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Payments
  async getArtistPayments(artistId?: string, contractId?: string, eventId?: string) {
    let query = supabase
      .from('artist_payments')
      .select('*, artists(name), artist_contracts(contract_name), events(title)')
      .order('payment_date', { ascending: false });
    
    if (artistId) query = query.eq('artist_id', artistId);
    if (contractId) query = query.eq('contract_id', contractId);
    if (eventId) query = query.eq('event_id', eventId);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(payment => ({
      id: payment.id,
      artistId: payment.artist_id,
      artistName: payment.artists?.name,
      contractId: payment.contract_id,
      contractName: payment.artist_contracts?.contract_name,
      eventId: payment.event_id,
      eventTitle: payment.events?.title,
      paymentDate: payment.payment_date,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      referenceNumber: payment.reference_number,
      status: payment.status,
      description: payment.description,
      createdBy: payment.created_by,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    }));
  },

  async createArtistPayment(payment: Omit<ArtistPayment, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('artist_payments')
      .insert([{
        artist_id: payment.artistId,
        contract_id: payment.contractId,
        event_id: payment.eventId,
        payment_date: payment.paymentDate,
        amount: payment.amount,
        payment_method: payment.paymentMethod,
        reference_number: payment.referenceNumber,
        status: payment.status,
        description: payment.description,
        created_by: payment.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  async updateArtistPayment(id: string, updates: Partial<ArtistPayment>) {
    const dbUpdates: any = {};
    
    if (updates.artistId !== undefined) dbUpdates.artist_id = updates.artistId;
    if (updates.contractId !== undefined) dbUpdates.contract_id = updates.contractId;
    if (updates.eventId !== undefined) dbUpdates.event_id = updates.eventId;
    if (updates.paymentDate !== undefined) dbUpdates.payment_date = updates.paymentDate;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.referenceNumber !== undefined) dbUpdates.reference_number = updates.referenceNumber;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('artist_payments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  async deleteArtistPayment(id: string) {
    const { error } = await supabase
      .from('artist_payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Royalty Reports
  async getRoyaltyReports(artistId?: string, eventId?: string) {
    let query = supabase
      .from('royalty_reports')
      .select('*, artists(name), events(title)')
      .order('report_period_end', { ascending: false });
    
    if (artistId) query = query.eq('artist_id', artistId);
    if (eventId) query = query.eq('event_id', eventId);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(report => ({
      id: report.id,
      artistId: report.artist_id,
      artistName: report.artists?.name,
      eventId: report.event_id,
      eventTitle: report.events?.title,
      reportPeriodStart: report.report_period_start,
      reportPeriodEnd: report.report_period_end,
      grossRevenue: report.gross_revenue,
      deductions: report.deductions,
      netRevenue: report.net_revenue,
      royaltyPercentage: report.royalty_percentage,
      royaltyAmount: report.royalty_amount,
      status: report.status,
      notes: report.notes,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    }));
  },

  async createRoyaltyReport(report: Omit<RoyaltyReport, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('royalty_reports')
      .insert([{
        artist_id: report.artistId,
        event_id: report.eventId,
        report_period_start: report.reportPeriodStart,
        report_period_end: report.reportPeriodEnd,
        gross_revenue: report.grossRevenue,
        deductions: report.deductions,
        net_revenue: report.netRevenue,
        royalty_percentage: report.royaltyPercentage,
        royalty_amount: report.royaltyAmount,
        status: report.status,
        notes: report.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  }
};

// Analytics API
export const analyticsApi = {
  // Metrics
  async getAnalyticsMetrics(category?: string, metricName?: string, timePeriod?: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('analytics_metrics')
      .select('*')
      .order('date', { ascending: false });
    
    if (category) query = query.eq('category', category);
    if (metricName) query = query.eq('metric_name', metricName);
    if (timePeriod) query = query.eq('time_period', timePeriod);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(metric => ({
      id: metric.id,
      metricName: metric.metric_name,
      category: metric.category,
      timePeriod: metric.time_period,
      date: metric.date,
      value: metric.value,
      comparisonValue: metric.comparison_value,
      targetValue: metric.target_value,
      isCumulative: metric.is_cumulative,
      metadata: metric.metadata,
      createdAt: metric.created_at,
      updatedAt: metric.updated_at
    }));
  },

  async createAnalyticsMetric(metric: Omit<AnalyticsMetric, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('analytics_metrics')
      .insert([{
        metric_name: metric.metricName,
        category: metric.category,
        time_period: metric.timePeriod,
        date: metric.date,
        value: metric.value,
        comparison_value: metric.comparisonValue,
        target_value: metric.targetValue,
        is_cumulative: metric.isCumulative,
        metadata: metric.metadata
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  // Dashboards
  async getDashboards() {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    
    return data.map(dashboard => ({
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      layout: dashboard.layout,
      isDefault: dashboard.is_default,
      createdBy: dashboard.created_by,
      createdAt: dashboard.created_at,
      updatedAt: dashboard.updated_at
    }));
  },

  async getDashboardWithWidgets(id: string) {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*, dashboard_widgets(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      layout: data.layout,
      isDefault: data.is_default,
      createdBy: data.created_by,
      widgets: data.dashboard_widgets.map((widget: any) => ({
        id: widget.id,
        dashboardId: widget.dashboard_id,
        widgetType: widget.widget_type,
        title: widget.title,
        dataSource: widget.data_source,
        chartType: widget.chart_type,
        timeRange: widget.time_range,
        positionX: widget.position_x,
        positionY: widget.position_y,
        width: widget.width,
        height: widget.height,
        config: widget.config,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at
      })),
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createDashboard(dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .insert([{
        name: dashboard.name,
        description: dashboard.description,
        layout: dashboard.layout,
        is_default: dashboard.isDefault,
        created_by: dashboard.createdBy
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      layout: data.layout,
      isDefault: data.is_default,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Widgets
  async createDashboardWidget(widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert([{
        dashboard_id: widget.dashboardId,
        widget_type: widget.widgetType,
        title: widget.title,
        data_source: widget.dataSource,
        chart_type: widget.chartType,
        time_range: widget.timeRange,
        position_x: widget.positionX,
        position_y: widget.positionY,
        width: widget.width,
        height: widget.height,
        config: widget.config
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  },

  // Analytics Reports & Calculations
  async getEventPerformanceMetrics(eventId: string) {
    // Custom query to get comprehensive event performance
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        event_revenue(*),
        event_expenses(*),
        tickets(count),
        event_reviews(avg(rating), count)
      `)
      .eq('id', eventId)
      .single();
    
    if (eventError) throw eventError;
    
    // Get event reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('event_reviews')
      .select('*')
      .eq('event_id', eventId);
      
    if (reviewsError) throw reviewsError;
    
    // Calculate metrics
    const ticketsSold = event.tickets_sold || 0;
    const capacity = event.total_capacity;
    const occupancyRate = capacity > 0 ? (ticketsSold / capacity * 100) : 0;
    
    const revenue = event.event_revenue;
    const expenses = event.event_expenses;
    
    const totalRevenue = (revenue?.tickets || 0) + 
                        (revenue?.bar || 0) + 
                        (revenue?.merchandise || 0) + 
                        (revenue?.other || 0);
                        
    const totalExpenses = (expenses?.artists || 0) + 
                         (expenses?.staff || 0) + 
                         (expenses?.marketing || 0) + 
                         (expenses?.other || 0);
                         
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
    
    const revenuePerAttendee = ticketsSold > 0 ? (totalRevenue / ticketsSold) : 0;
    
    const avgRating = event.event_reviews?.[0]?.avg || 0;
    const reviewCount = event.event_reviews?.[0]?.count || 0;
    
    // Return the comprehensive metrics
    return {
      eventId: event.id,
      eventName: event.title,
      eventDate: event.date,
      ticketsSold,
      capacity,
      occupancyRate: parseFloat(occupancyRate.toFixed(2)),
      revenue: {
        tickets: revenue?.tickets || 0,
        bar: revenue?.bar || 0,
        merchandise: revenue?.merchandise || 0,
        other: revenue?.other || 0,
        total: totalRevenue
      },
      expenses: {
        artists: expenses?.artists || 0,
        staff: expenses?.staff || 0,
        marketing: expenses?.marketing || 0,
        other: expenses?.other || 0,
        total: totalExpenses
      },
      netProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      revenuePerAttendee: parseFloat(revenuePerAttendee.toFixed(2)),
      reviews: {
        count: reviewCount,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewsList: reviews
      }
    };
  },

  async getArtistPerformanceMetrics(artistId: string) {
    // Get artist data
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single();
    
    if (artistError) throw artistError;
    
    // Get events this artist performed at
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .contains('artist_ids', [artistId]);
    
    if (eventsError) throw eventsError;
    
    // Get payments
    const { data: payments, error: paymentsError } = await supabase
      .from('artist_payments')
      .select('*')
      .eq('artist_id', artistId);
    
    if (paymentsError) throw paymentsError;
    
    // Calculate metrics
    const totalEvents = events.length;
    const upcomingEvents = events.filter(event => event.status === 'upcoming').length;
    const totalAttendees = events.reduce((sum, event) => sum + (event.tickets_sold || 0), 0);
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const averagePayment = payments.length > 0 ? totalRevenue / payments.length : 0;
    
    return {
      artistId: artist.id,
      artistName: artist.name,
      eventsTotal: totalEvents,
      eventsUpcoming: upcomingEvents,
      totalAttendees,
      financials: {
        totalPayments: payments.length,
        totalRevenue,
        averagePayment: parseFloat(averagePayment.toFixed(2)),
        recentPayments: payments.slice(0, 5)
      },
      performance: {
        averageAttendance: totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0
      }
    };
  },

  async getVenuePerformanceByPeriod(period: 'month' | 'quarter' | 'year', startDate: string, endDate: string) {
    // Get events in the period
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (eventsError) throw eventsError;
    
    // Get financial transactions in the period
    const { data: transactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (transactionsError) throw transactionsError;
    
    // Calculate metrics
    const totalEvents = events.length;
    const totalTickets = events.reduce((sum, event) => sum + (event.tickets_sold || 0), 0);
    
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netProfit = income - expenses;
    
    // Group by category
    const incomeByCategory = transactions
      .filter(tx => tx.type === 'income')
      .reduce((acc: Record<string, number>, tx) => {
        const category = tx.category;
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
      }, {});
      
    const expensesByCategory = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc: Record<string, number>, tx) => {
        const category = tx.category;
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
      }, {});

    // Genre distribution
    const genreDistribution = events.reduce((acc: Record<string, number>, event) => {
      const genre = event.genre || 'Other';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    
    // Get reviews for events in this period
    const { data: reviews, error: reviewsError } = await supabase
      .from('event_reviews')
      .select('rating')
      .in('event_id', events.map(e => e.id));
    
    if (reviewsError) throw reviewsError;
    
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    return {
      period,
      startDate,
      endDate,
      eventsMetrics: {
        totalEvents,
        totalTickets,
        averageAttendance: totalEvents > 0 ? Math.round(totalTickets / totalEvents) : 0,
        genreDistribution
      },
      financialMetrics: {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit,
        incomeByCategory,
        expensesByCategory
      },
      satisfactionMetrics: {
        reviewCount: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1))
      },
      events
    };
  },

  // Real-time Dashboard Analytics
  async getDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    // Today's metrics
    const { data: todayTransactions, error: todayTxError } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('date', today)
      .lt('date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (todayTxError) throw todayTxError;
    
    // Today's ticket sales
    const { data: todayTickets, error: todayTicketsError } = await supabase
      .from('tickets')
      .select('*')
      .gte('purchase_date', today)
      .lt('purchase_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (todayTicketsError) throw todayTicketsError;
    
    // This month's events
    const { data: monthEvents, error: monthEventsError } = await supabase
      .from('events')
      .select('*')
      .gte('date', thisMonth)
      .lt('date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]);
    
    if (monthEventsError) throw monthEventsError;
    
    // Get active customers (customers with recent interactions/purchases)
    const { data: activeCustomers, error: activeCustomersError } = await supabase
      .from('customers')
      .select('id')
      .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (activeCustomersError) throw activeCustomersError;
    
    // Calculate metrics
    const todayRevenue = todayTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const todayExpenses = todayTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalTicketsSold = monthEvents.reduce((sum, event) => sum + (event.tickets_sold || 0), 0);
    const totalCapacity = monthEvents.reduce((sum, event) => sum + (event.total_capacity || 0), 0);
    
    const upcomingEvents = monthEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date() && event.status === 'upcoming';
    });
    
    const todaysEvents = monthEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    });
    
    return {
      today: {
        revenue: todayRevenue,
        expenses: todayExpenses,
        profit: todayRevenue - todayExpenses,
        ticketsSold: todayTickets.length,
        events: todaysEvents.length
      },
      month: {
        events: monthEvents.length,
        upcomingEvents: upcomingEvents.length,
        totalTicketsSold,
        totalCapacity,
        occupancyRate: totalCapacity > 0 ? (totalTicketsSold / totalCapacity * 100) : 0
      },
      active: {
        customers: activeCustomers.length
      }
    };
  },

  // Recent Activity Feed
  async getRecentActivity(limit: number = 10) {
    const activities: any[] = [];
    
    // Recent ticket sales
    const { data: recentTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*, events(title)')
      .order('purchase_date', { ascending: false })
      .limit(5);
    
    if (ticketsError) throw ticketsError;
    
    // Recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (transactionsError) throw transactionsError;
    
    // Recent customer signups
    const { data: recentCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (customersError) throw customersError;
    
    // Recent events created
    const { data: recentEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (eventsError) throw eventsError;
    
    // Format activities
    recentTickets.forEach(ticket => {
      activities.push({
        id: `ticket-${ticket.id}`,
        type: 'ticket_sale',
        message: `Ticket sold for "${ticket.events?.title || 'Event'}"`,
        timestamp: new Date(ticket.purchase_date),
        value: ticket.price,
        details: {
          eventTitle: ticket.events?.title,
          purchaserName: ticket.purchaser_name,
          ticketType: ticket.type
        }
      });
    });
    
    recentTransactions.forEach(transaction => {
      activities.push({
        id: `transaction-${transaction.id}`,
        type: transaction.type === 'income' ? 'payment' : 'expense',
        message: `${transaction.type === 'income' ? 'Payment received' : 'Expense recorded'}: ${transaction.description}`,
        timestamp: new Date(transaction.date),
        value: transaction.amount,
        details: {
          category: transaction.category,
          description: transaction.description
        }
      });
    });
    
    recentCustomers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'customer_signup',
        message: `New customer: ${customer.first_name} ${customer.last_name}`,
        timestamp: new Date(customer.created_at),
        details: {
          customerName: `${customer.first_name} ${customer.last_name}`,
          email: customer.email
        }
      });
    });
    
    recentEvents.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'event_created',
        message: `New event created: ${event.title}`,
        timestamp: new Date(event.created_at),
        details: {
          eventTitle: event.title,
          eventDate: event.date,
          capacity: event.total_capacity
        }
      });
    });
    
    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },

  // Revenue trends for sparklines
  async getRevenueTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const { data: transactions, error } = await supabase
      .from('financial_transactions')
      .select('date, amount, type')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Group by date
    const dailyRevenue: Record<string, number> = {};
    const dailyExpenses: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const date = tx.date;
      if (tx.type === 'income') {
        dailyRevenue[date] = (dailyRevenue[date] || 0) + tx.amount;
      } else {
        dailyExpenses[date] = (dailyExpenses[date] || 0) + tx.amount;
      }
    });
    
    // Fill in missing dates with 0
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        revenue: dailyRevenue[dateStr] || 0,
        expenses: dailyExpenses[dateStr] || 0,
        profit: (dailyRevenue[dateStr] || 0) - (dailyExpenses[dateStr] || 0)
      });
    }
    
    return trends;
  },

  // Event type distribution with real data
  async getEventTypeDistribution() {
    const { data: events, error } = await supabase
      .from('events')
      .select('genre, tickets_sold, total_capacity');
    
    if (error) throw error;
    
    const distribution = events.reduce((acc: Record<string, any>, event) => {
      const genre = event.genre || 'Other';
      if (!acc[genre]) {
        acc[genre] = {
          name: genre,
          count: 0,
          totalTickets: 0,
          totalCapacity: 0
        };
      }
      acc[genre].count += 1;
      acc[genre].totalTickets += event.tickets_sold || 0;
      acc[genre].totalCapacity += event.total_capacity || 0;
      return acc;
    }, {});
    
    return Object.values(distribution).map((item: any) => ({
      name: item.name,
      value: item.count,
      tickets: item.totalTickets,
      capacity: item.totalCapacity,
      fillRate: item.totalCapacity > 0 ? ((item.totalTickets / item.totalCapacity) * 100) : 0
    }));
  }
};

// Staff Management API
export const staffApi = {
  // Staff Members
  async getStaffMembers() {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('first_name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(member => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      phone: member.phone,
      position: member.position,
      department: member.department,
      hourlyRate: member.hourly_rate,
      isActive: member.is_active,
      hireDate: member.hire_date,
      skills: member.skills,
      notes: member.notes,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    }));
  },

  async getStaffMemberById(id: string) {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      hourlyRate: data.hourly_rate,
      isActive: data.is_active,
      hireDate: data.hire_date,
      skills: data.skills,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createStaffMember(member: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('staff_members')
      .insert([{
        first_name: member.firstName,
        last_name: member.lastName,
        email: member.email,
        phone: member.phone,
        position: member.position,
        department: member.department,
        hourly_rate: member.hourlyRate,
        is_active: member.isActive ?? true,
        hire_date: member.hireDate,
        skills: member.skills || [],
        notes: member.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      hourlyRate: data.hourly_rate,
      isActive: data.is_active,
      hireDate: data.hire_date,
      skills: data.skills,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateStaffMember(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.hireDate !== undefined) dbUpdates.hire_date = updates.hireDate;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('staff_members')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      department: data.department,
      hourlyRate: data.hourly_rate,
      isActive: data.is_active,
      hireDate: data.hire_date,
      skills: data.skills,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteStaffMember(id: string) {
    const { error } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Shifts
  async getShifts() {
    const { data, error } = await supabase
      .from('shifts')
      .select('*, staff_members(first_name, last_name), events(title)')
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data.map(shift => ({
      id: shift.id,
      staffId: shift.staff_id,
      staffName: shift.staff_members ? `${shift.staff_members.first_name} ${shift.staff_members.last_name}` : '',
      eventId: shift.event_id,
      eventTitle: shift.events?.title,
      startTime: shift.start_time,
      endTime: shift.end_time,
      position: shift.position,
      status: shift.status,
      notes: shift.notes,
      createdAt: shift.created_at,
      updatedAt: shift.updated_at
    }));
  },

  async createShift(shift: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('shifts')
      .insert([{
        staff_id: shift.staffId,
        event_id: shift.eventId,
        start_time: shift.startTime,
        end_time: shift.endTime,
        position: shift.position,
        status: shift.status || 'scheduled',
        notes: shift.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      eventId: data.event_id,
      startTime: data.start_time,
      endTime: data.end_time,
      position: data.position,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateShift(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.staffId !== undefined) dbUpdates.staff_id = updates.staffId;
    if (updates.eventId !== undefined) dbUpdates.event_id = updates.eventId;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('shifts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      eventId: data.event_id,
      startTime: data.start_time,
      endTime: data.end_time,
      position: data.position,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteShift(id: string) {
    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Time Entries
  async getTimeEntries() {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, staff_members(first_name, last_name), shifts(*)')
      .order('clock_in_time', { ascending: false });
    
    if (error) throw error;
    
    return data.map(entry => ({
      id: entry.id,
      staffId: entry.staff_id,
      staffName: entry.staff_members ? `${entry.staff_members.first_name} ${entry.staff_members.last_name}` : '',
      shiftId: entry.shift_id,
      clockInTime: entry.clock_in_time,
      clockOutTime: entry.clock_out_time,
      totalHours: entry.total_hours,
      approved: entry.approved,
      approvedBy: entry.approved_by,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  },

  async createTimeEntry(entry: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        staff_id: entry.staffId,
        shift_id: entry.shiftId,
        clock_in_time: entry.clockInTime,
        clock_out_time: entry.clockOutTime,
        total_hours: entry.totalHours,
        approved: entry.approved || false,
        approved_by: entry.approvedBy,
        notes: entry.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      shiftId: data.shift_id,
      clockInTime: data.clock_in_time,
      clockOutTime: data.clock_out_time,
      totalHours: data.total_hours,
      approved: data.approved,
      approvedBy: data.approved_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateTimeEntry(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.staffId !== undefined) dbUpdates.staff_id = updates.staffId;
    if (updates.shiftId !== undefined) dbUpdates.shift_id = updates.shiftId;
    if (updates.clockInTime !== undefined) dbUpdates.clock_in_time = updates.clockInTime;
    if (updates.clockOutTime !== undefined) dbUpdates.clock_out_time = updates.clockOutTime;
    if (updates.totalHours !== undefined) dbUpdates.total_hours = updates.totalHours;
    if (updates.approved !== undefined) dbUpdates.approved = updates.approved;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('time_entries')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      shiftId: data.shift_id,
      clockInTime: data.clock_in_time,
      clockOutTime: data.clock_out_time,
      totalHours: data.total_hours,
      approved: data.approved,
      approvedBy: data.approved_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteTimeEntry(id: string) {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Clock In/Out Helper Functions
  async clockIn(staffId: string) {
    // Check if staff member is already clocked in
    const { data: existingEntry, error: checkError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('staff_id', staffId)
      .is('clock_out_time', null)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingEntry) {
      throw new Error('Staff member is already clocked in');
    }
    
    const clockInTime = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        staff_id: staffId,
        shift_id: null,
        clock_in_time: clockInTime,
        clock_out_time: null,
        total_hours: null,
        approved: false,
        approved_by: null,
        notes: null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      shiftId: data.shift_id,
      clockInTime: data.clock_in_time,
      clockOutTime: data.clock_out_time,
      totalHours: data.total_hours,
      approved: data.approved,
      approvedBy: data.approved_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async clockOut(timeEntryId: string) {
    // Get the existing time entry
    const { data: entry, error: getError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single();
    
    if (getError) throw getError;
    
    if (entry.clock_out_time) {
      throw new Error('Staff member is already clocked out');
    }
    
    const clockOutTime = new Date().toISOString();
    const clockInTime = new Date(entry.clock_in_time);
    const clockOutDate = new Date(clockOutTime);
    const totalHours = (clockOutDate.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_out_time: clockOutTime,
        total_hours: totalHours,
        updated_at: new Date().toISOString()
      })
      .eq('id', timeEntryId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      shiftId: data.shift_id,
      clockInTime: data.clock_in_time,
      clockOutTime: data.clock_out_time,
      totalHours: data.total_hours,
      approved: data.approved,
      approvedBy: data.approved_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async approveTimeEntry(timeEntryId: string, approvedBy: string = 'admin') {
    const { data: entry, error: getError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single();
    
    if (getError) throw getError;
    
    if (!entry.clock_out_time) {
      throw new Error('Cannot approve time entry that is still active');
    }
    
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        approved: true,
        approved_by: approvedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', timeEntryId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      shiftId: data.shift_id,
      clockInTime: data.clock_in_time,
      clockOutTime: data.clock_out_time,
      totalHours: data.total_hours,
      approved: data.approved,
      approvedBy: data.approved_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// Equipment Management API
export const equipmentApi = {
  // Equipment CRUD
  async getEquipment() {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      serialNumber: item.serial_number,
      manufacturer: item.manufacturer,
      model: item.model,
      purchaseDate: item.purchase_date,
      purchasePrice: item.purchase_price,
      condition: item.condition,
      location: item.location,
      notes: item.notes,
      lastMaintenance: item.last_maintenance,
      nextMaintenance: item.next_maintenance,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async getEquipmentById(id: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      serialNumber: data.serial_number,
      manufacturer: data.manufacturer,
      model: data.model,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      condition: data.condition,
      location: data.location,
      notes: data.notes,
      lastMaintenance: data.last_maintenance,
      nextMaintenance: data.next_maintenance,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createEquipment(equipment: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('equipment')
      .insert([{
        name: equipment.name,
        category: equipment.category,
        serial_number: equipment.serialNumber,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        purchase_date: equipment.purchaseDate,
        purchase_price: equipment.purchasePrice,
        condition: equipment.condition || 'good',
        location: equipment.location,
        notes: equipment.notes,
        last_maintenance: equipment.lastMaintenance,
        next_maintenance: equipment.nextMaintenance,
        is_active: equipment.isActive ?? true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      serialNumber: data.serial_number,
      manufacturer: data.manufacturer,
      model: data.model,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      condition: data.condition,
      location: data.location,
      notes: data.notes,
      lastMaintenance: data.last_maintenance,
      nextMaintenance: data.next_maintenance,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateEquipment(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.serialNumber !== undefined) dbUpdates.serial_number = updates.serialNumber;
    if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
    if (updates.model !== undefined) dbUpdates.model = updates.model;
    if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.lastMaintenance !== undefined) dbUpdates.last_maintenance = updates.lastMaintenance;
    if (updates.nextMaintenance !== undefined) dbUpdates.next_maintenance = updates.nextMaintenance;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('equipment')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      serialNumber: data.serial_number,
      manufacturer: data.manufacturer,
      model: data.model,
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      condition: data.condition,
      location: data.location,
      notes: data.notes,
      lastMaintenance: data.last_maintenance,
      nextMaintenance: data.next_maintenance,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteEquipment(id: string) {
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('equipment')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return true;
  },

  // Maintenance Records
  async getMaintenanceRecords(equipmentId?: string) {
    let query = supabase
      .from('maintenance_records')
      .select('*, equipment(name)')
      .order('maintenance_date', { ascending: false });
    
    if (equipmentId) {
      query = query.eq('equipment_id', equipmentId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(record => ({
      id: record.id,
      equipmentId: record.equipment_id,
      equipmentName: record.equipment?.name,
      maintenanceDate: record.maintenance_date,
      maintenanceType: record.maintenance_type,
      performedBy: record.performed_by,
      cost: record.cost,
      notes: record.notes,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
  },

  async createMaintenanceRecord(record: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert([{
        equipment_id: record.equipmentId,
        maintenance_date: record.maintenanceDate,
        maintenance_type: record.maintenanceType,
        performed_by: record.performedBy,
        cost: record.cost,
        notes: record.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update equipment last maintenance date
    await supabase
      .from('equipment')
      .update({ 
        last_maintenance: record.maintenanceDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', record.equipmentId);
    
    return {
      id: data.id,
      equipmentId: data.equipment_id,
      maintenanceDate: data.maintenance_date,
      maintenanceType: data.maintenance_type,
      performedBy: data.performed_by,
      cost: data.cost,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Equipment Reservations
  async getEquipmentReservations(equipmentId?: string, eventId?: string) {
    let query = supabase
      .from('equipment_reservations')
      .select('*, equipment(name), events(title)')
      .order('start_date', { ascending: true });
    
    if (equipmentId) query = query.eq('equipment_id', equipmentId);
    if (eventId) query = query.eq('event_id', eventId);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(reservation => ({
      id: reservation.id,
      equipmentId: reservation.equipment_id,
      equipmentName: reservation.equipment?.name,
      eventId: reservation.event_id,
      eventTitle: reservation.events?.title,
      startDate: reservation.start_date,
      endDate: reservation.end_date,
      reservedBy: reservation.reserved_by,
      status: reservation.status,
      notes: reservation.notes,
      createdAt: reservation.created_at,
      updatedAt: reservation.updated_at
    }));
  },

  async createEquipmentReservation(reservation: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('equipment_reservations')
      .insert([{
        equipment_id: reservation.equipmentId,
        event_id: reservation.eventId,
        start_date: reservation.startDate,
        end_date: reservation.endDate,
        reserved_by: reservation.reservedBy,
        status: reservation.status || 'pending',
        notes: reservation.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      equipmentId: data.equipment_id,
      eventId: data.event_id,
      startDate: data.start_date,
      endDate: data.end_date,
      reservedBy: data.reserved_by,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateEquipmentReservation(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.equipmentId !== undefined) dbUpdates.equipment_id = updates.equipmentId;
    if (updates.eventId !== undefined) dbUpdates.event_id = updates.eventId;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.reservedBy !== undefined) dbUpdates.reserved_by = updates.reservedBy;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('equipment_reservations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      equipmentId: data.equipment_id,
      eventId: data.event_id,
      startDate: data.start_date,
      endDate: data.end_date,
      reservedBy: data.reserved_by,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteEquipmentReservation(id: string) {
    const { error } = await supabase
      .from('equipment_reservations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Equipment Analytics
  async getEquipmentUtilization() {
    const { data: reservations, error } = await supabase
      .from('equipment_reservations')
      .select('equipment_id, start_date, end_date, equipment(name)')
      .eq('status', 'confirmed');
    
    if (error) throw error;
    
          const utilization = reservations.reduce((acc: Record<string, any>, reservation) => {
        const equipmentId = reservation.equipment_id;
        if (!acc[equipmentId]) {
          acc[equipmentId] = {
            equipmentId,
            equipmentName: reservation.equipment?.name || 'Unknown Equipment',
            totalReservations: 0,
            totalHours: 0
          };
        }
      acc[equipmentId].totalReservations += 1;
      
      const start = new Date(reservation.start_date);
      const end = new Date(reservation.end_date);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      acc[equipmentId].totalHours += hours;
      
      return acc;
    }, {});
    
    return Object.values(utilization);
  },

  async getMaintenanceSchedule() {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, next_maintenance, last_maintenance, condition')
      .eq('is_active', true)
      .not('next_maintenance', 'is', null)
      .order('next_maintenance', { ascending: true });
    
    if (error) throw error;
    
    return data.map(equipment => ({
      id: equipment.id,
      name: equipment.name,
      nextMaintenance: equipment.next_maintenance,
      lastMaintenance: equipment.last_maintenance,
      condition: equipment.condition,
      isDue: new Date(equipment.next_maintenance) <= new Date(),
      daysUntilDue: Math.ceil((new Date(equipment.next_maintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));
  }
};

// Venue Management API
export const venueApi = {
  async getVenues() {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data.map(venue => ({
      id: venue.id,
      name: venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      zip: venue.zip,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      capacity: venue.capacity,
      venueType: venue.venue_type,
      amenities: venue.amenities,
      description: venue.description,
      rentalRate: venue.rental_rate,
      availabilityCalendar: venue.availability_calendar,
      contactPerson: venue.contact_person,
      notes: venue.notes,
      isActive: venue.is_active,
      createdAt: venue.created_at,
      updatedAt: venue.updated_at
    }));
  },

  async getVenueById(id: string) {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      website: data.website,
      capacity: data.capacity,
      venueType: data.venue_type,
      amenities: data.amenities,
      description: data.description,
      rentalRate: data.rental_rate,
      availabilityCalendar: data.availability_calendar,
      contactPerson: data.contact_person,
      notes: data.notes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createVenue(venue: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('venues')
      .insert([{
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        zip: venue.zip,
        phone: venue.phone,
        email: venue.email,
        website: venue.website,
        capacity: venue.capacity,
        venue_type: venue.venueType || 'indoor',
        amenities: venue.amenities || [],
        description: venue.description,
        rental_rate: venue.rentalRate,
        availability_calendar: venue.availabilityCalendar || {},
        contact_person: venue.contactPerson,
        notes: venue.notes,
        is_active: venue.isActive ?? true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      website: data.website,
      capacity: data.capacity,
      venueType: data.venue_type,
      amenities: data.amenities,
      description: data.description,
      rentalRate: data.rental_rate,
      availabilityCalendar: data.availability_calendar,
      contactPerson: data.contact_person,
      notes: data.notes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateVenue(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.zip !== undefined) dbUpdates.zip = updates.zip;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.venueType !== undefined) dbUpdates.venue_type = updates.venueType;
    if (updates.amenities !== undefined) dbUpdates.amenities = updates.amenities;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.rentalRate !== undefined) dbUpdates.rental_rate = updates.rentalRate;
    if (updates.availabilityCalendar !== undefined) dbUpdates.availability_calendar = updates.availabilityCalendar;
    if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('venues')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      email: data.email,
      website: data.website,
      capacity: data.capacity,
      venueType: data.venue_type,
      amenities: data.amenities,
      description: data.description,
      rentalRate: data.rental_rate,
      availabilityCalendar: data.availability_calendar,
      contactPerson: data.contact_person,
      notes: data.notes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteVenue(id: string) {
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('venues')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return true;
  },

  async getVenueSeasons() {
    const { data, error } = await supabase
      .from('venue_seasons')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map(season => ({
      id: season.id,
      name: season.name,
      startDate: season.start_date,
      endDate: season.end_date,
      description: season.description,
      attendanceMultiplier: season.attendance_multiplier,
      createdAt: season.created_at,
      updatedAt: season.updated_at
    }));
  },

  async createVenueSeason(season: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('venue_seasons')
      .insert([{
        name: season.name,
        start_date: season.startDate,
        end_date: season.endDate,
        description: season.description,
        attendance_multiplier: season.attendanceMultiplier || 1.0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      description: data.description,
      attendanceMultiplier: data.attendance_multiplier,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

// Loyalty Program API
export const loyaltyApi = {
  // Loyalty Tiers
  async getLoyaltyTiers() {
    const { data, error } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .order('point_threshold', { ascending: true });
    
    if (error) throw error;
    
    return data.map(tier => ({
      id: tier.id,
      name: tier.name,
      pointThreshold: tier.point_threshold,
      benefits: tier.benefits,
      createdAt: tier.created_at,
      updatedAt: tier.updated_at
    }));
  },

  async createLoyaltyTier(tier: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('loyalty_tiers')
      .insert([{
        name: tier.name,
        point_threshold: tier.pointThreshold,
        benefits: tier.benefits
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      pointThreshold: data.point_threshold,
      benefits: data.benefits,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateLoyaltyTier(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.pointThreshold !== undefined) dbUpdates.point_threshold = updates.pointThreshold;
    if (updates.benefits !== undefined) dbUpdates.benefits = updates.benefits;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('loyalty_tiers')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      pointThreshold: data.point_threshold,
      benefits: data.benefits,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteLoyaltyTier(id: string) {
    const { error } = await supabase
      .from('loyalty_tiers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Loyalty Rewards
  async getLoyaltyRewards() {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .select('*, loyalty_tiers(name)')
      .eq('is_active', true)
      .order('points_cost', { ascending: true });
    
    if (error) throw error;
    
    return data.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.points_cost,
      requiredTierId: reward.required_tier_id,
      requiredTierName: reward.loyalty_tiers?.name,
      isActive: reward.is_active,
      createdAt: reward.created_at,
      updatedAt: reward.updated_at
    }));
  },

  async createLoyaltyReward(reward: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .insert([{
        name: reward.name,
        description: reward.description,
        points_cost: reward.pointsCost,
        required_tier_id: reward.requiredTierId,
        is_active: reward.isActive ?? true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      pointsCost: data.points_cost,
      requiredTierId: data.required_tier_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateLoyaltyReward(id: string, updates: Partial<any>) {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.pointsCost !== undefined) dbUpdates.points_cost = updates.pointsCost;
    if (updates.requiredTierId !== undefined) dbUpdates.required_tier_id = updates.requiredTierId;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      pointsCost: data.points_cost,
      requiredTierId: data.required_tier_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteLoyaltyReward(id: string) {
    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from('loyalty_rewards')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return true;
  },

  // Customer Loyalty Management
  async getCustomerLoyalty(customerId: string) {
    const { data, error } = await supabase
      .from('customer_loyalty')
      .select('*, customers(first_name, last_name), loyalty_tiers(name, benefits)')
      .eq('customer_id', customerId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customers ? `${data.customers.first_name} ${data.customers.last_name}` : '',
      points: data.points,
      tierId: data.tier_id,
      tierName: data.loyalty_tiers?.name,
      tierBenefits: data.loyalty_tiers?.benefits,
      lastUpdated: data.last_updated,
      lastPointsAdded: data.last_points_added,
      lastPointsReason: data.last_points_reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async addLoyaltyPoints(customerId: string, points: number, reason: string) {
    // Get current loyalty data
    const { data: currentLoyalty, error: getCurrentError } = await supabase
      .from('customer_loyalty')
      .select('*, loyalty_tiers(*)')
      .eq('customer_id', customerId)
      .single();
    
    if (getCurrentError) throw getCurrentError;
    
    const newPointsTotal = currentLoyalty.points + points;
    
    // Check if tier upgrade is needed
    const { data: availableTiers, error: getTiersError } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .lte('point_threshold', newPointsTotal)
      .order('point_threshold', { ascending: false })
      .limit(1);
    
    if (getTiersError) throw getTiersError;
    
    const newTier = availableTiers[0];
    
    const { data, error } = await supabase
      .from('customer_loyalty')
      .update({
        points: newPointsTotal,
        tier_id: newTier ? newTier.id : currentLoyalty.tier_id,
        last_updated: new Date().toISOString(),
        last_points_added: points,
        last_points_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      customerId: data.customer_id,
      points: data.points,
      tierId: data.tier_id,
      lastUpdated: data.last_updated,
      lastPointsAdded: data.last_points_added,
      lastPointsReason: data.last_points_reason,
      tierUpgraded: newTier && newTier.id !== currentLoyalty.tier_id,
      newTierName: newTier?.name
    };
  },

  // Reward Redemptions
  async getRewardRedemptions(customerId?: string) {
    let query = supabase
      .from('reward_redemptions')
      .select('*, customers(first_name, last_name), loyalty_rewards(name, description)')
      .order('redemption_date', { ascending: false });
    
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(redemption => ({
      id: redemption.id,
      customerId: redemption.customer_id,
      customerName: redemption.customers ? `${redemption.customers.first_name} ${redemption.customers.last_name}` : '',
      rewardId: redemption.reward_id,
      rewardName: redemption.loyalty_rewards?.name,
      rewardDescription: redemption.loyalty_rewards?.description,
      pointsSpent: redemption.points_spent,
      redemptionDate: redemption.redemption_date,
      status: redemption.status,
      notes: redemption.notes,
      createdAt: redemption.created_at,
      updatedAt: redemption.updated_at
    }));
  },

  async redeemReward(customerId: string, rewardId: string, notes?: string) {
    // Get customer loyalty data
    const { data: customerLoyalty, error: getLoyaltyError } = await supabase
      .from('customer_loyalty')
      .select('*')
      .eq('customer_id', customerId)
      .single();
    
    if (getLoyaltyError) throw getLoyaltyError;
    
    // Get reward data
    const { data: reward, error: getRewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();
    
    if (getRewardError) throw getRewardError;
    
    // Check if customer has enough points
    if (customerLoyalty.points < reward.points_cost) {
      throw new Error('Insufficient points for this reward');
    }
    
    // Create redemption record
    const { data: redemption, error: createRedemptionError } = await supabase
      .from('reward_redemptions')
      .insert([{
        customer_id: customerId,
        reward_id: rewardId,
        points_spent: reward.points_cost,
        redemption_date: new Date().toISOString(),
        status: 'pending',
        notes: notes
      }])
      .select()
      .single();
    
    if (createRedemptionError) throw createRedemptionError;
    
    // Deduct points from customer
    const { data: updatedLoyalty, error: updateLoyaltyError } = await supabase
      .from('customer_loyalty')
      .update({
        points: customerLoyalty.points - reward.points_cost,
        last_updated: new Date().toISOString(),
        last_points_added: -reward.points_cost,
        last_points_reason: `Redeemed: ${reward.name}`,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .select()
      .single();
    
    if (updateLoyaltyError) throw updateLoyaltyError;
    
    return {
      redemptionId: redemption.id,
      customerId,
      rewardId,
      pointsSpent: reward.points_cost,
      remainingPoints: updatedLoyalty.points,
      status: redemption.status,
      redemptionDate: redemption.redemption_date
    };
  },

  async updateRedemptionStatus(redemptionId: string, status: string, notes?: string) {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .update({
        status: status,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', redemptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      customerId: data.customer_id,
      rewardId: data.reward_id,
      pointsSpent: data.points_spent,
      redemptionDate: data.redemption_date,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};