import React from 'react';

const AssetTable = ({ assets }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Share</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset, index) => {
                        const marketPrice = asset.current_price || (asset.asset_type === 'CASH' || asset.asset_type === 'HOUSING' ? 1 : 0);
                        const costPerShare = asset.shares > 0 ? asset.cost_basis / asset.shares : 0;
                        const marketValue = asset.asset_type === 'CASH' || asset.asset_type === 'HOUSING' ? asset.shares : asset.shares * marketPrice;
                        const gainLoss = marketValue - asset.cost_basis;
                        const gainLossPercent = asset.cost_basis > 0 ? (gainLoss / asset.cost_basis) * 100 : 0;
                        
                        return (
                            <tr key={`${asset.ticker}-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 uppercase">{asset.asset_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{asset.ticker}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.shares.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {asset.asset_type !== 'CASH' && asset.asset_type !== 'HOUSING' ? `$${costPerShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                    {asset.asset_type !== 'CASH' && asset.asset_type !== 'HOUSING' ? `$${marketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                    ${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {asset.asset_type !== 'CASH' && asset.asset_type !== 'HOUSING' ? (
                                        <>
                                            {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="text-xs ml-1 font-normal">({gainLossPercent.toFixed(2)}%)</span>
                                        </>
                                    ) : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AssetTable;
