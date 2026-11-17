# Database schema proposal

Draft logical model for Oracle. This document describes proposed tables, not an existing schema or migration. Finance is planned beyond the current v1 scope in PROJECT.md. Names, types and constraints require validation against the selected Oracle version and EF Core provider.

## Conventions

| Convention | Meaning |
|---|---|
| PK / FK | Primary key / foreign key |
| ID | Surrogate identifier; exact Oracle type to be selected consistently |
| Amount / quantity | Fixed-precision decimal, never floating point; precision and rounding remain to be specified per use |
| Currency | ISO 4217 code; monetary values retain their original currency |
| Date / timestamp | Business dates are dates; event timestamps are UTC |
| Content fields | `ID`, `SORT_ORDER`, `IS_PUBLISHED`, `CREATED_AT`, `UPDATED_AT` on publishable content |
| Optional | A field marked `?` can be null; required fields and constraints need final validation |

## Identity and security

Identity tables and columns depend on the configured ASP.NET Core Identity model. The table names below are proposed mappings, not a commitment to expose all Identity features. One administrator; no public registration or granular permissions in the first release.

| Table | Fields | Relationships / purpose |
|---|---|---|
| `AUTH_USERS` | Identity user ID (PK), username, normalized username, password hash, security and concurrency stamps, lockout and access-failure fields; other Identity fields as configured | Single owner; password hashing and lockout managed by Identity |
| `AUTH_USER_CLAIMS` | User ID (FK), claim ID (PK), type, value | Identity claims, only if required by configured model |
| `AUTH_USER_LOGINS` | Provider and provider key (composite PK), user ID (FK), display name | Identity external-login storage if required by configured model; no external login feature planned |
| `AUTH_USER_TOKENS` | User ID (FK), provider, name (composite PK), value | Identity token storage if required by configured model |

| Table | Fields | Relationships / purpose |
|---|---|---|
| `LOG_SECURITY_EVENTS` | `ID` (PK), `OCCURRED_AT`, `EVENT_TYPE`, `OUTCOME`, `USER_ID` (FK, ?), `CORRELATION_ID` | Authentication events; user may be unknown |
| `LOG_AUDIT_EVENTS` | `ID` (PK), `OCCURRED_AT`, `USER_ID` (FK), `ENTITY_TYPE`, `ENTITY_ID`, `ACTION`, `BEFORE_DATA` (?), `AFTER_DATA` (?), `CORRELATION_ID` | Audit reference is logical, not a polymorphic FK; financial values are excluded from audit payloads |
| `LOG_TECHNICAL_EVENTS` | `ID` (PK), `OCCURRED_AT`, `LEVEL`, `CATEGORY`, `MESSAGE`, `DETAILS` (?), `CORRELATION_ID` | Diagnostic events; redact secrets and financial details |

Retain logs for 90 days. Audit and the associated administrative change are committed atomically. Never log passwords, cookies, tokens or connection strings.

## Work and public portfolio

The `WRK_` prefix replaces the previously proposed `CAR_`; PROJECT.md has not yet been changed.

| Table | Fields besides common content fields | Relationships / purpose |
|---|---|---|
| `WRK_EXPERIENCES` | `ROLE`, `COMPANY`, `LOCATION` (?), `START_DATE`, `END_DATE` (?), `DESCRIPTION` | Independent career entry |
| `WRK_SKILLS` | `CATEGORY`, `NAME` | Independent skill |
| `WRK_EDUCATION` | `TYPE`, `TITLE`, `INSTITUTION`, `YEAR` | Education or certification |
| `WRK_LANGUAGES` | `NAME`, `PROFICIENCY` | Language and stated proficiency |
| `PRJ_PROJECTS` | `GITHUB_REPOSITORY_ID` (unique), `TITLE_OVERRIDE` (?), `SUMMARY_OVERRIDE` (?), `DESCRIPTION_OVERRIDE` (?), `SITE_URL_OVERRIDE` (?) | Overrides for a GitHub repository; no Oracle FK to the external snapshot |
| `PRJ_PROJECT_IMAGES` | `PROJECT_ID` (PK, FK), `CONTENT`, `CONTENT_TYPE`, `FILE_NAME` | Zero or one cover per project; API validates size and type |
| `PRJ_PROJECT_TECHNOLOGIES` | `ID` (PK), `PROJECT_ID` (FK), `NAME`, `SORT_ORDER` | Ordered custom technologies per project |

The current snapshot is bundled in the frontend. An API integration and its failure behavior must be designed before Oracle overrides can control the public result. Public APIs must never return unpublished content.

## Finance: accounts, movements and budgets

