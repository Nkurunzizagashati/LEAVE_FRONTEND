import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leaveService from '../services/leaveService';

export const useLeave = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createLeaveRequest = async (leaveData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveService.createLeaveRequest(leaveData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveService.getLeaveRequests();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLeaveRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveService.getLeaveRequest(requestId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveRequest = async (requestId, leaveData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveService.updateLeaveRequest(requestId, leaveData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelLeaveRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaveService.cancelLeaveRequest(requestId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createLeaveRequest,
    getLeaveRequests,
    getLeaveRequest,
    updateLeaveRequest,
    cancelLeaveRequest,
  };
}; 