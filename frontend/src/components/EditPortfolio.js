import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Briefcase, DollarSign } from 'lucide-react';

const EditPortfolio = ({ onSave, assets: initialAssets, incomes: initialIncomes, debts: initialDebts, retirementAccounts: initialRetirementAccounts, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'income');
    const [assets, setAssets] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [debts, setDebts] = useState([]);
    const [retirementAccounts, setRetirementAccounts] = useState([]);
    
    // For Income Tab
    const [incomeYear, setIncomeYear] = useState(2026);

    // For Retirement Tab
    const [editingAccountAssets, setEditingAccountAssets] = useState(null); // ID of account being edited

    useEffect(() => {
        setAssets(initialAssets || []);
        const mappedIncomes = (initialIncomes || []).map(income => ({
            ...income,
            yearly_income: income.monthly_income ? income.monthly_income * 12 : (income.amount || 0),
            year: income.year || 2026
        }));
        setIncomes(mappedIncomes);
        setDebts(initialDebts || []);
        setRetirementAccounts(initialRetirementAccounts || []);
    }, [initialAssets, initialIncomes, initialDebts, initialRetirementAccounts]);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // --- ASSET LOGIC ---
    const handleAssetChange = (index, field, value) => {
        const updatedAssets = [...assets];
        const asset = { ...updatedAssets[index], [field]: value };
        
        if (field === 'shares' || field === 'cost_per_share') {
            const shares = field === 'shares' ? Number(value) : Number(asset.shares);
            const costPerShare = field === 'cost_per_share' ? Number(value) : Number(asset.cost_per_share || 0);
            asset.cost_basis = shares * costPerShare;
        }

        updatedAssets[index] = asset;
        setAssets(updatedAssets);
    };

    const addAsset = (retirementAccountId = null) => {
        setAssets([...assets, { 
            ticker: '', 
            shares: 0, 
            cost_basis: 0, 
            cost_per_share: 0, 
            asset_type: 'STOCK',
            retirement_account_id: retirementAccountId
        }]);
    };

    const removeAsset = (index) => {
        setAssets(assets.filter((_, i) => i !== index));
    };

    const getAssetsForAccount = (accountId) => {
        return assets.map((asset, index) => ({ ...asset, originalIndex: index }))
                     .filter(asset => asset.retirement_account_id === accountId);
    };

    const getTaxableAssets = () => {
        return assets.map((asset, index) => ({ ...asset, originalIndex: index }))
                     .filter(asset => !asset.retirement_account_id);
    };

    // --- INCOME LOGIC ---
    const handleIncomeChange = (index, field, value) => {
        const updatedIncomes = [...incomes];
        const income = { ...updatedIncomes[index], [field]: value };
        
        if (income.income_type === 'SALARY') {
            if (field === 'monthly_income') {
                income.yearly_income = value ? Number(value) * 12 : 0;
            } else if (field === 'yearly_income') {
                income.monthly_income = value ? Number(value) / 12 : 0;
            }
        }
        
        updatedIncomes[index] = income;
        setIncomes(updatedIncomes);
    };

    const addIncome = (year) => {
        setIncomes([...incomes, { 
            income_type: 'SALARY', 
            monthly_income: 0, 
            yearly_income: 0, 
            hourly_wage: 0, 
            hours_worked: 0,
            year: year
        }]);
    };

    const removeIncome = (index) => {
        setIncomes(incomes.filter((_, i) => i !== index));
    };

    const getIncomesForYear = (year) => {
        return incomes.map((inc, index) => ({ ...inc, originalIndex: index }))
                      .filter(inc => inc.year === year);
    };

    // --- DEBT LOGIC ---
    const handleDebtChange = (index, field, value) => {
        const updatedDebts = [...debts];
        updatedDebts[index] = { ...updatedDebts[index], [field]: value };
        setDebts(updatedDebts);
    };

    const addDebt = () => {
        setDebts([...debts, { name: '', initial_amount: 0, amount_paid: 0, monthly_payment: 0, interest_rate: 0 }]);
    };

    const removeDebt = (index) => {
        setDebts(debts.filter((_, i) => i !== index));
    };

    // --- RETIREMENT ACCOUNT LOGIC ---
    const handleRetirementAccountChange = (index, field, value) => {
        const updatedAccounts = [...retirementAccounts];
        updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
        setRetirementAccounts(updatedAccounts);
    };

    const addRetirementAccount = () => {
        // Generate a temporary ID for new accounts to link assets immediately
        const tempId = `temp_${Date.now()}`;
        setRetirementAccounts([...retirementAccounts, { 
            id: tempId,
            name: '', 
            account_type: 'K401', 
            contributions_2025: 0, 
            contributions_2026: 0 
        }]);
    };

    const removeRetirementAccount = (index) => {
        const accountId = retirementAccounts[index].id;
        // Also remove assets linked to this account
        setAssets(assets.filter(a => a.retirement_account_id !== accountId));
        setRetirementAccounts(retirementAccounts.filter((_, i) => i !== index));
    };

    // --- SAVE ---
    const handleSave = () => {
        onSave({
            assets: assets.map(asset => ({
                ...asset,
                shares: Number(asset.shares),
                cost_basis: Number(asset.cost_basis),
            })),
            incomes: incomes.map(income => ({
                ...income,
                monthly_income: Number(income.monthly_income),
                yearly_income: Number(income.yearly_income || 0),
                hourly_wage: Number(income.hourly_wage),
                hours_worked: Number(income.hours_worked),
                year: Number(income.year)
            })),
            debts: debts.map(debt => ({
                ...debt,
                initial_amount: Number(debt.initial_amount),
                amount_paid: Number(debt.amount_paid),
                monthly_payment: Number(debt.monthly_payment),
                interest_rate: Number(debt.interest_rate),
            })),
            retirement_accounts: retirementAccounts.map(ra => ({
                ...ra,
                contributions_2025: Number(ra.contributions_2025),
                contributions_2026: Number(ra.contributions_2026)
            }))
        });
    };

    const tabs = [
        { id: 'income', label: 'Income' },
        { id: 'retirement', label: 'Retirement' },
        { id: 'investments', label: 'Taxable Assets' },
        { id: 'debts', label: 'Debts' },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-4 min-h-[300px]">
                {activeTab === 'income' && (
                    <div>
                        <div className="flex space-x-4 mb-4">
                            <button 
                                onClick={() => setIncomeYear(2026)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${incomeYear === 2026 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                2026 (Current)
                            </button>
                            <button 
                                onClick={() => setIncomeYear(2025)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${incomeYear === 2025 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                2025 (Previous)
                            </button>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">Incomes for {incomeYear}</h3>
                        <div className="space-y-4">
                            {getIncomesForYear(incomeYear).map((income) => (
                                <div key={income.originalIndex} className="grid grid-cols-5 gap-2 items-end border-b pb-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            value={income.income_type}
                                            onChange={(e) => handleIncomeChange(income.originalIndex, 'income_type', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="SALARY">Salary</option>
                                            <option value="HOURLY">Hourly</option>
                                        </select>
                                    </div>

                                    {income.income_type === 'SALARY' ? (
                                        <>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Salary</label>
                                                <input
                                                    type="number"
                                                    placeholder="Monthly"
                                                    value={income.monthly_income}
                                                    onChange={(e) => handleIncomeChange(income.originalIndex, 'monthly_income', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Yearly Salary (Calculated)</label>
                                                <input
                                                    type="number"
                                                    placeholder="Yearly"
                                                    value={income.yearly_income}
                                                    onChange={(e) => handleIncomeChange(income.originalIndex, 'yearly_income', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-semibold text-indigo-700"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Hourly Wage</label>
                                                <input
                                                    type="number"
                                                    placeholder="Wage"
                                                    value={income.hourly_wage}
                                                    onChange={(e) => handleIncomeChange(income.originalIndex, 'hourly_wage', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Hours Per Week</label>
                                                <input
                                                    type="number"
                                                    placeholder="Hours"
                                                    value={income.hours_worked}
                                                    onChange={(e) => handleIncomeChange(income.originalIndex, 'hours_worked', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <button onClick={() => removeIncome(income.originalIndex)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center mb-2">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addIncome(incomeYear)} className="flex items-center text-blue-500 hover:text-blue-700 mt-4">
                            <PlusCircle size={20} className="mr-2" />
                            Add Income for {incomeYear}
                        </button>
                    </div>
                )}

                {activeTab === 'retirement' && (
                    <div>
                         <h3 className="text-lg font-medium text-gray-900 mb-2">Retirement Accounts</h3>
                         <div className="space-y-6">
                            {retirementAccounts.map((account, index) => (
                                <div key={account.id || index} className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="grid grid-cols-2 gap-4 w-full pr-8">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Account Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. My 401k"
                                                    value={account.name}
                                                    onChange={(e) => handleRetirementAccountChange(index, 'name', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Type</label>
                                                <select
                                                    value={account.account_type}
                                                    onChange={(e) => handleRetirementAccountChange(index, 'account_type', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                                >
                                                    <option value="K401">401(k)</option>
                                                    <option value="B403">403(b)</option>
                                                    <option value="ROTH_IRA">Roth IRA</option>
                                                    <option value="TRADITIONAL_IRA">Traditional IRA</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={() => removeRetirementAccount(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">2025 Contributions (Prior Year)</label>
                                            <input
                                                type="number"
                                                value={account.contributions_2025}
                                                onChange={(e) => handleRetirementAccountChange(index, 'contributions_2025', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">2026 Contributions (Current Year)</label>
                                            <input
                                                type="number"
                                                value={account.contributions_2026}
                                                onChange={(e) => handleRetirementAccountChange(index, 'contributions_2026', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-700">Investments in {account.name || 'this account'}</label>
                                            <button 
                                                onClick={() => addAsset(account.id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <PlusCircle size={14} className="mr-1" /> Add Investment
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2 pl-2 border-l-2 border-indigo-200">
                                            {getAssetsForAccount(account.id).map((asset) => (
                                                <div key={asset.originalIndex} className="grid grid-cols-6 gap-2 items-center bg-white p-2 rounded shadow-sm">
                                                    <div className="col-span-1">
                                                        <select
                                                            value={asset.asset_type}
                                                            onChange={(e) => handleAssetChange(asset.originalIndex, 'asset_type', e.target.value)}
                                                            className="block w-full text-xs border-gray-300 rounded"
                                                        >
                                                            <option value="STOCK">Stock</option>
                                                            <option value="BOND">Bond</option>
                                                            <option value="CASH">Cash</option>
                                                            <option value="HOUSING">Housing</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Ticker"
                                                            value={asset.ticker}
                                                            onChange={(e) => handleAssetChange(asset.originalIndex, 'ticker', e.target.value.toUpperCase())}
                                                            disabled={asset.asset_type === 'CASH'}
                                                            className="block w-full text-xs border-gray-300 rounded"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <input
                                                            type="number"
                                                            placeholder="Shares"
                                                            value={asset.shares}
                                                            onChange={(e) => handleAssetChange(asset.originalIndex, 'shares', e.target.value)}
                                                            className="block w-full text-xs border-gray-300 rounded"
                                                        />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <input
                                                            type="number"
                                                            placeholder="Price/Share"
                                                            value={asset.cost_per_share || 0}
                                                            onChange={(e) => handleAssetChange(asset.originalIndex, 'cost_per_share', e.target.value)}
                                                            className="block w-full text-xs border-gray-300 rounded"
                                                        />
                                                    </div>
                                                     <div className="col-span-1 text-xs text-gray-500">
                                                        ${(asset.cost_basis || 0).toLocaleString()}
                                                    </div>
                                                    <button onClick={() => removeAsset(asset.originalIndex)} className="text-red-400 hover:text-red-600 justify-self-center">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {getAssetsForAccount(account.id).length === 0 && (
                                                <p className="text-xs text-gray-400 italic">No investments added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <button onClick={addRetirementAccount} className="flex items-center text-blue-500 hover:text-blue-700 mt-4">
                            <PlusCircle size={20} className="mr-2" />
                            Add Retirement Account
                        </button>
                    </div>
                )}

                {activeTab === 'investments' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Taxable Investments (Non-Retirement)</h3>
                        <div className="space-y-4">
                            {getTaxableAssets().map((asset) => (
                                <div key={asset.originalIndex} className="border p-4 rounded-md space-y-2 relative">
                                    <button onClick={() => removeAsset(asset.originalIndex)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Asset Type</label>
                                            <select
                                                value={asset.asset_type}
                                                onChange={(e) => handleAssetChange(asset.originalIndex, 'asset_type', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="STOCK">Stock</option>
                                                <option value="BOND">Bond</option>
                                                <option value="CASH">Cash</option>
                                                <option value="HOUSING">Housing</option>
                                                <option value="SAVINGS">Savings</option>
                                                <option value="CHECKING">Checking</option>
                                                <option value="HIGH_YIELD_SAVINGS">High Yield Savings</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Ticker/Name</label>
                                            <input
                                                type="text"
                                                placeholder={asset.asset_type === 'HOUSING' ? 'Primary Residence' : 'e.g. AAPL'}
                                                value={asset.ticker}
                                                onChange={(e) => handleAssetChange(asset.originalIndex, 'ticker', e.target.value.toUpperCase())}
                                                disabled={['CASH', 'SAVINGS', 'CHECKING', 'HIGH_YIELD_SAVINGS'].includes(asset.asset_type)}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${['CASH', 'SAVINGS', 'CHECKING', 'HIGH_YIELD_SAVINGS'].includes(asset.asset_type) ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                    </div>
                                    {asset.asset_type !== 'CASH' && asset.asset_type !== 'HOUSING' && asset.asset_type !== 'SAVINGS' && asset.asset_type !== 'CHECKING' && asset.asset_type !== 'HIGH_YIELD_SAVINGS' && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Shares</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={asset.shares}
                                                    onChange={(e) => handleAssetChange(asset.originalIndex, 'shares', Math.max(0, e.target.value))}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Cost per Share</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={asset.cost_per_share || 0}
                                                    onChange={(e) => handleAssetChange(asset.originalIndex, 'cost_per_share', Math.max(0, e.target.value))}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Total Cost (Auto)</label>
                                                <input
                                                    type="number"
                                                    value={asset.cost_basis}
                                                    readOnly
                                                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {(asset.asset_type === 'CASH' || asset.asset_type === 'HOUSING' || asset.asset_type === 'SAVINGS' || asset.asset_type === 'CHECKING' || asset.asset_type === 'HIGH_YIELD_SAVINGS') && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">{['CASH', 'SAVINGS', 'CHECKING', 'HIGH_YIELD_SAVINGS'].includes(asset.asset_type) ? 'Cash Amount' : 'Market Value'}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={asset.shares}
                                                onChange={(e) => handleAssetChange(asset.originalIndex, 'shares', Math.max(0, e.target.value))}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addAsset(null)} className="flex items-center text-blue-500 hover:text-blue-700 mt-2">
                            <PlusCircle size={20} className="mr-2" />
                            Add Taxable Asset
                        </button>
                    </div>
                )}

                {activeTab === 'debts' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Debts</h3>
                        <div className="space-y-4">
                            {debts.map((debt, index) => (
                                <div key={index} className="border p-4 rounded-md space-y-2 relative">
                                    <button onClick={() => removeDebt(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Debt Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Mortgage"
                                                value={debt.name}
                                                onChange={(e) => handleDebtChange(index, 'name', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Total Loan Amount</label>
                                            <input
                                                type="number"
                                                value={debt.initial_amount}
                                                onChange={(e) => handleDebtChange(index, 'initial_amount', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Amount Paid Already</label>
                                            <input
                                                type="number"
                                                value={debt.amount_paid}
                                                onChange={(e) => handleDebtChange(index, 'amount_paid', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Monthly Payment</label>
                                            <input
                                                type="number"
                                                value={debt.monthly_payment}
                                                onChange={(e) => handleDebtChange(index, 'monthly_payment', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Interest Rate %</label>
                                            <input
                                                type="number"
                                                value={debt.interest_rate}
                                                onChange={(e) => handleDebtChange(index, 'interest_rate', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-sm font-medium text-gray-700">Remaining Balance: <span className="text-red-600">${Math.max(0, (debt.initial_amount || 0) - (debt.amount_paid || 0)).toLocaleString()}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addDebt} className="flex items-center text-blue-500 hover:text-blue-700 mt-2">
                            <PlusCircle size={20} className="mr-2" />
                            Add Debt
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button 
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default EditPortfolio;