Finance is private and requires authorization. The fields below are a starting point for detailed design, not a finalized accounting model.

| Table | Fields | Relationships / purpose |
|---|---|---|
| `FIN_ACCOUNTS` | `ID` (PK), `NAME`, `TYPE`, `CURRENCY`, `OPENING_BALANCE`, `OPENING_DATE`, `IS_ACTIVE` | Account balance derives from opening balance and posted movements |
| `FIN_CATEGORIES` | `ID` (PK), `PARENT_ID` (FK, ?), `NAME`, `TYPE`, `IS_ACTIVE` | Hierarchical income and expense categories |
| `FIN_TRANSACTIONS` | `ID` (PK), `ACCOUNT_ID` (FK), `BOOKING_DATE`, `VALUE_DATE` (?), `AMOUNT`, `CURRENCY`, `DESCRIPTION` (?), `STATUS` | Signed movement; currency must match account unless a separate conversion is recorded |
| `FIN_TRANSACTION_LINES` | `ID` (PK), `TRANSACTION_ID` (FK), `CATEGORY_ID` (FK, ?), `AMOUNT`, `DESCRIPTION` (?) | Splits a movement by category; line totals must reconcile with the parent |
| `FIN_TRANSFERS` | `ID` (PK), `OUT_TRANSACTION_ID` (FK, unique), `IN_TRANSACTION_ID` (FK, unique), `EXCHANGE_RATE` (?), `FEE_AMOUNT` (?), `FEE_CURRENCY` (?) | Links transfer legs; transfers are excluded from income and spending totals |
| `FIN_BUDGETS` | `ID` (PK), `CATEGORY_ID` (FK), `PERIOD_START`, `PERIOD_END`, `AMOUNT`, `CURRENCY` | Budget per category and period; monthly versus annual relationship remains undecided |
| `FIN_RECURRING_ITEMS` | `ID` (PK), `ACCOUNT_ID` (FK, ?), `CATEGORY_ID` (FK, ?), `NAME`, `AMOUNT`, `CURRENCY`, `FREQUENCY`, `NEXT_DUE_DATE`, `END_DATE` (?) | Reminder only; does not create transactions automatically |
| `FIN_SAVINGS_GOALS` | `ID` (PK), `NAME`, `TARGET_AMOUNT`, `CURRENCY`, `TARGET_DATE` (?), `STATUS` | Savings target |
| `FIN_GOAL_CONTRIBUTIONS` | `ID` (PK), `GOAL_ID` (FK), `ACCOUNT_ID` (FK), `DATE`, `AMOUNT` | Signed allocation or reversal; not a second expense |

## Investments and pension

| Table | Fields | Relationships / purpose |
|---|---|---|
| `FIN_PORTFOLIOS` | `ID` (PK), `NAME`, `REFERENCE_CURRENCY`, `IS_ACTIVE` | Investment portfolio |
| `FIN_INSTRUMENTS` | `ID` (PK), `NAME`, `TYPE`, `ISIN` (?), `TICKER` (?), `EXCHANGE` (?), `QUOTE_CURRENCY` | An instrument can appear in multiple portfolios; identifiers and provider mapping require further design |
| `FIN_INVESTMENT_TRANSACTIONS` | `ID` (PK), `PORTFOLIO_ID` (FK), `INSTRUMENT_ID` (FK), `TYPE`, `TRADE_DATE`, `SETTLEMENT_DATE` (?), `QUANTITY` (?), `UNIT_PRICE` (?), `AMOUNT`, `CURRENCY`, `FEES`, `TAXES`, `CASH_TRANSACTION_ID` (FK, ?) | Trades, distributions and adjustments; optional link to cash movement prevents double counting |
| `FIN_INVESTMENT_LOTS` | `ID` (PK), `PORTFOLIO_ID` (FK), `INSTRUMENT_ID` (FK), `OPENING_TRANSACTION_ID` (FK), `ACQUIRED_QUANTITY`, `COST_AMOUNT`, `COST_CURRENCY` | Acquisition lot; cost and tax treatment require further specification |
| `FIN_LOT_DISPOSALS` | `ID` (PK), `LOT_ID` (FK), `DISPOSAL_TRANSACTION_ID` (FK), `QUANTITY`, `ALLOCATED_COST` | Connects disposals to lots; cannot dispose of more than available |
| `FIN_INSTRUMENT_PRICES` | `ID` (PK), `INSTRUMENT_ID` (FK), `PRICE_DATE`, `PRICE`, `CURRENCY`, `SOURCE`, `RETRIEVED_AT` | Historical prices and provenance |
| `FIN_PENSION_FUNDS` | `ID` (PK), `NAME`, `PROVIDER`, `CURRENCY`, `START_DATE` (?), `STATUS` | Pension position, separate from generic portfolios |
| `FIN_PENSION_CONTRIBUTIONS` | `ID` (PK), `FUND_ID` (FK), `DATE`, `SOURCE_TYPE`, `AMOUNT`, `CURRENCY`, `CASH_TRANSACTION_ID` (FK, ?) | Distinguishes personal, employer and TFR contributions; cash link only when applicable |
| `FIN_PENSION_VALUATIONS` | `ID` (PK), `FUND_ID` (FK), `VALUATION_DATE`, `VALUE`, `CURRENCY`, `SOURCE` | Historical position value |
| `FIN_PENSION_OPERATIONS` | `ID` (PK), `FUND_ID` (FK), `DATE`, `TYPE`, `AMOUNT`, `CURRENCY`, `CASH_TRANSACTION_ID` (FK, ?), `NOTES` (?) | Transfers, withdrawals, fees and other pension operations; exact types remain to be defined |

