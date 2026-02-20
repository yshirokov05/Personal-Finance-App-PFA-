from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import enum

Base = declarative_base()

class FilingStatus(enum.Enum):
    SINGLE = "single"
    MARRIED_FILING_JOINTLY = "married_filing_jointly"
    MARRIED_FILING_SEPARATELY = "married_filing_separately"
    HEAD_OF_HOUSEHOLD = "head_of_household"
    QUALIFYING_WIDOW = "qualifying_widow"

class USState(enum.Enum):
    AL = "Alabama"
    AK = "Alaska"
    AZ = "Arizona"
    AR = "Arkansas"
    CA = "California"
    CO = "Colorado"
    CT = "Connecticut"
    DE = "Delaware"
    FL = "Florida"
    GA = "Georgia"
    HI = "Hawaii"
    ID = "Idaho"
    IL = "Illinois"
    IN = "Indiana"
    IA = "Iowa"
    KS = "Kansas"
    KY = "Kentucky"
    LA = "Louisiana"
    ME = "Maine"
    MD = "Maryland"
    MA = "Massachusetts"
    MI = "Michigan"
    MN = "Minnesota"
    MS = "Mississippi"
    MO = "Missouri"
    MT = "Montana"
    NE = "Nebraska"
    NV = "Nevada"
    NH = "New Hampshire"
    NJ = "New Jersey"
    NM = "New Mexico"
    NY = "New York"
    NC = "North Carolina"
    ND = "North Dakota"
    OH = "Ohio"
    OK = "Oklahoma"
    OR = "Oregon"
    PA = "Pennsylvania"
    RI = "Rhode Island"
    SC = "South Carolina"
    SD = "South Dakota"
    TN = "Tennessee"
    TX = "Texas"
    UT = "Utah"
    VT = "Vermont"
    VA = "Virginia"
    WA = "Washington"
    WV = "West Virginia"
    WI = "Wisconsin"
    WY = "Wyoming"

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    filing_status = Column(Enum(FilingStatus), nullable=False)
    state = Column(Enum(USState), nullable=False)

class IncomeType(enum.Enum):
    HOURLY = "hourly"
    SALARY = "salary"

class AccountType(enum.Enum):
    ROTH_IRA = "roth_ira"
    TRADITIONAL_IRA = "traditional_ira"
    K401 = "401k"
    B403 = "403b"

class AssetType(enum.Enum):
    STOCK = "stock"
    BOND = "bond"
    CASH = "cash"
    HOUSING = "housing"
    SAVINGS = "savings"
    CHECKING = "checking"
    HIGH_YIELD_SAVINGS = "high_yield_savings"

class Income(Base):
    __tablename__ = 'incomes'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    income_type = Column(Enum(IncomeType), nullable=False)
    amount = Column(Float, nullable=False)
    monthly_income = Column(Float, nullable=True)
    hourly_wage = Column(Float, nullable=True)
    hours_worked = Column(Float, nullable=True)
    year = Column(Integer, nullable=False, default=2026)

class RetirementAccount(Base):
    __tablename__ = 'retirement_accounts'
    id = Column(Integer, primary_key=True) # Used for linking assets in valid SQL, effectively UUID in Firestore
    user_id = Column(Integer, nullable=True)
    name = Column(String, nullable=False)
    account_type = Column(Enum(AccountType), nullable=False)
    contributions_2025 = Column(Float, nullable=False, default=0.0)
    contributions_2026 = Column(Float, nullable=False, default=0.0)

class Asset(Base):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    retirement_account_id = Column(String, nullable=True) # ID string to link to Firestore retirement account
    ticker = Column(String, nullable=False)
    shares = Column(Float, nullable=False)
    cost_basis = Column(Float, nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False, default=AssetType.STOCK)

class Debt(Base):
    __tablename__ = 'debts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    name = Column(String, nullable=False)
    initial_amount = Column(Float, nullable=False)
    amount_paid = Column(Float, nullable=False, default=0.0)
    monthly_payment = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)

    @property
    def remaining_balance(self):
        return max(0, self.initial_amount - self.amount_paid)

# Example of how to set up the database engine
# engine = create_engine('sqlite:///finance.db')
# Base.metadata.create_all(engine)
# Session = sessionmaker(bind=engine)
# session = Session()
