import MainLayout from '../../components/layout/MainLayout';
import { RiFileExcelLine, RiFileDownloadLine, RiFilterLine } from 'react-icons/ri';

const Reports = () => {
  // Mock data for reports
  const reports = [
    {
      id: 1,
      name: 'Leave Summary Report',
      description: 'Summary of all leave requests by department',
      lastGenerated: '2024-03-15',
      type: 'Excel',
    },
    {
      id: 2,
      name: 'Department Leave Analysis',
      description: 'Detailed analysis of leave patterns by department',
      lastGenerated: '2024-03-14',
      type: 'CSV',
    },
    {
      id: 3,
      name: 'Employee Leave History',
      description: 'Complete leave history for all employees',
      lastGenerated: '2024-03-13',
      type: 'Excel',
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Reports & Export</h1>
          <p className="text-gray-600">Generate and download leave management reports</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-4">
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Report Types</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RiFileExcelLine className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Last generated: {report.lastGenerated}</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full">{report.type}</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RiFileDownloadLine size={20} />
                Download Report
              </button>
            </div>
          ))}
        </div>

        {/* Generate New Report Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="leave_summary">Leave Summary</option>
                <option value="department_analysis">Department Analysis</option>
                <option value="employee_history">Employee History</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports; 