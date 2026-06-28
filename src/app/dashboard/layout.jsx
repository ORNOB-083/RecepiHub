// app/dashboard/layout.jsx
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f1117]">
        {children}
      </main>
    </div>
  );
}