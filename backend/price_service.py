import yfinance as yf

def get_current_price(ticker_symbol):
    """
    Fetches the current market price for a given ticker symbol using yfinance.
    """
    if ticker_symbol == 'CASH':
        return 1.0

    try:
        ticker = yf.Ticker(ticker_symbol)
        todays_data = ticker.history(period='1d')
        if not todays_data.empty:
            return todays_data['Close'][0]
        else:
            print(f"No data found for {ticker_symbol}")
            return 0.0
    except Exception as e:
        print(f"Error fetching price for {ticker_symbol}: {type(e).__name__} - {e}")
        return 0.0

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