Tax rules, corporate actions, transfers between pension funds and cost-basis methods need detailed requirements before implementation. External market data provider and coverage remain undecided; introducing a service requires approval.

## Home and condominium

| Table | Fields | Relationships / purpose |
|---|---|---|
| `FIN_PROPERTIES` | `ID` (PK), `NAME`, `TYPE`, `NOTES` (?) | Property; avoid storing unnecessary private address data |
| `FIN_PROPERTY_UNITS` | `ID` (PK), `PROPERTY_ID` (FK), `NAME`, `TYPE` | Unit within a property or condominium |
| `FIN_PROPERTY_INTERESTS` | `ID` (PK), `UNIT_ID` (FK), `RELATIONSHIP_TYPE`, `OWNERSHIP_FRACTION` (?), `START_DATE`, `END_DATE` (?) | Ownership or tenancy over time; ownership fraction applies only when relevant |
| `FIN_CONDO_TABLES` | `ID` (PK), `PROPERTY_ID` (FK), `NAME`, `TOTAL_SHARES`, `VALID_FROM`, `VALID_TO` (?) | A property may have multiple share tables and historical versions |
| `FIN_CONDO_SHARES` | `ID` (PK), `CONDO_TABLE_ID` (FK), `UNIT_ID` (FK), `SHARES` | Shares of a unit in a table; unique per table and unit |
| `FIN_CONDO_EXPENSES` | `ID` (PK), `PROPERTY_ID` (FK), `PERIOD_START`, `PERIOD_END`, `DESCRIPTION`, `CURRENCY` | Groups expenses for a condominium period |
| `FIN_CONDO_EXPENSE_LINES` | `ID` (PK), `CONDO_EXPENSE_ID` (FK), `CONDO_TABLE_ID` (FK), `DESCRIPTION`, `AMOUNT`, `ALLOCATION_DATE` | Each expense item uses the applicable share table; allocation and rounding rules remain to be defined |
| `FIN_HOME_COSTS` | `ID` (PK), `UNIT_ID` (FK), `TYPE`, `DESCRIPTION`, `PERIOD_START` (?), `PERIOD_END` (?), `AMOUNT`, `CURRENCY`, `TRANSACTION_LINE_ID` (FK, ?) | Utilities, maintenance, insurance, taxes and condominium charges; link actual payment without counting it twice |

Mortgage balances and payments link to liabilities and transaction details. Condominium calculations need explicit rules for effective dates, adjustments, rounding and costs not allocated by shares; do not assume every item uses the same table.

## Net worth and exchange rates

| Table | Fields | Relationships / purpose |
|---|---|---|
| `FIN_ASSETS` | `ID` (PK), `NAME`, `TYPE`, `CURRENCY`, `PROPERTY_ID` (FK, ?) | Non-account asset; optional link to an owned property |
| `FIN_ASSET_VALUATIONS` | `ID` (PK), `ASSET_ID` (FK), `VALUATION_DATE`, `VALUE`, `CURRENCY`, `SOURCE` | Dated asset valuations |
| `FIN_LIABILITIES` | `ID` (PK), `NAME`, `TYPE`, `CURRENCY`, `PROPERTY_ID` (FK, ?) | Debt or mortgage, optionally linked to a property |
| `FIN_LIABILITY_VALUATIONS` | `ID` (PK), `LIABILITY_ID` (FK), `VALUATION_DATE`, `OUTSTANDING_AMOUNT`, `CURRENCY` | Dated outstanding balances |
| `FIN_EXCHANGE_RATES` | `ID` (PK), `BASE_CURRENCY`, `QUOTE_CURRENCY`, `RATE_DATE`, `RATE`, `SOURCE`, `RETRIEVED_AT` | Historical exchange rates with provenance |
| `FIN_NET_WORTH_SNAPSHOTS` | `ID` (PK), `SNAPSHOT_DATE`, `REFERENCE_CURRENCY`, `TOTAL_AMOUNT`, `CREATED_AT` | Manually saved valuation; total must reconcile to its items |
| `FIN_NET_WORTH_ITEMS` | `ID` (PK), `SNAPSHOT_ID` (FK), `SOURCE_TYPE`, `SOURCE_ID`, `DESCRIPTION`, `ORIGINAL_AMOUNT`, `ORIGINAL_CURRENCY`, `EXCHANGE_RATE`, `CONVERTED_AMOUNT` | Preserves source, amount and rate used; logical source reference avoids a polymorphic FK |

