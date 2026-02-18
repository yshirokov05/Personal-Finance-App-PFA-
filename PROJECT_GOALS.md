# Project Goals: Net Worth Command Center

This document outlines the structure and goals of the Net Worth Command Center project.

## Backend Structure

### Database Models (`backend/models.py`)

- **User**: Stores user-specific information, including filing status and state of residence.
- **Income**: Manages user income, with support for both hourly and salary-based income types.
- **Investment**: Tracks user investments, including ticker symbols, number of shares, and cost basis.

### Tax Logic (`tax_logic.py`)

- **Federal Taxes**: Implements federal tax calculations for 2026, including standard deductions and tax brackets for single filers.
- **State Taxes**: Includes state-specific tax logic, starting with California for 2026. The system is designed to be extensible for other states.

## Frontend (React)

The frontend is a React application that provides the user interface for the Net Worth Command Center.

- **`public/index.html`**: The main entry point for the web application.
- **`src/App.js`**: The main application component.
- **`src/index.js`**: The JavaScript entry point.

## Project Roadmap

### Short-Term Goals (Soon)

- **Future Net Worth Prediction:** Implement a model to predict the user's future net worth based on their current financial situation.
- **Tax Payment Tracking:**
    - Display the amount of taxes the user has already paid.
    - Show an estimate of how much the user still needs to save for taxes.
- **Real Post-Tax Income:** Calculate and display the user's real post-tax income to provide a clearer picture of their actual take-home pay compared to their gross salary.
- **Enhanced Tax Calculation System:**
    - Improve the robustness of the tax calculation system.
    - Allow users to select their state for accurate state tax calculations.
- **Manual Investment Tracking:**
    - Allow users to manually enter their investment shares and cost basis.
    - Potentially add a feature to track the purchase date for historical performance tracking.

### Long-Term Goals

- **Cross-Platform Availability:**
    - Develop downloadable mobile applications for iPhone and Android devices.
    - Maintain and enhance the web-based application.
- **Personalized Financial Guidance:**
    - The overall goal is to help people improve their personal finance habits.
    - Provide personalized strategies based on the user's net worth, goals, age, income, and spending habits.
    - Identify unnecessary expenditures and impulse buys.
    - Offer aggressive strategies for users who are behind on their financial goals and provide encouragement for those who are on track.
- **Brokerage and Bank Integration:**
    - **Brokerage Sync:** Sync with brokerage accounts (e.g., Vanguard, E-Trade, Fidelity) to automatically track investments.
    - **Bank Sync:** Sync with bank accounts to automatically track income and expenses.
    - **Payroll Sync:** Sync with payroll services (e.g., ADP) to get accurate data on taxes paid.
