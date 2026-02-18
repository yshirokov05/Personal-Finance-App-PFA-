import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-4 text-xl font-bold">PFA</div>
                <nav className="mt-10">
                    <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</a>
                    <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Transactions</a>
                    <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Settings</a>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
