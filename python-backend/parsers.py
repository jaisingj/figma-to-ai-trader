import pandas as pd
import numpy as np
import re
from datetime import datetime, date
import io

# ─────────────────────────────────────────────────────────────
# STANDARD OUTPUT COLUMNS - These will ALWAYS be created
# ─────────────────────────────────────────────────────────────
STANDARD_COLUMNS = [
    "Activity Date",
    "Type",
    "Instrument",
    "Description",
    "Trans Code",
    "Quantity",
    "Price",
    "Amount",
    "Strike Price",
    "Expiry Date",
    "Option Type",
    "STO Date",
    "STO($)",
    "STO Price",
    "BTC Date",
    "BTC($)",
    "BTC Price",
    "Status",
    "Premium($)",
    "Collateral",
    "Broker",
]

# Column defaults (0 for numeric, None for others)
NUMERIC_COLUMNS = [
    "Quantity", "Price", "Amount", "Strike Price", 
    "STO($)", "STO Price", "BTC($)", "BTC Price", 
    "Premium($)", "Collateral"
]

# ─────────────────────────────────────────────────────────────
# Column name mappings from various brokerages
# ─────────────────────────────────────────────────────────────
COLUMN_MAPPINGS = {
    # Date columns
    "date": "Activity Date",
    "trade date": "Activity Date",
    "transaction date": "Activity Date",
    "run date": "Activity Date",
    "activity date": "Activity Date",
    "settlement date": "Activity Date",
    "settle date": "Activity Date",
    "process date": "Activity Date",
    
    # Instrument/Symbol columns
    "symbol": "Instrument",
    "ticker": "Instrument",
    "stock": "Instrument",
    "security": "Instrument",
    "instrument": "Instrument",
    "underlying": "Instrument",
    
    # Description columns
    "description": "Description",
    "desc": "Description",
    "details": "Description",
    "transaction description": "Description",
    "action description": "Description",
    
    # Transaction type columns
    "trans code": "Trans Code",
    "transaction code": "Trans Code",
    "action": "Trans Code",
    "type": "Type",
    "transaction type": "Trans Code",
    "trade type": "Trans Code",
    "side": "Trans Code",
    
    # Price columns
    "price": "Price",
    "price ($)": "Price",
    "trade price": "Price",
    "execution price": "Price",
    "unit price": "Price",
    
    # Amount columns
    "amount": "Amount",
    "amount ($)": "Amount",
    "total": "Amount",
    "total amount": "Amount",
    "net amount": "Amount",
    "value": "Amount",
    "proceeds": "Amount",
    "cash balance": "Amount",
    
    # Quantity columns
    "quantity": "Quantity",
    "qty": "Quantity",
    "shares": "Quantity",
    "contracts": "Quantity",
    
    # Option-specific columns
    "expiry date": "Expiry Date",
    "expiration date": "Expiry Date",
    "expiration": "Expiry Date",
    "exp date": "Expiry Date",
    "strike price": "Strike Price",
    "strike": "Strike Price",
    "option type": "Option Type",
    "put/call": "Option Type",
    "call/put": "Option Type",
    
    # STO/BTC columns
    "sto($)": "STO($)",
    "sto $": "STO($)",
    "sto": "STO($)",
    "sto date": "STO Date",
    "sto price": "STO Price",
    "btc($)": "BTC($)",
    "btc $": "BTC($)",
    "btc": "BTC($)",
    "btc date": "BTC Date",
    "btc price": "BTC Price",
    
    # Other columns
    "status": "Status",
    "premium($)": "Premium($)",
    "premium": "Premium($)",
    "collateral": "Collateral",
    "broker": "Broker",
    "commission fees ($)": "Commission",
    "commission": "Commission",
    "accrued interest": "Accrued Interest",
}

# ─────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────
def clean_stock_symbol(symbol):
    """Clean stock symbol - remove extra characters but preserve valid ticker symbols."""
    if pd.isna(symbol) or symbol is None:
        return None
    
    # Convert to string and strip whitespace
    cleaned = str(symbol).strip().upper()
    
    # If it's already a clean ticker (1-5 letters only), return as-is
    # This preserves valid symbols like APP, AAPL, TSLA, etc.
    if re.match(r'^[A-Z]{1,5}$', cleaned):
        return cleaned
    
    # For longer strings (like option descriptions), extract just the ticker part
    # Option format often looks like: "APP 01/17/2025 250.00 P" or "AAPL250117P00250000"
    
    # Try to extract ticker from beginning of string (letters before numbers/spaces)
    ticker_match = re.match(r'^([A-Z]{1,5})[\s\d]', cleaned)
    if ticker_match:
        return ticker_match.group(1)
    
    # Fallback: remove digits, hyphens, plus signs, slashes, and whitespace
    cleaned = re.sub(r'[0-9\-\+\s/\.]', '', cleaned)
    
    # Only remove trailing P or C if the result would still be at least 1 character
    # AND the original had numbers (indicating it's an option symbol, not a ticker)
    if len(cleaned) > 1 and re.search(r'\d', str(symbol)):
        cleaned = re.sub(r'[PC]$', '', cleaned)
    
    return cleaned if cleaned else None

