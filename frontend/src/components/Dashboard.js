import React from 'react';
import AssetTable from './AssetTable';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from './Card';
import { DollarSign, Briefcase, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = ({ netWorth, assets }) => {
    const chartData = assets.map(asset => ({ name: asset.ticker, value: asset.shares * (asset.current_price || asset.cost_basis) }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card title="Net Worth" icon={<DollarSign className="text-green-500" />}>
                <p className="text-3xl font-bold">${netWorth.toLocaleString()}</p>
            </Card>

            <Card title="Assets" icon={<Briefcase className="text-blue-500" />}>
                <AssetTable assets={assets} />
            </Card>

            <Card title="Asset Allocation" icon={<PieChartIcon className="text-yellow-500" />}>
                <RechartsPieChart width={300} height={300}>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </RechartsPieChart>
            </Card>
        </div>
    );
};

export default Dashboard;
