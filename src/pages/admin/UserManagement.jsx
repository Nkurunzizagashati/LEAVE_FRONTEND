import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '../../components/layout/MainLayout';
import { RiSearchLine, RiFilterLine, RiEditLine, RiDeleteBinLine, RiUserLine, RiBuildingLine, RiShieldLine, RiCalendarLine, RiCloseLine, RiAddLine } from 'react-icons/ri';
import { fetchTeamMembers } from '../../store/slices/teamSlice';
import { useToast } from '../../hooks/useToast';
import { fetchDepartments, addDepartment } from '../../store/slices/departmentSlice';
import { updateUser } from '../../store/slices/userSlice';
import { fetchLeaveTypes, updateLeaveType } from '../../store/slices/leaveTypeSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { teamMembers: users, loading, error } = useSelector((state) => state.team);
  const departmentsState = useSelector((state) => state.departments || {});
  const leaveTypesState = useSelector((state) => state.leaveTypes || {});
  
  const { departments = [], loading: departmentsLoading = false, error: departmentsError = null } = departmentsState || {};
  
  console.log("DEPARTMENTS", departments);
  
  const [activeTab, setActiveTab] = useState('users');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [isLeaveBalanceModalOpen, setIsLeaveBalanceModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState(null);
  const [editingUserLeaveBalance, setEditingUserLeaveBalance] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [searchParams, setSearchParams] = useState({
    search: '',
    department: '',
    role: '',
    jobTitle: ''
  });

  // Predefined roles
  const roles = [
    { id: 'ADMIN', name: 'ADMIN' },
    { id: 'MANAGER', name: 'MANAGER' },
    { id: 'STAFF', name: 'STAFF' }
  ];

  // Mock data for leave types
  const leaveTypes = [
    { id: 1, name: 'Annual Leave', accrualRate: 1.66, maxCarryover: 5, description: 'Regular annual leave' },
    { id: 2, name: 'Sick Leave', accrualRate: 1.0, maxCarryover: 0, description: 'Medical leave' },
    { id: 3, name: 'Emergency Leave', accrualRate: 0.5, maxCarryover: 0, description: 'Emergency situations' },
  ];

  useEffect(() => {
    dispatch(fetchTeamMembers())
      .unwrap()
      .catch((err) => showToast(err, 'error'));
    dispatch(fetchDepartments());
    dispatch(fetchLeaveTypes());
  }, [dispatch]);

  // Get unique departments and roles from team members for user section
  const userDepartments = [...new Set(users?.map(user => user?.department || '').filter(Boolean) || [])].map(dept => ({
    id: dept.toLowerCase(),
    name: dept
  }));

  const userRoles = [...new Set(users?.map(user => user?.role || '').filter(Boolean) || [])].map(role => ({
    id: role.toLowerCase(),
    name: role
  }));

  const jobTitles = [...new Set(users?.map(user => user?.jobTitle || '').filter(Boolean) || [])].map(title => ({
    id: title.toLowerCase(),
    name: title
  }));

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      if (!editingUser.id) {
        throw new Error('User ID is missing');
      }

      await dispatch(updateUser({
        userId: editingUser.id,
        userData: {
          department: editingUser.department || null,
          role: editingUser.role || 'PENDING',
          jobTitle: editingUser.jobTitle || null,
        }
      })).unwrap();
      
      // Refresh the team members list to show updated data
      await dispatch(fetchTeamMembers());
      
      showToast('User updated successfully', 'success');
      handleCloseModal();
    } catch (error) {
      showToast(error.message || 'Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Here you would make an API call to delete the user
        showToast('User deleted successfully', 'success');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  };

  const handleAddLeaveType = () => {
    setEditingLeaveType(null);
    setIsLeaveTypeModalOpen(true);
  };

  const handleEditLeaveType = (leaveType) => {
    setEditingLeaveType(leaveType);
    setIsLeaveTypeModalOpen(true);
  };

  const handleEditLeaveBalance = (user) => {
    setEditingUserLeaveBalance(user);
    setIsLeaveBalanceModalOpen(true);
  };

  const handleCloseLeaveTypeModal = () => {
    setIsLeaveTypeModalOpen(false);
    setEditingLeaveType(null);
  };

  const handleCloseLeaveBalanceModal = () => {
    setIsLeaveBalanceModalOpen(false);
    setEditingUserLeaveBalance(null);
  };

  const handleSaveLeaveType = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to save the leave type
    console.log('Saving leave type:', editingLeaveType);
    handleCloseLeaveTypeModal();
  };

  const handleSaveLeaveBalance = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to save the leave balance
    console.log('Saving leave balance:', editingUserLeaveBalance);
    handleCloseLeaveBalanceModal();
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addDepartment(newDepartment)).unwrap();
      showToast('Department added successfully', 'success');
      setIsDepartmentModalOpen(false);
      setNewDepartment({ name: '', description: '' });
    } catch (error) {
      showToast(error.message || 'Failed to add department', 'error');
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchParams.search === '' || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchParams.search.toLowerCase()) ||
      user.email.toLowerCase().includes(searchParams.search.toLowerCase());
    
    const matchesDepartment = searchParams.department === '' || 
      user.department?.toLowerCase() === searchParams.department;
    
    const matchesRole = searchParams.role === '' || 
      user.role?.toLowerCase() === searchParams.role;

    const matchesJobTitle = searchParams.jobTitle === '' || 
      user.jobTitle?.toLowerCase() === searchParams.jobTitle;

    return matchesSearch && matchesDepartment && matchesRole && matchesJobTitle;
  });

  // Department Section
  const renderDepartmentSection = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Departments</h2>
          <button
            onClick={() => setIsDepartmentModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RiAddLine className="mr-2" />
            Add Department
          </button>
        </div>

        {departmentsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : departmentsError ? (
          <div className="text-red-500 text-center py-4">{departmentsError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Head Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {department.headCount || 0} members
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage users, departments, roles, and leave balances</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <RiUserLine className="mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`${
                activeTab === 'departments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <RiBuildingLine className="mr-2" />
              Departments
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <RiShieldLine className="mr-2" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab('leave-balance')}
              className={`${
                activeTab === 'leave-balance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <RiCalendarLine className="mr-2" />
              Leave Balance
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchParams.search}
                      onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select 
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchParams.department}
                    onChange={(e) => setSearchParams({ ...searchParams, department: e.target.value })}
                  >
                    <option value="">All Departments</option>
                    {departments?.map(dept => (
                      <option key={dept._id} value={(dept.name || '').toLowerCase()}>
                        {dept.name || 'Unnamed Department'}
                      </option>
                    ))}
                  </select>
                  <select 
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchParams.role}
                    onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <select 
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchParams.jobTitle}
                    onChange={(e) => setSearchParams({ ...searchParams, jobTitle: e.target.value })}
                  >
                    <option value="">All Job Titles</option>
                    {jobTitles?.map(title => (
                      <option key={`title-${title.id}`} value={title.id}>{title.name || 'Unnamed Title'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-4">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers?.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.profilePictureUrl ? (
                                  <img
                                    src={user.profilePictureUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.department ? (
                                user.department
                              ) : (
                                <span className="text-yellow-600 font-medium">NOT SET</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.jobTitle ? (
                                user.jobTitle
                              ) : (
                                <span className="text-yellow-600 font-medium">NOT SET</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.onLeave ? (
                              <div>
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mb-1">
                                  On Leave
                                </span>
                                <div className="text-xs text-gray-500">
                                  {user.leaveDetails?.leaveType}
                                  <br />
                                  {new Date(user.leaveDetails?.startDate).toLocaleDateString()} - {new Date(user.leaveDetails?.endDate).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              onClick={() => handleEditClick(user)}
                            >
                              <RiEditLine size={20} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <RiDeleteBinLine size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'departments' && renderDepartmentSection()}

          {activeTab === 'roles' && (
            <div className="p-6">
              <div className="mb-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Role
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {role.permissions.map((permission, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{role.userCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">
                            <RiEditLine size={20} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <RiDeleteBinLine size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leave-balance' && (
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-4">
                  <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Leave Types</option>
                    {leaveTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleAddLeaveType}
                >
                  Add Leave Type
                </button>
              </div>

              {/* Leave Types Table */}
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accrual Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Max Carryover
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveTypes.map((type) => (
                      <tr key={type.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{type.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{type.accrualRate} days/month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{type.maxCarryover} days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{type.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            onClick={() => handleEditLeaveType(type)}
                          >
                            <RiEditLine size={20} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <RiDeleteBinLine size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* User Leave Balances */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Leave Balances</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Annual Leave
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sick Leave
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emergency Leave
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.profilePictureUrl ? (
                                  <img
                                    src={user.profilePictureUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.department}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.leaveStatus?.type === 'Annual Leave' ? 'On Leave' : ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.leaveStatus?.type === 'Sick Leave' ? 'On Leave' : ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.leaveStatus?.type === 'Emergency Leave' ? 'On Leave' : ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditLeaveBalance(user)}
                            >
                              <RiEditLine size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveChanges}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={editingUser.firstName}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={editingUser.lastName}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments?.map(dept => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={editingUser.role || ''}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                    <select
                      value={editingUser.jobTitle || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, jobTitle: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Job Title</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Senior Software Engineer">Senior Software Engineer</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>

                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Type Modal */}
        {isLeaveTypeModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}
                </h3>
                <button
                  onClick={handleCloseLeaveTypeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveLeaveType}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editingLeaveType?.name || ''}
                      onChange={(e) => setEditingLeaveType({...editingLeaveType, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Accrual Rate (days/month)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingLeaveType?.accrualRate || ''}
                      onChange={(e) => setEditingLeaveType({...editingLeaveType, accrualRate: parseFloat(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Carryover (days)</label>
                    <input
                      type="number"
                      value={editingLeaveType?.maxCarryover || ''}
                      onChange={(e) => setEditingLeaveType({...editingLeaveType, maxCarryover: parseInt(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingLeaveType?.description || ''}
                      onChange={(e) => setEditingLeaveType({...editingLeaveType, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseLeaveTypeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingLeaveType ? 'Save Changes' : 'Add Leave Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Balance Modal */}
        {isLeaveBalanceModalOpen && editingUserLeaveBalance && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Leave Balance</h3>
                <button
                  onClick={handleCloseLeaveBalanceModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveLeaveBalance}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <input
                      type="text"
                      value={`${editingUserLeaveBalance.firstName} ${editingUserLeaveBalance.lastName}`}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Annual Leave Balance</label>
                    <input
                      type="number"
                      value={editingUserLeaveBalance.annualLeaveBalance || 0}
                      onChange={(e) => setEditingUserLeaveBalance({
                        ...editingUserLeaveBalance,
                        annualLeaveBalance: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sick Leave Balance</label>
                    <input
                      type="number"
                      value={editingUserLeaveBalance.sickLeaveBalance || 0}
                      onChange={(e) => setEditingUserLeaveBalance({
                        ...editingUserLeaveBalance,
                        sickLeaveBalance: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Leave Balance</label>
                    <input
                      type="number"
                      value={editingUserLeaveBalance.emergencyLeaveBalance || 0}
                      onChange={(e) => setEditingUserLeaveBalance({
                        ...editingUserLeaveBalance,
                        emergencyLeaveBalance: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseLeaveBalanceModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Department Modal */}
        {isDepartmentModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Department</h3>
                <button
                  onClick={() => {
                    setIsDepartmentModalOpen(false);
                    setNewDepartment({ name: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
              <form onSubmit={handleAddDepartment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department Name</label>
                    <input
                      type="text"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newDepartment.description}
                      onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDepartmentModalOpen(false);
                      setNewDepartment({ name: '', description: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Add Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagement; 