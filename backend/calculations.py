from .price_service import get_current_price
from .tax_logic import calculate_federal_tax, calculate_state_tax
from .models import User, Income, Asset, Debt, AssetType

def calculate_net_worth(user: User, incomes: list[Income], assets: list[Asset], debts: list[Debt]):
    """
    Calculates the real-time net worth for a user.
    Net Worth = Total Assets - Total Debts.
    """
    total_assets_market_value = 0
    for asset in assets:
        if asset.asset_type in [AssetType.CASH, AssetType.HOUSING]:
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
    total_income = sum(income.amount for income in incomes)

    # Estimate tax liability (informative, not subtracted from net worth)
    estimated_federal_tax = calculate_federal_tax(total_income, user.filing_status.value)
    estimated_state_tax = calculate_state_tax(total_income, user.state.name, user.filing_status.value) 
    estimated_tax_liability = estimated_federal_tax + estimated_state_tax

    real_time_net_worth = total_assets_market_value - total_debts

    return {
        "total_assets_market_value": total_assets_market_value,
        "total_debts": total_debts,
        "total_income": total_income,
        "estimated_federal_tax": estimated_federal_tax,
        "estimated_state_tax": estimated_state_tax,
        "estimated_tax_liability": estimated_tax_liability,
        "real_time_net_worth": real_time_net_worth
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
