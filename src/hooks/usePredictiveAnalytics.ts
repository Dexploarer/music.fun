import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PredictiveModel, Prediction } from '../types';
import { format, addDays, subDays } from 'date-fns';

// Mock data for predictive models
const mockModels: PredictiveModel[] = [
  {
    id: 'model1',
    name: 'Attendance Prediction Model',
    type: 'attendance',
    description: 'Predicts event attendance based on historical data and external factors',
    parameters: {
      genres: ['blues', 'jazz', 'folk', 'rock', 'country'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      weatherFactors: ['clear', 'rain', 'snow'],
      holidayFactor: true
    },
    accuracy: 0.82,
    lastTrained: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'model2',
    name: 'Price Optimization Model',
    type: 'pricing',
    description: 'Determines optimal ticket pricing to maximize revenue',
    parameters: {
      genres: ['blues', 'jazz', 'folk', 'rock', 'country'],
      elasticityFactors: ['weekend', 'holiday', 'competition'],
      capacityUtilization: true
    },
    accuracy: 0.78,
    lastTrained: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'model3',
    name: 'Revenue Forecast Model',
    type: 'revenue',
    description: 'Projects total revenue across tickets, bar, and merchandise',
    parameters: {
      genres: ['blues', 'jazz', 'folk', 'rock', 'country'],
      components: ['tickets', 'bar', 'merchandise'],
      seasonalFactors: true
    },
    accuracy: 0.85,
    lastTrained: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for predictions
const mockPredictions: Prediction[] = [
  {
    id: 'pred1',
    modelId: 'model1',
    eventId: 'event1',
    predictionDate: subDays(new Date(), 30).toISOString(),
    targetMetric: 'attendance',
    predictedValue: 185,
    confidenceScore: 0.84,
    actualValue: 192,
    metadata: {
      genre: 'blues',
      dayOfWeek: 'saturday',
      isHoliday: false
    },
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 30).toISOString()
  },
  {
    id: 'pred2',
    modelId: 'model2',
    eventId: 'event1',
    predictionDate: subDays(new Date(), 30).toISOString(),
    targetMetric: 'optimal_price',
    predictedValue: 32.5,
    confidenceScore: 0.76,
    actualValue: 35,
    metadata: {
      genre: 'blues',
      elasticity: 'medium',
      competitionLevel: 'low'
    },
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 30).toISOString()
  },
  {
    id: 'pred3',
    modelId: 'model3',
    eventId: 'event1',
    predictionDate: subDays(new Date(), 30).toISOString(),
    targetMetric: 'total_revenue',
    predictedValue: 6825,
    confidenceScore: 0.81,
    actualValue: 7105,
    metadata: {
      ticketRevenue: 4200,
      barRevenue: 2100,
      merchandiseRevenue: 525
    },
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 30).toISOString()
  }
];