def parse_amount(amt):
    """Parse a string amount (with $/commas/parentheses) to float. Safe for any input."""
    if pd.isna(amt):
        return 0.0
    if isinstance(amt, (int, float)):
        return float(amt)
    txt = str(amt).replace("$", "").replace(",", "").replace("(", "-").replace(")", "")
    nums = re.findall(r"[+-]?\d+(?:\.\d+)?", txt)
    return sum(float(n) for n in nums) if nums else 0.0

def safe_parse_date(d):
    """Parse various date formats to datetime. Safe for any input."""
    if pd.isna(d) or d is None:
        return None
    if isinstance(d, (datetime, date)):
        return d
    if isinstance(d, pd.Timestamp):
        return d.to_pydatetime()
    
    date_formats = [
        "%m/%d/%Y", "%Y-%m-%d", "%m-%d-%Y", "%d/%m/%Y",
        "%m/%d/%y", "%Y/%m/%d", "%d-%m-%Y", "%m.%d.%Y",
        "%b %d %Y", "%B %d %Y", "%d %b %Y", "%d %B %Y",
    ]
    
    txt = str(d).strip()
    m = re.search(r"as of (\d{2}/\d{2}/\d{4})", txt)
    if m:
        txt = m.group(1)
    
    for fmt in date_formats:
        try:
            return datetime.strptime(txt, fmt)
        except ValueError:
            continue
    
    try:
        return pd.to_datetime(txt, errors='coerce')
    except:
        return None

def fallback_extract_expiry_date(desc):
    """Extract expiry date from description if present as MM/DD/YYYY or MM/DD/YY."""
    if pd.isna(desc):
        return None
    txt = str(desc)
    m = re.search(r"\b(\d{1,2}/\d{1,2}/\d{4})\b", txt)
    if m:
        try:
            return datetime.strptime(m.group(1), "%m/%d/%Y")
        except ValueError:
            return None
    m2 = re.search(r"\b(\d{1,2}/\d{1,2}/\d{2})\b(?!\d)", txt)
    if m2:
        try:
            return datetime.strptime(m2.group(1), "%m/%d/%y")
        except ValueError:
            return None
    return None

def symbol_extract_expiry_strike_option(text):
    """Extract expiry date, strike, and option type from symbol/description text."""
    if not text or pd.isna(text):
        return (None, 0.0, None)
    dt_m = re.search(r"\b(\d{1,2}/\d{1,2}/\d{4})\b", text)
    expiry_dt = (
        datetime.strptime(dt_m.group(1), "%m/%d/%Y").date() if dt_m else None
    )
    sc_m = re.search(r"\s(\d+(?:\.\d+))\s([PC])\b", text)
    if sc_m:
        strike = float(sc_m.group(1))
        opt_type = "Put" if sc_m.group(2).upper() == "P" else "Call"
    else:
        strike, opt_type = 0.0, None
    return (expiry_dt, strike, opt_type)

