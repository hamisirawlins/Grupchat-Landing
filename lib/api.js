import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Make authenticated API requests
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Get the current user's ID token
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Dashboard API services
 */
export const dashboardAPI = {
  // Get user profile with insights
  async getUserProfile() {
    return apiRequest('/v1/users/profile');
  },

  // Get user insights
  async getUserInsights() {
    return apiRequest('/v1/users/insights');
  },

  // Get user pools
  async getUserPools() {
    return apiRequest('/v1/users/pools');
  },

  // Get user transactions
  async getUserTransactions(options = {}) {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.type) params.append('type', options.type);
    if (options.status) params.append('status', options.status);
    
    const queryString = params.toString();
    const endpoint = `/v1/users/transactions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get pool details
  async getPoolDetails(poolId) {
    return apiRequest(`/v1/pools/${poolId}`);
  },

  // Get pool insights
  async getPoolInsights(poolId) {
    return apiRequest(`/v1/pools/${poolId}/insights`);
  },

  // Create a new pool
  async createPool(poolData) {
    return apiRequest('/v1/pools', {
      method: 'POST',
      body: JSON.stringify(poolData)
    });
  },

  // Update an existing pool
  async updatePool(poolId, poolData) {
    return apiRequest(`/v1/pools/${poolId}`, {
      method: 'PUT',
      body: JSON.stringify(poolData)
    });
  },

  // Make a deposit to a pool
  async makeDeposit(poolId, depositData) {
    return apiRequest(`/v1/transactions/pools/${poolId}/deposits`, {
      method: 'POST',
      body: JSON.stringify(depositData)
    });
  },

  // Initiate a withdrawal from a pool
  async initiateWithdrawal(poolId, withdrawalData) {
    return apiRequest(`/v1/transactions/pools/${poolId}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    });
  },

  // Invitation methods
  async createInvitation(poolId, invitationData) {
    return apiRequest(`/v1/invitations/pools/${poolId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(invitationData)
    });
  },

  async getPoolInvitations(poolId) {
    return apiRequest(`/v1/invitations/pools/${poolId}/invitations`);
  },

  async getPendingInvitations() {
    return apiRequest('/v1/invitations/pending');
  },

  async acceptInvitation(invitationData) {
    return apiRequest('/v1/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(invitationData)
    });
  },

  async declineInvitation(invitationId) {
    return apiRequest(`/v1/invitations/${invitationId}/decline`, {
      method: 'PUT'
    });
  },

  async revokeInvitation(invitationId) {
    return apiRequest(`/v1/invitations/${invitationId}/revoke`, {
      method: 'DELETE'
    });
  },

  async getInvitationByCode(inviteCode) {
    return apiRequest(`/v1/invitations/code/${inviteCode}`);
  },
};

/**
 * Error handler for API calls in components
 */
export function handleApiError(error, fallbackMessage = 'Something went wrong') {
  console.error('API Error:', error);
  
  if (error.message.includes('User not authenticated')) {
    // Handle authentication errors
    window.location.href = '/sign-in';
    return;
  }
  
  // Return user-friendly error message
  return error.message || fallbackMessage;
}