export function usePredictiveAnalytics() {
  const queryClient = useQueryClient();
  const [localModels, setLocalModels] = useState<PredictiveModel[]>(mockModels);
  const [localPredictions, setLocalPredictions] = useState<Prediction[]>(mockPredictions);

  // Fetch predictive models
  const modelsQuery = useQuery({
    queryKey: ['predictive_models'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localModels;
    }
  });

  // Fetch attendance predictions
  const attendancePredictionsQuery = useQuery({
    queryKey: ['predictions', 'attendance'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localPredictions.filter(p => p.targetMetric === 'attendance');
    }
  });

  // Fetch price predictions
  const pricePredictionsQuery = useQuery({
    queryKey: ['predictions', 'price'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localPredictions.filter(p => p.targetMetric === 'optimal_price');
    }
  });

  // Fetch revenue predictions
  const revenuePredictionsQuery = useQuery({
    queryKey: ['predictions', 'revenue'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localPredictions.filter(p => p.targetMetric === 'total_revenue');
    }
  });

  // Generate attendance prediction mutation
  const generateAttendancePredictionMutation = useMutation({
    mutationFn: async (input: {
      eventId: string;
      eventDate: string;
      genreId: string;
      dayOfWeek: string;
      isHoliday: boolean;
      previousEvents: number;
      weatherForecast: string;
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a base prediction value with some randomness
      let predictedValue = 185;
      
      // Add factors based on inputs
      if (input.dayOfWeek === 'friday' || input.dayOfWeek === 'saturday') {
        predictedValue += 30;
      }
      
      if (input.isHoliday) {
        predictedValue += 15;
      }
      
      if (input.weatherForecast === 'clear') {
        predictedValue += 10;
      } else if (input.weatherForecast === 'rain') {
        predictedValue -= 25;
      }
      
      // Add some randomness
      predictedValue = Math.max(50, predictedValue + Math.round((Math.random() - 0.5) * 20));
      
      const newPrediction: Prediction = {
        id: `pred${localPredictions.length + 1}`,
        modelId: 'model1',
        eventId: input.eventId,
        predictionDate: new Date().toISOString(),
        targetMetric: 'attendance',
        predictedValue,
        confidenceScore: 0.75 + Math.random() * 0.15,
        actualValue: null,
        metadata: {
          genre: input.genreId,
          dayOfWeek: input.dayOfWeek,
          isHoliday: input.isHoliday,
          weatherForecast: input.weatherForecast
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalPredictions(prev => [...prev, newPrediction]);
      return newPrediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'attendance'] });
    }
  });

  // Generate price prediction mutation
  const generatePricePredictionMutation = useMutation({
    mutationFn: async (input: {
      eventId: string;
      eventDate: string;
      genreId: string;
      targetAttendance: number;
      venueCapacity: number;
      costPerHead: number;
      competitionLevel: 'low' | 'medium' | 'high';
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a base price with some randomness
      let basePrice = 25;
      
      // Add factors based on inputs
      if (input.genreId === 'jazz' || input.genreId === 'blues') {
        basePrice += 5;
      }
      
      if (input.targetAttendance > input.venueCapacity * 0.8) {
        basePrice += 10;
      }
      
      if (input.competitionLevel === 'low') {
        basePrice += 5;
      } else if (input.competitionLevel === 'high') {
        basePrice -= 5;
      }
      
      // Ensure minimum profitability
      const minimumPrice = input.costPerHead * 1.5;
      basePrice = Math.max(basePrice, minimumPrice);
      
      // Add some randomness
      const predictedValue = Math.round((basePrice + (Math.random() - 0.5) * 5) * 100) / 100;
      
      const newPrediction: Prediction = {
        id: `pred${localPredictions.length + 1}`,
        modelId: 'model2',
        eventId: input.eventId,
        predictionDate: new Date().toISOString(),
        targetMetric: 'optimal_price',
        predictedValue,
        confidenceScore: 0.75 + Math.random() * 0.15,
        actualValue: null,
        metadata: {
          genre: input.genreId,
          targetAttendance: input.targetAttendance,
          competitionLevel: input.competitionLevel,
          costPerHead: input.costPerHead
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalPredictions(prev => [...prev, newPrediction]);
      return newPrediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'price'] });
    }
  });

  // Generate revenue prediction mutation
  const generateRevenuePredictionMutation = useMutation({
    mutationFn: async (input: {
      eventId: string;
      eventDate: string;
      genreId: string;
      ticketPrice: number;
      predictedAttendance: number;
      averageDrinksPerPerson: number;
      averageDrinkPrice: number;
      merchandiseSalesRate: number;
    }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate revenue components
      const ticketRevenue = input.ticketPrice * input.predictedAttendance;
      const barRevenue = input.averageDrinksPerPerson * input.averageDrinkPrice * input.predictedAttendance;
      const merchandiseRevenue = input.ticketPrice * input.predictedAttendance * input.merchandiseSalesRate;
      
      // Calculate total predicted revenue
      const predictedValue = Math.round(ticketRevenue + barRevenue + merchandiseRevenue);
      
      const newPrediction: Prediction = {
        id: `pred${localPredictions.length + 1}`,
        modelId: 'model3',
        eventId: input.eventId,
        predictionDate: new Date().toISOString(),
        targetMetric: 'total_revenue',
        predictedValue,
        confidenceScore: 0.75 + Math.random() * 0.15,
        actualValue: null,
        metadata: {
          ticketRevenue,
          barRevenue,
          merchandiseRevenue,
          ticketPrice: input.ticketPrice,
          predictedAttendance: input.predictedAttendance
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalPredictions(prev => [...prev, newPrediction]);
      return newPrediction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions', 'revenue'] });
    }
  });

  return {
    models: modelsQuery.data || [],
    isLoadingModels: modelsQuery.isLoading,
    
    attendancePredictions: attendancePredictionsQuery.data || [],
    isLoadingAttendancePredictions: attendancePredictionsQuery.isLoading,
    
    pricePredictions: pricePredictionsQuery.data || [],
    isLoadingPricePredictions: pricePredictionsQuery.isLoading,
    
    revenuePredictions: revenuePredictionsQuery.data || [],
    isLoadingRevenuePredictions: revenuePredictionsQuery.isLoading,
    
    generateAttendancePrediction: generateAttendancePredictionMutation.mutateAsync,
    generatePricePrediction: generatePricePredictionMutation.mutateAsync,
    generateRevenuePrediction: generateRevenuePredictionMutation.mutateAsync,
    
    isGeneratingAttendance: generateAttendancePredictionMutation.isPending,
    isGeneratingPrice: generatePricePredictionMutation.isPending,
    isGeneratingRevenue: generateRevenuePredictionMutation.isPending
  };
}