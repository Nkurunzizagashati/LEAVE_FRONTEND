import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiFilterLine, RiTeamLine, RiCalendarLine, RiUserFollowLine } from 'react-icons/ri';
import MainLayout from '../../components/layout/MainLayout';
import { fetchTeamMembers } from '../../store/slices/teamSlice'; // adjust path if needed
import { useToast } from '../../hooks/useToast';
import { Alert } from '../../components/common/Alert';

const TeamCalendar = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { leaveHistory } = useSelector((state) => state.leave);
  const { teamMembers: members, loading, error } = useSelector((state) => state.team);

  // Calculate stats
  const stats = {
    totalTeamMembers: members?.length || 0,
    currentlyOnLeave: members?.filter(member => member.onLeave)?.length || 0,
    totalLeaves: leaveHistory?.length || 0,
    upcomingLeaves: leaveHistory?.filter(leave => 
      new Date(leave.startDate) > new Date() && 
      new Date(leave.startDate) <= new Date(new Date().setDate(new Date().getDate() + 7))
    )?.length || 0
  };

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'design', name: 'Design' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'hr', name: 'Human Resources' },
  ];

  useEffect(() => {
    dispatch(fetchTeamMembers())
      .unwrap()
      .catch((err) => showToast(err, 'error'));
  }, [dispatch]);

  const getReturnDate = (endDate) => {
    const date = new Date(endDate);
    date?.setDate(date?.getDate() + 1);
    return date?.toLocaleDateString();
  };

  const filteredMembers = selectedDepartment === 'all'
    ? members
    : members?.filter(
        (member) => member.department.toLowerCase() === selectedDepartment
      );

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Team Members */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Team Members</p>
                  <p className="text-2xl font-semibold text-gray-800">{stats.totalTeamMembers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <RiTeamLine className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Currently on Leave */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently on Leave</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.currentlyOnLeave}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <RiUserFollowLine className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Total Leaves */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.totalLeaves}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <RiCalendarLine className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Upcoming Leaves */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Leaves (7 days)</p>
                  <p className="text-2xl font-semibold text-purple-600">{stats.upcomingLeaves}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <RiCalendarLine className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {error && <Alert type="error" message={error} />}

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMembers?.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No team members found
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member?.firstName
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {member?.lastName} {member?.firstName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {member?.jobTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {member.onLeave ? (
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                On Leave
                              </span>
                              <span className="text-sm text-gray-500 mt-1">
                                Until {getReturnDate(member?.leaveDetails?.endDate)}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeamCalendar;