def parse_description_for_option(desc):
    """Extract expiry, strike, and type from a description string."""
    if not desc or pd.isna(desc):
        return (None, 0.0, None)
    
    desc_str = str(desc)
    
    # Try MM/DD/YYYY format
    expiry = None
    dt_m = re.search(r"\b(\d{1,2}/\d{1,2}/\d{4})\b", desc_str)
    if dt_m:
        try:
            expiry = datetime.strptime(dt_m.group(1), "%m/%d/%Y").date()
        except ValueError:
            pass
    if not expiry:
        dt_m2 = re.search(r"\b(\d{1,2}/\d{1,2}/\d{2})\b(?!\d)", desc_str)
        if dt_m2:
            try:
                expiry = datetime.strptime(dt_m2.group(1), "%m/%d/%y").date()
            except ValueError:
                pass
    
    # Try month name format
    if not expiry:
        month_match = re.search(r"([A-Z]{3,9})\s+(\d{1,2})\s+(\d{2,4})", desc_str, re.IGNORECASE)
        if month_match:
            try:
                expiry = pd.to_datetime(month_match.group(0), errors='coerce')
                if pd.notna(expiry):
                    expiry = expiry.date()
            except:
                pass
    
    # Extract strike
    strike = 0.0
    strike_m = re.search(r"\$(\d+(?:\.\d+)?)", desc_str)
    if strike_m:
        strike = float(strike_m.group(1))
    else:
        strike_m2 = re.search(r"(\d+(?:\.\d+)?)\s*[PC]", desc_str, re.IGNORECASE)
        if strike_m2:
            strike = float(strike_m2.group(1))
    
    # Extract option type
    opt_type = None
    if re.search(r"\bput\b", desc_str, re.IGNORECASE):
        opt_type = "Put"
    elif re.search(r"\bcall\b", desc_str, re.IGNORECASE):
        opt_type = "Call"
    elif re.search(r"\bP\b", desc_str):
        opt_type = "Put"
    elif re.search(r"\bC\b", desc_str):
        opt_type = "Call"
    
    return (expiry, strike, opt_type)

def normalize_column_name(col_name):
    """Normalize a column name to a standard name if possible."""
    clean_name = str(col_name).strip().lower()
    return COLUMN_MAPPINGS.get(clean_name, col_name.strip())

def ensure_standard_columns(df):
    """Ensure DataFrame has ALL standard columns, creating missing ones with defaults."""
    df = df.copy()
    
    for col in STANDARD_COLUMNS:
        if col not in df.columns:
            if col in NUMERIC_COLUMNS:
                df[col] = 0.0
            else:
                df[col] = None
    
    # Double-check critical columns
    critical_numeric = ["Quantity", "Price", "Amount", "STO($)", "BTC($)", "Premium($)", "Strike Price"]
    for col in critical_numeric:
        if col not in df.columns:
            df[col] = 0.0
    
    # Clean stock symbols - remove -, +, and numbers, keep only letters
    if "Instrument" in df.columns:
        df["Instrument"] = df["Instrument"].apply(clean_stock_symbol)
    
    return df

def calculate_derived_columns(df):
    """Calculate derived columns like Premium, STO/BTC based on available data."""
    
    # Ensure columns exist
    if "STO($)" not in df.columns:
        df["STO($)"] = 0.0
    if "BTC($)" not in df.columns:
        df["BTC($)"] = 0.0
    if "Premium($)" not in df.columns:
        df["Premium($)"] = 0.0
    if "Quantity" not in df.columns:
        df["Quantity"] = 0.0
    
    # Calculate STO($) and BTC($) if empty
    sto_empty = df["STO($)"].isna().all() or (df["STO($)"].fillna(0) == 0).all()
    if sto_empty:
        if "Trans Code" in df.columns and "Amount" in df.columns:
            trans_col = df["Trans Code"].astype(str).str.upper()
            df["STO($)"] = np.where(
                trans_col.str.contains("STO|SELL|SOLD|OPEN", na=False), 
                df["Amount"].abs(), 
                df["STO($)"]
            )
            df["BTC($)"] = np.where(
                trans_col.str.contains("BTC|BUY|BOUGHT|CLOSE", na=False), 
                -df["Amount"].abs(), 
                df["BTC($)"]
            )
        elif "Amount" in df.columns:
            df["STO($)"] = np.where(df["Amount"] > 0, df["Amount"], 0)
            df["BTC($)"] = np.where(df["Amount"] < 0, df["Amount"], 0)
    
    # Calculate Premium if empty
    premium_empty = df["Premium($)"].isna().all() or (df["Premium($)"].fillna(0) == 0).all()
    if premium_empty:
        df["Premium($)"] = df["STO($)"].fillna(0) - df["BTC($)"].fillna(0).abs()
    
    return df

