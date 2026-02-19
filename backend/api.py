from flask import Flask, jsonify, request
from flask_cors import CORS
from price_service import get_current_price, validate_ticker
from calculations import calculate_net_worth
from models import User, Income, Asset, FilingStatus, USState, IncomeType, Debt, AssetType
from firestore_db import get_user_data, save_user_data
from auth import token_required

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {
    "origins": "*", 
    "allow_headers": ["Authorization", "Content-Type"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}})

def asset_to_dict(asset):
    current_price = get_current_price(asset.ticker) if asset.asset_type not in [AssetType.CASH, AssetType.HOUSING, AssetType.SAVINGS, AssetType.CHECKING, AssetType.HIGH_YIELD_SAVINGS] else 1.0
    return {
        'ticker': asset.ticker,
        'shares': asset.shares,
        'cost_basis': asset.cost_basis,
        'asset_type': asset.asset_type.name,
        'current_price': current_price
    }

def income_to_dict(income):
    return {
        'income_type': income.income_type.name,
        'amount': income.amount,
        'monthly_income': income.monthly_income,
        'hourly_wage': income.hourly_wage,
        'hours_worked': income.hours_worked,
    }

def debt_to_dict(debt):
    return {
        'name': debt.name,
        'initial_amount': debt.initial_amount,
        'amount_paid': debt.amount_paid,
        'remaining_balance': debt.remaining_balance,
        'monthly_payment': debt.monthly_payment,
        'interest_rate': debt.interest_rate
    }

@app.route('/api/net_worth', methods=['GET'])
@token_required
def get_net_worth():
    """Calculates and returns the current net worth."""
    if request.uid == "guest":
        # Return empty/zero data for guests
        user = User(filing_status=FilingStatus.SINGLE, state=USState.CA)
        incomes = []
        assets = []
        debts = []
    else:
        user, incomes, assets, debts = get_user_data(user_id=request.uid)
    
    net_worth_data = calculate_net_worth(user, incomes, assets, debts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    net_worth_data['filing_status'] = user.filing_status.name
    net_worth_data['state'] = user.state.name
    return jsonify(net_worth_data)

@app.route('/api/portfolio', methods=['PUT'])
@token_required
def update_portfolio():
    """Updates the portfolio with validation for tickers and numbers."""
    data = request.get_json()
    if request.uid == "guest":
        user = User(filing_status=FilingStatus.SINGLE, state=USState.CA)
        incomes = []
        assets = []
        debts = []
    else:
        user, incomes, assets, debts = get_user_data(user_id=request.uid)

    # Update assets
    new_assets_data = data.get('assets', [])
    temp_assets = []
    for asset_data in new_assets_data:
        ticker = asset_data.get('ticker', '').upper()
        asset_type_str = asset_data.get('asset_type', 'STOCK')
        asset_type = AssetType[asset_type_str]
        shares = float(asset_data.get('shares', 0))
        cost_basis = float(asset_data.get('cost_basis', 0))

        if shares < 0 or cost_basis < 0:
             return jsonify({'error': f"Values for {ticker or asset_type_str} must be positive."}), 400

        if asset_type in [AssetType.STOCK, AssetType.BOND]:
            if not ticker:
                 return jsonify({'error': "Ticker is required for stocks and bonds."}), 400
            if not validate_ticker(ticker):
                 return jsonify({'error': f"Invalid ticker: {ticker}. Please enter a real market symbol."}), 400
        elif asset_type in [AssetType.CASH, AssetType.SAVINGS, AssetType.CHECKING, AssetType.HIGH_YIELD_SAVINGS]:
            ticker = asset_type.name
            cost_basis = 1.0
        elif asset_type == AssetType.HOUSING:
            if not ticker:
                ticker = 'PRIMARY RESIDENCE'
            cost_basis = shares 

        temp_assets.append(
            Asset(
                ticker=ticker,
                shares=shares,
                cost_basis=cost_basis,
                asset_type=asset_type
            )
        )
    
    assets = temp_assets

    # Update incomes
    new_incomes_data = data.get('incomes', [])
    incomes = []
    for income_data in new_incomes_data:
        income_type = IncomeType[income_data['income_type']]
        amount = 0
        income = Income(income_type=income_type)
        if income_type == IncomeType.SALARY:
            monthly_income = float(income_data.get('monthly_income', 0))
            amount = monthly_income * 12
            income.monthly_income = monthly_income
        elif income_type == IncomeType.HOURLY:
            hourly_wage = float(income_data.get('hourly_wage', 0))
            hours_worked = float(income_data.get('hours_worked', 0))
            amount = hourly_wage * hours_worked * 52
            income.hourly_wage = hourly_wage
            income.hours_worked = hours_worked
        income.amount = max(0, amount)
        incomes.append(income)

    # Update debts
    new_debts_data = data.get('debts', [])
    debts = []
    for debt_data in new_debts_data:
        initial = float(debt_data.get('initial_amount', 0))
        paid = float(debt_data.get('amount_paid', 0))
        if initial < 0 or paid < 0:
             return jsonify({'error': "Debt amounts must be positive."}), 400
        
        debts.append(
            Debt(
                name=debt_data['name'] or 'Unnamed Debt',
                initial_amount=initial,
                amount_paid=paid,
                monthly_payment=float(debt_data.get('monthly_payment', 0)),
                interest_rate=float(debt_data.get('interest_rate', 0))
            )
        )

    # Save to Firestore only for registered users
    if request.uid != "guest":
        save_user_data(user, incomes, assets, debts, user_id=request.uid)

    net_worth_data = calculate_net_worth(user, incomes, assets, debts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    return jsonify(net_worth_data)

@app.route('/api/user_tax_info', methods=['PUT'])
@token_required
def update_user_tax_info():
    data = request.get_json()
    if request.uid == "guest":
        user = User(filing_status=FilingStatus.SINGLE, state=USState.CA)
        incomes = []
        assets = []
        debts = []
    else:
        user, incomes, assets, debts = get_user_data(user_id=request.uid)
    
    new_filing_status_str = data.get('filing_status')
    new_state_str = data.get('state')

    if new_filing_status_str:
        try:
            user.filing_status = FilingStatus[new_filing_status_str]
        except KeyError:
            return jsonify({'error': f"Invalid filing status: {new_filing_status_str}"}), 400
    
    if new_state_str:
        try:
            user.state = USState[new_state_str]
        except KeyError:
            return jsonify({'error': f"Invalid state: {new_state_str}"}), 400
    
    # Save to Firestore only for registered users
    if request.uid != "guest":
        save_user_data(user, incomes, assets, debts, user_id=request.uid)

    net_worth_data = calculate_net_worth(user, incomes, assets, debts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    net_worth_data['filing_status'] = user.filing_status.name
    net_worth_data['state'] = user.state.name
    return jsonify(net_worth_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
