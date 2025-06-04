/**
 * OpenAI Model Configuration for 2025
 * Centralized configuration to ensure consistent usage of current models
 */

// Current OpenAI Models (2025)
export const OPENAI_MODELS = {
  // Text Generation - Latest efficient model
  TEXT: 'gpt-4.1-mini',
  
  // Reasoning - Advanced reasoning model with multimodal capabilities
  REASONING: 'o4-mini',
  
  // Image Generation - Multimodal model (replaces DALL-E 3)
  IMAGE: 'gpt-4o',
  
  // Multimodal - For combined text/image tasks
  MULTIMODAL: 'gpt-4o'
} as const;

// Model Configuration with optimal settings
export const MODEL_CONFIGS = {
  [OPENAI_MODELS.TEXT]: {
    temperature: 0.7,
    max_tokens: 1000,
    description: 'Latest efficient text generation model'
  },
  [OPENAI_MODELS.REASONING]: {
    temperature: 0.3,
    max_tokens: 1500,
    description: 'Advanced reasoning model for analysis and complex tasks'
  },
  [OPENAI_MODELS.IMAGE]: {
    size: '1024x1024' as const,
    quality: 'hd' as const,
    style: 'vivid' as const,
    description: 'Current image generation model (replaces DALL-E 3)'
  },
  [OPENAI_MODELS.MULTIMODAL]: {
    temperature: 0.7,
    max_tokens: 1000,
    description: 'Multimodal model for combined text/image tasks'
  }
} as const;

// Helper functions to get model configurations
export const getTextModel = () => OPENAI_MODELS.TEXT;
export const getReasoningModel = () => OPENAI_MODELS.REASONING;
export const getImageModel = () => OPENAI_MODELS.IMAGE;
export const getMultimodalModel = () => OPENAI_MODELS.MULTIMODAL;

// Get optimal settings for a model
export const getModelConfig = (model: keyof typeof MODEL_CONFIGS) => {
  return MODEL_CONFIGS[model];
};

// Task-specific model recommendations
export const getModelForTask = (task: 'content' | 'analysis' | 'image' | 'social' | 'document') => {
  switch (task) {
    case 'content':
    case 'social':
    case 'document':
      return OPENAI_MODELS.TEXT;
    case 'analysis':
      return OPENAI_MODELS.REASONING;
    case 'image':
      return OPENAI_MODELS.IMAGE;
    default:
      return OPENAI_MODELS.TEXT;
  }
};

/**
 * @deprecated DALL-E models are deprecated. Use GPT-4o for image generation.
 */
export const DEPRECATED_MODELS = {
  'dall-e-2': 'Use gpt-4o instead',
  'dall-e-3': 'Use gpt-4o instead',
  'gpt-4o-mini': 'Use gpt-4.1-mini instead',
  'gpt-4': 'Use gpt-4.1-mini for most tasks or o4-mini for reasoning'
} as const; 