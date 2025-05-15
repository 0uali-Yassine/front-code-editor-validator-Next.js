// import React from 'react';

// const ManagerDashboard: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-white p-8">
//       <h1 className="text-3xl font-bold">Manager Dashboard</h1>
//       <p className="mt-4 text-gray-600">Welcome to the manager dashboard. This area is under construction.</p>
//     </div>
//   );
// };

// export default ManagerDashboard;

import { useRouter } from "next/router";
import Dashboard from "../components/dashboard"
import { mockDashboardData } from "../data"

export default function ManagerDashboard() {

 
  return (
    <div>
      <Dashboard data={mockDashboardData} />
    </div>
  )
}
