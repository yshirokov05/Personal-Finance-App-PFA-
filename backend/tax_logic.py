
FEDERAL_TAX_BRACKETS_2026 = {
    'single': {
        'deduction': 16100,
        'brackets': [
            {'rate': 0.10, 'up_to': 12400},
            {'rate': 0.12, 'up_to': 50400},
            {'rate': 0.22, 'up_to': 105700},
            {'rate': 0.24, 'up_to': 201775},
            {'rate': 0.32, 'up_to': 256225},
            {'rate': 0.35, 'up_to': 640600},
            {'rate': 0.37, 'up_to': float('inf')}
        ]
    }
    # Filing statuses for married_filing_jointly, married_filing_separately, head_of_household, and qualifying_widow will be added later
}

STATE_TAX_BRACKETS_2026 = {
    'CA': {
        'single': {
            'deduction': 5706,
            'brackets': [
                {'rate': 0.01, 'up_to': 11079},
                {'rate': 0.02, 'up_to': 26264},
                {'rate': 0.04, 'up_to': 41452},
                {'rate': 0.06, 'up_to': 57542},
                {'rate': 0.08, 'up_to': 72724},
                {'rate': 0.093, 'up_to': 371479},
                {'rate': 0.103, 'up_to': 445771},
                {'rate': 0.113, 'up_to': 742953},
                {'rate': 0.123, 'up_to': float('inf')}
            ],
            'mental_health_tax_rate': 0.01,
            'mental_health_tax_threshold': 1000000
        }
        # Other filing statuses for CA will be added later
    }
    # Other states will be added later
}

def calculate_federal_tax(income, filing_status='single'):
    """
    Calculates the federal tax for a given income and filing status.
    """
    if filing_status not in FEDERAL_TAX_BRACKETS_2026:
        raise ValueError(f"Invalid filing status: {filing_status}")

    status_brackets = FEDERAL_TAX_BRACKETS_2026[filing_status]
    taxable_income = max(0, income - status_brackets['deduction'])
    
    tax = 0
    previous_bracket_limit = 0
    
    for bracket in status_brackets['brackets']:
        if taxable_income == 0:
            break
            
        bracket_limit = bracket['up_to']
        rate = bracket['rate']
        
        if taxable_income > bracket_limit:
            tax += (bracket_limit - previous_bracket_limit) * rate
            previous_bracket_limit = bracket_limit
        else:
            tax += (taxable_income - previous_bracket_limit) * rate
            break
            
    return tax

def calculate_state_tax(income, state='CA', filing_status='single'):
    """
    Calculates the state tax for a given income, state, and filing status.
    """
    if state not in STATE_TAX_BRACKETS_2026:
        raise ValueError(f"Tax logic for state {state} is not available.")
    
    if filing_status not in STATE_TAX_BRACKETS_2026[state]:
        raise ValueError(f"Invalid filing status for {state}: {filing_status}")

    state_brackets = STATE_TAX_BRACKETS_2026[state][filing_status]
    taxable_income = max(0, income - state_brackets['deduction'])
    
    tax = 0
    previous_bracket_limit = 0
    
    for bracket in state_brackets['brackets']:
        if taxable_income == 0:
            break
            
        bracket_limit = bracket['up_to']
        rate = bracket['rate']
        
        if taxable_income > bracket_limit:
            tax += (bracket_limit - previous_bracket_limit) * rate
            previous_bracket_limit = bracket_limit
        else:
            tax += (taxable_income - previous_bracket_limit) * rate
            break

    # Apply mental health services tax
    if taxable_income > state_brackets['mental_health_tax_threshold']:
        tax += (taxable_income - state_brackets['mental_health_tax_threshold']) * state_brackets['mental_health_tax_rate']
            
    return tax

if __name__ == '__main__':
    # Example usage:
    # To be added later
    pass
