import React from 'react';
import { LayoutDashboard, Server, FileText, Activity, BrainCircuit } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'workloads', label: 'Workloads', icon: Server },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'optimizer', label: 'AI Optimizer', icon: BrainCircuit },
  ];

  return (
    <div className="w-64 bg-ibm-black border-r border-ibm-gray h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center space-x-3 border-b border-ibm-gray">
        <Activity className="text-ibm-blue w-6 h-6" />
        <span className="text-sm font-bold tracking-wider text-white">HYBRID<span className="text-ibm-blue">OPS</span></span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group ${
                isActive 
                  ? 'bg-ibm-gray text-white border-l-4 border-ibm-blue' 
                  : 'text-gray-400 hover:bg-ibm-gray hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-ibm-blue' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ibm-gray">
        <div className="bg-ibm-gray/50 p-3 rounded text-xs text-gray-500">
          <p>Cluster: <span className="text-green-400">Online</span></p>
          <p>Agent: <span className="text-green-400">v2.4.1</span></p>
          <p className="mt-2 text-ibm-blue">IBM ISDL Mode</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;