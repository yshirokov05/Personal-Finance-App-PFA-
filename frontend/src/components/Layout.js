import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, PiggyBank, Settings } from 'lucide-react';

const Layout = ({ children, activeView, setActiveView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'income', label: 'Income', icon: <Wallet size={20} /> },
        { id: 'investments', label: 'Investments', icon: <PiggyBank size={20} /> },
        { id: 'debts', label: 'Debts', icon: <CreditCard size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="p-6 text-2xl font-bold tracking-tight text-blue-400">
                    MyFinance
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`
                                w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition duration-200
                                ${activeView === item.id 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                            `}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
