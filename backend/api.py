from flask import Flask, jsonify, request
from flask_cors import CORS
from price_service import get_current_price, validate_ticker
from calculations import calculate_net_worth
from models import User, Income, Asset, FilingStatus, USState, IncomeType, Debt, AssetType, RetirementAccount, AccountType
from firestore_db import get_user_data, save_user_data, get_db
from auth import token_required
import uuid

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
        'current_price': current_price,
        'retirement_account_id': getattr(asset, 'retirement_account_id', None)
    }

def income_to_dict(income):
    return {
        'income_type': income.income_type.name,
        'amount': income.amount,
        'monthly_income': income.monthly_income,
        'yearly_income': income.amount if income.income_type == IncomeType.SALARY else None,
        'hourly_wage': income.hourly_wage,
        'hours_worked': income.hours_worked,
        'year': getattr(income, 'year', 2026)
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

def retirement_account_to_dict(ra):
    return {
        'id': ra.id,
        'name': ra.name,
        'account_type': ra.account_type.name,
        'contributions_2025': ra.contributions_2025,
        'contributions_2026': ra.contributions_2026
    }

@app.route('/api/net_worth', methods=['GET'])
@token_required
def get_net_worth():
    """Calculates and returns the current net worth."""
    if request.uid == "guest":
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id="demo_user")
    else:
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id=request.uid)
    
    net_worth_data = calculate_net_worth(user, incomes, assets, debts, retirement_accounts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    net_worth_data['retirement_accounts'] = [retirement_account_to_dict(ra) for ra in retirement_accounts]
    net_worth_data['filing_status'] = user.filing_status.name
    net_worth_data['state'] = user.state.name
    return jsonify(net_worth_data)

@app.route('/api/portfolio', methods=['PUT'])
@token_required
def update_portfolio():
    """Updates the portfolio with validation for tickers and numbers."""
    data = request.get_json()
    if request.uid == "guest":
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id="demo_user")
    else:
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id=request.uid)

    # Update retirement accounts
    new_retirement_data = data.get('retirement_accounts', [])
    retirement_accounts = []
    for ra_data in new_retirement_data:
        ra_id = ra_data.get('id')
        if not ra_id:
            ra_id = str(uuid.uuid4())
            
        retirement_accounts.append(RetirementAccount(
            id=ra_id,
            name=ra_data['name'],
            account_type=AccountType[ra_data['account_type']],
            contributions_2025=float(ra_data.get('contributions_2025', 0)),
            contributions_2026=float(ra_data.get('contributions_2026', 0))
        ))

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

        asset = Asset(
            ticker=ticker,
            shares=shares,
            cost_basis=cost_basis,
            asset_type=asset_type
        )
        if 'retirement_account_id' in asset_data:
            asset.retirement_account_id = asset_data['retirement_account_id']
        temp_assets.append(asset)
    
    assets = temp_assets

    # Update incomes
    new_incomes_data = data.get('incomes', [])
    incomes = []
    for income_data in new_incomes_data:
        income_type = IncomeType[income_data['income_type']]
        amount = 0
        income = Income(income_type=income_type)
        income.year = int(income_data.get('year', 2026))

        if income_type == IncomeType.SALARY:
            if 'yearly_income' in income_data and income_data['yearly_income']:
                amount = float(income_data['yearly_income'])
                income.monthly_income = amount / 12
            else:
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
        save_user_data(user, incomes, assets, debts, retirement_accounts, user_id=request.uid)

    net_worth_data = calculate_net_worth(user, incomes, assets, debts, retirement_accounts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    net_worth_data['retirement_accounts'] = [retirement_account_to_dict(ra) for ra in retirement_accounts]
    return jsonify(net_worth_data)

@app.route('/api/user_tax_info', methods=['PUT'])
@token_required
def update_user_tax_info():
    data = request.get_json()
    if request.uid == "guest":
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id="demo_user")
    else:
        user, incomes, assets, debts, retirement_accounts = get_user_data(user_id=request.uid)
    
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
        save_user_data(user, incomes, assets, debts, retirement_accounts, user_id=request.uid)

    net_worth_data = calculate_net_worth(user, incomes, assets, debts, retirement_accounts)
    net_worth_data['assets'] = [asset_to_dict(a) for a in assets]
    net_worth_data['incomes'] = [income_to_dict(i) for i in incomes]
    net_worth_data['debts'] = [debt_to_dict(d) for d in debts]
    net_worth_data['retirement_accounts'] = [retirement_account_to_dict(ra) for ra in retirement_accounts]
    net_worth_data['filing_status'] = user.filing_status.name
    net_worth_data['state'] = user.state.name
    return jsonify(net_worth_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
