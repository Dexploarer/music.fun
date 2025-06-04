import { supabase } from '@/lib/supabase';

interface SquareOAuthParams {
  code: string;
  redirectUri: string;
}

interface SquareTokens {
  merchantId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  environment: "sandbox" | "production";
}

/**
 * Exchange an authorization code for access and refresh tokens
 */
export async function exchangeSquareAuthCode({ code, redirectUri }: SquareOAuthParams): Promise<{ success: boolean; merchantId?: string; error?: string }> {
  try {
    // Call the edge function to exchange the code for tokens
    const { data: functionData, error: functionError } = await supabase.functions.invoke('square-oauth', {
      body: { code, redirectUri },
    });
    
    if (functionError) {
      console.error('Error calling square-oauth function:', functionError);
      return { success: false, error: functionError.message };
    }
    
    if (!functionData.success) {
      return { success: false, error: functionData.error || 'Unknown error occurred during authorization' };
    }
    
    return { 
      success: true, 
      merchantId: functionData.merchant_id
    };
  } catch (error) {
    console.error('Error exchanging Square auth code:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Refresh the Square access token
 */
export async function refreshSquareToken(merchantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Call the edge function to refresh the token
    const { data: functionData, error: functionError } = await supabase.functions.invoke('square-refresh-token', {
      body: { merchantId },
    });
    
    if (functionError) {
      console.error('Error calling square-refresh-token function:', functionError);
      return { success: false, error: functionError.message };
    }
    
    if (!functionData.success) {
      return { success: false, error: functionData.error || 'Unknown error occurred during token refresh' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error refreshing Square token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if Square is connected for the current user
 */
export async function checkSquareConnection(): Promise<{ connected: boolean; merchantId?: string; environment?: string }> {
  try {
    // Get the integration record from the database
    const { data, error } = await supabase
      .from('integrations')
      .select('id, merchant_id, token_expiry, metadata')
      .eq('provider', 'square')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error checking Square connection:', error);
      return { connected: false };
    }
    
    if (!data || data.length === 0) {
      return { connected: false };
    }
    
    // Check if the token has expired
    const integration = data[0];
    const tokenExpiry = new Date(integration.token_expiry);
    const now = new Date();
    const isExpired = tokenExpiry < now;
    
    // If token is expired, try to refresh it
    if (isExpired) {
      const refreshResult = await refreshSquareToken(integration.merchant_id);
      if (!refreshResult.success) {
        return { connected: false };
      }
    }
    
    return { 
      connected: true, 
      merchantId: integration.merchant_id,
      environment: integration.metadata?.environment || 'sandbox'
    };
  } catch (error) {
    console.error('Error in checkSquareConnection:', error);
    return { connected: false };
  }
}

/**
 * Disconnect Square integration
 */
export async function disconnectSquare(): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the integration record from the database
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('provider', 'square');
    
    if (error) {
      console.error('Error disconnecting Square:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in disconnectSquare:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get Square transactions
 */
export async function getSquareTransactions(merchantId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Call the edge function to get transactions
    const { data: functionData, error: functionError } = await supabase.functions.invoke('square-transactions', {
      method: 'GET',
      queryParams: { merchantId },
    });
    
    if (functionError) {
      console.error('Error calling square-transactions function:', functionError);
      return { success: false, error: functionError.message };
    }
    
    if (!functionData.success) {
      return { success: false, error: functionData.error || 'Unknown error occurred while fetching transactions' };
    }
    
    return { 
      success: true, 
      data: functionData.data
    };
  } catch (error) {
    console.error('Error getting Square transactions:', error);
    return { success: false, error: error.message };
  }
}