Snapshot items must avoid duplicate inclusion of cash, investments, pensions, properties and debts. Missing or stale valuations and rates must be shown explicitly; behavior when a rate is unavailable remains to be defined.

## Finance statistics and reporting

Statistics are private and derived from the dated records above. The proposal does not add aggregate tables: compute summaries from source data, and consider persisted aggregates only if measured performance requires them. Corrections to source records are reflected when reports are recalculated; manually saved net-worth snapshots remain historical records.

| Period | Proposed boundaries | Typical use |
|---|---|---|
| Daily | Calendar day | Transactions, account balances and available market prices |
| Weekly | Monday to Sunday, ISO week and week-year | Cash flow and spending trends |
| Monthly | Calendar month | Spending, budgets, recurring costs and contributions |
| Quarterly | Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec | Cash flow, investments and household expenses |
| Half-yearly | Jan–Jun and Jul–Dec | Medium-term comparisons |
| Annual | Calendar year | Annual budget, cash flow and portfolio overview |

| Report | Source tables | Measure / constraints |
|---|---|---|
| Income, spending and cash flow | `FIN_TRANSACTIONS`, `FIN_TRANSACTION_LINES`, `FIN_CATEGORIES`, `FIN_TRANSFERS` | Posted income and expenses by booking date, category and account; exclude transfer legs and avoid counting both parent and split lines |
| Account balance | `FIN_ACCOUNTS`, `FIN_TRANSACTIONS` | Opening balance plus posted movements through the selected date; show opening and closing balances, not their sum across days |
| Budget versus actual | `FIN_BUDGETS`, transaction lines and categories | Compare actual spending and applicable budget by category and period; prevent overlapping annual and monthly budgets from being counted twice |
| Investments | `FIN_INVESTMENT_TRANSACTIONS`, lots, prices and exchange rates | Contributions, disposals, distributions, costs and position value; show price dates and distinguish realized from unrealized results |
| Pension | `FIN_PENSION_CONTRIBUTIONS`, `FIN_PENSION_OPERATIONS`, `FIN_PENSION_VALUATIONS` | Contributions by source and latest available position value as of the selected date; avoid counting linked cash movements twice |
| Home and condominium | `FIN_HOME_COSTS`, condominium expenses and transaction lines | Costs by unit, category and period; distinguish assessed charges from payments and do not add linked records twice |
| Net worth | Accounts, portfolios, pensions, asset and liability valuations, rates and saved snapshots | Assets minus liabilities at a date; compare available valuations or saved snapshots without inventing daily observations |
| Savings goals | `FIN_SAVINGS_GOALS`, `FIN_GOAL_CONTRIBUTIONS` | Allocations and progress by goal and period; allocations are not expenses |

Flow measures are summed within a period; balances and valuations are point-in-time values and must not be summed across dates. Reports retain original currencies and may show a converted total only when an applicable historical exchange rate exists. Display the reference currency, valuation and rate dates, missing data and stale data; never silently treat a missing price or rate as zero. Report access is restricted to the authenticated owner. Exact reporting timezone, budget period rules, rate selection and freshness thresholds remain open decisions.

## Open decisions before migrations

- Oracle Autonomous Database version and instance type; provider compatibility, field sizes and indexes.
- Independent annual budgets versus annual totals derived from monthly budgets.
- Market-data and exchange-rate provider, coverage, cost and failure behavior.
- Detailed transaction and transfer fee accounting, investment operations, lot selection and fiscal rules.
- Condominium allocation, rounding, adjustments and reconciliation with official statements.
- Snapshot valuation dates, stale-data thresholds and treatment of missing data.
- Reporting timezone, historical exchange-rate selection, and statistical definitions where data or valuations are incomplete.
- Projects API integration and behavior when the API is unavailable.
- Finance implementation phases and any changes to the scope currently recorded in PROJECT.md.
