import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiFilterLine, RiSearchLine, RiCloseLine } from 'react-icons/ri';
import MainLayout from '../../components/layout/MainLayout';
import { useToast } from '../../hooks/useToast';
import { Alert } from '../../components/common/Alert';
import { fetchLeaveHistory } from '../../store/slices/leaveSlice';

const LeaveHistory = () => {
  const dispatch = useDispatch();
  const { leaveHistory, loading, error } = useSelector((state) => state?.leave);
  const { showToast } = useToast();

  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only fetch if we don't have data or if we need to refresh
    if (!leaveHistory?.length) {
      dispatch(fetchLeaveHistory())
        .unwrap()
        .catch((error) => {
          showToast(error || 'Failed to load leave requests', 'error');
        });
    }
  }, [dispatch, leaveHistory?.length]);

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const filteredLeaves = leaveHistory?.filter(leave => {
    const matchesStatus = filters?.status === 'all' || leave?.status === filters?.status;
    const matchesType = filters?.type === 'all' || leave?.leaveType?.name?.toLowerCase()?.includes(filters?.type?.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      leave?.reason?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      leave?.type?.toLowerCase()?.includes(searchQuery?.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by reason or leave type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <RiCloseLine size={20} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                    <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave History List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {error && <Alert type="error" message={error} />}
            
            {loading ? (
              <div className="flex items-center justify-center px-6 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                        Applied On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaves?.length === 0 ? (
                      <tr key="no-results">
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No leave requests found
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves?.map((leave) => (
                        <tr key={`leave-${leave?.id}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {leave?.leaveType?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(leave?.startDate)?.toLocaleDateString()} - {new Date(leave?.endDate)?.toLocaleDateString()} {' '} <span className='text-sm font-medium text-gray-900'>[{leave?.numberOfDays} days]</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {leave?.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(leave?.createdAt)?.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[leave?.status]}`}>
                              {leave?.status?.charAt(0)?.toUpperCase() + leave?.status?.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LeaveHistory; 