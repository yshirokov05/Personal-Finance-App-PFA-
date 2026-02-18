from flask import Flask, jsonify, request
from flask_cors import CORS
from .calculations import calculate_net_worth
from .models import User, Income, Asset, FilingStatus, USState, IncomeType

app = Flask(__name__)
CORS(app)

# In-memory data store
user = User(filing_status=FilingStatus.SINGLE, state=USState.CA)
incomes = [Income(income_type=IncomeType.SALARY, amount=120000)]
assets = [
    Asset(ticker='QQQ', shares=100, cost_basis=30000),
    Asset(ticker='NVDA', shares=50, cost_basis=10000),
    Asset(ticker='CASH', shares=25000, cost_basis=1) # Representing cash as an asset
]

def asset_to_dict(asset):
    return {
        'ticker': asset.ticker,
        'shares': asset.shares,
        'cost_basis': asset.cost_basis
    }

def income_to_dict(income):
    return {
        'income_type': income.income_type.name,
        'amount': income.amount
    }

@app.route('/api/net_worth', methods=['GET'])
def get_net_worth():
    """Calculates and returns the current net worth."""
    net_worth_data = calculate_net_worth(user, incomes, assets)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    return jsonify(net_worth_data)

@app.route('/api/portfolio', methods=['PUT'])
def update_portfolio():
    """Updates the portfolio based on new share and income data."""
    data = request.get_json()

    # Update annual income
    # This assumes a single salary income for simplicity
    incomes[0].amount = data.get('annualIncome', incomes[0].amount)

    # Update asset shares
    for asset in assets:
        if asset.ticker == 'QQQ':
            asset.shares = data.get('qqqShares', asset.shares)
        elif asset.ticker == 'NVDA':
            asset.shares = data.get('nvdaShares', asset.shares)

    # Recalculate net worth with updated data
    net_worth_data = calculate_net_worth(user, incomes, assets)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    return jsonify(net_worth_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
