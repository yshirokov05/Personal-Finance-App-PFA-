import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import EditPortfolio from './components/EditPortfolio';
import TaxCalculator from './components/TaxCalculator';
import axios from 'axios';
import Layout from './components/Layout';
import Modal from './components/Modal';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainContent({ isGuest, onResetGuest }) {
  const { currentUser, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [netWorth, setNetWorth] = useState(0);
  const [assets, setAssets] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [debts, setDebts] = useState([]);
  const [retirementAccounts, setRetirementAccounts] = useState([]);
  const [taxLiability, setTaxLiability] = useState({ 
    total: 0, 
    federal: 0, 
    state: 0,
    fica: 0
  });
  const [userTaxInfo, setUserTaxInfo] = useState({ filing_status: 'SINGLE', state: 'CA' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('income');

  const fetchData = async () => {
    // Both guest and authenticated users can fetch data
    try {
        let headers = {};
        if (!isGuest && currentUser) {
            const token = await currentUser.getIdToken(true);
            headers = {
              headers: { Authorization: `Bearer ${token}` }
            };
        }
        
        console.log("Fetching data...");
        const response = await axios.get('/api/net_worth', headers);
        setAssets(response.data.assets);
        setIncomes(response.data.incomes);
        setDebts(response.data.debts);
        setRetirementAccounts(response.data.retirement_accounts || []);
        setNetWorth(response.data.real_time_net_worth);
        setTaxLiability({
            total: response.data.estimated_tax_liability,
            federal: response.data.estimated_federal_tax,
            state: response.data.estimated_state_tax,
            fica: response.data.estimated_fica_tax
        });
        setUserTaxInfo({
            filing_status: response.data.filing_status,
            state: response.data.state
        });
        setLoading(false);
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, isGuest]);

  const handleSave = async (portfolioData) => {
    setLoading(true);
    try {
        let headers = {};
        if (!isGuest && currentUser) {
            const token = await currentUser.getIdToken(true);
            headers = {
              headers: { Authorization: `Bearer ${token}` }
            };
        }
        const response = await axios.put('/api/portfolio', portfolioData, headers);
        setAssets(response.data.assets);
        setIncomes(response.data.incomes);
        setDebts(response.data.debts);
        setRetirementAccounts(response.data.retirement_accounts || []);
        setNetWorth(response.data.real_time_net_worth);
        setTaxLiability({
          total: response.data.estimated_tax_liability,
          federal: response.data.estimated_federal_tax,
          state: response.data.estimated_state_tax,
          fica: response.data.estimated_fica_tax
        });
        setUserTaxInfo({
            filing_status: response.data.filing_status,
            state: response.data.state
        });
        setIsModalOpen(false);
        setLoading(false);
        setError(null);
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        alert(msg);
        setError(msg);
        setLoading(false);
    }
  };

  const handleSaveTaxInfo = async (taxData) => {
    setLoading(true);
    try {
        let headers = {};
        if (!isGuest && currentUser) {
            const token = await currentUser.getIdToken(true);
            headers = {
              headers: { Authorization: `Bearer ${token}` }
            };
        }
        const response = await axios.put('/api/user_tax_info', taxData, headers);
        setNetWorth(response.data.real_time_net_worth);
        setTaxLiability({
          total: response.data.estimated_tax_liability,
          federal: response.data.estimated_federal_tax,
          state: response.data.estimated_state_tax,
          fica: response.data.estimated_fica_tax
        });
        setUserTaxInfo({
            filing_status: response.data.filing_status,
            state: response.data.state
        });
        setLoading(false);
        setError(null);
    } catch (error) {
        const msg = error.response?.data?.error || error.message;
        alert(msg);
        setError(msg);
        setLoading(false);
    }
  };

  const openEditModal = (tab = 'income') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  if (loading && !isModalOpen) {
    return <Layout activeView={activeView} setActiveView={setActiveView}><div>Loading...</div></Layout>;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard netWorth={netWorth} assets={assets} debts={debts} taxLiability={taxLiability} />;
      case 'income':
        const totalAnnualIncomeForOverview = incomes.reduce((acc, inc) => acc + inc.amount, 0);
        const totalMonthlyIncomeForOverview = totalAnnualIncomeForOverview / 12;
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Income Overview</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-600">Total Annual Gross Income: <span className="font-bold text-green-600">${totalAnnualIncomeForOverview.toLocaleString()}</span></p>
                    <p className="text-gray-600">Total Monthly Gross Income: <span className="font-bold text-green-600">${totalMonthlyIncomeForOverview.toLocaleString()}</span></p>
                  </div>
                  <button onClick={() => openEditModal('income')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update Income</button>
               </div>
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
                  <p className="text-gray-600">Total Debt Balance: <span className="font-bold text-red-600">${debts.reduce((acc, d) => acc + d.remaining_balance, 0).toLocaleString()}</span></p>
                  <button onClick={() => openEditModal('debts')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Manage Debts</button>
               </div>
               <Dashboard debts={debts} assets={[]} netWorth={0} hideSummary hideAssetSections={true} showDebtAllocation={true} />
            </div>
          </div>
        );
      case 'taxes':
        const totalAnnualIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800">Tax Estimation</h2>
                <TaxCalculator 
                    initialFilingStatus={userTaxInfo.filing_status}
                    initialState={userTaxInfo.state}
                    onSave={handleSaveTaxInfo}
                    estimatedFederalTax={taxLiability.federal}
                    estimatedStateTax={taxLiability.state}
                    estimatedFicaTax={taxLiability.fica}
                    totalIncome={totalAnnualIncome}
                />
            </div>
        );
      case 'settings':
          return (
              <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      {isGuest ? (
                        <div className="space-y-4">
                            <p className="text-lg text-gray-700 font-medium">To access settings, please make an account.</p>
                            <button 
                                onClick={onResetGuest}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Create an Account
                            </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            <p className="text-gray-600 italic">Logged in as: <strong className="text-gray-900 not-italic">{currentUser?.email}</strong></p>
                            <button 
                                onClick={() => logout()}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </div>
                      )}
                  </div>
              </div>
          )
      default:
        return <div>Coming Soon...</div>;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Portfolio">
        <EditPortfolio onSave={handleSave} assets={assets} incomes={incomes} debts={debts} retirementAccounts={retirementAccounts} initialTab={modalTab} /> 
      </Modal>
    </Layout>
  );
}

function App() {
    const { currentUser } = useAuth();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const handleGuest = () => setIsGuest(true);
        window.addEventListener('continue-as-guest', handleGuest);
        return () => window.removeEventListener('continue-as-guest', handleGuest);
    }, []);

    return (
        <ErrorBoundary>
            {(currentUser || isGuest) ? (
                <MainContent isGuest={isGuest} onResetGuest={() => setIsGuest(false)} />
            ) : (
                <Login />
            )}
        </ErrorBoundary>
    );
}

export default function Root() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
