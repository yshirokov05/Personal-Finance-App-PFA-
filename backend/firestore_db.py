import firebase_admin
from firebase_admin import credentials, firestore
from models import User, Income, Asset, Debt, FilingStatus, USState, IncomeType, AssetType, RetirementAccount, AccountType
import logging

# We move the client creation inside a function so it doesn't slow down the boot-up
def get_db():
    try:
        # Check if the app is already initialized
        app = firebase_admin.get_app()
    except ValueError:
        # If not, initialize it
        try:
            # In production (Firebase Functions), this automatically uses the right credentials
            app = firebase_admin.initialize_app()
        except Exception as e:
            logging.error(f"Failed to initialize Firebase: {e}")
            return None
    try:
        return firestore.client()
    except Exception as e:
        logging.error(f"Failed to create Firestore client: {e}")
        return None

def get_user_data(user_id="default_user"):
    """Fetches user tax info, incomes, assets, debts, and retirement accounts from Firestore."""
    db = get_db()
    if db is None:
        return (
            User(filing_status=FilingStatus.SINGLE, state=USState.CA),
            [],
            [],
            [],
            []
        )
    user_ref = db.collection('users').document(user_id)
    doc = user_ref.get()
    
    if not doc.exists:
        # Return empty state if not found (don't force demo data on new users)
        return (
            User(filing_status=FilingStatus.SINGLE, state=USState.CA),
            [],
            [],
            [],
            []
        )
    
    data = doc.to_dict()
    
    # Reconstruct objects
    user = User(
        filing_status=FilingStatus[data.get('filing_status', 'SINGLE')],
        state=USState[data.get('state', 'CA')]
    )
    
    incomes = []
    for inc in data.get('incomes', []):
        incomes.append(Income(
            income_type=IncomeType[inc['income_type']],
            amount=inc['amount'],
            monthly_income=inc.get('monthly_income'),
            hourly_wage=inc.get('hourly_wage'),
            hours_worked=inc.get('hours_worked'),
            year=inc.get('year', 2026)
        ))
        
    assets = []
    for ass in data.get('assets', []):
        asset = Asset(
            ticker=ass['ticker'],
            shares=ass['shares'],
            cost_basis=ass['cost_basis'],
            asset_type=AssetType[ass['asset_type']]
        )
        if 'retirement_account_id' in ass:
            asset.retirement_account_id = ass['retirement_account_id']
        assets.append(asset)
        
    debts = []
    for dbt in data.get('debts', []):
        debts.append(Debt(
            name=dbt['name'],
            initial_amount=dbt['initial_amount'],
            amount_paid=dbt['amount_paid'],
            monthly_payment=dbt.get('monthly_payment'),
            interest_rate=dbt.get('interest_rate')
        ))

    retirement_accounts = []
    for ra in data.get('retirement_accounts', []):
        retirement_accounts.append(RetirementAccount(
            id=ra.get('id'), # Use Firestore provided ID or generate one if missing? Actually client should provide unique IDs or name is key
            name=ra['name'],
            account_type=AccountType[ra['account_type']],
            contributions_2025=ra.get('contributions_2025', 0.0),
            contributions_2026=ra.get('contributions_2026', 0.0)
        ))
        
    return user, incomes, assets, debts, retirement_accounts

def save_user_data(user, incomes, assets, debts, retirement_accounts, user_id="default_user"):
    """Saves the entire state to Firestore."""
    db = get_db()
    if db is None:
        logging.warning("Skipping save to Firestore because the client is not initialized.")
        return
    user_ref = db.collection('users').document(user_id)
    
    data = {
        'filing_status': user.filing_status.name,
        'state': user.state.name,
        'incomes': [{
            'income_type': i.income_type.name,
            'amount': i.amount,
            'monthly_income': i.monthly_income,
            'hourly_wage': i.hourly_wage,
            'hours_worked': i.hours_worked,
            'year': i.year
        } for i in incomes],
        'assets': [{
            'ticker': a.ticker,
            'shares': a.shares,
            'cost_basis': a.cost_basis,
            'asset_type': a.asset_type.name,
            'retirement_account_id': getattr(a, 'retirement_account_id', None)
        } for a in assets],
        'debts': [{
            'name': d.name,
            'initial_amount': d.initial_amount,
            'amount_paid': d.amount_paid,
            'monthly_payment': d.monthly_payment,
            'interest_rate': d.interest_rate
        } for d in debts],
        'retirement_accounts': [{
            'id': r.id,
            'name': r.name,
            'account_type': r.account_type.name,
            'contributions_2025': r.contributions_2025,
            'contributions_2026': r.contributions_2026
        } for r in retirement_accounts]
    }
    
    user_ref.set(data)
