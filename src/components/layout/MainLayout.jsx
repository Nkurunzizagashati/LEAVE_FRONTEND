  import { useState, useEffect } from 'react';
  import { Link, useLocation } from 'react-router-dom';
  import {
    RiDashboardLine,
    RiAddLine,
    RiFileListLine,
    RiTeamLine,
    RiCheckboxCircleLine,
    RiUserSettingsLine,
    RiFileExcelLine,
    RiSettings4Line,
    RiMenuFoldLine,
    RiMenuUnfoldLine,
    RiSearchLine,
    RiNotification3Line,
    RiUserLine,
    RiLogoutBoxLine,
  } from 'react-icons/ri';
  import { useSelector } from 'react-redux';

  const getUserData = () => {
    try {
      const storedResponse = sessionStorage.getItem('authResponse');
      if (storedResponse) {
        const authData = JSON.parse(storedResponse);
        return authData.user;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  };

  const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const [userData] = useState(getUserData());
    const loggedInUser = useSelector((state) => state?.user);

    const userRole = loggedInUser.userProfile?.user?.role;

    const menuItems = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <RiDashboardLine size={20} />,
        path: '/dashboard',
      },
      {
        key: 'apply-leave',
        label: 'Apply Leave',
        icon: <RiAddLine size={20} />,
        path: '/leaves/apply',
      },
      {
        key: 'leave-history',
        label: 'Leave History',
        icon: <RiFileListLine size={20} />,
        path: '/leaves/history',
      },
      {
        key: 'team-calendar',
        label: 'Team Calendar',
        icon: <RiTeamLine size={20} />,
        path: '/calendar',
      },
      ...(userRole === 'MANAGER' || userRole === 'ADMIN'
        ? [
            {
              key: 'approvals',
              label: 'Approvals',
              icon: <RiCheckboxCircleLine size={20} />,
              path: '/approvals',
            },
            {
              key: 'reports',
              label: 'Reports & Export',
              icon: <RiFileExcelLine size={20} />,
              path: '/admin/reports',
            },
            
            // 👇 Only this user sees the reports route
            ...(userRole === 'ADMIN'
              ? [
                  
                  {
                    key: 'user-management',
                    label: 'User Management',
                    icon: <RiUserSettingsLine size={20} />,
                    path: '/admin/users',
                  },
                ]
              : []),
          ]
        : []),
      {
        key: 'settings',
        label: 'Settings',
        icon: <RiSettings4Line size={20} />,
        path: '/settings',
      },
    ];

    const isActive = (path) => location.pathname === path;

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
          <div className="h-full px-4 flex items-center justify-between">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {collapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <RiNotification3Line size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                {userData?.profilePictureUrl ? (
                  <img
                    src={userData.profilePictureUrl}
                    alt={userData.lastName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <RiUserLine className="text-blue-600" size={20} />
                  </div>
                )}
                <span className="text-sm font-medium">{userData?.lastName || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-center border-b">
              <h1 className={`font-bold text-xl text-blue-600 ${collapsed ? 'hidden' : 'block'}`}>
                LeaveMS
              </h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-3">
                {menuItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 text-gray-700 rounded-lg ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-3">{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-gray-200 p-4">
              <Link
                to="/login"
                className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  isActive('/login') ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <RiLogoutBoxLine size={20} />
                {!collapsed && <span className="ml-3">Login</span>}
              </Link>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-300 pt-16 ${collapsed ? 'ml-20' : 'ml-64'}`}>
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  };

  export default MainLayout;
