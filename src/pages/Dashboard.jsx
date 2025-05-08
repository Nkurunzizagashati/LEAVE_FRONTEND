import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import { RiCalendarLine, RiTeamLine } from 'react-icons/ri';
import { fetchLeaveHistory, fetchLeaveBalance } from '../store/slices/leaveSlice';
import { fetchTeamMembers } from '../store/slices/teamSlice';
import { useToast } from '../hooks/useToast';
import { Alert } from '../components/common/Alert';
import Holidays from 'date-holidays';

export const Dashboard = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { leaveHistory, leaveBalance, loading: leaveLoading, error: leaveError } = useSelector((state) => state.leave);
  const { teamMembers, loading: teamLoading, error: teamError } = useSelector((state) => state.team);

  console.log("LEAVE BALANCE", leaveBalance);

  // Initialize holidays for Rwanda
  const hd = new Holidays('RW');
  
  // Get upcoming holidays for the current year
  const getUpcomingHolidays = () => {
    const currentYear = new Date().getFullYear();
    const holidays = hd.getHolidays(currentYear);
    
    // Filter and format upcoming holidays
    return holidays
      .filter(holiday => new Date(holiday.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3)
      .map(holiday => ({
        id: holiday.date,
        name: holiday.name,
        date: holiday.date
      }));
  };

  const [upcomingHolidays, setUpcomingHolidays] = useState(getUpcomingHolidays());

  // Calculate stats from leaveHistory
  const stats = {
    totalLeaves: leaveHistory?.length || 0,
    pendingLeaves: leaveHistory?.filter(leave => leave.status === 'pending')?.length || 0,
    approvedLeaves: leaveHistory?.filter(leave => leave.status === 'approved')?.length || 0,
    rejectedLeaves: leaveHistory?.filter(leave => leave.status === 'rejected')?.length || 0
  };

  // Get recent leave requests (most recent 3)
  const recentLeaveRequests = leaveHistory
    ? [...leaveHistory]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
        .map(leave => ({
          id: leave._id,
          type: leave.status,
          leaveType: leave.leaveType?.name,
          startDate: new Date(leave.startDate).toLocaleDateString(),
          endDate: new Date(leave.endDate).toLocaleDateString(),
          numberOfDays: leave.numberOfDays
        }))
    : [];

  useEffect(() => {
    dispatch(fetchLeaveHistory())
      .unwrap()
      .catch((err) => showToast(err, 'error'));

    dispatch(fetchLeaveBalance())
      .unwrap()
      .catch((err) => showToast(err, 'error'));

    dispatch(fetchTeamMembers())
      .unwrap()
      .catch((err) => showToast(err, 'error'));

    // Update holidays at the start of each day
    const updateHolidays = () => {
      setUpcomingHolidays(getUpcomingHolidays());
    };

    // Update holidays immediately
    updateHolidays();

    // Set up interval to update holidays at the start of each day
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;

    const intervalId = setInterval(updateHolidays, 24 * 60 * 60 * 1000); // Update every 24 hours
    const initialTimeoutId = setTimeout(updateHolidays, timeUntilMidnight); // Update at midnight

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeoutId);
    };
  }, [dispatch]);

  // Filter team members who are currently on leave
  const teammatesOnLeave = teamMembers?.filter(member => member.onLeave) || [];

  console.log(leaveBalance);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's an overview of your leave management system.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Leaves Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalLeaves}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Leaves Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.pendingLeaves}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Approved Leaves Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.approvedLeaves}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rejected Leaves Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Leaves</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.rejectedLeaves}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balance and Upcoming Holidays */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Leave Balance */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Leave Balance</h2>
              </div>
              <div className="p-6">
                {leaveLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : leaveError ? (
                  <Alert type="error" message={leaveError} />
                ) : (
                  <div className="space-y-2 ">
                    {Array.isArray(leaveBalance) ? (
                      leaveBalance.map(leave => (
                        <div key={leave.leaveType._id} className="flex justify-between items-center hover:bg-gray-100">
                          <span className="text-gray-600 capitalize">{leave.leaveType.name}</span>
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-gray-800">{leave.availableBalance} <span className='text-gray-600'>days</span></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">No leave balance data available</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Holidays</h2>
              </div>
              <div className="p-6">
                {upcomingHolidays.length === 0 ? (
                  <div className="text-center text-gray-500">No upcoming holidays</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingHolidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <RiCalendarLine className="text-blue-500" size={20} />
                          <span className="text-gray-800">{holiday.name}</span>
                        </div>
                        <span className="text-gray-600">{new Date(holiday.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teammates on Leave and Recent Leave Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teammates on Leave */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Teammates on Leave</h2>
              </div>
              <div className="p-6">
                {teamLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : teamError ? (
                  <Alert type="error" message={teamError} />
                ) : teammatesOnLeave.length === 0 ? (
                  <div className="text-center text-gray-500">No team members are currently on leave</div>
                ) : (
                  <div className="space-y-4">
                    {teammatesOnLeave.map((teammate) => (
                      <div key={teammate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <RiTeamLine className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{teammate.firstName} {teammate.lastName}</p>
                            <p className="text-sm text-gray-600 capitalize">{teammate.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800 capitalize">{teammate.leaveDetails.leaveType} Leave</p>
                          <p className="text-sm text-gray-600">
                            {new Date(teammate.leaveDetails.startDate).toLocaleDateString()} - {new Date(teammate.leaveDetails.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Leave Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recent Leave Requests</h2>
              </div>
              <div className="p-6">
                {leaveLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : leaveError ? (
                  <Alert type="error" message={leaveError} />
                ) : recentLeaveRequests.length === 0 ? (
                  <div className="text-center text-gray-500">No recent leave requests</div>
                ) : (
                  <div className="space-y-4">
                    {recentLeaveRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            request.type === 'approved' ? 'bg-green-100' :
                            request.type === 'pending' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              request.type === 'approved' ? 'text-green-600' :
                              request.type === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {request.type === 'approved' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              ) : request.type === 'pending' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 capitalize">{request.leaveType} Leave</p>
                            <p className="text-sm text-gray-600">
                              {request.startDate} - {request.endDate} <span className="font-medium">({request.numberOfDays} days)</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            request.type === 'approved' ? 'text-green-600' :
                            request.type === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

