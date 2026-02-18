import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import EditPortfolio from './components/EditPortfolio';
import axios from 'axios';
import Layout from './components/Layout';
import Modal from './components/Modal';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [netWorth, setNetWorth] = useState(0);
  const [assets, setAssets] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [debts, setDebts] = useState([]);
  const [taxLiability, setTaxLiability] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('income');

  const fetchData = () => {
    axios.get('/api/net_worth')
        .then(response => {
            setAssets(response.data.assets);
            setIncomes(response.data.incomes);
            setDebts(response.data.debts);
            setNetWorth(response.data.real_time_net_worth);
            setTaxLiability(response.data.estimated_tax_liability);
            setLoading(false);
        })
        .catch(error => {
            setError(error.message);
            setLoading(false);
        });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = (portfolioData) => {
    setLoading(true);
    axios.put('/api/portfolio', portfolioData)
      .then(response => {
        setAssets(response.data.assets);
        setIncomes(response.data.incomes);
        setDebts(response.data.debts);
        setNetWorth(response.data.real_time_net_worth);
        setTaxLiability(response.data.estimated_tax_liability);
        setIsModalOpen(false);
        setLoading(false);
        setError(null);
      })
      .catch(error => {
        const msg = error.response?.data?.error || error.message;
        alert(msg); // Alert user of validation failure
        setError(msg);
        setLoading(false);
      });
  };

  const openEditModal = (tab = 'income') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  if (loading && !isModalOpen) {
    return <Layout activeView={activeView} setActiveView={setActiveView}><div>Loading...</div></Layout>;
  }

  if (error) {
      return <Layout activeView={activeView} setActiveView={setActiveView}><div>Error: {error}</div></Layout>;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard netWorth={netWorth} assets={assets} debts={debts} taxLiability={taxLiability} />;
      case 'income':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Income Overview</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">Total Annual Gross Income: <span className="font-bold text-green-600">${incomes.reduce((acc, inc) => acc + inc.amount, 0).toLocaleString()}</span></p>
                  <button onClick={() => openEditModal('income')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update Income</button>
               </div>
               {/* Display income details... */}
            </div>
          </div>
        );
      case 'investments':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Investment Portfolio</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">Total Asset Value: <span className="font-bold text-blue-600">${assets.reduce((acc, a) => acc + (a.shares * (a.current_price || a.cost_basis/a.shares || 0)), 0).toLocaleString()}</span></p>
                  <button onClick={() => openEditModal('investments')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Manage Assets</button>
               </div>
               <Dashboard assets={assets} debts={[]} netWorth={0} hideSummary />
            </div>
          </div>
        );
      case 'debts':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Debts & Liabilities</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">Total Debt Balance: <span className="font-bold text-red-600">${debts.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}</span></p>
                  <button onClick={() => openEditModal('debts')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Manage Debts</button>
               </div>
               {/* Display debt details... */}
            </div>
          </div>
        );
      default:
        return <div>Coming Soon...</div>;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Portfolio">
        <EditPortfolio onSave={handleSave} assets={assets} incomes={incomes} debts={debts} initialTab={modalTab} /> 
      </Modal>
    </Layout>
  );
}

export default App;
