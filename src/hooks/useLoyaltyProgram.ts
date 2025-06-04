import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { LoyaltyTier, CustomerLoyalty, PointMultiplier } from '../types';

// Mock data - in a real app, these would come from Supabase
const mockTiers: LoyaltyTier[] = [
  {
    id: 'regular',
    name: 'Regular',
    pointThreshold: 0,
    benefits: 'Standard access to events, Regular pricing, Basic rewards'
  },
  {
    id: 'gold',
    name: 'Gold',
    pointThreshold: 1000,
    benefits: 'Priority access to tickets, 10% discount on drinks, Free coat check'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    pointThreshold: 3000,
    benefits: 'VIP entrance, 15% discount on all purchases, Dedicated host, Artist meet & greets'
  }
];

const mockMultipliers: PointMultiplier[] = [
  {
    id: 'standard',
    name: 'Standard Purchases',
    multiplier: 1,
    description: 'Standard ticket and merchandise purchases'
  },
  {
    id: 'premium',
    name: 'Premium Events',
    multiplier: 2,
    description: 'Special events and premium shows'
  },
  {
    id: 'weekday',
    name: 'Weekday Events',
    multiplier: 1.5,
    description: 'Events held Monday through Thursday'
  },
  {
    id: 'referral',
    name: 'Friend Referral',
    multiplier: 3,
    description: 'Points for bringing new customers'
  }
];

const mockCustomerLoyalty: CustomerLoyalty[] = [
  {
    id: 'cl1',
    customerId: '1',
    points: 1250,
    tierId: 'gold',
    lastUpdated: new Date().toISOString(),
    lastPointsAdded: 250,
    lastPointsReason: 'Event Attendance'
  },
  {
    id: 'cl2',
    customerId: '2',
    points: 450,
    tierId: 'regular',
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    lastPointsAdded: 150,
    lastPointsReason: 'Bar Purchase'
  },
  {
    id: 'cl3',
    customerId: '3',
    points: 3200,
    tierId: 'platinum',
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    lastPointsAdded: 500,
    lastPointsReason: 'Special Promotion'
  }
];

export function useLoyaltyProgram() {
  const queryClient = useQueryClient();

  // Fetch loyalty tiers
  const loyaltyTiersQuery = useQuery({
    queryKey: ['loyalty_tiers'],
    queryFn: async () => {
      // In a real app, this would fetch from Supabase
      /*
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('point_threshold', { ascending: true });
        
      if (error) throw error;
      return data;
      */
      return mockTiers;
    }
  });

  // Fetch point multipliers
  const pointMultipliersQuery = useQuery({
    queryKey: ['point_multipliers'],
    queryFn: async () => {
      // In a real app, this would fetch from Supabase
      /*
      const { data, error } = await supabase
        .from('point_multipliers')
        .select('*');
        
      if (error) throw error;
      return data;
      */
      return mockMultipliers;
    }
  });

  // Fetch customer loyalty data
  const customerLoyaltyQuery = useQuery({
    queryKey: ['customer_loyalty'],
    queryFn: async () => {
      // In a real app, this would fetch from Supabase
      /*
      const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*');
        
      if (error) throw error;
      return data;
      */
      return mockCustomerLoyalty;
    }
  });

  // Add points mutation
  const addPointsMutation = useMutation({
    mutationFn: async ({ 
      customerId, 
      points, 
      reason 
    }: { 
      customerId: string; 
      points: number; 
      reason: string;
    }) => {
      // In a real app, this would update in Supabase
      /*
      const { data: existingData, error: fetchError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (!existingData) {
        // Create new record
        const { data, error } = await supabase
          .from('customer_loyalty')
          .insert([{
            customer_id: customerId,
            points: points,
            tier_id: 'regular', // Default tier
            last_points_added: points,
            last_points_reason: reason
          }])
          .select();
          
        if (error) throw error;
        return data[0];
      } else {
        // Update existing record
        const newPoints = existingData.points + points;
        
        // Determine tier based on points
        let newTierId = 'regular';
        for (const tier of mockTiers) {
          if (newPoints >= tier.pointThreshold) {
            newTierId = tier.id;
          }
        }
        
        const { data, error } = await supabase
          .from('customer_loyalty')
          .update({
            points: newPoints,
            tier_id: newTierId,
            last_updated: new Date().toISOString(),
            last_points_added: points,
            last_points_reason: reason
          })
          .eq('customer_id', customerId)
          .select();
          
        if (error) throw error;
        return data[0];
      }
      */
      
      // Mock implementation
      const existingIndex = mockCustomerLoyalty.findIndex(cl => cl.customerId === customerId);
      if (existingIndex === -1) {
        // Create new record
        const newRecord = {
          id: `cl${mockCustomerLoyalty.length + 1}`,
          customerId,
          points,
          tierId: 'regular', // Default tier
          lastUpdated: new Date().toISOString(),
          lastPointsAdded: points,
          lastPointsReason: reason
        };
        mockCustomerLoyalty.push(newRecord);
        return newRecord;
      } else {
        // Update existing record
        const updatedRecord = { ...mockCustomerLoyalty[existingIndex] };
        updatedRecord.points += points;
        
        // Determine tier based on points
        for (const tier of mockTiers) {
          if (updatedRecord.points >= tier.pointThreshold) {
            updatedRecord.tierId = tier.id;
          }
        }
        
        updatedRecord.lastUpdated = new Date().toISOString();
        updatedRecord.lastPointsAdded = points;
        updatedRecord.lastPointsReason = reason;
        
        mockCustomerLoyalty[existingIndex] = updatedRecord;
        return updatedRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_loyalty'] });
    }
  });

  // Update customer tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ 
      customerId, 
      tierId 
    }: { 
      customerId: string; 
      tierId: string;
    }) => {
      // In a real app, this would update in Supabase
      /*
      const { data, error } = await supabase
        .from('customer_loyalty')
        .update({
          tier_id: tierId,
          last_updated: new Date().toISOString()
        })
        .eq('customer_id', customerId)
        .select();
        
      if (error) throw error;
      return data[0];
      */
      
      // Mock implementation
      const existingIndex = mockCustomerLoyalty.findIndex(cl => cl.customerId === customerId);
      if (existingIndex === -1) {
        throw new Error('Customer loyalty record not found');
      }
      
      const updatedRecord = { ...mockCustomerLoyalty[existingIndex], tierId, lastUpdated: new Date().toISOString() };
      mockCustomerLoyalty[existingIndex] = updatedRecord;
      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_loyalty'] });
    }
  });

  return {
    loyaltyTiers: loyaltyTiersQuery.data || [],
    isLoadingTiers: loyaltyTiersQuery.isLoading,
    pointsMultipliers: pointMultipliersQuery.data || [],
    isLoadingMultipliers: pointMultipliersQuery.isLoading,
    customerLoyalty: customerLoyaltyQuery.data || [],
    isLoadingLoyalty: customerLoyaltyQuery.isLoading,
    updateCustomerPoints: (customerId: string, points: number, reason: string) => 
      addPointsMutation.mutateAsync({ customerId, points, reason }),
    updateCustomerTier: (customerId: string, tierId: string) => 
      updateTierMutation.mutateAsync({ customerId, tierId }),
    isUpdatingPoints: addPointsMutation.isPending,
    isUpdatingTier: updateTierMutation.isPending
  };
}