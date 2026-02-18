from .price_service import get_current_price
from .tax_logic import calculate_federal_tax, calculate_state_tax
from .models import User, Income, Asset

def calculate_net_worth(user: User, incomes: list[Income], assets: list[Asset]):
    """
    Calculates the real-time net worth for a user.
    Net Worth = Total Assets at Market Price - Estimated Tax Liability.
    """
    total_assets_market_value = 0
    for asset in assets:
        current_price = get_current_price(asset.ticker)
        if current_price is not None:
            total_assets_market_value += (current_price * asset.shares)
        # else: Handle cases where price cannot be fetched (e.g., print warning, use last known price)

    total_income = sum(income.amount for income in incomes)

    # Estimate tax liability (simplified for now)
    # This is a very basic estimation. A real-world scenario would be far more complex,
    # considering capital gains, deductions beyond standard, various income types, etc.
    estimated_federal_tax = calculate_federal_tax(total_income, user.filing_status.value)
    
    # Assuming state tax is calculated on the same total income for simplicity
    estimated_state_tax = calculate_state_tax(total_income, user.state.name, user.filing_status.value) 
    
    # For now, let's assume total tax liability is the sum of federal and state.
    # In a real app, this would need to consider how state taxes interact with federal (e.g., state tax deduction).
    estimated_tax_liability = estimated_federal_tax + estimated_state_tax

    real_time_net_worth = total_assets_market_value - estimated_tax_liability

    return {
        "total_assets_market_value": total_assets_market_value,
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
