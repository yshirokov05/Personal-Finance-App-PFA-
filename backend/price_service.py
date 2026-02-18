import yfinance as yf

def get_current_price(ticker_symbol):
    """
    Fetches the current market price for a given ticker symbol using yfinance.
    Returns None if ticker is invalid or data cannot be fetched.
    """
    if not ticker_symbol or ticker_symbol == 'CASH':
        return 1.0

    try:
        ticker = yf.Ticker(ticker_symbol)
        # Fetching info is a better way to check if ticker exists
        # but it's slow. history is usually enough.
        todays_data = ticker.history(period='1d')
        if not todays_data.empty:
            return float(todays_data['Close'].iloc[-1])
        else:
            return None
    except Exception as e:
        print(f"Error fetching price for {ticker_symbol}: {e}")
        return None

def validate_ticker(ticker_symbol):
    """Returns True if ticker is valid, False otherwise."""
    if ticker_symbol == 'CASH':
        return True
    price = get_current_price(ticker_symbol)
    return price is not None

if __name__ == '__main__':
    # Example usage:
    # price = get_current_price("AAPL")
    # if price:
    #     print(f"AAPL current price: {price}")
    #
    # price = get_current_price("MSFT")
    # if price:
    #     print(f"MSFT current price: {price}")
    pass
