import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import EditPortfolio from './components/EditPortfolio';
import axios from 'axios';
import Layout from './components/Layout';
import Modal from './components/Modal';

function App() {
  const [netWorth, setNetWorth] = useState(0);
  const [assets, setAssets] = useState([]);
  const [incomes, setIncomes] = useState([]); // New state for incomes
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    axios.get('/api/net_worth') // Use relative URL
        .then(response => {
            setAssets(response.data.assets);
            setIncomes(response.data.incomes); // Set incomes
            setNetWorth(response.data.real_time_net_worth);
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
    axios.put('/api/portfolio', portfolioData) // Use relative URL
      .then(response => { // Use the response to update state
        setAssets(response.data.assets);
        setIncomes(response.data.incomes);
        setNetWorth(response.data.real_time_net_worth);
        setIsModalOpen(false); // Close modal on save
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  if (loading && !isModalOpen) {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (error) {
      return <Layout><div>Error: {error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Portfolio
        </button>
      </div>
      <Dashboard netWorth={netWorth} assets={assets} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Portfolio">
        <EditPortfolio onSave={handleSave} assets={assets} incomes={incomes} /> 
      </Modal>
    </Layout>
  );
}

export default App;