# ─────────────────────────────────────────────────────────────
# Generic Parser - Works with ANY CSV format
# ─────────────────────────────────────────────────────────────
def parse_generic_file(file_like):
    """
    Parse ANY CSV/Excel file and normalize to standard format.
    Creates all standard columns regardless of input format.
    """
    fname = getattr(file_like, 'name', '').lower()
    
    # Try to read the file
    data = None
    try:
        if fname.endswith((".xlsx", ".xls")):
            data = pd.read_excel(file_like)
        else:
            data = pd.read_csv(file_like, on_bad_lines="skip")
    except Exception as e:
        try:
            file_like.seek(0)
            data = pd.read_csv(file_like, encoding='latin-1', on_bad_lines="skip")
        except:
            try:
                file_like.seek(0)
                data = pd.read_csv(file_like, sep=None, engine='python', on_bad_lines="skip")
            except:
                raise ValueError(f"Could not parse file: {e}")
    
    if data is None or data.empty:
        raise ValueError("File is empty or could not be parsed")
    
    # Normalize column names
    data.columns = data.columns.astype(str).str.strip()
    
    rename_map = {}
    for col in data.columns:
        normalized = normalize_column_name(col)
        if normalized != col and normalized not in data.columns:
            rename_map[col] = normalized
    
    if rename_map:
        data = data.rename(columns=rename_map)
    
    # Parse date columns
    date_cols = ["Activity Date", "STO Date", "BTC Date", "Expiry Date"]
    for col in date_cols:
        if col in data.columns:
            data[col] = data[col].apply(safe_parse_date)
    
    # Parse numeric columns
    for col in NUMERIC_COLUMNS:
        if col in data.columns:
            data[col] = data[col].apply(parse_amount)
    
    # Extract option info from Description if missing
    if "Description" in data.columns:
        has_option_info = (
            ("Expiry Date" in data.columns and data["Expiry Date"].notna().any()) or
            ("Strike Price" in data.columns and (data["Strike Price"] != 0).any()) or
            ("Option Type" in data.columns and data["Option Type"].notna().any())
        )
        
        if not has_option_info:
            extracted = data["Description"].apply(parse_description_for_option)
            data["Expiry Date"] = extracted.apply(lambda x: x[0])
            data["Strike Price"] = extracted.apply(lambda x: x[1])
            data["Option Type"] = extracted.apply(lambda x: x[2])
    
    # Ensure all standard columns exist
    data = ensure_standard_columns(data)
    data = calculate_derived_columns(data)
    
    return data

# ─────────────────────────────────────────────────────────────
# Schwab Parser
# ─────────────────────────────────────────────────────────────
def parse_schwab_to_robinhood(file_like):
    """Parse Schwab CSV to a standardized options DataFrame."""
    try:
        df = pd.read_csv(file_like)
        df.columns = df.columns.str.strip()
        
        if "Action" not in df.columns:
            file_like.seek(0)
            return parse_generic_file(file_like)
        
        df = df[df["Action"].isin(["Sell to Open", "Buy to Close"])].copy()
        df["Instrument"] = df["Symbol"].str.split().str[0]
        df["Trans Code"] = np.where(df["Action"] == "Sell to Open", "STO", "BTC")

        def clean_dt(d):
            if pd.isna(d):
                return None
            m = re.search(r"as of (\d{2}/\d{2}/\d{4})", str(d))
            if m:
                try:
                    return datetime.strptime(m.group(1), "%m/%d/%Y").date()
                except ValueError:
                    return None
            try:
                return datetime.strptime(str(d), "%m/%d/%Y").date()
            except ValueError:
                return None

        df["Activity Date"] = df["Date"].apply(clean_dt)
        df["Price"] = df["Price"].apply(parse_amount)
        df["Amount"] = df["Amount"].apply(parse_amount)

        parsed = df["Symbol"].apply(symbol_extract_expiry_strike_option)
        df["Expiry Date"] = parsed.apply(lambda x: x[0])
        df["Strike Price"] = parsed.apply(lambda x: x[1])
        df["Option Type"] = parsed.apply(lambda x: x[2])

        if df["Expiry Date"].notna().sum() == 0:
            df["Expiry Date"] = df["Description"].apply(fallback_extract_expiry_date)

        def seg_amt(a):
            if pd.isna(a):
                return (0, 0)
            if a > 0:
                return (a, 0)
            if a < 0:
                return (0, a)
            return (0, 0)

        df[["STO($)", "BTC($)"]] = df["Amount"].apply(lambda x: pd.Series(seg_amt(x)))

        df = ensure_standard_columns(df)
        df = calculate_derived_columns(df)
        return df
        
    except Exception as e:
        file_like.seek(0)
        return parse_generic_file(file_like)

