import React, { useState, useEffect } from 'react';

const EditPortfolio = ({ onSave, assets, incomes }) => {
    const [qqqShares, setQqqShares] = useState(0);
    const [nvdaShares, setNvdaShares] = useState(0);
    const [annualIncome, setAnnualIncome] = useState(0);

    useEffect(() => {
        const qqq = assets.find(asset => asset.ticker === 'QQQ');
        if (qqq) {
            setQqqShares(qqq.shares);
        }

        const nvda = assets.find(asset => asset.ticker === 'NVDA');
        if (nvda) {
            setNvdaShares(nvda.shares);
        }

        if (incomes && incomes.length > 0) {
            setAnnualIncome(incomes[0].amount);
        }
    }, [assets, incomes]);

    const handleSave = () => {
        onSave({
            qqqShares: Number(qqqShares),
            nvdaShares: Number(nvdaShares),
            annualIncome: Number(annualIncome)
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    QQQ Shares:
                </label>
                <input
                    type="number"
                    value={qqqShares}
                    onChange={(e) => setQqqShares(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    NVDA Shares:
                </label>
                <input
                    type="number"
                    value={nvdaShares}
                    onChange={(e) => setNvdaShares(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Annual Income:
                </label>
                <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={handleSave}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default EditPortfolio;
