import { leaveApi } from './api';
import axios from 'axios';

const leaveService = {
  // Helper function to get token
  getToken() {
    const authResponse = localStorage.getItem('authResponse');
    if (authResponse) {
      const { token } = JSON.parse(authResponse);
      return token;
    }
    return null;
  },

  // Create a new leave request
  createLeaveRequest: async (leaveData) => {
    try {
      console.log('Creating leave request:', leaveData);
      const response = await leaveApi.post('/requests', leaveData);
      return response.data;
    } catch (error) {
      console.error('Leave request error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to create leave request');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // Get all leave requests for the current user
  getLeaveRequests: async () => {
    try {
      const response = await leaveApi.get('/requests');
      return response.data;
    } catch (error) {
      console.error('Get leave requests error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch leave requests');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // Get a specific leave request by ID
  getLeaveRequest: async (requestId) => {
    try {
      const response = await leaveApi.get(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Get leave request error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch leave request');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // Update a leave request
  updateLeaveRequest: async (requestId, leaveData) => {
    try {
      const response = await leaveApi.put(`/requests/${requestId}`, leaveData);
      return response.data;
    } catch (error) {
      console.error('Update leave request error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update leave request');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // Cancel a leave request
  cancelLeaveRequest: async (requestId) => {
    try {
      const response = await leaveApi.delete(`/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel leave request error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to cancel leave request');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // Leave Balance
  getLeaveBalance: async () => {
    const response = await leaveApi.get('/balances/all');
    return response.data;
  },

  // Leave History
  getLeaveHistory: async (params = {}) => {
    const response = await leaveApi.get('/leave/history', { params });
    return response.data;
  },

  // Leave Types
  getLeaveTypes: async () => {
    const response = await leaveApi.get('/leave/types');
    return response.data;
  },

  // Leave Approvals
  approveLeaveRequest: async (id, { comment }) => {
    const token = leaveService.getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      const response = await axios.post(
        `${leaveApi.defaults.baseURL}/requests/${id}/approve`,
        {
          status: 'approved',
          comment: comment || ''
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve leave request');
    }
  },

  rejectLeaveRequest: async (id, { comment }) => {
    const token = leaveService.getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    if (!comment || comment.length < 10) {
      throw new Error('Rejection reason must be at least 10 characters long');
    }

    try {
      const response = await axios.post(
        `${leaveApi.defaults.baseURL}/requests/${id}/reject`,
        {
          status: 'rejected',
          rejectionReason: comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject leave request');
    }
  },

  // Get pending leave requests for approval
  getPendingLeaveRequests: async () => {
    try {
      const response = await leaveApi.get('/requests/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending leave requests error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch pending leave requests');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },
};

export default leaveService; 