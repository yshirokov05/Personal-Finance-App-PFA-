import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const EditPortfolio = ({ onSave, assets: initialAssets, incomes: initialIncomes, debts: initialDebts, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab || 'income');
    const [assets, setAssets] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [debts, setDebts] = useState([]);

    useEffect(() => {
        setAssets(initialAssets || []);
        setIncomes(initialIncomes || []);
        setDebts(initialDebts || []);
    }, [initialAssets, initialIncomes, initialDebts]);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const handleAssetChange = (index, field, value) => {
        const updatedAssets = [...assets];
        const asset = { ...updatedAssets[index], [field]: value };
        
        // Auto-populate cost basis if shares or cost per share changes
        if (field === 'shares' || field === 'cost_per_share') {
            const shares = field === 'shares' ? Number(value) : Number(asset.shares);
            const costPerShare = field === 'cost_per_share' ? Number(value) : Number(asset.cost_per_share || 0);
            asset.cost_basis = shares * costPerShare;
        }

        updatedAssets[index] = asset;
        setAssets(updatedAssets);
    };

    const addAsset = () => {
        setAssets([...assets, { ticker: '', shares: 0, cost_basis: 0, cost_per_share: 0, asset_type: 'STOCK' }]);
    };

    const removeAsset = (index) => {
        setAssets(assets.filter((_, i) => i !== index));
    };

    const handleIncomeChange = (index, field, value) => {
        const updatedIncomes = [...incomes];
        updatedIncomes[index] = { ...updatedIncomes[index], [field]: value };
        setIncomes(updatedIncomes);
    };

    const addIncome = () => {
        setIncomes([...incomes, { income_type: 'SALARY', monthly_income: 0, hourly_wage: 0, hours_worked: 0 }]);
    };

    const removeIncome = (index) => {
        setIncomes(incomes.filter((_, i) => i !== index));
    };

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
                hourly_wage: Number(income.hourly_wage),
                hours_worked: Number(income.hours_worked),
            })),
            debts: debts.map(debt => ({
                ...debt,
                initial_amount: Number(debt.initial_amount),
                amount_paid: Number(debt.amount_paid),
                monthly_payment: Number(debt.monthly_payment),
                interest_rate: Number(debt.interest_rate),
            }))
        });
    };

    const tabs = [
        { id: 'income', label: 'Income' },
        { id: 'investments', label: 'Investments' },
        { id: 'debts', label: 'Debts' },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Incomes</h3>
                        <div className="space-y-2">
                            {incomes.map((income, index) => (
                                <div key={index} className="grid grid-cols-4 gap-2 items-center">
                                    <select
                                        value={income.income_type}
                                        onChange={(e) => handleIncomeChange(index, 'income_type', e.target.value)}
                                        className="col-span-1 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="SALARY">Salary</option>
                                        <option value="HOURLY">Hourly</option>
                                    </select>

                                    {income.income_type === 'SALARY' ? (
                                        <input
                                            type="number"
                                            placeholder="Monthly Income"
                                            value={income.monthly_income}
                                            onChange={(e) => handleIncomeChange(index, 'monthly_income', e.target.value)}
                                            className="col-span-2 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    ) : (
                                        <>
                                            <input
                                                type="number"
                                                placeholder="Hourly Wage"
                                                value={income.hourly_wage}
                                                onChange={(e) => handleIncomeChange(index, 'hourly_wage', e.target.value)}
                                                className="col-span-1 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Hours/Week"
                                                value={income.hours_worked}
                                                onChange={(e) => handleIncomeChange(index, 'hours_worked', e.target.value)}
                                                className="col-span-1 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </>
                                    )}
                                    <button onClick={() => removeIncome(index)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addIncome} className="flex items-center text-blue-500 hover:text-blue-700 mt-2">
                            <PlusCircle size={20} className="mr-2" />
                            Add Income
                        </button>
                    </div>
                )}

                {activeTab === 'investments' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Investments</h3>
                        <div className="space-y-4">
                            {assets.map((asset, index) => (
                                <div key={index} className="border p-4 rounded-md space-y-2 relative">
                                    <button onClick={() => removeAsset(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Asset Type</label>
                                            <select
                                                value={asset.asset_type}
                                                onChange={(e) => handleAssetChange(index, 'asset_type', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="STOCK">Stock</option>
                                                <option value="BOND">Bond</option>
                                                <option value="CASH">Cash</option>
                                                <option value="HOUSING">Housing</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Ticker/Name</label>
                                            <input
                                                type="text"
                                                placeholder={asset.asset_type === 'HOUSING' ? 'Primary Residence' : 'e.g. AAPL'}
                                                value={asset.ticker}
                                                onChange={(e) => handleAssetChange(index, 'ticker', e.target.value.toUpperCase())}
                                                disabled={asset.asset_type === 'CASH'}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${asset.asset_type === 'CASH' ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'}`}
                                            />
                                        </div>
                                    </div>
                                    {asset.asset_type !== 'CASH' && asset.asset_type !== 'HOUSING' && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Shares</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={asset.shares}
                                                    onChange={(e) => handleAssetChange(index, 'shares', Math.max(0, e.target.value))}
                                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Cost per Share</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={asset.cost_per_share || 0}
                                                    onChange={(e) => handleAssetChange(index, 'cost_per_share', Math.max(0, e.target.value))}
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
                                    {(asset.asset_type === 'CASH' || asset.asset_type === 'HOUSING') && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">{asset.asset_type === 'CASH' ? 'Cash Amount' : 'Market Value'}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={asset.shares}
                                                onChange={(e) => handleAssetChange(index, 'shares', Math.max(0, e.target.value))}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addAsset} className="flex items-center text-blue-500 hover:text-blue-700 mt-2">
                            <PlusCircle size={20} className="mr-2" />
                            Add Asset
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

