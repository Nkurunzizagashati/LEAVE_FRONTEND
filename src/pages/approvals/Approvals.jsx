import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '../../components/layout/MainLayout';
import { RiCheckLine, RiCloseLine, RiSearchLine, RiFilterLine } from 'react-icons/ri';
import { useToast } from '../../hooks/useToast';
import { Alert } from '../../components/common/Alert';
import { fetchTeamMembers } from '../../store/slices/teamSlice';
import leaveService from '../../services/leaveService';
import { useNavigate } from 'react-router-dom';

const Approvals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { teamMembers, loading: teamLoading, error: teamError } = useSelector((state) => state.team);
  const [userRole, setUserRole] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // First useEffect to get role from localStorage
  useEffect(() => {
    const authResponse = localStorage.getItem('authResponse');
    if (authResponse) {
      const { user } = JSON.parse(authResponse);
      setUserRole(user.role);
    }
  }, []);

  // Second useEffect to handle role-based actions
  useEffect(() => {
    

    const fetchData = async () => {
      try {
        // Fetch team members
        await dispatch(fetchTeamMembers()).unwrap();
        
        // Fetch pending leave requests
        const response = await leaveService.getPendingLeaveRequests();
        // Access the data property from the response
        const requests = Array.isArray(response.data) ? response.data : [];
        setPendingRequests(requests);
      } catch (err) {
        setError(err.message);
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userRole, navigate]);

  // Calculate department summary from team members
  const departmentSummary = teamMembers?.reduce((acc, member) => {
    const dept = member.department;
    if (!acc[dept]) {
      acc[dept] = {
        department: dept,
        totalEmployees: 0,
        onLeave: 0,
        pendingRequests: 0
      };
    }
    acc[dept].totalEmployees++;
    if (member.onLeave) {
      acc[dept].onLeave++;
    }
    return acc;
  }, {});

  // Update pending requests count in department summary
  if (Array.isArray(pendingRequests)) {
    pendingRequests.forEach(request => {
      // Find the department of the user from team members
      const userTeamMember = teamMembers?.find(member => member.id === request.user.id);
      if (userTeamMember?.department) {
        const dept = userTeamMember.department;
        if (departmentSummary[dept]) {
          departmentSummary[dept].pendingRequests++;
        }
      }
    });
  }

  const handleActionClick = (request, type) => {
    if (userRole !== 'ROLE_MANAGER') {
      showToast('You do not have permission to approve/reject leave requests', 'error');
      return;
    }
    setSelectedRequest(request);
    setActionType(type);
    setComment('');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setComment('');
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !actionType) return;
    if (userRole !== 'ROLE_MANAGER') {
      showToast('You do not have permission to approve/reject leave requests', 'error');
      return;
    }

    // Validate rejection reason
    if (actionType === 'reject' && (!comment || comment.length < 10)) {
      showToast('Please provide a rejection reason (minimum 10 characters)', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await leaveService.approveLeaveRequest(selectedRequest._id, { comment });
        showToast('Leave request approved successfully', 'success');
      } else {
        await leaveService.rejectLeaveRequest(selectedRequest._id, { comment });
        showToast('Leave request rejected successfully', 'success');
      }
      
      // Update the pending requests list
      setPendingRequests(prev => prev.filter(req => req._id !== selectedRequest._id));
      handleCloseModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not a manager, don't render the component
  
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Leave Approvals</h1>
          <p className="text-gray-600">Review and manage leave requests from your team</p>
        </div>

        {/* Department Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.values(departmentSummary || {}).map((dept) => (
            <div key={dept.department} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{dept.department}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Employees</span>
                  <span className="font-medium">{dept.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently on Leave</span>
                  <span className="font-medium text-blue-600">{dept.onLeave}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Requests</span>
                  <span className="font-medium text-yellow-600">{dept.pendingRequests}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">All Departments</option>
                  {Object.keys(departmentSummary || {}).map(dept => (
                    <option key={dept} value={dept} className="capitalize">{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <Alert type="error" message={error} />
            ) : !Array.isArray(pendingRequests) || pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending leave requests</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {`${request.user.firstName[0]}${request.user.lastName[0]}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{`${request.user.firstName} ${request.user.lastName}`}</div>
                            <div className="text-sm text-gray-500 capitalize">{request.user.jobTitle || 'No job title'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {request.leaveType.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleActionClick(request, 'approve')}
                            className="p-2 text-green-600 hover:text-green-900 bg-green-50 rounded-lg"
                          >
                            <RiCheckLine size={20} />
                          </button>
                          <button 
                            onClick={() => handleActionClick(request, 'reject')}
                            className="p-2 text-red-600 hover:text-red-900 bg-red-50 rounded-lg"
                          >
                            <RiCloseLine size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    {actionType === 'approve' 
                      ? 'Are you sure you want to approve this leave request?'
                      : 'Are you sure you want to reject this leave request?'}
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {actionType === 'approve' ? 'Add a comment (optional)' : 'Rejection reason (required, min 10 characters)'}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder={actionType === 'approve' 
                        ? "Enter your comment here..."
                        : "Please provide a reason for rejection (minimum 10 characters)..."}
                      required={actionType === 'reject'}
                    />
                    {actionType === 'reject' && comment.length > 0 && comment.length < 10 && (
                      <p className="mt-1 text-sm text-red-600">
                        Rejection reason must be at least 10 characters long
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-4 py-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      actionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                    disabled={isSubmitting || (actionType === 'reject' && (!comment || comment.length < 10))}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      actionType === 'approve' ? 'Approve' : 'Reject'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Approvals; 