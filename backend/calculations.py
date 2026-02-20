from price_service import get_current_price
from tax_logic import calculate_federal_tax, calculate_state_tax, calculate_fica_tax
from models import User, Income, Asset, Debt, AssetType, RetirementAccount, AccountType

def calculate_net_worth(user: User, incomes: list[Income], assets: list[Asset], debts: list[Debt], retirement_accounts: list[RetirementAccount] = []):
    """
    Calculates the real-time net worth for a user.
    Net Worth = Total Assets - Total Debts.
    """
    total_assets_market_value = 0
    for asset in assets:
        if asset.asset_type in [AssetType.CASH, AssetType.HOUSING, AssetType.SAVINGS, AssetType.CHECKING, AssetType.HIGH_YIELD_SAVINGS]:
            # For Cash and Housing, 'shares' stores the actual market value/amount
            total_assets_market_value += asset.shares
        else:
            # For Stocks/Bonds, fetch the current price
            current_price = get_current_price(asset.ticker)
            if current_price is not None and current_price > 0:
                total_assets_market_value += (current_price * asset.shares)
            else:
                # Fallback to cost basis if price cannot be fetched
                total_assets_market_value += asset.cost_basis

    total_debts = sum(max(0, debt.initial_amount - debt.amount_paid) for debt in debts)
    
    # Calculate taxes for 2025 and 2026
    tax_info = {}
    for year in [2025, 2026]:
        # Filter income for the specific year
        year_incomes = [inc for inc in incomes if getattr(inc, 'year', 2026) == year]
        gross_income = sum(inc.amount for inc in year_incomes)
        
        # Calculate deductions from traditional retirement contributions
        deductions = 0
        for ra in retirement_accounts:
            if ra.account_type in [AccountType.TRADITIONAL_IRA, AccountType.K401, AccountType.B403]:
                if year == 2025:
                    deductions += ra.contributions_2025
                elif year == 2026:
                    deductions += ra.contributions_2026
        
        taxable_income = max(0, gross_income - deductions)
        
        fed_tax = calculate_federal_tax(taxable_income, user.filing_status.value)
        state_tax = calculate_state_tax(taxable_income, user.state.name, user.filing_status.value)
        # FICA is usually on gross income (up to limits), not taxable income after 401k deductions (except maybe some parts, but for simplicity use gross)
        # Actually 401k is FICA taxable. IRA is not payroll deducted usually but we are estimating.
        # Let's use gross_income for FICA.
        fica_tax = calculate_fica_tax(gross_income, user.filing_status.value)
        
        tax_info[year] = {
            "gross_income": gross_income,
            "taxable_income": taxable_income,
            "federal_tax": fed_tax,
            "state_tax": state_tax,
            "fica_tax": fica_tax,
            "total_tax": fed_tax + state_tax + fica_tax
        }

    # Default to 2026 for the dashboard summary
    current_year_tax = tax_info[2026]

    real_time_net_worth = total_assets_market_value - total_debts

    return {
        "total_assets_market_value": total_assets_market_value,
        "total_debts": total_debts,
        "total_income": current_year_tax['gross_income'], # For dashboard compatibility
        "estimated_federal_tax": current_year_tax['federal_tax'],
        "estimated_state_tax": current_year_tax['state_tax'],
        "estimated_fica_tax": current_year_tax['fica_tax'],
        "estimated_tax_liability": current_year_tax['total_tax'],
        "real_time_net_worth": real_time_net_worth,
        "tax_details": tax_info
    }

if __name__ == '__main__':
    # Example Usage:
    # from sqlalchemy import create_engine
    # from sqlalchemy.orm import sessionmaker
    # Base.metadata.create_all(engine)
    #
    # # Setup a dummy session and add a user, income, and asset for demonstration
    # # This part requires a running database and session setup
    # print("Run this within a proper application context with a database session.")
    pass