# ─────────────────────────────────────────────────────────────
# Robinhood Parser
# ─────────────────────────────────────────────────────────────
def parse_robinhood_file(file_like):
    """Parse Robinhood CSV or Excel to a standardized options DataFrame."""
    try:
        fname = getattr(file_like, 'name', '').lower()
        data = pd.read_csv(file_like, on_bad_lines="skip") if fname.endswith(".csv") else pd.read_excel(file_like)
        data.columns = data.columns.str.strip()

        # Normalize column names
        rename_map = {}
        for col in data.columns:
            normalized = normalize_column_name(col)
            if normalized != col and normalized not in data.columns:
                rename_map[col] = normalized
        if rename_map:
            data = data.rename(columns=rename_map)

        if "Description" in data.columns:
            ext = data["Description"].apply(parse_description_for_option)
            data["Expiry Date"] = ext.apply(lambda x: x[0])
            data["Strike Price"] = ext.apply(lambda x: x[1])
            data["Option Type"] = ext.apply(lambda x: x[2])

        if {"Trans Code", "Amount"}.issubset(data.columns):
            data["STO($)"] = np.where(data["Trans Code"] == "STO", data["Amount"], 0)
            data["BTC($)"] = np.where(data["Trans Code"] == "BTC", data["Amount"], 0)

        for c in ["Amount", "Price", "Quantity"]:
            if c in data.columns:
                data[c] = data[c].apply(parse_amount)
        
        data = ensure_standard_columns(data)
        data = calculate_derived_columns(data)
        return data
        
    except Exception as e:
        file_like.seek(0)
        return parse_generic_file(file_like)

# ─────────────────────────────────────────────────────────────
# Fidelity Parser
# ─────────────────────────────────────────────────────────────
def parse_fidelity_file(file_like):
    """Parse Fidelity text/CSV to a standardized options DataFrame."""
    try:
        content = file_like.read()
        if isinstance(content, bytes):
            content = content.decode("utf-8")
        clean_lines = [
            line for line in content.splitlines()
            if "date downloaded" not in line.lower() and "provided to you solely for your use" not in line.lower()
        ]
        df = pd.read_csv(io.StringIO("\n".join(clean_lines)))

        df.columns = df.columns.str.strip()
        for col in df.select_dtypes(include="object").columns:
            df[col] = df[col].astype(str).str.strip()

        if "Run Date" in df.columns:
            df["Activity Date"] = pd.to_datetime(df["Run Date"], errors="coerce")
        
        if "Action" in df.columns:
            df["Trans Code"] = df["Action"].str.extract(r"YOU\s+(\w+)", expand=False).str.upper()
            df["Trans Code"] = df["Trans Code"].replace({"SOLD": "STO", "BOUGHT": "BTC"})
        
        if "Symbol" in df.columns:
            df["Instrument"] = df["Symbol"]
        elif "Description" in df.columns:
            df["Instrument"] = df["Description"].str.extract(r"\((\w+)\)")

        def extract_option_fields(desc):
            if pd.isna(desc):
                return (None, 0.0, None)
            desc = str(desc)
            expiry = re.search(r"([A-Z]{3,9}\s\d{1,2}\s\d{2,4})", desc)
            strike = re.search(r"\$(\d+(?:\.\d+)?)", desc)
            opt_type = "Put" if "put" in desc.lower() else ("Call" if "call" in desc.lower() else None)
            return (
                pd.to_datetime(expiry.group(1), errors="coerce").date() if expiry else None,
                float(strike.group(1)) if strike else 0.0,
                opt_type
            )

        if "Description" in df.columns:
            parsed = df["Description"].apply(extract_option_fields)
            df["Expiry Date"] = parsed.apply(lambda x: x[0])
            df["Strike Price"] = parsed.apply(lambda x: x[1])
            df["Option Type"] = parsed.apply(lambda x: x[2])

        if "Price ($)" in df.columns:
            df["Price"] = df["Price ($)"].apply(parse_amount)
        if "Amount ($)" in df.columns:
            df["Amount"] = df["Amount ($)"].apply(parse_amount)
            df[["STO($)", "BTC($)"]] = df["Amount"].apply(lambda x: pd.Series((x, 0) if x > 0 else (0, x)))

        df = df[df["Description"].notna()].copy()
        df = ensure_standard_columns(df)
        df = calculate_derived_columns(df)
        return df
        
    except Exception as e:
        file_like.seek(0)
        return parse_generic_file(file_like)

# ─────────────────────────────────────────────────────────────
# Normalize DataFrame - Used after concat
# ─────────────────────────────────────────────────────────────
def normalize_dataframe_columns(df):
    """Ensure DataFrame has ALL standard columns after concatenation."""
    df = ensure_standard_columns(df)
    df = calculate_derived_columns(df)
    return df
