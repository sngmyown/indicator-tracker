import csv
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from io import StringIO
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
HISTORY_PATH = Path("data/history.json")
HISTORY_MAX_SNAPSHOTS = 80
KST = ZoneInfo("Asia/Seoul")

FRED_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv?id="
YAHOO_VIX_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_NEAR_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVW1VX?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_SECOND_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVW2VX?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_FIRST_MONTH_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVFTW1?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_SECOND_MONTH_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVFTW2?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_VXIND1_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVXIND1?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_VXIND2_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVXIND2?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_VX1_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVX1?range=1mo&interval=1d"
YAHOO_VIX_FUTURE_VX2_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVX2?range=1mo&interval=1d"
YAHOO_VIX3M_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX3M?range=1mo&interval=1d"
YAHOO_VIX6M_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX6M?range=1mo&interval=1d"
STOOQ_VIX_URL = "https://stooq.com/q/d/l/?s=%5Evix&i=d"
TREASURY_YIELD_CURVE_BASE = "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml"
DOL_AR539_CSV_URL = "https://oui.doleta.gov/unemploy/csv/ar539.csv"
BLS_PUBLIC_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
BLS_UNRATE_SERIES_ID = "LNS14000000"
STOOQ_WTI_URL = "https://stooq.com/q/d/l/?s=cl.f&i=d"
STOOQ_DOLLAR_INDEX_URL = "https://stooq.com/q/d/l/?s=dx.f&i=d"
YAHOO_DOLLAR_INDEX_URL = "https://query1.finance.yahoo.com/v8/finance/chart/DX-Y.NYB?range=1mo&interval=1d"
YAHOO_DOLLAR_INDEX_ALT_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EDXY?range=1mo&interval=1d"
YAHOO_WTI_URL = "https://query1.finance.yahoo.com/v8/finance/chart/CL%3DF?range=1mo&interval=1d"
STOOQ_COPPER_URL = "https://stooq.com/q/d/l/?s=hg.f&i=d"
YAHOO_COPPER_URL = "https://query1.finance.yahoo.com/v8/finance/chart/HG%3DF?range=1mo&interval=1d"
CENSUS_RETAIL_SALES_PAGE_URL = "https://www.census.gov/retail/sales.html"
BLS_CPI_SA_SERIES_ID = "CUSR0000SA0"
BLS_CPI_NSA_SERIES_ID = "CUUR0000SA0"
BLS_PAYEMS_SERIES_ID = "CES0000000001"
BLS_AVG_HOURLY_EARNINGS_SERIES_ID = "CES0500000003"
BLS_PPI_ALL_COMMODITIES_SERIES_ID = "WPU00000000"
BLS_PPI_FINAL_DEMAND_SERIES_ID = "WPUFD4"
FED_H15_FED_FUNDS_WEEKLY_URL = "https://www.federalreserve.gov/datadownload/Output.aspx?rel=H15&series=8e83f7f17c5cea4d190d85ae6737639f&lastObs=52&from=&to=&filetype=csv&label=include&layout=seriescolumn&type=package"
FED_CREDIT_CARD_DELINQUENCY_URL = "https://www.federalreserve.gov/releases/chargeoff/delallsa.htm"

FACTSET_EARNINGS_INSIGHT_URL = "https://www.factset.com/earningsinsight"
FACTSET_EARNINGS_TOPIC_URL = "https://insight.factset.com/topic/earnings"
ISM_INVESTING_URL = "https://www.investing.com/economic-calendar/ism-manufacturing-pmi-173"
ISM_TRADING_ECONOMICS_URL = "https://tradingeconomics.com/united-states/business-confidence"
ISM_REPORTS_URL = "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/"



YAHOO_SPY_URL = "https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=1mo&interval=1d"
YAHOO_QQQ_URL = "https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=1mo&interval=1d"
YAHOO_IWM_URL = "https://query1.finance.yahoo.com/v8/finance/chart/IWM?range=1mo&interval=1d"
YAHOO_SQQQ_URL = "https://query1.finance.yahoo.com/v8/finance/chart/SQQQ?range=1mo&interval=1d"
YAHOO_GOLD_URL = "https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?range=1mo&interval=1d"

STOOQ_SPY_URL = "https://stooq.com/q/d/l/?s=spy.us&i=d"
STOOQ_QQQ_URL = "https://stooq.com/q/d/l/?s=qqq.us&i=d"
STOOQ_IWM_URL = "https://stooq.com/q/d/l/?s=iwm.us&i=d"
STOOQ_SQQQ_URL = "https://stooq.com/q/d/l/?s=sqqq.us&i=d"
STOOQ_GOLD_URL = "https://stooq.com/q/d/l/?s=gc.f&i=d"


def fred_url(series_id):
    return FRED_BASE + series_id


def treasury_yield_curve_url(month_yyyymm):
    query = urllib.parse.urlencode({
        "data": "daily_treasury_yield_curve",
        "field_tdr_date_value_month": month_yyyymm,
    })
    return f"{TREASURY_YIELD_CURVE_BASE}?{query}"


def treasury_real_yield_curve_url(month_yyyymm):
    query = urllib.parse.urlencode({
        "data": "daily_treasury_real_yield_curve",
        "field_tdr_date_value_month": month_yyyymm,
    })
    return f"{TREASURY_YIELD_CURVE_BASE}?{query}"


def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError("data/latest.json 파일을 찾을 수 없습니다.")

    with DATA_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if data.get("schemaVersion") != "1.0.0":
        raise ValueError("latest.json이 v1 스키마가 아닙니다. schemaVersion을 확인하세요.")

    if "indicators" not in data or not isinstance(data["indicators"], list):
        raise ValueError("latest.json에 indicators 배열이 없습니다.")

    return data


def save_data(data):
    DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def find_indicator(data, indicator_id):
    for item in data["indicators"]:
        if item.get("id") == indicator_id:
            return item

    raise KeyError(f"indicator id를 찾을 수 없습니다: {indicator_id}")


def fetch_text(url, retries=1, timeout=8):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            print(f"[fetch] attempt {attempt}/{retries}: {url}", flush=True)

            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "text/csv,text/plain,application/json,application/xml,text/xml,*/*",
                    "Cache-Control": "no-cache",
                },
            )

            with urllib.request.urlopen(request, timeout=timeout) as response:
                text = response.read().decode("utf-8")
                print(f"[fetch-ok] {url}", flush=True)
                return text

        except (TimeoutError, urllib.error.URLError, urllib.error.HTTPError) as error:
            last_error = error
            print(f"[fetch-failed] {url}", flush=True)
            print(f"[fetch-error] {error}", flush=True)

            if attempt < retries:
                time.sleep(2)

    raise RuntimeError(f"데이터 호출 실패: {url}. 마지막 오류: {last_error}")


def latest_two_from_rows(rows, value_key="value"):
    valid_rows = []

    for row in rows:
        value = row.get(value_key)
        date = row.get("date")

        if date is None or value is None:
            continue

        try:
            numeric = round(float(value), 4)
        except (TypeError, ValueError):
            continue

        valid_rows.append({
            "date": str(date)[:10],
            "value": numeric,
        })

    if len(valid_rows) < 2:
        raise ValueError("유효 데이터가 2개 미만입니다.")

    valid_rows.sort(key=lambda row: row["date"])
    return valid_rows[-1], valid_rows[-2]


def fetch_fred_series(series_id):
    text = fetch_text(fred_url(series_id), retries=1, timeout=8)
    reader = csv.DictReader(StringIO(text))

    rows = []
    for row in reader:
        rows.append({
            "date": row.get("observation_date"),
            "value": row.get(series_id),
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "FRED",
        "series": series_id,
        "url": fred_url(series_id),
        "latest": latest,
        "previous": previous,
    }


def fetch_fred_series_recent(series_id, years_back=2):
    now = datetime.now(KST)
    start_year = max(1900, now.year - years_back)
    start_date = f"{start_year}-01-01"
    url = f"{fred_url(series_id)}&cosd={start_date}"
    text = fetch_text(url, retries=2, timeout=10)
    reader = csv.DictReader(StringIO(text))

    rows = []
    for row in reader:
        rows.append({
            "date": row.get("observation_date"),
            "value": row.get(series_id),
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "FRED",
        "series": series_id,
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_fred_vix():
    return fetch_fred_series("VIXCLS")


def fetch_fred_vxv():
    # Cboe S&P 500 3-Month Volatility Index.
    # VXVCLS is used only as a volatility-term proxy when direct VX1/VX2 futures data is unavailable.
    return fetch_fred_series_recent("VXVCLS", years_back=1)


def fetch_yahoo_vix():
    text = fetch_text(YAHOO_VIX_URL, retries=1, timeout=8)
    payload = json.loads(text)

    result = payload.get("chart", {}).get("result")
    if not result:
        raise ValueError("Yahoo Finance 응답에 chart.result가 없습니다.")

    result0 = result[0]
    timestamps = result0.get("timestamp") or []
    quote = result0.get("indicators", {}).get("quote", [{}])[0]
    closes = quote.get("close") or []

    rows = []
    for ts, close in zip(timestamps, closes):
        if close is None:
            continue

        date = datetime.fromtimestamp(ts, KST).date().isoformat()
        rows.append({
            "date": date,
            "value": close,
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "Yahoo Finance",
        "series": "^VIX",
        "url": YAHOO_VIX_URL,
        "latest": latest,
        "previous": previous,
    }


def fetch_yahoo_chart_close(url, series_name, label):
    text = fetch_text(url, retries=1, timeout=8)
    payload = json.loads(text)

    result = payload.get("chart", {}).get("result")
    if not result:
        error = payload.get("chart", {}).get("error")
        raise ValueError(f"Yahoo Finance 응답에 chart.result가 없습니다. error={error}")

    result0 = result[0]
    timestamps = result0.get("timestamp") or []
    quote = result0.get("indicators", {}).get("quote", [{}])[0]
    closes = quote.get("close") or []

    rows = []
    for ts, close in zip(timestamps, closes):
        if close is None:
            continue
        date = datetime.fromtimestamp(ts, KST).date().isoformat()
        rows.append({
            "date": date,
            "value": close,
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": label,
        "series": series_name,
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": True,
    }


def fetch_yahoo_dollar_index():
    return fetch_yahoo_chart_close(YAHOO_DOLLAR_INDEX_URL, "DX-Y.NYB", "Yahoo Finance Dollar Index")


def fetch_yahoo_dollar_index_alt():
    return fetch_yahoo_chart_close(YAHOO_DOLLAR_INDEX_ALT_URL, "^DXY", "Yahoo Finance Dollar Index Alt")


def fetch_yahoo_wti_oil():
    return fetch_yahoo_chart_close(YAHOO_WTI_URL, "CL=F", "Yahoo Finance WTI Futures")


def fetch_yahoo_copper_price():
    return fetch_yahoo_chart_close(YAHOO_COPPER_URL, "HG=F", "Yahoo Finance Copper Futures")


def fetch_yahoo_vix_future_near_term():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_NEAR_URL, "^VW1VX", "Yahoo Finance Cboe Near-Term VIX Future")


def fetch_yahoo_vix_future_second_term():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_SECOND_URL, "^VW2VX", "Yahoo Finance Cboe Second-Term VIX Future")


def fetch_yahoo_vix_future_first_month():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_FIRST_MONTH_URL, "^VFTW1", "Yahoo Finance Cboe 1st Month VIX Futures")


def fetch_yahoo_vix_future_second_month():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_SECOND_MONTH_URL, "^VFTW2", "Yahoo Finance Cboe 2nd Month VIX Futures")


def fetch_yahoo_vix_future_vxind1():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_VXIND1_URL, "^VXIND1", "Yahoo Finance Cboe VX Futures 1st Near-Term")


def fetch_yahoo_vix_future_vxind2():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_VXIND2_URL, "^VXIND2", "Yahoo Finance Cboe VX Futures 2nd Near-Term")


def fetch_yahoo_vix_future_vx1():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_VX1_URL, "^VX1", "Yahoo Finance VIX Futures 1st Contract")


def fetch_yahoo_vix_future_vx2():
    return fetch_yahoo_chart_close(YAHOO_VIX_FUTURE_VX2_URL, "^VX2", "Yahoo Finance VIX Futures 2nd Contract")


def fetch_yahoo_vix3m():
    return fetch_yahoo_chart_close(YAHOO_VIX3M_URL, "^VIX3M", "Yahoo Finance Cboe 3-Month Volatility Index")


def fetch_yahoo_vix6m():
    return fetch_yahoo_chart_close(YAHOO_VIX6M_URL, "^VIX6M", "Yahoo Finance Cboe 6-Month Volatility Index")


def fetch_vix_vxv_proxy_from_current_data(data, upstream_error=None):
    """Use the already-updated VIX value plus FRED VXVCLS as a robust fallback.

    This is not a direct VX1/VX2 futures curve. It is a volatility index term proxy:
    VIX spot (roughly 30-day implied vol) vs VXV/VIX3M (roughly 3-month implied vol).
    It is more reliable than Yahoo futures proxy symbols in GitHub Actions and is marked
    as proxy-auto-updated.
    """
    vix_item = find_indicator(data, "vix")
    current_vix = vix_item.get("currentValue")
    previous_vix = vix_item.get("previousValue")

    if not is_number(current_vix):
        # Fallback to FRED VIXCLS only if the current run did not produce a usable VIX value.
        fred_vix = fetch_fred_series_recent("VIXCLS", years_back=1)
        near_latest = fred_vix["latest"]
        near_previous = fred_vix["previous"]
        near_url = fred_vix.get("url")
    else:
        near_latest = {
            "date": str(vix_item.get("actualDate") or datetime.now(KST).date().isoformat())[:10],
            "value": round(float(current_vix), 4),
        }
        near_previous = {
            "date": str(vix_item.get("previousDate") or vix_item.get("actualDate") or near_latest["date"])[:10],
            "value": round(float(previous_vix), 4) if is_number(previous_vix) else round(float(current_vix), 4),
        }
        near_url = vix_item.get("sourceUrl", "data/latest.json:vix")

    second = fetch_fred_vxv()

    if upstream_error:
        print(f"[vix-term-proxy] direct futures proxies failed, using VIX/VXV fallback. upstream={upstream_error}", flush=True)

    return {
        "provider": "FRED VIX/VXV Volatility Term Proxy",
        "series": "VIXCLS/VXVCLS",
        "url": f"{near_url} | {second.get('url')}",
        "near": {
            "provider": "Existing VIX or FRED VIXCLS",
            "series": "VIXCLS",
            "url": near_url,
            "latest": near_latest,
            "previous": near_previous,
            "isProxy": True,
        },
        "second": second,
        "isVolatilityIndexProxy": True,
    }


def fetch_vix_term_proxy_with_fallback():
    """Fallback when direct VIX futures quote proxies are unavailable.

    This is not the same as VX1/VX2 futures. It uses the Cboe volatility index term curve
    (^VIX vs ^VIX3M, or ^VIX3M vs ^VIX6M) as a market stress proxy. It is kept as
    proxy-auto-updated and the interpretation explicitly states the limitation.
    """
    errors = []

    proxy_pairs = [
        ("FRED VIX/VXV Volatility Term Proxy", fetch_fred_vix, fetch_fred_vxv, "VIXCLS/VXVCLS"),
        ("Yahoo Finance VIX/VIX3M Volatility Term Proxy", fetch_yahoo_vix, fetch_yahoo_vix3m, "^VIX/^VIX3M"),
        ("Yahoo Finance VIX3M/VIX6M Volatility Term Proxy", fetch_yahoo_vix3m, fetch_yahoo_vix6m, "^VIX3M/^VIX6M"),
    ]

    for provider, near_fetcher, second_fetcher, series in proxy_pairs:
        try:
            near = near_fetcher()
            second = second_fetcher()
            return {
                "provider": provider,
                "series": series,
                "url": f"{near.get('url')} | {second.get('url')}",
                "near": near,
                "second": second,
                "isVolatilityIndexProxy": True,
            }
        except Exception as error:
            errors.append(f"{provider}: {error}")
            print(f"[vix-term-proxy-failed] {provider}: {error}", flush=True)

    raise RuntimeError("VIX volatility term proxy fallback 모두 실패: " + " | ".join(errors))


def fetch_vix_futures_pair_with_fallback():
    """Fetch front/second VIX futures proxies and calculate the curve.

    우선순위:
    1. Yahoo ^VW1VX/^VW2VX
    2. Yahoo ^VXIND1/^VXIND2
    3. Yahoo ^VFTW1/^VFTW2
    4. Yahoo ^VX1/^VX2
    5. 최후 수단: ^VIX/^VIX3M 또는 ^VIX3M/^VIX6M 변동성 만기구조 프록시

    직접 VX1/VX2 선물값이 막히는 경우가 있어 프록시를 여러 겹으로 둡니다.
    최후 수단은 선물 구조 그 자체가 아니므로 interpretation에 명확히 표시합니다.
    """
    providers = [
        ("Yahoo Finance Cboe VIX Futures Term Index", fetch_yahoo_vix_future_near_term, fetch_yahoo_vix_future_second_term, "^VW1VX/^VW2VX"),
        ("Yahoo Finance Cboe VX Futures Near-Term Index", fetch_yahoo_vix_future_vxind1, fetch_yahoo_vix_future_vxind2, "^VXIND1/^VXIND2"),
        ("Yahoo Finance Cboe VIX Futures Month Index", fetch_yahoo_vix_future_first_month, fetch_yahoo_vix_future_second_month, "^VFTW1/^VFTW2"),
        ("Yahoo Finance VIX Futures Contract Index", fetch_yahoo_vix_future_vx1, fetch_yahoo_vix_future_vx2, "^VX1/^VX2"),
    ]

    errors = []
    for provider, near_fetcher, second_fetcher, series in providers:
        try:
            near = near_fetcher()
            second = second_fetcher()
            return {
                "provider": provider,
                "series": series,
                "url": f"{near.get('url')} | {second.get('url')}",
                "near": near,
                "second": second,
                "isVolatilityIndexProxy": False,
            }
        except Exception as error:
            errors.append(f"{provider}: {error}")
            print(f"[vix-futures-failed] {provider}: {error}", flush=True)

    try:
        return fetch_vix_term_proxy_with_fallback()
    except Exception as proxy_error:
        errors.append(str(proxy_error))

    raise RuntimeError("VIX futures pair fallback 모두 실패: " + " | ".join(errors))

def fetch_stooq_vix():
    text = fetch_text(STOOQ_VIX_URL, retries=1, timeout=8)
    reader = csv.DictReader(StringIO(text))

    rows = []
    for row in reader:
        rows.append({
            "date": row.get("Date"),
            "value": row.get("Close"),
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "Stooq",
        "series": "^vix",
        "url": STOOQ_VIX_URL,
        "latest": latest,
        "previous": previous,
    }


def fetch_vix_with_fallback():
    providers = [
        ("FRED", fetch_fred_vix),
        ("Yahoo Finance", fetch_yahoo_vix),
        ("Stooq", fetch_stooq_vix),
    ]

    return fetch_with_fallback("vix", providers)


def month_candidates(months_back=4):
    now = datetime.now(KST)
    year = now.year
    month = now.month
    candidates = []

    for _ in range(months_back):
        candidates.append(f"{year}{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1

    return candidates


def local_name(tag):
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def parse_treasury_yield_curve_xml(text):
    root = ET.fromstring(text)
    rows = []

    for props in root.iter():
        if local_name(props.tag) != "properties":
            continue

        row = {}
        for child in list(props):
            key = local_name(child.tag)
            value = child.text
            if value is not None:
                row[key] = value.strip()

        date = row.get("NEW_DATE") or row.get("NEWDATE") or row.get("Date")
        if not date:
            continue

        parsed = {"date": date[:10]}
        # Nominal curve fields such as BC_2YEAR/BC_10YEAR and real-yield curve fields
        # such as TC_10YEAR are preserved. This makes the same XML parser work for
        # both Treasury feeds.
        for key, value in row.items():
            if key != "NEW_DATE" and key != "NEWDATE" and key != "Date":
                parsed[key] = value
        rows.append(parsed)

    return rows


def fetch_treasury_yield_curve(field_name):
    errors = []

    for month in month_candidates():
        url = treasury_yield_curve_url(month)
        try:
            text = fetch_text(url, retries=1, timeout=8)
            rows = parse_treasury_yield_curve_xml(text)
            latest, previous = latest_two_from_rows(rows, value_key=field_name)
            return {
                "provider": "U.S. Treasury XML Feed",
                "series": field_name,
                "url": url,
                "latest": latest,
                "previous": previous,
            }
        except Exception as error:
            message = f"Treasury {field_name} {month}: {error}"
            errors.append(message)
            print(f"[treasury] provider failed: {message}", flush=True)

    raise RuntimeError(" | ".join(errors))


def fetch_rate_with_fallback(rate_name, fred_series, treasury_field):
    providers = [
        ("FRED", lambda: fetch_fred_series(fred_series)),
        ("U.S. Treasury XML Feed", lambda: fetch_treasury_yield_curve(treasury_field)),
    ]

    return fetch_with_fallback(rate_name, providers)


def fetch_treasury_real_yield_curve(field_name="TC_10YEAR"):
    errors = []

    for month in month_candidates():
        url = treasury_real_yield_curve_url(month)
        try:
            text = fetch_text(url, retries=1, timeout=10)
            rows = parse_treasury_yield_curve_xml(text)
            latest, previous = latest_two_from_rows(rows, value_key=field_name)
            return {
                "provider": "U.S. Treasury Real Yield XML Feed",
                "series": field_name,
                "url": url,
                "latest": latest,
                "previous": previous,
                "isProxy": False,
            }
        except Exception as error:
            message = f"Treasury real yield {field_name} {month}: {error}"
            errors.append(message)
            print(f"[treasury-real] provider failed: {message}", flush=True)

    raise RuntimeError(" | ".join(errors))


def fetch_real_10y_yield_with_fallback():
    providers = [
        ("FRED recent DFII10", lambda: fetch_fred_series_recent("DFII10", years_back=2)),
        ("U.S. Treasury Real Yield XML Feed TC_10YEAR", lambda: fetch_treasury_real_yield_curve("TC_10YEAR")),
    ]
    return fetch_with_fallback("real_10y_yield", providers)


def parse_federal_reserve_h15_csv_for_fed_funds(text):
    rows = []
    reader = csv.reader(StringIO(text))
    header = None

    for raw_row in reader:
        row = [cell.strip() for cell in raw_row]
        if not any(row):
            continue

        first = row[0].lower() if row else ""
        if first in ("time period", "date") or first.startswith("time period"):
            header = row
            continue

        if header is None:
            continue

        date = row[0] if row else ""
        if not re.match(r"^\d{4}[-/]", date):
            continue

        value = None
        for idx, cell in enumerate(row[1:], start=1):
            if not cell or cell.upper() in ("ND", "NA", "."):
                continue
            label = header[idx] if idx < len(header) else ""
            try:
                numeric = float(cell)
            except ValueError:
                continue
            if "RIFSPFF" in label or "Federal funds effective" in label or value is None:
                value = numeric
                if "RIFSPFF" in label or "Federal funds effective" in label:
                    break

        if value is not None:
            rows.append({"date": date[:10], "value": value})

    latest, previous = latest_two_from_rows(rows)
    return latest, previous


def fetch_h15_fed_funds_weekly():
    text = fetch_text(FED_H15_FED_FUNDS_WEEKLY_URL, retries=1, timeout=12)
    latest, previous = parse_federal_reserve_h15_csv_for_fed_funds(text)
    return {
        "provider": "Federal Reserve H.15 Data Download",
        "series": "RIFSPFF_N.WW",
        "url": FED_H15_FED_FUNDS_WEEKLY_URL,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_fed_funds_with_fallback():
    providers = [
        ("FRED recent DFF", lambda: fetch_fred_series_recent("DFF", years_back=2)),
        ("FRED monthly FEDFUNDS", lambda: fetch_fred_series_recent("FEDFUNDS", years_back=5)),
        ("Federal Reserve H.15 weekly EFFR", fetch_h15_fed_funds_weekly),
    ]
    return fetch_with_fallback("fed_funds_rate", providers)


def fetch_with_fallback(label, providers):
    errors = []

    for provider_name, fetcher in providers:
        try:
            print(f"[{label}] trying provider: {provider_name}", flush=True)
            result = fetcher()
            print(f"[{label}] provider succeeded: {provider_name}", flush=True)
            return result
        except Exception as error:
            message = f"{provider_name}: {error}"
            errors.append(message)
            print(f"[{label}] provider failed: {message}", flush=True)

    raise RuntimeError(" | ".join(errors))


def percent_change(current, previous):
    if previous == 0:
        return 0

    return round((current - previous) / abs(previous) * 100, 2)


def direction_from_change(change):
    if change > 0:
        return "up"
    if change < 0:
        return "down"
    return "flat"


def vix_signal(value):
    if value >= 30:
        return "negative", -1

    if value >= 20:
        return "warning", 0

    if 10 < value < 20:
        return "positive", 1

    return "warning", 0


def vix_change_signal(change_percent):
    if change_percent >= 20:
        return "negative", -1

    if change_percent >= 8:
        return "warning", 0

    if change_percent <= -8:
        return "positive", 1

    return "neutral", 0


def rate_signal(value, change):
    if value >= 4.75 or change >= 0.15:
        return "negative", -1

    if value <= 4.0 or change <= -0.15:
        return "positive", 1

    return "neutral", 0


def initial_claims_signal(value, change):
    """신규 실업수당 청구건수 해석 기준.

    value는 FRED ICSA의 최신 청구건수입니다.
    change는 직전 관측치 대비 증감입니다.
    절대값과 변화 속도를 함께 봅니다.
    """
    if value >= 260000 or change >= 15000:
        return "negative", -1

    if value <= 230000 and change <= 5000:
        return "positive", 1

    return "neutral", 0

def unemployment_rate_signal(value, change):
    """실업률 해석 기준.

    실업률은 후행지표이므로 단일 수치보다 상승 속도를 더 경계합니다.
    value는 실업률 %, change는 전월 대비 %p 변화입니다.
    """
    if value >= 4.8 or change >= 0.3:
        return "negative", -1

    if value >= 4.4 or change >= 0.15:
        return "warning", 0

    if value <= 4.0 and change <= 0:
        return "positive", 1

    return "neutral", 0



def dollar_index_signal(value, change_percent):
    """달러 지수 해석 기준.

    DTWEXBGS와 DXY 선물 프록시는 절대 레벨이 다르므로,
    자동 점수는 절대값보다 단기 변화율을 중심으로 판단합니다.
    달러 급등은 위험자산과 원자재에 부담으로 봅니다.
    """
    if change_percent >= 1.0:
        return "negative", -1

    if change_percent <= -1.0:
        return "positive", 1

    return "neutral", 0


def wti_oil_signal(value, change_percent):
    """WTI 원유 해석 기준.

    유가 급등은 인플레이션 압력과 금리 부담으로 연결될 수 있습니다.
    반대로 과도한 급락은 경기 둔화 신호일 수 있으므로 단순 긍정으로 보지 않습니다.
    """
    if value >= 90 or change_percent >= 5.0:
        return "negative", -1

    if value <= 55 or change_percent <= -7.0:
        return "warning", 0

    if 60 <= value <= 85 and abs(change_percent) < 5.0:
        return "neutral", 0

    return "neutral", 0


def copper_price_signal(value, change_percent):
    """구리 가격 해석 기준.

    구리는 제조업·건설 수요와 경기 회복 기대를 반영하는 선행성 원자재입니다.
    FRED PCOPPUSDM은 월간 USD/metric ton 계열이고, Yahoo/Stooq는 구리 선물 프록시이므로
    자동 점수는 절대값보다 최근 변화율을 우선합니다.
    """
    # 급격한 하락은 제조업/건설 수요 둔화 신호로 봅니다.
    if change_percent <= -3.0:
        return "negative", -1

    # 완만한 상승은 경기 회복 기대와 소재/산업재 상대강도에 우호적입니다.
    if change_percent >= 3.0:
        return "positive", 1

    # 프록시가 달러/파운드 단위일 때의 보조 절대 레벨입니다.
    if value < 100:
        if value >= 4.5:
            return "positive", 1
        if value <= 3.5:
            return "negative", -1

    return "neutral", 0

def axis_status_from_score(score):
    if score > 0:
        return "positive"
    if score < 0:
        return "negative"
    return "neutral"


def is_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def mark_source_error(item, today, error_message):
    """Mark source failure without deleting a previously valid value.

    자동 업데이트 대시보드에서 가장 위험한 동작은 일시적 네트워크 실패 때문에
    직전 정상 숫자를 source-error 문자열로 덮어쓰는 것입니다.
    이미 숫자가 있으면 숫자는 보존하고, statusNote만 source-error로 바꿉니다.
    숫자가 없을 때만 currentValue를 source-error로 표시합니다.
    """
    previous_current = item.get("currentValue")
    previous_date = item.get("actualDate")

    if is_number(previous_current):
        item.update({
            "sourceErrorAt": today,
            "sourceErrorMessage": str(error_message)[:500],
            "interpretation": f"최신 데이터 호출에 실패했습니다. 직전 정상값 {previous_current}을 유지합니다. 직전 기준일: {previous_date or '확인 필요'}. 오류: {error_message}",
            "marketReaction": "일시적 데이터 소스 오류일 수 있으므로, 숫자는 참고하되 최신성은 낮게 봅니다.",
            "action": "다음 자동 업데이트에서 복구되는지 확인하고, 필요한 경우 원천 데이터를 직접 확인합니다.",
            "statusNote": "source-error",
        })
        return

    item.update({
        "currentValue": "source-error",
        "previousValue": "source-error",
        "actualDate": today,
        "direction": "not-available",
        "change": "source-error",
        "changePercent": "source-error",
        "signal": "source-error",
        "score": 0,
        "interpretation": f"데이터 소스 호출에 실패했습니다. 오류: {error_message}",
        "marketReaction": "데이터 확인이 불가능하므로 시장 반응 해석을 보류합니다.",
        "action": "GitHub Actions 로그와 데이터 소스 상태를 확인합니다.",
        "statusNote": "source-error",
    })


def update_indicator_success(item, result, signal, score, interpretation, market_reaction, action, status_note="auto-updated"):
    latest = result["latest"]
    previous = result["previous"]
    current_value = latest["value"]
    previous_value = previous["value"]
    change = round(current_value - previous_value, 4)
    change_percent = percent_change(current_value, previous_value)
    direction = direction_from_change(change)

    item.update({
        "source": result["provider"],
        "sourceSeries": result["series"],
        "sourceUrl": result["url"],
        "currentValue": current_value,
        "previousValue": previous_value,
        "actualDate": latest["date"],
        "direction": direction,
        "change": change,
        "changePercent": change_percent,
        "signal": signal,
        "score": score,
        "interpretation": interpretation,
        "marketReaction": market_reaction,
        "action": action,
        "statusNote": status_note,
    })

    return {
        "currentValue": current_value,
        "previousValue": previous_value,
        "change": change,
        "changePercent": change_percent,
        "direction": direction,
        "actualDate": latest["date"],
        "provider": result["provider"],
    }


def update_vix(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    vix = find_indicator(data, "vix")
    vix_change = find_indicator(data, "vix_change_rate")

    try:
        result = fetch_vix_with_fallback()

        latest = result["latest"]
        previous = result["previous"]

        current_value = latest["value"]
        previous_value = previous["value"]
        change = round(current_value - previous_value, 4)
        change_percent = percent_change(current_value, previous_value)
        direction = direction_from_change(change)

        signal, score = vix_signal(current_value)
        change_signal, change_score = vix_change_signal(change_percent)

        provider = result["provider"]
        source_series = result["series"]
        source_url = result["url"]

        vix.update({
            "source": provider,
            "sourceSeries": source_series,
            "sourceUrl": source_url,
            "currentValue": current_value,
            "previousValue": previous_value,
            "unit": "index",
            "actualDate": latest["date"],
            "direction": direction,
            "change": change,
            "changePercent": change_percent,
            "signal": signal,
            "score": score,
            "interpretation": f"VIX 최신값은 {current_value}입니다. 데이터 출처는 {provider}입니다. 10~20은 정상 위험선호, 20 이상은 긴장 상승, 30 이상은 공포 구간으로 봅니다.",
            "marketReaction": "VIX가 낮고 안정적이면 위험자산에는 우호적입니다. VIX가 빠르게 상승하면 단기 조정 또는 공포 확산을 경계해야 합니다.",
            "action": "VIX만으로 매수·매도하지 말고 금리, 자금 흐름, 실적 축과 함께 확인합니다.",
            "statusNote": "auto-updated",
        })

        vix_change.update({
            "source": f"Derived from {provider}",
            "sourceSeries": f"{source_series}-change",
            "sourceUrl": source_url,
            "currentValue": change_percent,
            "previousValue": 0,
            "unit": "%",
            "actualDate": latest["date"],
            "direction": direction,
            "change": change_percent,
            "changePercent": change_percent,
            "signal": change_signal,
            "score": change_score,
            "interpretation": f"VIX 변화율은 {change_percent}%입니다. 급등은 공포 확산, 급락은 공포 해소 신호로 봅니다.",
            "marketReaction": "VIX 변화율이 급등하면 단기 변동성 확대 가능성이 커지고, 급락하면 공포 해소와 위험선호 회복 가능성이 있습니다.",
            "action": "변동성 급등 구간에서는 포지션 크기를 줄이고, 급락 구간에서는 다른 축의 회복 여부를 확인합니다.",
            "statusNote": "auto-updated",
        })

        update_volatility_summary(data, signal, change_signal, current_value, change_percent, latest["date"], provider)
        print(f"[update] VIX auto-updated from {provider}", flush=True)

    except Exception as error:
        error_message = str(error)

        mark_source_error(vix, today, error_message)
        mark_source_error(vix_change, today, error_message)

        update_volatility_source_error(data, error_message)
        print("[update] VIX source-error", flush=True)



def vix_term_structure_signal(spread_percent, vix_spot=None, vx1=None, vx2=None):
    """Return signal/score/label for VIX futures term structure.

    spread_percent = (VX2 - VX1) / VX1 * 100
    VX2 > VX1 이면 콘탱고, VX2 < VX1 이면 백워데이션입니다.
    """
    if not is_number(spread_percent):
        return "source-error", 0, "확인 불가"

    if spread_percent <= -5:
        return "negative", -2, "깊은 백워데이션"
    if spread_percent < -1:
        return "negative", -1, "백워데이션"
    if spread_percent <= 1:
        return "neutral", 0, "평탄"
    if spread_percent <= 8:
        return "positive", 1, "콘탱고"

    # 매우 가파른 콘탱고는 정상 위험선호이지만 방심/과열 가능성도 있으므로 점수는 중립에 둡니다.
    return "warning", 0, "강한 콘탱고"


def update_vix_futures_structure(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "vix_futures_structure")

    try:
        try:
            result = fetch_vix_futures_pair_with_fallback()
        except Exception as direct_error:
            # Direct VIX futures proxy symbols are unstable in GitHub Actions.
            # Use an already updated VIX value plus FRED VXVCLS as the final robust proxy.
            result = fetch_vix_vxv_proxy_from_current_data(data, direct_error)

        near_latest = result["near"]["latest"]
        near_previous = result["near"]["previous"]
        second_latest = result["second"]["latest"]
        second_previous = result["second"]["previous"]

        vx1 = near_latest["value"]
        vx2 = second_latest["value"]
        prev_vx1 = near_previous["value"]
        prev_vx2 = second_previous["value"]

        if not vx1:
            raise ValueError("VX1/near-term proxy 값이 0 또는 비어 있습니다.")

        spread_percent = round(((vx2 - vx1) / vx1) * 100, 4)
        previous_spread = round(((prev_vx2 - prev_vx1) / prev_vx1) * 100, 4) if prev_vx1 else 0
        change = round(spread_percent - previous_spread, 4)
        direction = direction_from_change(change)

        vix_spot = None
        try:
            spot_item = find_indicator(data, "vix")
            if is_number(spot_item.get("currentValue")):
                vix_spot = spot_item.get("currentValue")
        except Exception:
            vix_spot = None

        signal, score, structure_label = vix_term_structure_signal(spread_percent, vix_spot, vx1, vx2)
        is_vol_proxy = bool(result.get("isVolatilityIndexProxy"))

        if is_vol_proxy:
            source_series_suffix = "volatility-index-term-proxy-spread"
            term_name = "변동성 만기구조 프록시"
            method_note = "직접 VIX 선물값이 아니라 Cboe VIX 계열 변동성 지수의 만기구조 프록시입니다."
            near_label = result["series"].split("/")[0]
            second_label = result["series"].split("/")[1] if "/" in result["series"] else "second-term proxy"
        else:
            source_series_suffix = "vix-futures-term-structure-spread"
            term_name = "VIX 선물 구조"
            method_note = "근월물과 차근월물 성격의 VIX futures proxy를 이용한 구조입니다."
            near_label = "VX1"
            second_label = "VX2"

        spot_note = ""
        if is_number(vix_spot):
            spot_note = f" VIX 현물은 {vix_spot:.2f}, {near_label}은 {vx1:.2f}, {second_label}는 {vx2:.2f}입니다."

        item.update({
            "source": result["provider"],
            "sourceSeries": f"{result['series']}-{source_series_suffix}",
            "sourceUrl": result["url"],
            "currentValue": spread_percent,
            "previousValue": previous_spread,
            "unit": "%",
            "actualDate": near_latest.get("date") or today,
            "direction": direction,
            "change": change,
            "changePercent": change,
            "signal": signal,
            "score": score,
            "termStructure": structure_label,
            "termStructureMethod": term_name,
            "vx1": vx1,
            "vx2": vx2,
            "vx1Label": near_label,
            "vx2Label": second_label,
            "vixSpot": vix_spot if is_number(vix_spot) else "not-available",
            "interpretation": f"{term_name}는 {structure_label}입니다. 계산식은 ({second_label} - {near_label}) / {near_label} × 100이며 현재 스프레드는 {spread_percent:.2f}%입니다. {method_note}{spot_note} 콘탱고는 정상 시장 구조, 백워데이션은 단기 공포와 헤지 수요 급증으로 해석합니다.",
            "marketReaction": f"{second_label}가 {near_label}보다 높으면 콘탱고로 위험선호가 유지되는 정상 구조에 가깝고, {near_label}이 {second_label}보다 높아지면 단기 변동성 수요가 급해진 것으로 봅니다.",
            "action": "백워데이션이면 신규 매수보다 리스크 관리와 현금 비중을 우선하고, 깊은 백워데이션에서 VIX 급등 후 둔화가 나오면 단기 바닥 후보로 관찰합니다. 콘탱고에서는 VIX 현물과 자금흐름 축을 함께 확인합니다.",
            "statusNote": "proxy-auto-updated",
        })
        print(f"[update] VIX futures/term structure {structure_label} {spread_percent}% via {result['provider']}", flush=True)
        update_volatility_summary_with_futures(data)
        return {"id": "vix_futures_structure", "signal": signal, "score": score, "value": spread_percent, "statusNote": "proxy-auto-updated"}

    except Exception as error:
        mark_source_error(item, today, str(error))
        print(f"[update] VIX futures structure source-error: {error}", flush=True)
        update_volatility_summary_with_futures(data)
        return {"id": "vix_futures_structure", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}

def update_volatility_summary_with_futures(data):
    try:
        vix = find_indicator(data, "vix")
        vix_change = find_indicator(data, "vix_change_rate")
        futures = find_indicator(data, "vix_futures_structure")
    except Exception as error:
        print(f"[volatility-summary] skipped: {error}", flush=True)
        return

    ids = ["vix", "vix_change_rate", "vix_futures_structure"]
    score = 0
    for indicator_id in ids:
        item = find_indicator(data, indicator_id)
        if item.get("signal") in ("source-error", "manual-required"):
            continue
        if is_number(item.get("score")):
            score += item.get("score")

    axis_status = axis_status_from_score(score)
    futures_label = futures.get("termStructure", "확인 필요")
    futures_value = futures.get("currentValue")
    futures_text = f"{futures_label} {futures_value}%" if is_number(futures_value) else str(futures_value)

    data.setdefault("axisSummary", {})
    if "volatility" in data["axisSummary"]:
        data["axisSummary"]["volatility"].update({
            "status": axis_status,
            "score": score,
            "leadingStatus": futures.get("signal", "neutral"),
            "coincidentStatus": vix.get("signal", "neutral"),
            "laggingStatus": "not-applicable",
            "summary": f"VIX {vix.get('currentValue')}, 변화율 {vix_change.get('currentValue')}%, VIX 선물 구조 {futures_text}입니다.",
            "interpretation": "변동성 축은 VIX 현물, VIX 변화율, VIX 선물 콘탱고/백워데이션을 함께 봅니다. 현물은 공포 수준, 변화율은 공포 확산 속도, 선물 구조는 헤지 수요의 긴급도를 보여줍니다.",
            "action": "VIX가 낮아도 선물 구조가 백워데이션으로 전환되면 단기 위험을 경계하고, VIX 급등 후 백워데이션 완화가 나타나면 공포 해소 여부를 확인합니다.",
        })

    data.setdefault("matrix", {})
    if "volatility" in data["matrix"]:
        data["matrix"]["volatility"].update({
            "leading": futures.get("signal", "neutral"),
            "coincident": vix.get("signal", "neutral"),
            "lagging": "not-applicable",
        })


def update_rates(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    updates = []

    rate_configs = [
        {
            "label": "us_2y_yield",
            "indicator_id": "us_2y_yield",
            "name": "미국 2년물 국채금리",
            "fred_series": "DGS2",
            "treasury_field": "BC_2YEAR",
        },
        {
            "label": "us_10y_yield",
            "indicator_id": "us_10y_yield",
            "name": "미국 10년물 국채금리",
            "fred_series": "DGS10",
            "treasury_field": "BC_10YEAR",
        },
    ]

    for config in rate_configs:
        item = find_indicator(data, config["indicator_id"])

        try:
            result = fetch_rate_with_fallback(
                config["label"],
                config["fred_series"],
                config["treasury_field"],
            )

            current_value = result["latest"]["value"]
            previous_value = result["previous"]["value"]
            change = round(current_value - previous_value, 4)
            signal, score = rate_signal(current_value, change)

            interpretation = f"{config['name']} 최신값은 {current_value}%입니다. 데이터 출처는 {result['provider']}입니다. 금리 변화는 이유를 함께 해석해야 합니다."
            market_reaction = "금리 상승은 성장주와 고PER 종목의 멀티플에 부담입니다. 금리 하락은 인플레 안정에 의한 하락인지 경기 둔화 우려인지 구분해야 합니다."
            action = "금리 축이 악화될 때는 성장주 추격 매수를 제한하고, 금리 안정 확인 후 분할 접근합니다."

            info = update_indicator_success(
                item,
                result,
                signal,
                score,
                interpretation,
                market_reaction,
                action,
            )
            updates.append({
                "id": config["indicator_id"],
                "signal": signal,
                "score": score,
                "value": info["currentValue"],
                "change": info["change"],
                "date": info["actualDate"],
                "provider": info["provider"],
            })
            print(f"[update] {config['indicator_id']} auto-updated", flush=True)

        except Exception as error:
            error_message = str(error)
            mark_source_error(item, today, error_message)
            updates.append({
                "id": config["indicator_id"],
                "signal": "source-error",
                "score": 0,
                "value": "source-error",
                "change": "source-error",
                "date": today,
                "provider": "source-error",
            })
            print(f"[update] {config['indicator_id']} source-error", flush=True)

    update_rates_summary(data, updates)


def update_rates_summary(data, updates):
    score = sum(item["score"] for item in updates)
    status = axis_status_from_score(score)

    leading_statuses = [item["signal"] for item in updates if item["signal"] != "source-error"]

    if any(item["signal"] == "source-error" for item in updates):
        leading_status = "source-error" if not leading_statuses else status
    else:
        leading_status = status

    details = []
    for item in updates:
        details.append(f"{item['id']}: {item['value']}")

    summary_text = " / ".join(details)

    data.setdefault("axisSummary", {})
    if "rates" in data["axisSummary"]:
        data["axisSummary"]["rates"].update({
            "status": status,
            "score": score,
            "leadingStatus": leading_status,
            "coincidentStatus": "warning",
            "laggingStatus": "not-applicable",
            "summary": f"2년물과 10년물 자동 업데이트 결과: {summary_text}",
            "interpretation": "금리 축은 돈의 가격입니다. 방향보다 금리 변화의 이유를 우선 확인해야 합니다.",
            "action": "금리 급등 구간에서는 성장주 추격 매수를 제한하고, 금리 안정 시 분할 접근합니다.",
        })

    data.setdefault("matrix", {})
    if "rates" in data["matrix"]:
        data["matrix"]["rates"].update({
            "leading": leading_status,
            "coincident": "warning",
            "lagging": "not-applicable",
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX + 금리 자동 업데이트 2단계",
        "riskMode": "balanced",
        "summary": "VIX와 2년물·10년물 금리 자동 업데이트가 실행되었습니다. 아직 전체 8축 판단은 부분 자동화 상태입니다.",
        "conflictSummary": "현재는 변동성과 금리 축만 자동화된 상태이므로, 실적·자금흐름·고용·소비 축과의 연결 판단은 다음 단계에서 확장합니다.",
        "watchAxes": ["rates", "flows", "volatility"],
    })


def parse_number(value):
    if value is None:
        raise ValueError("값이 없습니다.")

    text_value = str(value).strip().replace(",", "")
    if text_value == "" or text_value == ".":
        raise ValueError("비어 있는 숫자 값입니다.")

    return float(text_value)


def parse_dol_date(value):
    raw = str(value).strip()
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y"):
        try:
            return datetime.strptime(raw, fmt).date().isoformat()
        except ValueError:
            continue

    return raw[:10]


def fetch_dol_ar539_initial_claims_proxy():
    """DOL ETA 539 raw CSV fallback.

    This is not the same as FRED ICSA. FRED ICSA is seasonally adjusted.
    The DOL AR539 file is used here only as a proxy fallback so the dashboard
    can show a current directional number when FRED is unavailable.
    """
    text = fetch_text(DOL_AR539_CSV_URL, retries=2, timeout=12)
    reader = csv.DictReader(StringIO(text))

    weekly_totals = {}

    for row in reader:
        lower = {str(key).strip().lower(): value for key, value in row.items() if key is not None}

        date_raw = lower.get("c2")
        if not date_raw:
            continue

        try:
            regular_initial = parse_number(lower.get("c3", 0))
        except Exception:
            regular_initial = 0

        try:
            federal_initial = parse_number(lower.get("c4", 0))
        except Exception:
            federal_initial = 0

        total = regular_initial + federal_initial
        if total <= 0:
            continue

        date = parse_dol_date(date_raw)
        weekly_totals[date] = weekly_totals.get(date, 0) + total

    rows = [
        {"date": date, "value": value}
        for date, value in weekly_totals.items()
    ]

    latest, previous = latest_two_from_rows(rows)
    latest["value"] = round(latest["value"])
    previous["value"] = round(previous["value"])

    return {
        "provider": "DOL ETA 539 Raw CSV",
        "series": "AR539-C3+C4-proxy",
        "url": DOL_AR539_CSV_URL,
        "latest": latest,
        "previous": previous,
        "isProxy": True,
    }


def fetch_initial_claims_with_fallback():
    providers = [
        ("FRED recent ICSA", lambda: fetch_fred_series_recent("ICSA", years_back=2)),
        ("DOL ETA 539 Raw CSV proxy", fetch_dol_ar539_initial_claims_proxy),
    ]

    return fetch_with_fallback("initial_claims", providers)


def fetch_bls_unemployment_rate():
    """BLS public API fallback for the unemployment rate.

    FRED UNRATE is also sourced from BLS. This direct BLS fallback uses
    LNS14000000, the seasonally adjusted civilian unemployment rate.
    """
    now = datetime.now(KST)
    payload = json.dumps({
        "seriesid": [BLS_UNRATE_SERIES_ID],
        "startyear": str(now.year - 3),
        "endyear": str(now.year),
    }).encode("utf-8")

    request = urllib.request.Request(
        BLS_PUBLIC_API_URL,
        data=payload,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Accept": "application/json,*/*",
        },
        method="POST",
    )

    print(f"[fetch] BLS unemployment API: {BLS_PUBLIC_API_URL}", flush=True)
    with urllib.request.urlopen(request, timeout=12) as response:
        payload_text = response.read().decode("utf-8")

    payload_json = json.loads(payload_text)
    status = payload_json.get("status")
    if status not in ("REQUEST_SUCCEEDED", "REQUEST_SUCCEEDED_WITH_ERRORS"):
        raise ValueError(f"BLS API status가 정상 범위가 아닙니다: {status}")

    series_list = payload_json.get("Results", {}).get("series", [])
    if not series_list:
        raise ValueError("BLS API 응답에 Results.series가 없습니다.")

    data_points = series_list[0].get("data", [])
    rows = []

    for point in data_points:
        year = point.get("year")
        period = point.get("period")
        value = point.get("value")

        if not year or not period or not period.startswith("M") or period == "M13":
            continue

        month = int(period[1:])
        date = f"{int(year):04d}-{month:02d}-01"
        rows.append({
            "date": date,
            "value": value,
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "BLS Public Data API",
        "series": BLS_UNRATE_SERIES_ID,
        "url": BLS_PUBLIC_API_URL,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_bls_unemployment_rate_get():
    now = datetime.now(KST)
    start_year = now.year - 3
    end_year = now.year
    url = f"{BLS_PUBLIC_API_URL}{BLS_UNRATE_SERIES_ID}?startyear={start_year}&endyear={end_year}"
    text = fetch_text(url, retries=1, timeout=10)
    payload_json = json.loads(text)

    status = payload_json.get("status")
    if status not in ("REQUEST_SUCCEEDED", "REQUEST_SUCCEEDED_WITH_ERRORS"):
        raise ValueError(f"BLS GET API status가 정상 범위가 아닙니다: {status}")

    series_list = payload_json.get("Results", {}).get("series", [])
    if not series_list:
        raise ValueError("BLS GET API 응답에 Results.series가 없습니다.")

    rows = []
    for point in series_list[0].get("data", []):
        year = point.get("year")
        period = point.get("period")
        value = point.get("value")

        if not year or not period or not period.startswith("M") or period == "M13":
            continue

        month = int(period[1:])
        date = f"{int(year):04d}-{month:02d}-01"
        rows.append({
            "date": date,
            "value": value,
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "BLS Public Data API GET",
        "series": BLS_UNRATE_SERIES_ID,
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_unemployment_rate_with_fallback():
    providers = [
        ("FRED recent UNRATE", lambda: fetch_fred_series_recent("UNRATE", years_back=5)),
        ("BLS Public Data API POST LNS14000000", fetch_bls_unemployment_rate),
        ("BLS Public Data API GET LNS14000000", fetch_bls_unemployment_rate_get),
    ]

    return fetch_with_fallback("unemployment_rate", providers)



def fetch_stooq_daily_close(url, series_name, label):
    text = fetch_text(url, retries=1, timeout=8)
    reader = csv.DictReader(StringIO(text))

    rows = []
    for row in reader:
        rows.append({
            "date": row.get("Date"),
            "value": row.get("Close"),
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": label,
        "series": series_name,
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": True,
    }


def fetch_dollar_index_with_fallback():
    providers = [
        ("FRED recent DTWEXBGS", lambda: fetch_fred_series_recent("DTWEXBGS", years_back=2)),
        ("Yahoo Finance Dollar Index DX-Y.NYB proxy", fetch_yahoo_dollar_index),
        ("Yahoo Finance Dollar Index ^DXY proxy", fetch_yahoo_dollar_index_alt),
        ("Stooq Dollar Index Futures proxy", lambda: fetch_stooq_daily_close(
            STOOQ_DOLLAR_INDEX_URL,
            "dx.f-proxy",
            "Stooq Dollar Index Futures Proxy",
        )),
    ]

    return fetch_with_fallback("dollar_index_proxy", providers)


def fetch_wti_oil_with_fallback():
    providers = [
        ("FRED recent DCOILWTICO", lambda: fetch_fred_series_recent("DCOILWTICO", years_back=2)),
        ("Yahoo Finance WTI CL=F proxy", fetch_yahoo_wti_oil),
        ("Stooq WTI Futures proxy", lambda: fetch_stooq_daily_close(
            STOOQ_WTI_URL,
            "cl.f-proxy",
            "Stooq WTI Futures Proxy",
        )),
    ]

    return fetch_with_fallback("wti_oil", providers)


def fetch_copper_price_with_fallback():
    providers = [
        ("FRED recent PCOPPUSDM", lambda: fetch_fred_series_recent("PCOPPUSDM", years_back=5)),
        ("Yahoo Finance Copper HG=F proxy", fetch_yahoo_copper_price),
        ("Stooq Copper Futures proxy", lambda: fetch_stooq_daily_close(
            STOOQ_COPPER_URL,
            "hg.f-proxy",
            "Stooq Copper Futures Proxy",
        )),
    ]

    return fetch_with_fallback("copper_price", providers)

def update_initial_claims(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    item = find_indicator(data, "initial_claims")

    try:
        result = fetch_initial_claims_with_fallback()

        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change = round(current_value - previous_value, 4)

        is_proxy = bool(result.get("isProxy"))
        if is_proxy:
            signal, score = "neutral", 0
            status_note = "proxy-auto-updated"
            interpretation = f"신규 실업수당 청구건수는 {current_value:,.0f}건입니다. 데이터 출처는 {result['provider']}입니다. 이 값은 FRED ICSA가 실패했을 때 쓰는 DOL 원자료 기반 프록시이므로, 계절조정 ICSA와 완전히 동일하지 않습니다."
            market_reaction = "프록시 값은 고용 냉각 여부를 임시로 확인하기 위한 참고값입니다. 시장 판단에서는 다음 실행에서 FRED ICSA가 복구되는지 함께 확인해야 합니다."
            action = "프록시 값만으로 포지션을 크게 바꾸지 말고, 실업률·NFP·임금 상승률과 함께 확인합니다."
        else:
            signal, score = initial_claims_signal(current_value, change)
            status_note = "auto-updated"
            interpretation = f"신규 실업수당 청구건수 최신값은 {current_value:,.0f}건입니다. 데이터 출처는 {result['provider']}입니다. 절대 수준과 전주 대비 증가 속도를 함께 봅니다."
            market_reaction = "청구건수가 빠르게 늘면 고용 냉각과 경기 둔화 가능성이 커집니다. 낮고 안정적인 청구건수는 소비와 기업 매출 체력에는 우호적입니다."
            action = "청구건수가 악화되면 경기민감주와 고레버리지 성장주의 비중 확대를 늦추고, 실업률·NFP·임금 상승률과 함께 확인합니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )

        print("[update] initial_claims auto-updated", flush=True)
        return {
            "id": "initial_claims",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "change": info["change"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] initial_claims source-error", flush=True)
        return {
            "id": "initial_claims",
            "signal": "source-error",
            "score": 0,
            "value": "source-error",
            "change": "source-error",
            "date": today,
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_unemployment_rate(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    item = find_indicator(data, "unemployment_rate")

    try:
        result = fetch_unemployment_rate_with_fallback()

        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change = round(current_value - previous_value, 4)
        signal, score = unemployment_rate_signal(current_value, change)

        interpretation = f"실업률 최신값은 {current_value:.1f}%입니다. 데이터 출처는 {result['provider']}입니다. 실업률은 후행성이 강하므로 신규 실업수당, NFP, 임금상승률과 함께 확인해야 합니다."
        market_reaction = "실업률이 빠르게 상승하면 경기 둔화가 사후적으로 확인되는 구간일 수 있습니다. 반대로 낮고 안정적인 실업률은 소비 체력에는 우호적이지만, 금리 인하 기대를 약화시킬 수도 있습니다."
        action = "실업률이 상승 추세로 전환되면 경기민감주와 고레버리지 성장주의 비중 확대를 늦추고, 방어주·현금 비중 점검을 강화합니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note="auto-updated",
        )

        print("[update] unemployment_rate auto-updated", flush=True)
        return {
            "id": "unemployment_rate",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "change": info["change"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": "auto-updated",
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] unemployment_rate source-error", flush=True)
        return {
            "id": "unemployment_rate",
            "signal": "source-error",
            "score": 0,
            "value": "source-error",
            "change": "source-error",
            "date": today,
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_employment(data):
    updates = [
        update_initial_claims(data),
        update_unemployment_rate(data),
    ]
    update_employment_summary(data, updates)


def format_claims_value(value):
    if isinstance(value, (int, float)):
        return f"{value:,.0f}건"
    return str(value)


def format_rate_value(value):
    if isinstance(value, (int, float)):
        return f"{value:.1f}%"
    return str(value)


def format_claims_change(value):
    if isinstance(value, (int, float)):
        return f"{value:+,.0f}건"
    return str(value)


def format_rate_change(value):
    if isinstance(value, (int, float)):
        return f"{value:+.1f}%p"
    return str(value)


def update_employment_summary(data, updates):
    by_id = {item["id"]: item for item in updates}
    initial = by_id.get("initial_claims", {})
    unemployment = by_id.get("unemployment_rate", {})

    score = sum(item.get("score", 0) for item in updates)
    all_source_error = all(item.get("signal") == "source-error" for item in updates)

    if all_source_error:
        status = "source-error"
    else:
        status = axis_status_from_score(score)

    initial_signal = initial.get("signal", "source-error")
    unemployment_signal = unemployment.get("signal", "source-error")

    initial_value_text = format_claims_value(initial.get("value"))
    initial_change_text = format_claims_change(initial.get("change"))
    unemployment_value_text = format_rate_value(unemployment.get("value"))
    unemployment_change_text = format_rate_change(unemployment.get("change"))

    data.setdefault("axisSummary", {})
    if "employment" in data["axisSummary"]:
        data["axisSummary"]["employment"].update({
            "status": status,
            "score": score,
            "leadingStatus": initial_signal,
            "coincidentStatus": "warning",
            "laggingStatus": unemployment_signal,
            "summary": f"신규 실업수당은 {initial_value_text}, 실업률은 {unemployment_value_text}입니다.",
            "interpretation": "고용 축에서는 신규 실업수당이 먼저 흔들리고, 실업률은 뒤늦게 경기 둔화를 확인합니다. 두 지표가 동시에 악화되면 고용 축의 부정 신호가 강화됩니다.",
            "action": "신규 실업수당 상승과 실업률 상승이 함께 나타나면 경기민감주와 고레버리지 성장주의 비중 확대를 늦추고, 현금·방어주 비중을 점검합니다.",
        })

    data.setdefault("matrix", {})
    if "employment" in data["matrix"]:
        data["matrix"]["employment"].update({
            "leading": initial_signal,
            "coincident": "warning",
            "lagging": unemployment_signal,
        })

    data.setdefault("timingSummary", {})
    if "leading" in data["timingSummary"]:
        data["timingSummary"]["leading"].update({
            "status": initial_signal,
            "summary": f"신규 실업수당은 {initial_value_text}, 전주 대비 {initial_change_text}입니다. 고용 냉각의 초기 신호를 확인합니다.",
        })

    if "lagging" in data["timingSummary"]:
        data["timingSummary"]["lagging"].update({
            "status": unemployment_signal,
            "summary": f"실업률은 {unemployment_value_text}, 전월 대비 {unemployment_change_text}입니다. 고용 둔화가 사후적으로 확인되는지 봅니다.",
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX + 금리 + 고용 자동 업데이트 4단계",
        "riskMode": "balanced",
        "summary": "VIX, 2년물·10년물 금리, 신규 실업수당 청구건수, 실업률 자동 업데이트가 실행되었습니다. 아직 전체 8축 판단은 부분 자동화 상태입니다.",
        "conflictSummary": "현재는 변동성·금리·고용 선행/후행 신호가 자동화된 상태입니다. 실적·자금흐름·소비·마진·달러/원자재 축과의 연결 판단은 다음 단계에서 확장합니다.",
        "watchAxes": ["rates", "employment", "flows", "volatility"],
    })



def update_dollar_index(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    item = find_indicator(data, "dollar_index_proxy")

    try:
        result = fetch_dollar_index_with_fallback()

        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change_percent = percent_change(current_value, previous_value)
        signal, score = dollar_index_signal(current_value, change_percent)

        is_proxy = bool(result.get("isProxy"))
        status_note = "proxy-auto-updated" if is_proxy else "auto-updated"

        if is_proxy:
            interpretation = f"달러 지수 프록시 최신값은 {current_value:.2f}입니다. 데이터 출처는 {result['provider']}입니다. 이 값은 FRED DTWEXBGS 실패 시 쓰는 달러 인덱스 선물 기반 프록시이므로, 미국 광의 달러지수와 완전히 동일하지 않습니다."
            market_reaction = "달러 프록시가 빠르게 상승하면 글로벌 유동성 긴축, 원자재와 위험자산 부담을 경계합니다. 프록시 값은 방향 확인용으로 제한적으로 사용합니다."
            action = "프록시 값만으로 비중을 크게 바꾸지 말고, 금리·원자재·VIX와 함께 확인합니다."
        else:
            interpretation = f"미국 광의 달러지수 최신값은 {current_value:.2f}입니다. 데이터 출처는 {result['provider']}입니다. 절대값보다 최근 변화율과 금리 방향을 함께 봅니다."
            market_reaction = "달러가 빠르게 강해지면 글로벌 유동성과 원자재, 미국 외 매출 비중이 큰 기업에 부담이 될 수 있습니다. 달러 약세는 원자재와 다국적 기업에는 우호적일 수 있습니다."
            action = "달러 강세가 금리 상승·VIX 상승과 동시에 나타나면 위험자산 추격 매수를 제한합니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )

        item["unit"] = "index"

        print("[update] dollar_index_proxy auto-updated", flush=True)
        return {
            "id": "dollar_index_proxy",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "change": info["change"],
            "changePercent": info["changePercent"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] dollar_index_proxy source-error", flush=True)
        return {
            "id": "dollar_index_proxy",
            "signal": "source-error",
            "score": 0,
            "value": "source-error",
            "change": "source-error",
            "changePercent": "source-error",
            "date": today,
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_wti_oil(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    item = find_indicator(data, "wti_oil")

    try:
        result = fetch_wti_oil_with_fallback()

        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change_percent = percent_change(current_value, previous_value)
        signal, score = wti_oil_signal(current_value, change_percent)

        is_proxy = bool(result.get("isProxy"))
        status_note = "proxy-auto-updated" if is_proxy else "auto-updated"

        if is_proxy:
            interpretation = f"WTI 원유 프록시 최신값은 {current_value:.2f}달러입니다. 데이터 출처는 {result['provider']}입니다. 이 값은 FRED DCOILWTICO 실패 시 쓰는 WTI 선물 기반 프록시입니다."
            market_reaction = "WTI 프록시 급등은 인플레이션 압력과 금리 부담을 키울 수 있습니다. 프록시 값은 방향 확인용으로 사용합니다."
            action = "유가 급등이 달러 강세·금리 상승과 동시에 나타나면 성장주와 소비 민감주의 추격 매수를 제한합니다."
        else:
            interpretation = f"WTI 원유 최신값은 {current_value:.2f}달러입니다. 데이터 출처는 {result['provider']}입니다. 유가 급등은 인플레이션 압력, 급락은 경기 수요 둔화 가능성으로 해석합니다."
            market_reaction = "유가가 빠르게 오르면 인플레이션과 기업 비용 압력이 커질 수 있습니다. 반대로 과도한 급락은 경기 둔화 신호일 수 있습니다."
            action = "WTI가 급등하면 에너지·운송·소비재 마진 압박을 확인하고, 달러와 금리 방향을 함께 봅니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )

        item["unit"] = "$/bbl"

        print("[update] wti_oil auto-updated", flush=True)
        return {
            "id": "wti_oil",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "change": info["change"],
            "changePercent": info["changePercent"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] wti_oil source-error", flush=True)
        return {
            "id": "wti_oil",
            "signal": "source-error",
            "score": 0,
            "value": "source-error",
            "change": "source-error",
            "changePercent": "source-error",
            "date": today,
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_copper_price(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    item = find_indicator(data, "copper_price")

    try:
        result = fetch_copper_price_with_fallback()

        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change_percent = percent_change(current_value, previous_value)
        signal, score = copper_price_signal(current_value, change_percent)

        is_proxy = bool(result.get("isProxy"))
        status_note = "proxy-auto-updated" if is_proxy else "auto-updated"

        if is_proxy:
            interpretation = f"구리 가격 프록시 최신값은 {current_value:.4f}입니다. 데이터 출처는 {result['provider']}입니다. 이 값은 FRED PCOPPUSDM 실패 시 쓰는 구리 선물 기반 프록시입니다."
            market_reaction = "구리 프록시 상승은 제조업·건설 수요와 경기 회복 기대에 우호적일 수 있습니다. 단, 프록시는 방향 확인용으로 제한적으로 사용합니다."
            action = "구리 강세가 달러 약세·금리 안정과 함께 나타나면 산업재·소재·경기민감주 상대강도를 관찰합니다."
        else:
            interpretation = f"구리 가격 최신값은 {current_value:.2f}입니다. 데이터 출처는 {result['provider']}입니다. FRED PCOPPUSDM은 월간 구리 가격 계열이므로 방향성과 추세를 중심으로 봅니다."
            market_reaction = "구리 상승은 제조업·건설 수요와 경기 회복 기대를 반영할 수 있습니다. 반대로 구리 하락은 경기 둔화와 산업 수요 약화를 경고할 수 있습니다."
            action = "구리 강세가 WTI 급등이 아닌 수요 회복과 함께 나타나는지 확인하고, 산업재·소재 섹터 자금 흐름을 함께 봅니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )

        item["unit"] = "USD" if not is_proxy else "$/lb proxy"

        print("[update] copper_price auto-updated", flush=True)
        return {
            "id": "copper_price",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "change": info["change"],
            "changePercent": info["changePercent"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] copper_price source-error", flush=True)
        return {
            "id": "copper_price",
            "signal": "source-error",
            "score": 0,
            "value": "source-error",
            "change": "source-error",
            "changePercent": "source-error",
            "date": today,
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_dollar_commodities(data):
    updates = [
        update_dollar_index(data),
        update_wti_oil(data),
        update_copper_price(data),
    ]
    update_dollar_commodities_summary(data, updates)


def format_price_value(value, suffix=""):
    if isinstance(value, (int, float)):
        return f"{value:.2f}{suffix}"
    return str(value)


def update_dollar_commodities_summary(data, updates):
    by_id = {item["id"]: item for item in updates}
    dollar = by_id.get("dollar_index_proxy", {})
    wti = by_id.get("wti_oil", {})
    copper = by_id.get("copper_price", {})

    score = sum(item.get("score", 0) for item in updates)
    all_source_error = all(item.get("signal") == "source-error" for item in updates)

    if all_source_error:
        status = "source-error"
    else:
        status = axis_status_from_score(score)

    dollar_signal_value = dollar.get("signal", "source-error")
    wti_signal_value = wti.get("signal", "source-error")
    copper_signal_value = copper.get("signal", "source-error")

    leading_scores = [
        item.get("score", 0)
        for item in (dollar, copper)
        if item.get("signal") != "source-error"
    ]
    if leading_scores:
        leading_status = axis_status_from_score(sum(leading_scores))
    else:
        leading_status = "source-error"

    dollar_value_text = format_price_value(dollar.get("value"))
    wti_value_text = format_price_value(wti.get("value"), "달러")
    copper_value = copper.get("value")
    copper_suffix = "" if not isinstance(copper_value, (int, float)) else ("달러" if copper_value > 100 else "달러/파운드")
    copper_value_text = format_price_value(copper_value, copper_suffix)

    data.setdefault("axisSummary", {})
    if "dollar-commodities" in data["axisSummary"]:
        data["axisSummary"]["dollar-commodities"].update({
            "status": status,
            "score": score,
            "leadingStatus": leading_status,
            "coincidentStatus": wti_signal_value,
            "laggingStatus": "not-applicable",
            "summary": f"달러 지수는 {dollar_value_text}, WTI는 {wti_value_text}, 구리는 {copper_value_text}입니다.",
            "interpretation": "달러·원유·구리는 글로벌 유동성, 인플레이션 압력, 제조업·건설 수요를 함께 보여주는 축입니다. 달러 강세와 유가 급등이 동시에 나타나면 위험자산에는 부담이 커지고, 구리 강세가 동반되면 경기 회복 기대를 함께 확인할 수 있습니다.",
            "action": "달러 강세·유가 급등·금리 상승이 동시에 나타나면 추격 매수를 줄입니다. 반대로 달러 안정, 유가 안정, 구리 강세가 함께 나타나면 산업재·소재·경기민감 섹터의 상대강도를 관찰합니다.",
        })

    data.setdefault("matrix", {})
    if "dollar-commodities" in data["matrix"]:
        data["matrix"]["dollar-commodities"].update({
            "leading": leading_status,
            "coincident": wti_signal_value,
            "lagging": "not-applicable",
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX + 금리 + 고용 + 달러/WTI 자동 업데이트 5단계",
        "riskMode": "balanced",
        "summary": "VIX, 2년물·10년물 금리, 신규 실업수당, 실업률, 달러 지수, WTI 자동 업데이트가 실행되었습니다. 아직 전체 8축 판단은 부분 자동화 상태입니다.",
        "conflictSummary": "현재는 변동성·금리·고용·달러/원유 축이 자동화된 상태입니다. 실적·자금흐름·소비·마진·구리 축과의 연결 판단은 다음 단계에서 확장합니다.",
        "watchAxes": ["rates", "employment", "dollar-commodities", "flows", "volatility"],
    })



def month_name_to_number(month_name):
    months = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12,
    }
    return months.get(month_name)


def normalize_html_text(text):
    text = re.sub(r"<script[\s\S]*?</script>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def signed_percent(direction_word, numeric_text):
    value = float(numeric_text)
    if str(direction_word).lower() == "down":
        value = -abs(value)
    return round(value, 4)


def fetch_census_retail_sales_yoy_proxy():
    """Fallback retail-sales YoY from the Census retail sales release page.

    주의: Census 문장에는 보통 MoM과 YoY가 같은 문장에 함께 있습니다.
    예: "up 0.5 percent from March 2026, and up 5.2 percent from last year".
    이전 버전은 이 문장에서 첫 번째 숫자 0.5(MoM)를 YoY로 잘못 잡을 수 있었습니다.
    이 버전은 "from last year" 바로 앞의 증가율만 추출합니다.
    """
    text = fetch_text(CENSUS_RETAIL_SALES_PAGE_URL, retries=2, timeout=12)
    normalized = normalize_html_text(text)

    # 가장 안전한 패턴: "up/down X percent (...) from last year"에 직접 붙은 숫자만 사용합니다.
    direct_last_year_matches = list(re.finditer(
        r"\b(up|down)\s+([-+]?\d+(?:\.\d+)?)\s+percent(?:\s*\([^)]*\))?\s+from last year",
        normalized,
        flags=re.IGNORECASE,
    ))

    yoy_value = None
    if direct_last_year_matches:
        # Census 문서에서 여러 문장이 잡힐 수 있으므로 Retail trade sales 문장에 가까운 값을 우선합니다.
        preferred = None
        for match in direct_last_year_matches:
            window_start = max(0, match.start() - 260)
            window = normalized[window_start:match.start()].lower()
            if "retail trade sales" in window:
                preferred = match
                break
        selected = preferred or direct_last_year_matches[0]
        yoy_value = signed_percent(selected.group(1), selected.group(2))

    if yoy_value is None:
        # 보조 패턴: "from <same month prior year>" 형태.
        # MoM의 "from March 2026" 같은 문장을 피하기 위해, 같은 문장 안의 마지막 증가율을 사용합니다.
        sentence_match = re.search(
            r"Retail trade sales were[^.]+\.",
            normalized,
            flags=re.IGNORECASE,
        )
        if sentence_match:
            sentence = sentence_match.group(0)
            candidates = list(re.finditer(
                r"\b(up|down)\s+([-+]?\d+(?:\.\d+)?)\s+percent(?:\s*\([^)]*\))?\s+from\s+[A-Z][a-z]+\s+\d{4}",
                sentence,
                flags=re.IGNORECASE,
            ))
            if candidates:
                selected = candidates[-1]
                yoy_value = signed_percent(selected.group(1), selected.group(2))

    if yoy_value is None:
        raise ValueError("Census retail sales release page에서 YoY 값을 찾지 못했습니다. MoM 숫자와 혼동하지 않도록 파싱을 중단했습니다.")

    date_value = datetime.now(KST).date().isoformat()
    release_match = re.search(r"FOR IMMEDIATE RELEASE:\s*[A-Za-z]+,\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})", normalized)
    if not release_match:
        release_match = re.search(r"\b([A-Z][a-z]+\s+\d{1,2},\s+\d{4})\b", normalized)

    if release_match:
        try:
            date_value = datetime.strptime(release_match.group(1), "%B %d, %Y").date().isoformat()
        except Exception:
            pass

    latest = {"date": date_value, "value": yoy_value}
    previous = {"date": date_value, "value": yoy_value}

    return {
        "provider": "U.S. Census Retail Sales Release Page YoY Proxy",
        "series": "Census-retail-sales-yoy-proxy-fixed",
        "url": CENSUS_RETAIL_SALES_PAGE_URL,
        "latest": latest,
        "previous": previous,
        "isProxy": True,
    }


def fetch_bls_monthly_yoy(series_id, label, years_back=5, is_proxy=False):
    """Fetch a BLS monthly level series and convert it to YoY % growth."""
    now = datetime.now(KST)
    start_year = now.year - years_back
    end_year = now.year
    url = f"{BLS_PUBLIC_API_URL}{series_id}?startyear={start_year}&endyear={end_year}"
    text = fetch_text(url, retries=2, timeout=12)
    payload_json = json.loads(text)

    status = payload_json.get("status")
    if status not in ("REQUEST_SUCCEEDED", "REQUEST_SUCCEEDED_WITH_ERRORS"):
        raise ValueError(f"BLS GET API status가 정상 범위가 아닙니다: {status}")

    series_list = payload_json.get("Results", {}).get("series", [])
    if not series_list:
        raise ValueError("BLS GET API 응답에 Results.series가 없습니다.")

    level_rows = []
    for point in series_list[0].get("data", []):
        year = point.get("year")
        period = point.get("period")
        value = point.get("value")

        if not year or not period or not period.startswith("M") or period == "M13":
            continue

        month = int(period[1:])
        date = f"{int(year):04d}-{month:02d}-01"
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            continue
        level_rows.append({"date": date, "value": numeric})

    level_rows.sort(key=lambda row: row["date"])

    yoy_rows = []
    for index in range(12, len(level_rows)):
        current = level_rows[index]
        prior_year = level_rows[index - 12]
        if prior_year["value"] == 0:
            continue
        yoy_value = round((current["value"] / prior_year["value"] - 1) * 100, 4)
        yoy_rows.append({"date": current["date"], "value": yoy_value})

    latest, previous = latest_two_from_rows(yoy_rows)
    return {
        "provider": label,
        "series": f"{series_id}-YoY",
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": is_proxy,
    }



def fetch_bls_monthly_level_rows(series_id, years_back=8):
    now = datetime.now(KST)
    start_year = now.year - years_back
    end_year = now.year
    url = f"{BLS_PUBLIC_API_URL}{series_id}?startyear={start_year}&endyear={end_year}"
    text = fetch_text(url, retries=2, timeout=12)
    payload_json = json.loads(text)

    status = payload_json.get("status")
    if status not in ("REQUEST_SUCCEEDED", "REQUEST_SUCCEEDED_WITH_ERRORS"):
        raise ValueError(f"BLS GET API status가 정상 범위가 아닙니다: {status}")

    series_list = payload_json.get("Results", {}).get("series", [])
    if not series_list:
        raise ValueError("BLS GET API 응답에 Results.series가 없습니다.")

    rows = []
    for point in series_list[0].get("data", []):
        year = point.get("year")
        period = point.get("period")
        value = point.get("value")
        if not year or not period or not period.startswith("M") or period == "M13":
            continue
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            continue
        month = int(period[1:])
        rows.append({"date": f"{int(year):04d}-{month:02d}-01", "value": numeric})

    rows.sort(key=lambda row: row["date"])
    if len(rows) < 2:
        raise ValueError(f"{series_id} BLS 유효 데이터가 2개 미만입니다.")
    return rows, url


def fetch_bls_monthly_change(series_id, label, years_back=8, is_proxy=False):
    rows, url = fetch_bls_monthly_level_rows(series_id, years_back=years_back)
    change_rows = []
    for index in range(1, len(rows)):
        current = rows[index]
        previous = rows[index - 1]
        change_rows.append({"date": current["date"], "value": round(current["value"] - previous["value"], 4)})

    latest, previous = latest_two_from_rows(change_rows)
    return {
        "provider": label,
        "series": f"{series_id}-MoM-change",
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": is_proxy,
    }


def fetch_payems_change_with_fallback():
    providers = [
        ("FRED PAYEMS monthly change", lambda: fetch_fred_monthly_change("PAYEMS", years_back=5)),
        ("BLS CES0000000001 total nonfarm monthly change", lambda: fetch_bls_monthly_change(BLS_PAYEMS_SERIES_ID, "BLS CES Total Nonfarm Employment", years_back=5, is_proxy=False)),
    ]
    return fetch_with_fallback("nonfarm_payrolls", providers)


def fetch_average_hourly_earnings_yoy_with_fallback():
    providers = [
        ("FRED CES0500000003 YoY", lambda: fetch_fred_monthly_yoy("CES0500000003", years_back=6)),
        ("BLS CES0500000003 YoY", lambda: fetch_bls_monthly_yoy(BLS_AVG_HOURLY_EARNINGS_SERIES_ID, "BLS Average Hourly Earnings", years_back=6, is_proxy=False)),
    ]
    return fetch_with_fallback("average_hourly_earnings", providers)


def fetch_ppi_yoy_with_fallback():
    providers = [
        ("FRED PPIACO YoY", lambda: fetch_fred_monthly_yoy("PPIACO", years_back=8)),
        ("BLS WPU00000000 All Commodities PPI YoY", lambda: fetch_bls_monthly_yoy(BLS_PPI_ALL_COMMODITIES_SERIES_ID, "BLS PPI All Commodities", years_back=8, is_proxy=False)),
        ("BLS WPUFD4 Final Demand PPI YoY proxy", lambda: fetch_bls_monthly_yoy(BLS_PPI_FINAL_DEMAND_SERIES_ID, "BLS PPI Final Demand Proxy", years_back=8, is_proxy=True)),
    ]
    return fetch_with_fallback("ppi_yoy", providers)


def quarter_to_fred_like_date(quarter_label):
    """Convert Federal Reserve quarter label like 2026:1 to FRED-style quarter start date."""
    match = re.match(r"^(\d{4})[:Qq]([1-4])$", str(quarter_label).strip())
    if not match:
        return datetime.now(KST).date().isoformat()
    year = int(match.group(1))
    quarter = int(match.group(2))
    month = {1: 1, 2: 4, 3: 7, 4: 10}[quarter]
    return f"{year:04d}-{month:02d}-01"


def fetch_fred_plain_data_series(series_id, years_back=12):
    """Fetch FRED's plain text data endpoint as a fallback to graph CSV."""
    url = f"https://fred.stlouisfed.org/data/{series_id}"
    text = fetch_text(url, retries=2, timeout=12)
    rows = []
    for line in text.splitlines():
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        date = parts[0]
        value = parts[-1]
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            continue
        if value in (".", "", "n.a.", "NA"):
            continue
        try:
            numeric = float(value)
        except ValueError:
            continue
        rows.append({"date": date, "value": numeric})

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "FRED plain data endpoint",
        "series": series_id,
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_federal_reserve_credit_card_delinquency():
    """Fetch credit-card delinquency rate from the Federal Reserve release page.

    The delallsa.htm table is 'Delinquency Rates / All Banks, SA'.
    In the row structure, the 6th numeric field is Consumer loans - Credit cards.
    It matches FRED DRCCLACBS (e.g., 2026:1 -> 2.92).
    """
    raw = fetch_text(FED_CREDIT_CARD_DELINQUENCY_URL, retries=2, timeout=12)
    text = clean_html_text(raw)
    rows = []

    for match in re.finditer(r"(20\d{2}|19\d{2})[:Qq]([1-4])\s+((?:-?\d+(?:\.\d+)?|n\.a\.)[\s\u00a0]+(?:-?\d+(?:\.\d+)?|n\.a\.)[\s\u00a0]+(?:-?\d+(?:\.\d+)?|n\.a\.)[\s\u00a0]+(?:-?\d+(?:\.\d+)?|n\.a\.)[\s\u00a0]+(?:-?\d+(?:\.\d+)?|n\.a\.)[\s\u00a0]+(?:-?\d+(?:\.\d+)?|n\.a\.))", text):
        year = match.group(1)
        quarter = match.group(2)
        numeric_values = re.findall(r"-?\d+(?:\.\d+)?|n\.a\.", match.group(3), flags=re.IGNORECASE)
        if len(numeric_values) < 6:
            continue
        credit_card_value = numeric_values[5]
        if credit_card_value.lower() == "n.a.":
            continue
        try:
            value = round(float(credit_card_value), 4)
        except ValueError:
            continue
        rows.append({
            "date": quarter_to_fred_like_date(f"{year}:{quarter}"),
            "value": value,
        })

    latest, previous = latest_two_from_rows(rows)
    return {
        "provider": "Federal Reserve Charge-Off and Delinquency Rates",
        "series": "DRCCLACBS-FRB-delallsa-credit-card-delinquency",
        "url": FED_CREDIT_CARD_DELINQUENCY_URL,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_credit_card_delinquency_with_fallback():
    providers = [
        ("FRED DRCCLACBS graph CSV", lambda: fetch_fred_series_recent("DRCCLACBS", years_back=12)),
        ("FRED DRCCLACBS plain data endpoint", lambda: fetch_fred_plain_data_series("DRCCLACBS", years_back=12)),
        ("Federal Reserve delinquency rates release table", fetch_federal_reserve_credit_card_delinquency),
    ]
    return fetch_with_fallback("credit_card_delinquency", providers)

def fetch_fred_monthly_yoy(series_id, years_back=8):
    """Fetch a FRED monthly level series and convert it to YoY % growth.

    RSXFS, CPIAUCSL 같은 월간 레벨 지표는 시장 판단에서 절대 레벨보다
    전년동월 대비 증가율이 더 직관적입니다. 여기서는 최신 YoY와 직전월 YoY를 계산합니다.
    """
    now = datetime.now(KST)
    start_year = max(1900, now.year - years_back)
    start_date = f"{start_year}-01-01"
    url = f"{fred_url(series_id)}&cosd={start_date}"
    text = fetch_text(url, retries=2, timeout=10)
    reader = csv.DictReader(StringIO(text))

    level_rows = []
    for row in reader:
        date = row.get("observation_date")
        raw_value = row.get(series_id)
        if not date or raw_value in (None, "", "."):
            continue
        try:
            value = float(raw_value)
        except ValueError:
            continue
        level_rows.append({
            "date": str(date)[:10],
            "value": value,
        })

    level_rows.sort(key=lambda row: row["date"])

    yoy_rows = []
    for index in range(12, len(level_rows)):
        current = level_rows[index]
        prior_year = level_rows[index - 12]
        if prior_year["value"] == 0:
            continue
        yoy_value = round((current["value"] / prior_year["value"] - 1) * 100, 4)
        yoy_rows.append({
            "date": current["date"],
            "value": yoy_value,
        })

    latest, previous = latest_two_from_rows(yoy_rows)
    return {
        "provider": "FRED YoY calculation",
        "series": f"{series_id}-YoY",
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def fetch_retail_sales_yoy_with_fallback():
    providers = [
        ("FRED recent RSXFS YoY", lambda: fetch_fred_monthly_yoy("RSXFS", years_back=4)),
        ("Census Retail Sales Release Page YoY proxy", fetch_census_retail_sales_yoy_proxy),
    ]

    return fetch_with_fallback("retail_sales_yoy", providers)


def fetch_cpi_yoy_with_fallback():
    providers = [
        ("FRED recent CPIAUCSL YoY", lambda: fetch_fred_monthly_yoy("CPIAUCSL", years_back=4)),
        ("BLS CPI-U SA CUSR0000SA0 YoY", lambda: fetch_bls_monthly_yoy(BLS_CPI_SA_SERIES_ID, "BLS CPI-U SA Public Data API", years_back=5, is_proxy=False)),
        ("BLS CPI-U NSA CUUR0000SA0 YoY proxy", lambda: fetch_bls_monthly_yoy(BLS_CPI_NSA_SERIES_ID, "BLS CPI-U NSA Public Data API Proxy", years_back=5, is_proxy=True)),
    ]

    return fetch_with_fallback("cpi_yoy", providers)


def retail_sales_yoy_signal(value, change):
    """소매판매 YoY 해석 기준.

    명목 소매판매가 높아도 인플레이션보다 낮으면 실질 수요는 약할 수 있습니다.
    그래서 여기서는 단독 점수는 보수적으로 주고, 최종 판단은 real_retail_sales_proxy에서 강화합니다.
    """
    if value >= 4.0 and change >= -0.5:
        return "positive", 1

    if value <= 1.0 or change <= -1.5:
        return "negative", -1

    return "neutral", 0


def cpi_yoy_signal(value, change):
    """CPI YoY 해석 기준.

    소비축에서 CPI는 수요 그 자체가 아니라 소비 구매력을 갉아먹는 압력입니다.
    높은 CPI 또는 재가속은 부정, 안정적 둔화는 긍정으로 해석합니다.
    """
    if value >= 4.0 or change >= 0.3:
        return "negative", -1

    if value <= 3.0 and change <= 0:
        return "positive", 1

    return "neutral", 0


def real_retail_sales_proxy_signal(value, change):
    """Retail Sales YoY - CPI YoY 프록시 해석 기준.

    양수면 명목 소매판매 증가율이 인플레이션보다 높아 실질 소비 여력이 상대적으로 양호하다고 봅니다.
    음수면 매출 증가가 물가를 못 따라가는 구간으로 소비축에는 부담입니다.
    """
    if value >= 1.0:
        return "positive", 1

    if value <= 0:
        return "negative", -1

    return "neutral", 0


def update_retail_sales_yoy(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "retail_sales_yoy")

    try:
        result = fetch_retail_sales_yoy_with_fallback()
        is_proxy = bool(result.get("isProxy"))
        status_note = "proxy-auto-updated" if is_proxy else "auto-updated"
        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change = round(current_value - previous_value, 4)
        signal, score = retail_sales_yoy_signal(current_value, change)

        interpretation = f"소매판매 YoY는 {current_value:.2f}%입니다. 데이터 출처는 {result['provider']}입니다. 명목 소비 증가율이므로 CPI와 함께 봐야 합니다."
        market_reaction = "소매판매 증가율이 양호하면 기업 매출 체력에는 우호적입니다. 단, 인플레이션보다 낮으면 실질 소비는 약할 수 있습니다."
        action = "소매판매 단독으로 판단하지 말고, CPI YoY와의 차이인 Retail Sales - CPI 프록시를 확인합니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )
        item["unit"] = "%"

        print("[update] retail_sales_yoy auto-updated", flush=True)
        return {
            "id": "retail_sales_yoy",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "previousValue": info["previousValue"],
            "change": info["change"],
            "changePercent": info["changePercent"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] retail_sales_yoy source-error", flush=True)
        return {
            "id": "retail_sales_yoy",
            "signal": item.get("signal", "source-error"),
            "score": item.get("score", 0) if is_number(item.get("currentValue")) else 0,
            "value": item.get("currentValue", "source-error"),
            "previousValue": item.get("previousValue", "source-error"),
            "change": item.get("change", "source-error"),
            "changePercent": item.get("changePercent", "source-error"),
            "date": item.get("actualDate", today),
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_cpi_yoy(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "cpi_yoy")

    try:
        result = fetch_cpi_yoy_with_fallback()
        is_proxy = bool(result.get("isProxy"))
        status_note = "proxy-auto-updated" if is_proxy else "auto-updated"
        current_value = result["latest"]["value"]
        previous_value = result["previous"]["value"]
        change = round(current_value - previous_value, 4)
        signal, score = cpi_yoy_signal(current_value, change)

        interpretation = f"CPI YoY는 {current_value:.2f}%입니다. 데이터 출처는 {result['provider']}입니다. 소비축에서는 CPI를 구매력 압력으로 해석합니다."
        market_reaction = "CPI 둔화는 실질 소비 여력과 금리 부담 완화에 우호적입니다. CPI 재가속은 소비와 멀티플에 부담이 될 수 있습니다."
        action = "CPI가 재가속되면 Retail Sales - CPI 프록시와 금리 축을 함께 확인합니다."

        info = update_indicator_success(
            item,
            result,
            signal,
            score,
            interpretation,
            market_reaction,
            action,
            status_note=status_note,
        )
        item["unit"] = "%"

        print("[update] cpi_yoy auto-updated", flush=True)
        return {
            "id": "cpi_yoy",
            "signal": signal,
            "score": score,
            "value": info["currentValue"],
            "previousValue": info["previousValue"],
            "change": info["change"],
            "changePercent": info["changePercent"],
            "date": info["actualDate"],
            "provider": info["provider"],
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] cpi_yoy source-error", flush=True)
        return {
            "id": "cpi_yoy",
            "signal": item.get("signal", "source-error"),
            "score": item.get("score", 0) if is_number(item.get("currentValue")) else 0,
            "value": item.get("currentValue", "source-error"),
            "previousValue": item.get("previousValue", "source-error"),
            "change": item.get("change", "source-error"),
            "changePercent": item.get("changePercent", "source-error"),
            "date": item.get("actualDate", today),
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_real_retail_sales_proxy(data, retail_update, cpi_update):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "real_retail_sales_proxy")

    try:
        retail_value = parse_number(retail_update.get("value"))
        cpi_value = parse_number(cpi_update.get("value"))
        retail_previous = parse_number(retail_update.get("previousValue"))
        cpi_previous = parse_number(cpi_update.get("previousValue"))

        current_value = round(retail_value - cpi_value, 4)
        previous_value = round(retail_previous - cpi_previous, 4)
        change = round(current_value - previous_value, 4)
        change_percent = percent_change(current_value, previous_value) if previous_value != 0 else 0
        direction = direction_from_change(change)
        signal, score = real_retail_sales_proxy_signal(current_value, change)

        latest_date = max(str(retail_update.get("date", today)), str(cpi_update.get("date", today)))
        source_note = f"Retail Sales YoY {retail_value:.2f}% - CPI YoY {cpi_value:.2f}%"
        status_note = "proxy-auto-updated" if "proxy" in (retail_update.get("statusNote", "") + cpi_update.get("statusNote", "")) else "auto-updated"

        item.update({
            "source": "Derived from Retail Sales YoY and CPI YoY",
            "sourceSeries": "RetailSalesYoY-minus-CPIYoY",
            "sourceUrl": "https://fred.stlouisfed.org/series/RSXFS",
            "currentValue": current_value,
            "previousValue": previous_value,
            "unit": "%p",
            "actualDate": latest_date,
            "direction": direction,
            "change": change,
            "changePercent": change_percent,
            "signal": signal,
            "score": score,
            "interpretation": f"Retail Sales - CPI 프록시는 {current_value:.2f}%p입니다. 계산식은 {source_note}입니다. 양수면 명목 소비 증가율이 인플레이션을 이긴 구간입니다.",
            "marketReaction": "이 프록시가 양수면 소비가 물가를 넘어서는 힘을 보인다는 뜻이라 임의소비재와 기업 매출 체력에 우호적입니다. 음수면 소비축은 약해진 것으로 봅니다.",
            "action": "프록시가 음수로 전환되면 소비 민감주 추격 매수를 줄이고, 신용카드 연체율과 고용축을 함께 확인합니다.",
            "statusNote": status_note,
        })

        print("[update] real_retail_sales_proxy auto-updated", flush=True)
        return {
            "id": "real_retail_sales_proxy",
            "signal": signal,
            "score": score,
            "value": current_value,
            "previousValue": previous_value,
            "change": change,
            "changePercent": change_percent,
            "date": latest_date,
            "provider": "derived",
            "statusNote": status_note,
        }

    except Exception as error:
        error_message = str(error)
        mark_source_error(item, today, error_message)
        print("[update] real_retail_sales_proxy source-error", flush=True)
        return {
            "id": "real_retail_sales_proxy",
            "signal": item.get("signal", "source-error"),
            "score": item.get("score", 0) if is_number(item.get("currentValue")) else 0,
            "value": item.get("currentValue", "source-error"),
            "previousValue": item.get("previousValue", "source-error"),
            "change": item.get("change", "source-error"),
            "changePercent": item.get("changePercent", "source-error"),
            "date": item.get("actualDate", today),
            "provider": "source-error",
            "statusNote": "source-error",
        }


def update_consumption(data):
    retail_update = update_retail_sales_yoy(data)
    cpi_update = update_cpi_yoy(data)
    real_proxy_update = update_real_retail_sales_proxy(data, retail_update, cpi_update)

    updates = [retail_update, cpi_update, real_proxy_update]
    update_consumption_summary(data, updates)


def format_percent_value(value):
    if isinstance(value, (int, float)):
        return f"{value:.2f}%"
    return str(value)


def format_percent_point_value(value):
    if isinstance(value, (int, float)):
        return f"{value:.2f}%p"
    return str(value)


def update_consumption_summary(data, updates):
    by_id = {item["id"]: item for item in updates}
    retail = by_id.get("retail_sales_yoy", {})
    cpi = by_id.get("cpi_yoy", {})
    real_proxy = by_id.get("real_retail_sales_proxy", {})

    score = sum(item.get("score", 0) for item in updates)
    all_source_error = all(item.get("signal") == "source-error" for item in updates)

    if all_source_error:
        status = "source-error"
    else:
        status = axis_status_from_score(score)

    retail_signal = retail.get("signal", "source-error")
    cpi_signal = cpi.get("signal", "source-error")
    real_signal = real_proxy.get("signal", "source-error")

    retail_value_text = format_percent_value(retail.get("value"))
    cpi_value_text = format_percent_value(cpi.get("value"))
    real_value_text = format_percent_point_value(real_proxy.get("value"))

    data.setdefault("axisSummary", {})
    if "consumption" in data["axisSummary"]:
        data["axisSummary"]["consumption"].update({
            "status": status,
            "score": score,
            "leadingStatus": real_signal,
            "coincidentStatus": retail_signal,
            "laggingStatus": "warning",
            "summary": f"소매판매 YoY는 {retail_value_text}, CPI YoY는 {cpi_value_text}, Retail Sales - CPI 프록시는 {real_value_text}입니다.",
            "interpretation": "소비축에서는 명목 소매판매보다 인플레이션을 이긴 실질 소비 여부가 중요합니다. Retail Sales - CPI 프록시가 양수이면 소비가 물가를 넘어서는 구간이고, 음수이면 매출 증가가 물가를 따라가지 못하는 구간입니다.",
            "action": "Retail Sales - CPI 프록시가 음수로 전환되면 소비 민감주와 리테일 종목 추격 매수를 제한하고, 고용축과 신용카드 연체율을 함께 확인합니다.",
        })

    data.setdefault("matrix", {})
    if "consumption" in data["matrix"]:
        data["matrix"]["consumption"].update({
            "leading": real_signal,
            "coincident": retail_signal,
            "lagging": "warning",
        })

    data.setdefault("timingSummary", {})
    if "coincident" in data["timingSummary"]:
        data["timingSummary"]["coincident"].update({
            "status": status,
            "summary": f"소비축은 소매판매 {retail_value_text}, CPI {cpi_value_text}, 실질 소비 프록시 {real_value_text}입니다.",
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX + 금리 + 고용 + 달러/원자재 + 소비 자동 업데이트 6단계",
        "riskMode": "balanced",
        "summary": "VIX, 금리, 고용, 달러/원자재, 소비축 주요 지표 자동 업데이트가 실행되었습니다. 아직 실적·자금흐름·마진 축은 부분 수동 확인이 필요합니다.",
        "conflictSummary": "소비축은 Retail Sales - CPI 프록시를 통해 명목 매출 증가가 물가를 이기는지 확인합니다. 고용이 강하고 실질 소비 프록시가 양수이면 경기 체력은 긍정적이고, 고용 둔화와 프록시 음수가 겹치면 방어 모드가 필요합니다.",
        "watchAxes": ["rates", "employment", "consumption", "dollar-commodities", "flows", "volatility"],
    })

def update_volatility_summary(data, vix_status, change_status, vix_value, change_percent, actual_date, provider):
    score = 0

    if vix_status == "positive":
        score += 1
    elif vix_status == "negative":
        score -= 1

    if change_status == "positive":
        score += 1
    elif change_status == "negative":
        score -= 1

    axis_status = axis_status_from_score(score)

    data.setdefault("axisSummary", {})
    if "volatility" in data["axisSummary"]:
        data["axisSummary"]["volatility"].update({
            "status": axis_status,
            "score": score,
            "leadingStatus": change_status,
            "coincidentStatus": vix_status,
            "laggingStatus": "not-applicable",
            "summary": f"VIX {vix_value}, 변화율 {change_percent}%입니다. 데이터 출처는 {provider}입니다.",
            "interpretation": "VIX 현재값과 변화율을 함께 보면 단기 공포의 수준과 확산 속도를 구분할 수 있습니다.",
            "action": "변동성 축은 단독 판단보다 금리, 자금 흐름, 실적 축과 연결해 해석합니다.",
        })

    data.setdefault("matrix", {})
    if "volatility" in data["matrix"]:
        data["matrix"]["volatility"].update({
            "leading": change_status,
            "coincident": vix_status,
            "lagging": "not-applicable",
        })

    data.setdefault("timingSummary", {})
    if "leading" in data["timingSummary"]:
        data["timingSummary"]["leading"].update({
            "status": change_status,
            "summary": f"VIX 변화율은 {change_percent}%입니다. 변동성 확산 여부를 확인합니다.",
        })

    if "coincident" in data["timingSummary"]:
        data["timingSummary"]["coincident"].update({
            "status": vix_status,
            "summary": f"VIX 현재값은 {vix_value}입니다. 단기 공포 수준을 확인합니다.",
        })


def update_volatility_source_error(data, error_message):
    data.setdefault("axisSummary", {})
    if "volatility" in data["axisSummary"]:
        data["axisSummary"]["volatility"].update({
            "status": "source-error",
            "score": 0,
            "leadingStatus": "source-error",
            "coincidentStatus": "source-error",
            "laggingStatus": "not-applicable",
            "summary": "VIX 데이터 소스 호출에 실패했습니다.",
            "interpretation": f"FRED/Yahoo/Stooq VIX 호출 오류: {error_message}",
            "action": "GitHub Actions 로그를 확인하고, 다음 실행에서 재시도합니다.",
        })

    data.setdefault("matrix", {})
    if "volatility" in data["matrix"]:
        data["matrix"]["volatility"].update({
            "leading": "source-error",
            "coincident": "source-error",
            "lagging": "not-applicable",
        })



# -----------------------------------------------------------------------------
# Remaining auto-updatable indicators
# -----------------------------------------------------------------------------


def fetch_fred_recent_rows(series_id, years_back=8):
    now = datetime.now(KST)
    start_year = max(1900, now.year - years_back)
    start_date = f"{start_year}-01-01"
    url = f"{fred_url(series_id)}&cosd={start_date}"
    text = fetch_text(url, retries=2, timeout=10)
    reader = csv.DictReader(StringIO(text))

    rows = []
    for row in reader:
        date = row.get("observation_date")
        raw_value = row.get(series_id)
        if not date or raw_value in (None, "", "."):
            continue
        try:
            value = float(raw_value)
        except ValueError:
            continue
        rows.append({"date": str(date)[:10], "value": value})

    rows.sort(key=lambda row: row["date"])
    if len(rows) < 2:
        raise ValueError(f"{series_id} 유효 데이터가 2개 미만입니다.")
    return rows, url


def fetch_fred_monthly_change(series_id, years_back=5):
    """Fetch a FRED monthly level series and convert it to month-over-month level change.

    PAYEMS는 고용자 수 레벨 계열이므로, 시장 해석에는 최신 레벨보다 전월 대비 증감이 더 유용합니다.
    currentValue는 최신 월간 변화량, previousValue는 직전 월간 변화량입니다.
    """
    rows, url = fetch_fred_recent_rows(series_id, years_back=years_back)
    change_rows = []
    for index in range(1, len(rows)):
        current = rows[index]
        previous = rows[index - 1]
        change_rows.append({
            "date": current["date"],
            "value": round(current["value"] - previous["value"], 4),
        })

    latest, previous = latest_two_from_rows(change_rows)
    return {
        "provider": "FRED monthly change calculation",
        "series": f"{series_id}-MoM-change",
        "url": url,
        "latest": latest,
        "previous": previous,
        "isProxy": False,
    }


def safe_numeric_from_indicator(data, indicator_id):
    try:
        value = find_indicator(data, indicator_id).get("currentValue")
    except Exception:
        return None
    return value if is_number(value) else None


def ten_two_spread_signal(value):
    if value < 0:
        return "negative", -1
    if value < 0.25:
        return "warning", 0
    if value >= 0.75:
        return "positive", 1
    return "neutral", 0


def real_yield_signal(value, change):
    if value >= 2.25 or change >= 0.15:
        return "negative", -1
    if value <= 1.25 or change <= -0.15:
        return "positive", 1
    return "neutral", 0


def fed_funds_signal(value, change):
    if value >= 5.0 or change >= 0.10:
        return "negative", -1
    if value <= 4.0 or change <= -0.10:
        return "positive", 1
    return "neutral", 0


def payrolls_signal(value):
    if value < 50000:
        return "negative", -1
    if value >= 150000:
        return "positive", 1
    return "neutral", 0


def wage_yoy_signal(value):
    if value >= 4.5:
        return "negative", -1
    if value <= 3.2:
        return "positive", 1
    return "neutral", 0


def flow_proxy_signal(indicator_id, change_percent):
    if indicator_id == "sqqq_flow_proxy":
        if change_percent >= 1.0:
            return "negative", -1
        if change_percent <= -1.0:
            return "positive", 1
        return "neutral", 0

    if change_percent >= 0.5:
        return "positive", 1
    if change_percent <= -0.5:
        return "negative", -1
    return "neutral", 0


def credit_card_delinquency_signal(value, change):
    if value >= 4.0 or change >= 0.30:
        return "negative", -1
    if value <= 3.0 and change <= 0.10:
        return "positive", 1
    return "neutral", 0


def ppi_yoy_signal(value):
    if value >= 4.0:
        return "negative", -1
    if value <= 2.0:
        return "positive", 1
    return "neutral", 0


def pass_through_signal(value):
    if value <= -1.0:
        return "negative", -1
    if value >= 0.5:
        return "positive", 1
    return "neutral", 0


def gold_price_signal(value, change_percent):
    # 금은 위험자산 선호 지표라기보다 헤지 수요 지표이므로 점수는 보수적으로 둡니다.
    if change_percent >= 2.0:
        return "warning", 0
    if change_percent <= -2.0:
        return "neutral", 0
    return "neutral", 0


def fetch_flow_proxy_with_fallback(indicator_id):
    configs = {
        "spy_flow_proxy": {
            "yahoo_url": YAHOO_SPY_URL,
            "yahoo_series": "SPY",
            "stooq_url": STOOQ_SPY_URL,
            "stooq_series": "spy.us",
            "label": "SPY ETF price flow proxy",
        },
        "qqq_flow_proxy": {
            "yahoo_url": YAHOO_QQQ_URL,
            "yahoo_series": "QQQ",
            "stooq_url": STOOQ_QQQ_URL,
            "stooq_series": "qqq.us",
            "label": "QQQ ETF price flow proxy",
        },
        "iwm_flow_proxy": {
            "yahoo_url": YAHOO_IWM_URL,
            "yahoo_series": "IWM",
            "stooq_url": STOOQ_IWM_URL,
            "stooq_series": "iwm.us",
            "label": "IWM ETF price flow proxy",
        },
        "sqqq_flow_proxy": {
            "yahoo_url": YAHOO_SQQQ_URL,
            "yahoo_series": "SQQQ",
            "stooq_url": STOOQ_SQQQ_URL,
            "stooq_series": "sqqq.us",
            "label": "SQQQ inverse ETF hedge proxy",
        },
    }

    config = configs[indicator_id]
    providers = [
        (f"Yahoo Finance {config['yahoo_series']} proxy", lambda: fetch_yahoo_chart_close(
            config["yahoo_url"],
            f"{config['yahoo_series']}-close-proxy",
            f"Yahoo Finance {config['label']}",
        )),
        (f"Stooq {config['stooq_series']} proxy", lambda: fetch_stooq_daily_close(
            config["stooq_url"],
            f"{config['stooq_series']}-close-proxy",
            f"Stooq {config['label']}",
        )),
    ]
    return fetch_with_fallback(indicator_id, providers)


def fetch_gold_price_with_fallback():
    providers = [
        ("Yahoo Finance Gold Futures GC=F proxy", lambda: fetch_yahoo_chart_close(
            YAHOO_GOLD_URL,
            "GC=F-gold-futures-proxy",
            "Yahoo Finance Gold Futures Proxy",
        )),
        ("Stooq Gold Futures proxy", lambda: fetch_stooq_daily_close(
            STOOQ_GOLD_URL,
            "gc.f-gold-futures-proxy",
            "Stooq Gold Futures Proxy",
        )),
    ]
    return fetch_with_fallback("gold_price_proxy", providers)


def update_ten_two_spread(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "ten_two_spread")

    ten_year = safe_numeric_from_indicator(data, "us_10y_yield")
    two_year = safe_numeric_from_indicator(data, "us_2y_yield")

    if ten_year is None or two_year is None:
        mark_source_error(item, today, "10년물 또는 2년물 금리 값이 숫자가 아니어서 스프레드를 계산할 수 없습니다.")
        return {"id": "ten_two_spread", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}

    previous_ten = find_indicator(data, "us_10y_yield").get("previousValue")
    previous_two = find_indicator(data, "us_2y_yield").get("previousValue")
    if is_number(previous_ten) and is_number(previous_two):
        previous_value = round(previous_ten - previous_two, 4)
    else:
        previous_value = item.get("currentValue") if is_number(item.get("currentValue")) else 0

    current_value = round(ten_year - two_year, 4)
    change = round(current_value - previous_value, 4) if is_number(previous_value) else 0
    signal, score = ten_two_spread_signal(current_value)
    direction = direction_from_change(change)
    actual_date = find_indicator(data, "us_10y_yield").get("actualDate") or today

    item.update({
        "source": "Derived from DGS10 and DGS2",
        "sourceSeries": "DGS10-DGS2-derived",
        "sourceUrl": find_indicator(data, "us_10y_yield").get("sourceUrl", "derived"),
        "currentValue": current_value,
        "previousValue": previous_value,
        "unit": "%p",
        "actualDate": actual_date,
        "direction": direction,
        "change": change,
        "changePercent": 0,
        "signal": signal,
        "score": score,
        "interpretation": f"10년물-2년물 금리 스프레드는 {current_value:.2f}%p입니다. 음수이면 장단기 금리 역전으로 경기 침체 경고 신호로 봅니다.",
        "marketReaction": "스프레드 역전은 즉시 침체를 뜻하지는 않지만, 고용과 소비가 둔화될 때 경기 리스크 해석을 강화합니다.",
        "action": "스프레드 역전 구간에서는 고용·소비·신용 지표와 함께 방어적 포지션 비중을 점검합니다.",
        "statusNote": "auto-updated",
    })
    return {"id": "ten_two_spread", "signal": signal, "score": score, "value": current_value, "statusNote": "auto-updated"}


def update_real_10y_yield(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "real_10y_yield")
    try:
        result = fetch_real_10y_yield_with_fallback()
        current = result["latest"]["value"]
        previous = result["previous"]["value"]
        change = round(current - previous, 4)
        signal, score = real_yield_signal(current, change)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"10년 실질금리 최신값은 {current:.2f}%입니다. 실질금리 상승은 성장주 멀티플과 금·장기채에 부담이 될 수 있습니다.",
            "실질금리가 높고 상승하면 위험자산에는 할인율 부담이 커집니다.",
            "실질금리 상승 구간에서는 고PER 성장주 추격을 줄이고, 금리 안정 여부를 확인합니다.",
        ) | {"id": "real_10y_yield", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "real_10y_yield", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_fed_funds_rate(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "fed_funds_rate")
    try:
        result = fetch_fed_funds_with_fallback()
        current = result["latest"]["value"]
        previous = result["previous"]["value"]
        change = round(current - previous, 4)
        signal, score = fed_funds_signal(current, change)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"Effective Fed Funds Rate 최신값은 {current:.2f}%입니다. 기준금리의 실제 적용 수준을 확인하는 동행 지표입니다.",
            "정책금리가 높게 유지되면 유동성·밸류에이션 부담이 지속됩니다.",
            "금리 인하 기대만 보지 말고 실제 단기 정책금리와 2년물 금리의 방향을 함께 봅니다.",
        ) | {"id": "fed_funds_rate", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "fed_funds_rate", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_generic_indicator(item, result, signal, score, interpretation, market_reaction, action, status_note="auto-updated"):
    info = update_indicator_success(item, result, signal, score, interpretation, market_reaction, action, status_note=status_note)
    return {
        "value": info["currentValue"],
        "change": info["change"],
        "changePercent": info["changePercent"],
        "date": info["actualDate"],
        "provider": info["provider"],
    }


def update_extra_rates(data):
    updates = [
        update_ten_two_spread(data),
        update_real_10y_yield(data),
        update_fed_funds_rate(data),
    ]

    # 기존 2년물·10년물까지 포함해서 금리축 요약을 다시 정리합니다.
    ids = ["us_2y_yield", "us_10y_yield", "ten_two_spread", "real_10y_yield", "fed_funds_rate"]
    score = 0
    signals = []
    details = []
    for indicator_id in ids:
        try:
            item = find_indicator(data, indicator_id)
        except Exception:
            continue
        if item.get("signal") != "source-error":
            score += item.get("score", 0) if is_number(item.get("score")) else 0
            signals.append(item.get("signal", "neutral"))
        details.append(f"{indicator_id}: {item.get('currentValue')}")

    status = axis_status_from_score(score)
    if "rates" in data.get("axisSummary", {}):
        data["axisSummary"]["rates"].update({
            "status": status,
            "score": score,
            "leadingStatus": status,
            "coincidentStatus": find_indicator(data, "fed_funds_rate").get("signal", "neutral"),
            "laggingStatus": "not-applicable",
            "summary": " / ".join(details),
            "interpretation": "금리축은 2년물·10년물·장단기 스프레드·실질금리·정책금리를 함께 봅니다. 방향보다 금리 변화의 이유가 더 중요합니다.",
            "action": "금리와 실질금리가 동시에 상승하면 성장주 추격을 제한하고, 금리 안정과 스프레드 정상화 여부를 확인합니다.",
        })
    if "rates" in data.get("matrix", {}):
        data["matrix"]["rates"].update({"leading": status, "coincident": find_indicator(data, "fed_funds_rate").get("signal", "neutral"), "lagging": "not-applicable"})


def update_nonfarm_payrolls(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "nonfarm_payrolls")
    try:
        result = fetch_payems_change_with_fallback()
        current = result["latest"]["value"]
        signal, score = payrolls_signal(current)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"비농업 고용자 수 변화는 {current:,.0f}천 명입니다. FRED PAYEMS 레벨 계열의 전월 대비 변화량으로 계산했습니다.",
            "고용 증가가 15만 명 이상이면 소비 체력에는 우호적입니다. 급격한 둔화는 경기 냉각 신호입니다.",
            "NFP가 둔화되면 신규 실업수당과 실업률 상승 여부를 함께 확인합니다.",
        ) | {"id": "nonfarm_payrolls", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "nonfarm_payrolls", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_average_hourly_earnings(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "average_hourly_earnings")
    try:
        result = fetch_average_hourly_earnings_yoy_with_fallback()
        current = result["latest"]["value"]
        signal, score = wage_yoy_signal(current)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"시간당 평균 임금 YoY는 {current:.2f}%입니다. 임금은 소비 여력과 인플레이션 압력을 동시에 보여줍니다.",
            "임금 상승률이 높으면 소비에는 긍정적이지만, 인플레이션과 금리 부담에는 부정적일 수 있습니다.",
            "임금 상승률이 높게 유지되면 연준의 금리 인하 지연 가능성과 기업 마진 압박을 함께 봅니다.",
        ) | {"id": "average_hourly_earnings", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "average_hourly_earnings", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_extra_employment(data):
    updates = [update_nonfarm_payrolls(data), update_average_hourly_earnings(data)]
    ids = ["initial_claims", "unemployment_rate", "nonfarm_payrolls", "average_hourly_earnings"]
    score = 0
    details = []
    for indicator_id in ids:
        item = find_indicator(data, indicator_id)
        if item.get("signal") != "source-error":
            score += item.get("score", 0) if is_number(item.get("score")) else 0
        details.append(f"{indicator_id}: {item.get('currentValue')}")
    status = axis_status_from_score(score)
    if "employment" in data.get("axisSummary", {}):
        data["axisSummary"]["employment"].update({
            "status": status,
            "score": score,
            "leadingStatus": find_indicator(data, "initial_claims").get("signal", "neutral"),
            "coincidentStatus": axis_status_from_score(sum(find_indicator(data, i).get("score", 0) if is_number(find_indicator(data, i).get("score")) else 0 for i in ["nonfarm_payrolls", "average_hourly_earnings"])),
            "laggingStatus": find_indicator(data, "unemployment_rate").get("signal", "neutral"),
            "summary": " / ".join(details),
            "interpretation": "고용축은 신규 실업수당, NFP, 임금, 실업률을 함께 봅니다. 선행 악화와 후행 악화가 동시에 나타나면 경기 둔화 신호가 강해집니다.",
            "action": "고용축 악화가 소비축 악화와 겹치면 경기민감주·고레버리지 성장주 비중 확대를 늦춥니다.",
        })
    if "employment" in data.get("matrix", {}):
        data["matrix"]["employment"].update({
            "leading": find_indicator(data, "initial_claims").get("signal", "neutral"),
            "coincident": data["axisSummary"]["employment"].get("coincidentStatus", "neutral"),
            "lagging": find_indicator(data, "unemployment_rate").get("signal", "neutral"),
        })


def update_single_flow_proxy(data, indicator_id, display_name):
    """Update ETF flow proxy as price-change percentage, not ETF price level.

    이 지표는 실제 ETF fund flow가 아닙니다. Yahoo/Stooq에서 가져오는 값은 ETF 종가입니다.
    따라서 currentValue에 종가 자체를 넣으면 SPY 741.75 같은 가격이 '흐름 %'처럼 보이는 문제가 생깁니다.
    이 함수는 종가를 원자료로 쓰되, 화면에 표시할 currentValue는 전일 대비 가격 변화율(%)로 저장합니다.
    """
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, indicator_id)
    try:
        result = fetch_flow_proxy_with_fallback(indicator_id)
        current_close = result["latest"]["value"]
        previous_close = result["previous"]["value"]
        flow_value = percent_change(current_close, previous_close)
        signal, score = flow_proxy_signal(indicator_id, flow_value)
        direction = direction_from_change(flow_value)
        source = result.get("provider") or result.get("source") or "ETF price proxy"
        source_series = result.get("series") or display_name
        source_url = result.get("url") or ""
        actual_date = result["latest"]["date"]

        inverse_note = " SQQQ는 인버스 ETF이므로 상승은 헤지 수요 증가, 즉 시장에는 부정 신호로 해석합니다." if indicator_id == "sqqq_flow_proxy" else ""

        item.update({
            "source": source,
            "sourceSeries": f"{source_series}-daily-change-percent-proxy",
            "sourceUrl": source_url,
            "currentValue": flow_value,
            "previousValue": 0,
            "unit": "%",
            "actualDate": actual_date,
            "direction": direction,
            "change": flow_value,
            "changePercent": flow_value,
            "signal": signal,
            "score": score,
            "rawClose": current_close,
            "rawPreviousClose": previous_close,
            "interpretation": f"{display_name} 흐름 프록시는 전일 대비 가격 변화율 {flow_value:.2f}%입니다. 원자료 종가는 {current_close:.2f}, 직전 종가는 {previous_close:.2f}입니다. 이는 실제 ETF 자금 유입액이 아니라 가격 기반 수급 프록시입니다.{inverse_note}",
            "marketReaction": "가격 기반 프록시는 실제 fund flow보다 약하지만, 위험선호와 상대강도 확인에는 사용할 수 있습니다.",
            "action": "프록시 수급은 단독 판단하지 말고 거래량·섹터 ETF·지수 추세와 함께 확인합니다. 다음 단계에서는 실제 ETF flow 또는 거래량 데이터를 보강합니다.",
            "statusNote": "proxy-auto-updated",
        })
        return {"id": indicator_id, "signal": signal, "score": score, "value": flow_value, "changePercent": flow_value, "statusNote": "proxy-auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": indicator_id, "signal": "source-error", "score": 0, "value": item.get("currentValue"), "changePercent": "source-error", "statusNote": "source-error"}


def update_flows(data):
    updates = [
        update_single_flow_proxy(data, "spy_flow_proxy", "SPY"),
        update_single_flow_proxy(data, "qqq_flow_proxy", "QQQ"),
        update_single_flow_proxy(data, "iwm_flow_proxy", "IWM"),
        update_single_flow_proxy(data, "sqqq_flow_proxy", "SQQQ"),
    ]
    score = sum(item.get("score", 0) for item in updates if item.get("signal") != "source-error")
    status = axis_status_from_score(score)
    details = " / ".join(f"{item['id']}: {item.get('value')}" for item in updates)
    leading_scores = [item.get("score", 0) for item in updates if item["id"] in ("qqq_flow_proxy", "iwm_flow_proxy", "sqqq_flow_proxy") and item.get("signal") != "source-error"]
    leading_status = axis_status_from_score(sum(leading_scores)) if leading_scores else "source-error"
    if "flows" in data.get("axisSummary", {}):
        data["axisSummary"]["flows"].update({
            "status": status,
            "score": score,
            "leadingStatus": leading_status,
            "coincidentStatus": find_indicator(data, "spy_flow_proxy").get("signal", "neutral"),
            "laggingStatus": "not-applicable",
            "summary": details,
            "interpretation": "자금 흐름 축은 현재 실제 ETF fund flow가 아니라 ETF 가격 기반 프록시입니다. SPY·QQQ·IWM 상승은 위험선호, SQQQ 상승은 헤지 수요 증가로 해석합니다.",
            "action": "프록시가 강하면 다음 단계에서 실제 ETF flow 또는 거래량 데이터를 보강합니다. SQQQ가 급등하면 단기 방어 모드로 봅니다.",
        })
    if "flows" in data.get("matrix", {}):
        data["matrix"]["flows"].update({"leading": leading_status, "coincident": find_indicator(data, "spy_flow_proxy").get("signal", "neutral"), "lagging": "not-applicable"})


def update_credit_card_delinquency(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "credit_card_delinquency")
    try:
        result = fetch_credit_card_delinquency_with_fallback()
        current = result["latest"]["value"]
        previous = result["previous"]["value"]
        change = round(current - previous, 4)
        signal, score = credit_card_delinquency_signal(current, change)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"신용카드 연체율은 {current:.2f}%입니다. 3% 이하는 소비 신용 여건이 안정적인 구간으로 보고, 상승 추세는 소비 둔화 리스크로 봅니다.",
            "연체율 상승은 소비 여력 약화와 리테일/임의소비재 부담으로 연결될 수 있습니다.",
            "연체율이 상승하면 소매판매와 고용 지표를 함께 확인하고 소비 민감주 추격을 제한합니다.",
        ) | {"id": "credit_card_delinquency", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        # 이 지표는 분기·은행권 계열이라 FRED가 실패하면 안정적인 무료 대체 소스가 제한적입니다.
        # 기존 숫자가 있으면 보존하고 source-error로 표시합니다. 숫자가 전혀 없으면 수동 확인 대상으로 남깁니다.
        if is_number(item.get("currentValue")):
            mark_source_error(item, today, str(error))
            return {"id": "credit_card_delinquency", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}
        item.update({
            "currentValue": "manual-required",
            "previousValue": "manual-required",
            "statusNote": "manual-required",
            "signal": "manual-required",
            "score": 0,
            "actualDate": today,
            "interpretation": f"신용카드 연체율 자동 호출에 실패했습니다. 이 지표는 분기성 신용 지표라 수동 확인 대상으로 남깁니다. 오류: {str(error)[:300]}",
            "marketReaction": "신용카드 연체율은 소비 둔화와 신용 스트레스 확인용 후행 지표입니다.",
            "action": "화요일 리서치 루틴에서 최신 연체율을 직접 확인하고, 자동 소스가 안정화되면 다시 연결합니다.",
        })
        return {"id": "credit_card_delinquency", "signal": "manual-required", "score": 0, "value": "manual-required", "statusNote": "manual-required"}


def update_extra_consumption(data):
    update = update_credit_card_delinquency(data)
    # 기존 소비축 요약에 후행 신용 지표를 추가 반영합니다.
    try:
        current_summary = data.get("axisSummary", {}).get("consumption", {}).get("summary", "")
        cc_item = find_indicator(data, "credit_card_delinquency")
        if "consumption" in data.get("axisSummary", {}):
            data["axisSummary"]["consumption"].update({
                "laggingStatus": cc_item.get("signal", "neutral"),
                "summary": f"{current_summary} / 신용카드 연체율: {cc_item.get('currentValue')}",
            })
        if "consumption" in data.get("matrix", {}):
            data["matrix"]["consumption"]["lagging"] = cc_item.get("signal", "neutral")
    except Exception as error:
        print(f"[consumption-summary] credit card delinquency summary update skipped: {error}", flush=True)


def update_ppi_yoy(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "ppi_yoy")
    try:
        result = fetch_ppi_yoy_with_fallback()
        current = result["latest"]["value"]
        signal, score = ppi_yoy_signal(current)
        status_note = "proxy-auto-updated" if result.get("isProxy") else "auto-updated"
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"PPI YoY는 {current:.2f}%입니다. 생산자물가는 기업 원가 압박의 선행 신호로 봅니다.",
            "PPI가 CPI보다 빠르게 오르면 마진 압박 가능성이 커집니다.",
            "PPI 상승률이 재가속되면 원자재·임금·가격전가력을 함께 확인합니다.",
            status_note=status_note,
        ) | {"id": "ppi_yoy", "signal": signal, "score": score, "statusNote": status_note}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "ppi_yoy", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_wage_cost_yoy(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "wage_cost_yoy")
    try:
        result = fetch_average_hourly_earnings_yoy_with_fallback()
        current = result["latest"]["value"]
        signal, score = wage_yoy_signal(current)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"임금 비용 YoY는 {current:.2f}%입니다. 임금 상승은 서비스 인플레이션과 기업 마진 압박의 핵심 변수입니다.",
            "임금 상승률이 높으면 가격전가력이 약한 기업의 마진 압박이 커질 수 있습니다.",
            "임금 상승률이 높게 유지되면 컨퍼런스콜의 cost pressure, labor cost 언급을 함께 확인합니다.",
        ) | {"id": "wage_cost_yoy", "signal": signal, "score": score, "statusNote": "auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "wage_cost_yoy", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_cpi_ppi_pass_through(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "cpi_ppi_pass_through")
    cpi = safe_numeric_from_indicator(data, "cpi_yoy")
    ppi = safe_numeric_from_indicator(data, "ppi_yoy")
    if cpi is None or ppi is None:
        mark_source_error(item, today, "CPI YoY 또는 PPI YoY가 숫자가 아니어서 가격전가 프록시를 계산할 수 없습니다.")
        return {"id": "cpi_ppi_pass_through", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}
    current = round(cpi - ppi, 4)
    previous = item.get("currentValue") if is_number(item.get("currentValue")) else 0
    change = round(current - previous, 4) if is_number(previous) else 0
    signal, score = pass_through_signal(current)
    item.update({
        "source": "Derived from CPIAUCSL-YoY and PPIACO-YoY",
        "sourceSeries": "CPIAUCSL-YoY-minus-PPIACO-YoY",
        "sourceUrl": find_indicator(data, "cpi_yoy").get("sourceUrl", "derived"),
        "currentValue": current,
        "previousValue": previous,
        "unit": "%p",
        "actualDate": find_indicator(data, "cpi_yoy").get("actualDate", today),
        "direction": direction_from_change(change),
        "change": change,
        "changePercent": 0,
        "signal": signal,
        "score": score,
        "interpretation": f"CPI-PPI 가격전가 프록시는 {current:.2f}%p입니다. CPI가 PPI보다 높으면 가격전가 여지가 있고, PPI가 CPI보다 높으면 마진 압박 가능성이 큽니다.",
        "marketReaction": "가격전가 프록시가 음수이면 비용 상승을 소비자 가격으로 넘기기 어려운 구간일 수 있습니다.",
        "action": "프록시가 악화되면 기업 실적 발표의 margin headwinds, cost pressure, pricing power 언급을 확인합니다.",
        "statusNote": "auto-updated",
    })
    return {"id": "cpi_ppi_pass_through", "signal": signal, "score": score, "value": current, "statusNote": "auto-updated"}


def update_margins(data):
    updates = [update_ppi_yoy(data), update_wage_cost_yoy(data), update_cpi_ppi_pass_through(data)]
    score = sum(item.get("score", 0) for item in updates if item.get("signal") != "source-error")
    status = axis_status_from_score(score)
    details = " / ".join(f"{item['id']}: {item.get('value')}" for item in updates)
    if "margins" in data.get("axisSummary", {}):
        data["axisSummary"]["margins"].update({
            "status": status,
            "score": score,
            "leadingStatus": axis_status_from_score(sum(find_indicator(data, i).get("score", 0) if is_number(find_indicator(data, i).get("score")) else 0 for i in ["ppi_yoy", "wage_cost_yoy"])),
            "coincidentStatus": find_indicator(data, "cpi_ppi_pass_through").get("signal", "neutral"),
            "laggingStatus": "manual-required",
            "summary": details,
            "interpretation": "마진축은 PPI, 임금, CPI-PPI 가격전가 프록시를 통해 비용 압박과 가격결정력을 봅니다. 실제 기업 마진은 실적 발표와 컨퍼런스콜에서 확인해야 합니다.",
            "action": "PPI·임금 상승이 재가속되고 가격전가 프록시가 악화되면 마진 취약 기업의 비중 확대를 제한합니다.",
        })
    if "margins" in data.get("matrix", {}):
        data["matrix"]["margins"].update({
            "leading": data["axisSummary"]["margins"].get("leadingStatus", "neutral"),
            "coincident": find_indicator(data, "cpi_ppi_pass_through").get("signal", "neutral"),
            "lagging": "manual-required",
        })


def update_gold_price_proxy(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "gold_price_proxy")
    try:
        result = fetch_gold_price_with_fallback()
        current = result["latest"]["value"]
        previous = result["previous"]["value"]
        change_percent = percent_change(current, previous)
        signal, score = gold_price_signal(current, change_percent)
        info = update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"금 가격 프록시 최신값은 {current:.2f}입니다. 데이터 출처는 {result['provider']}입니다. 금은 통화 헤지와 위험 회피 수요를 함께 반영합니다.",
            "금 급등은 달러·실질금리·지정학 리스크와 함께 해석해야 합니다.",
            "금은 추세 전환 확인 후 접근하고, 단기 급등만으로 위험자산 전체 판단을 바꾸지 않습니다.",
            status_note="proxy-auto-updated",
        )
        return {"id": "gold_price_proxy", "signal": signal, "score": score, "value": info["value"], "statusNote": "proxy-auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "gold_price_proxy", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_extra_dollar_commodities(data):
    update_gold_price_proxy(data)
    ids = ["dollar_index_proxy", "wti_oil", "copper_price", "gold_price_proxy"]
    score = 0
    details = []
    for indicator_id in ids:
        item = find_indicator(data, indicator_id)
        if item.get("signal") != "source-error":
            score += item.get("score", 0) if is_number(item.get("score")) else 0
        details.append(f"{indicator_id}: {item.get('currentValue')}")
    status = axis_status_from_score(score)
    if "dollar-commodities" in data.get("axisSummary", {}):
        data["axisSummary"]["dollar-commodities"].update({
            "status": status,
            "score": score,
            "leadingStatus": axis_status_from_score(sum(find_indicator(data, i).get("score", 0) if is_number(find_indicator(data, i).get("score")) else 0 for i in ["dollar_index_proxy", "copper_price"])),
            "coincidentStatus": find_indicator(data, "wti_oil").get("signal", "neutral"),
            "laggingStatus": find_indicator(data, "gold_price_proxy").get("signal", "neutral"),
            "summary": " / ".join(details),
            "interpretation": "달러·WTI·구리·금은 유동성, 인플레이션 압력, 경기 수요, 헤지 수요를 함께 보여줍니다.",
            "action": "달러 강세와 유가 급등이 동시에 나타나면 위험자산 추격을 제한하고, 구리 강세와 달러 안정이 함께 나타나면 경기민감 섹터를 관찰합니다.",
        })
    if "dollar-commodities" in data.get("matrix", {}):
        data["matrix"]["dollar-commodities"].update({
            "leading": data["axisSummary"]["dollar-commodities"].get("leadingStatus", "neutral"),
            "coincident": find_indicator(data, "wti_oil").get("signal", "neutral"),
            "lagging": find_indicator(data, "gold_price_proxy").get("signal", "neutral"),
        })


def update_all_remaining_auto_indicators(data):
    print("[remaining] update extra rates", flush=True)
    update_extra_rates(data)
    print("[remaining] update extra employment", flush=True)
    update_extra_employment(data)
    print("[remaining] update flows", flush=True)
    update_flows(data)
    print("[remaining] update credit card delinquency", flush=True)
    update_extra_consumption(data)
    print("[remaining] update margins", flush=True)
    update_margins(data)
    print("[remaining] update gold price proxy", flush=True)
    update_extra_dollar_commodities(data)



# Additional auto-updatable manual indicators
# - 신용카드 연체율은 기존 FRED DRCCLACBS 자동화 함수를 사용합니다.
# - ISM Manufacturing PMI는 공식/공개 페이지에서 headline 숫자를 파싱합니다.
# - FactSet EPS/Revenue beat rate는 FactSet 공개 Earnings Insight/Update 페이지에서 숫자만 추출합니다.

FACTSET_BEAT_RATE_CACHE = None


def clean_html_text(raw_text):
    text = re.sub(r"<script[\s\S]*?</script>", " ", raw_text, flags=re.IGNORECASE)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def static_result(provider, series, url, current, previous=None, date=None, is_proxy=True):
    if previous is None:
        previous = current
    if date is None:
        date = datetime.now(KST).date().isoformat()
    return {
        "provider": provider,
        "series": series,
        "url": url,
        "latest": {"date": date, "value": round(float(current), 4)},
        "previous": {"date": date, "value": round(float(previous), 4)},
        "isProxy": is_proxy,
    }


def extract_number(value):
    if value is None:
        raise ValueError("숫자 값이 없습니다.")
    return float(str(value).replace(",", "").strip())


def ism_pmi_signal(value, change):
    # 50은 제조업 확장/수축 기준선입니다.
    # 50~55는 골디락스에 가까운 완만한 확장, 55 이상은 강한 확장입니다.
    if value >= 50:
        return "positive", 1
    if value < 45:
        return "negative", -1
    return "warning", 0


def beat_rate_signal(value, threshold=70):
    if value >= threshold:
        return "positive", 1
    if value >= threshold - 10:
        return "neutral", 0
    return "negative", -1


def parse_ism_from_text(raw_text):
    text = clean_html_text(raw_text)

    patterns = [
        # Investing.com economic calendar style: Actual 54.0 Forecast 53.3 Previous 52.7
        r"Actual\s+([0-9]+(?:\.[0-9]+)?)\s+Forecast\s+[0-9]+(?:\.[0-9]+)?\s+Previous\s+([0-9]+(?:\.[0-9]+)?)",
        # TradingEconomics/news style: PMI increased to 52.7 ... from 52.4
        r"ISM\s+Manufacturing\s+PMI[^.]{0,400}?(?:increased|rose|slipped|fell|declined|decreased|was|came\s+in|registered|stood\s+at)\s+(?:to|at)?\s*([0-9]+(?:\.[0-9]+)?)[^.]{0,200}?\s+from\s+([0-9]+(?:\.[0-9]+)?)",
        # ISM press-release style: Manufacturing PMI registered 54 percent ... previous 52.7
        r"Manufacturing\s+PMI[^.]{0,300}?(?:registered|was|came\s+in\s+at|stood\s+at)\s+([0-9]+(?:\.[0-9]+)?)\s*(?:percent|%)?[^.]{0,300}?(?:previous|prior|last\s+month)[^0-9]{0,80}([0-9]+(?:\.[0-9]+)?)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return extract_number(match.group(1)), extract_number(match.group(2))

    # If a page exposes JSON-like keys.
    json_like = re.search(r'"actual"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?[\s\S]{0,300}?"previous"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?', raw_text, flags=re.IGNORECASE)
    if json_like:
        return extract_number(json_like.group(1)), extract_number(json_like.group(2))

    raise ValueError("ISM Manufacturing PMI headline 숫자를 파싱하지 못했습니다.")


def fetch_ism_manufacturing_pmi_with_fallback():
    providers = [
        ("Investing.com ISM Manufacturing PMI calendar", ISM_INVESTING_URL),
        ("TradingEconomics ISM Manufacturing PMI page", ISM_TRADING_ECONOMICS_URL),
        ("ISM PMI reports page", ISM_REPORTS_URL),
    ]

    last_error = None
    for provider, url in providers:
        try:
            text = fetch_text(url, retries=1, timeout=10)
            current, previous = parse_ism_from_text(text)
            return static_result(provider, "ISM-Manufacturing-PMI-Headline", url, current, previous, is_proxy=True)
        except Exception as error:
            last_error = error
            print(f"[ism-failed] {provider}: {error}", flush=True)

    raise RuntimeError(f"ISM Manufacturing PMI 자동 수집 실패: {last_error}")


def extract_factset_candidate_urls(raw_html):
    urls = []
    for href in re.findall(r'href=["\']([^"\']+)["\']', raw_html, flags=re.IGNORECASE):
        if "earnings-season-update" not in href.lower() and "earnings-insight" not in href.lower():
            continue
        if href.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
            continue
        if href.startswith("//"):
            url = "https:" + href
        elif href.startswith("/"):
            url = urllib.parse.urljoin("https://insight.factset.com", href)
        elif href.startswith("http"):
            url = href
        else:
            url = urllib.parse.urljoin("https://insight.factset.com", href)
        if url not in urls:
            urls.append(url)
    return urls[:8]


def first_percent_in_relevant_sentence(text, required_keywords, reject_keywords=None):
    """Return the first percentage in a sentence/window containing all required keywords."""
    reject_keywords = reject_keywords or []
    normalized = re.sub(r"\s+", " ", text)

    # Sentence-level parsing first.
    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    for sentence in sentences:
        lower = sentence.lower()
        if all(keyword.lower() in lower for keyword in required_keywords) and not any(keyword.lower() in lower for keyword in reject_keywords):
            for candidate in re.findall(r"([0-9]{1,3}(?:\.\d+)?)\s*%", sentence):
                value = float(candidate)
                if 0 <= value <= 100:
                    return value

    # If punctuation was stripped by the site, use a window around the key phrase.
    primary_keyword = required_keywords[-1]
    for match in re.finditer(re.escape(primary_keyword), normalized, flags=re.IGNORECASE):
        window = normalized[max(0, match.start() - 240): match.end() + 240]
        lower = window.lower()
        if all(keyword.lower() in lower for keyword in required_keywords) and not any(keyword.lower() in lower for keyword in reject_keywords):
            candidates = [float(x) for x in re.findall(r"([0-9]{1,3}(?:\.\d+)?)\s*%", window)]
            candidates = [value for value in candidates if 0 <= value <= 100]
            if candidates:
                return candidates[0]

    return None


def parse_factset_beat_rates(raw_text):
    text = clean_html_text(raw_text)

    eps = None
    revenue = None

    eps_patterns = [
        r"([0-9]{1,3})%\s+have\s+reported\s+actual\s+EPS\s+above\s+estimates",
        r"([0-9]{1,3})%\s+of\s+S&P\s+500\s+companies\s+have\s+reported\s+actual\s+EPS\s+above\s+estimates",
        r"([0-9]{1,3})\s*percent\s+(?:of\s+S&P\s+500\s+companies\s+)?have\s+reported\s+actual\s+EPS\s+above\s+estimates",
        r"actual\s+EPS\s+above\s+estimates[^0-9]{0,160}([0-9]{1,3})%",
        r"([0-9]{1,3})%[^.]{0,220}actual\s+EPS\s+above\s+estimates",
    ]
    rev_patterns = [
        r"In\s+terms\s+of\s+revenues?,?\s+([0-9]{1,3})%\s+of\s+S&P\s+500\s+companies\s+have\s+reported\s+actual\s+revenues?\s+above\s+estimates",
        r"([0-9]{1,3})%\s+of\s+S&P\s+500\s+companies\s+have\s+reported\s+actual\s+revenues?\s+above\s+estimates",
        r"([0-9]{1,3})%\s+have\s+reported\s+actual\s+revenues?\s+above\s+estimates",
        r"([0-9]{1,3})\s*percent\s+(?:of\s+S&P\s+500\s+companies\s+)?have\s+reported\s+actual\s+revenues?\s+above\s+estimates",
        r"actual\s+revenues?\s+above\s+estimates[^0-9]{0,160}([0-9]{1,3})%",
        r"([0-9]{1,3})%[^.]{0,260}actual\s+revenues?\s+above\s+estimates",
    ]

    for pattern in eps_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            eps = extract_number(match.group(1))
            break
    for pattern in rev_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            revenue = extract_number(match.group(1))
            break

    # Robust fallback for FactSet's common wording:
    # "In terms of revenues, 81% of S&P 500 companies have reported actual revenues above estimates..."
    if eps is None:
        eps = first_percent_in_relevant_sentence(text, ["actual EPS", "above estimates"])
    if revenue is None:
        revenue = first_percent_in_relevant_sentence(text, ["revenues", "above estimates"])

    if eps is None and revenue is None:
        raise ValueError("FactSet EPS/Revenue beat rate 숫자를 파싱하지 못했습니다.")

    return {"eps": eps, "revenue": revenue}

def fetch_factset_beat_rates():
    global FACTSET_BEAT_RATE_CACHE
    if FACTSET_BEAT_RATE_CACHE is not None:
        return FACTSET_BEAT_RATE_CACHE

    errors = []
    candidate_urls = [FACTSET_EARNINGS_INSIGHT_URL, FACTSET_EARNINGS_TOPIC_URL]

    # First fetch index/topic pages and collect recent article URLs.
    for url in list(candidate_urls):
        try:
            raw = fetch_text(url, retries=1, timeout=12)
            for candidate in extract_factset_candidate_urls(raw):
                if candidate not in candidate_urls:
                    candidate_urls.append(candidate)
            rates = parse_factset_beat_rates(raw)
            if rates.get("eps") is not None or rates.get("revenue") is not None:
                FACTSET_BEAT_RATE_CACHE = {"rates": rates, "url": url, "provider": "FactSet Earnings Insight"}
                return FACTSET_BEAT_RATE_CACHE
        except Exception as error:
            errors.append(f"{url}: {error}")

    # Then fetch recent candidate articles.
    for url in candidate_urls[2:]:
        try:
            raw = fetch_text(url, retries=1, timeout=12)
            rates = parse_factset_beat_rates(raw)
            if rates.get("eps") is not None or rates.get("revenue") is not None:
                FACTSET_BEAT_RATE_CACHE = {"rates": rates, "url": url, "provider": "FactSet Earnings Insight"}
                return FACTSET_BEAT_RATE_CACHE
        except Exception as error:
            errors.append(f"{url}: {error}")

    raise RuntimeError("FactSet beat rate 자동 수집 실패: " + " | ".join(errors[-5:]))


def fetch_factset_single_rate(kind):
    data = fetch_factset_beat_rates()
    value = data["rates"].get(kind)
    if value is None:
        raise ValueError(f"FactSet {kind} beat rate를 찾지 못했습니다.")
    label = "EPS Beat Rate" if kind == "eps" else "Revenue Beat Rate"
    return static_result(data["provider"], f"FactSet-S&P500-{label}", data["url"], value, value, is_proxy=True)


def update_ism_manufacturing_pmi(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "ism_manufacturing_pmi")
    try:
        result = fetch_ism_manufacturing_pmi_with_fallback()
        current = result["latest"]["value"]
        previous = result["previous"]["value"]
        signal, score = ism_pmi_signal(current, round(current - previous, 4))
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"ISM Manufacturing PMI Headline은 {current:.1f}입니다. 50 이상은 제조업 확장, 50 미만은 수축으로 봅니다.",
            "PMI가 50 이상이면 제조업 경기와 경기민감 섹터에 우호적이지만, 과도한 강세는 물가 압력과 함께 해석해야 합니다.",
            "50 이상 유지 시 경기민감·산업재·소재 흐름을 관찰하고, 50 하회가 지속되면 방어적 해석으로 전환합니다.",
            status_note="proxy-auto-updated",
        ) | {"id": "ism_manufacturing_pmi", "signal": signal, "score": score, "statusNote": "proxy-auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "ism_manufacturing_pmi", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_eps_beat_rate(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "eps_beat_rate")
    try:
        result = fetch_factset_single_rate("eps")
        current = result["latest"]["value"]
        signal, score = beat_rate_signal(current, threshold=70)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"S&P 500 EPS Beat Rate는 {current:.0f}%입니다. 70% 이상은 실적 시즌의 질이 양호한 구간으로 봅니다.",
            "EPS beat rate가 높으면 이익 기대가 유지되며 멀티플 부담을 일부 흡수할 수 있습니다.",
            "70% 이상 유지 시 실적 축을 긍정으로 보고, 60% 이하로 내려가면 이익 기대 둔화를 경계합니다.",
            status_note="proxy-auto-updated",
        ) | {"id": "eps_beat_rate", "signal": signal, "score": score, "statusNote": "proxy-auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "eps_beat_rate", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_revenue_beat_rate(data):
    now = datetime.now(KST)
    today = now.date().isoformat()
    item = find_indicator(data, "revenue_beat_rate")
    try:
        result = fetch_factset_single_rate("revenue")
        current = result["latest"]["value"]
        signal, score = beat_rate_signal(current, threshold=65)
        return update_generic_indicator(
            item,
            result,
            signal,
            score,
            f"S&P 500 Revenue Beat Rate는 {current:.0f}%입니다. 65% 이상은 매출 수요가 양호한 구간으로 봅니다.",
            "Revenue beat rate가 높으면 비용 절감이 아니라 실제 수요가 실적을 받치는지 확인하는 데 유용합니다.",
            "Revenue beat가 약해지면 EPS beat가 높아도 마진/비용절감 중심 실적인지 점검합니다.",
            status_note="proxy-auto-updated",
        ) | {"id": "revenue_beat_rate", "signal": signal, "score": score, "statusNote": "proxy-auto-updated"}
    except Exception as error:
        mark_source_error(item, today, str(error))
        return {"id": "revenue_beat_rate", "signal": "source-error", "score": 0, "value": item.get("currentValue"), "statusNote": "source-error"}


def update_earnings_summary(data):
    ids = ["eps_beat_rate", "revenue_beat_rate", "m7_guidance_change", "consensus_revision"]
    score = 0
    for indicator_id in ids:
        try:
            item = find_indicator(data, indicator_id)
        except Exception:
            continue
        if item.get("signal") in ("source-error", "manual-required"):
            continue
        if is_number(item.get("score")):
            score += item.get("score")

    eps = find_indicator(data, "eps_beat_rate")
    rev = find_indicator(data, "revenue_beat_rate")
    try:
        m7 = find_indicator(data, "m7_guidance_change")
        consensus = find_indicator(data, "consensus_revision")
    except Exception:
        m7 = {"signal": "manual-required"}
        consensus = {"signal": "manual-required"}

    status = axis_status_from_score(score)
    if "earnings" in data.get("axisSummary", {}):
        data["axisSummary"]["earnings"].update({
            "status": status,
            "score": score,
            "leadingStatus": axis_status_from_score(sum(x.get("score", 0) if is_number(x.get("score")) else 0 for x in [m7, consensus] if x.get("signal") not in ("source-error", "manual-required"))),
            "coincidentStatus": rev.get("signal", "neutral"),
            "laggingStatus": axis_status_from_score(sum(x.get("score", 0) if is_number(x.get("score")) else 0 for x in [eps, rev] if x.get("signal") not in ("source-error", "manual-required"))),
            "summary": f"EPS Beat {eps.get('currentValue')}, Revenue Beat {rev.get('currentValue')}입니다. M7 가이던스와 컨센서스 리비전은 수동 입력을 병행합니다.",
            "interpretation": "실적 축은 EPS beat와 revenue beat를 함께 봅니다. EPS만 강하고 매출이 약하면 비용절감형 실적일 수 있어 질을 낮게 봅니다.",
            "action": "EPS와 매출 beat가 모두 양호하면 실적 축을 긍정으로 보고, 가이던스와 컨센서스 리비전 수동 입력으로 선행성을 보강합니다.",
        })
    if "earnings" in data.get("matrix", {}):
        data["matrix"]["earnings"].update({
            "leading": data.get("axisSummary", {}).get("earnings", {}).get("leadingStatus", "manual-required"),
            "coincident": rev.get("signal", "neutral"),
            "lagging": data.get("axisSummary", {}).get("earnings", {}).get("laggingStatus", "neutral"),
        })


def update_employment_summary_with_ism(data):
    ids = ["initial_claims", "unemployment_rate", "nonfarm_payrolls", "average_hourly_earnings", "ism_manufacturing_pmi"]
    score = 0
    details = []
    for indicator_id in ids:
        try:
            item = find_indicator(data, indicator_id)
        except Exception:
            continue
        if item.get("signal") not in ("source-error", "manual-required") and is_number(item.get("score")):
            score += item.get("score")
        details.append(f"{indicator_id}: {item.get('currentValue')}")
    status = axis_status_from_score(score)
    if "employment" in data.get("axisSummary", {}):
        data["axisSummary"]["employment"].update({
            "status": status,
            "score": score,
            "leadingStatus": axis_status_from_score(sum(find_indicator(data, i).get("score", 0) if is_number(find_indicator(data, i).get("score")) else 0 for i in ["initial_claims", "ism_manufacturing_pmi"] if find_indicator(data, i).get("signal") not in ("source-error", "manual-required"))),
            "coincidentStatus": axis_status_from_score(sum(find_indicator(data, i).get("score", 0) if is_number(find_indicator(data, i).get("score")) else 0 for i in ["nonfarm_payrolls", "average_hourly_earnings"] if find_indicator(data, i).get("signal") not in ("source-error", "manual-required"))),
            "laggingStatus": find_indicator(data, "unemployment_rate").get("signal", "neutral"),
            "summary": " / ".join(details),
            "interpretation": "고용·경기 사이클 축은 신규 실업수당, 실업률, NFP, 임금, ISM 제조업 PMI를 함께 봅니다.",
            "action": "신규 실업수당과 ISM이 동시에 악화되면 경기 둔화 시나리오를 높이고, NFP와 임금은 동행 확인 신호로 봅니다.",
        })
    if "employment" in data.get("matrix", {}):
        data["matrix"]["employment"].update({
            "leading": data["axisSummary"]["employment"].get("leadingStatus", "neutral"),
            "coincident": data["axisSummary"]["employment"].get("coincidentStatus", "neutral"),
            "lagging": find_indicator(data, "unemployment_rate").get("signal", "neutral"),
        })


def update_newly_automated_indicators(data):
    print("[new-auto] update credit card delinquency", flush=True)
    # Credit-card delinquency update already exists; run it again so it is no longer left as manual-required.
    update_credit_card_delinquency(data)

    print("[new-auto] update ISM Manufacturing PMI", flush=True)
    update_ism_manufacturing_pmi(data)
    update_employment_summary_with_ism(data)

    print("[new-auto] update FactSet EPS / Revenue beat rates", flush=True)
    update_eps_beat_rate(data)
    update_revenue_beat_rate(data)
    update_earnings_summary(data)


def update_unautomated_manual_notes(data):
    """Mark structurally manual indicators clearly.

    M7 가이던스, 컨센서스 리비전, pricing power 멘트, Fear & Greed Index는 안정적인 무료 JSON 소스가 없거나 해석형 데이터입니다.
    이들은 현재 자동화 대상이 아니라 수동 확인 대상으로 명확히 남깁니다.
    """
    manual_ids = [
        "m7_guidance_change",
        "consensus_revision",
        "pricing_power_mentions",
        "fear_greed_index",
    ]
    for indicator_id in manual_ids:
        try:
            item = find_indicator(data, indicator_id)
        except Exception:
            continue
        if item.get("statusNote") in ("auto-updated", "proxy-auto-updated"):
            continue
        item.update({
            "currentValue": item.get("currentValue", "manual-required"),
            "statusNote": "manual-required",
            "signal": item.get("signal", "manual-required"),
            "score": item.get("score", 0) if is_number(item.get("score")) else 0,
            "interpretation": item.get("interpretation") or "이 지표는 원천 데이터의 신뢰성 또는 해석 난이도 때문에 현재 수동 확인 대상으로 남깁니다.",
            "action": item.get("action") or "주간 리서치 루틴에서 직접 확인하고, 추후 안정적인 데이터 소스가 생기면 자동화합니다.",
        })

def update_meta(data):
    now = datetime.now(KST)

    data.setdefault("meta", {})
    data["meta"].update({
        "updatedAt": now.isoformat(timespec="seconds"),
        "week": f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "timezone": "Asia/Seoul",
        "dataStatus": "partial-plus",
        "automationStatus": "full-auto-broad-indicators-history-v1",
        "sourceMode": "mixed",
        "notes": [
            "VIX, VIX 선물 구조, 금리, 고용, 자금흐름 프록시, 소비, 마진, 달러/원자재 주요 지표 자동 업데이트가 실행되었습니다.",
            "이번 버전은 기존 자동화 지표에 더해 실질금리·정책금리·NFP·임금·PPI의 공식 대체 소스를 보강하고, ETF 흐름 프록시는 가격 변화율로 표시합니다.",
            "추가 금리 지표: 10Y-2Y 스프레드, 10년 실질금리, Effective Fed Funds Rate.",
            "추가 고용 지표: 비농업 고용자 수 변화, 시간당 평균 임금 YoY.",
            "자금흐름 축은 실제 ETF fund flow가 아니라 SPY/QQQ/IWM/SQQQ 가격 기반 프록시로 먼저 자동화했습니다.",
            "추가 소비 지표: 신용카드 연체율.",
            "마진 축: PPI YoY, 임금 비용 YoY, CPI-PPI 가격전가 프록시.",
            "추가 원자재 지표: 금 가격 프록시.",
            "EPS/Revenue Beat Rate, ISM Manufacturing PMI, 신용카드 연체율은 자동화 대상으로 전환했습니다. M7 가이던스, 컨센서스 리비전, pricing power 멘트, Fear & Greed Index는 현재 수동 확인 대상으로 남깁니다.",
            "성공 시 auto-updated, 프록시 성공 시 proxy-auto-updated, 모든 소스 실패 시 source-error로 표시됩니다. 단, 직전 정상 숫자가 있으면 일시적 소스 실패가 나도 currentValue 숫자는 보존합니다.",
            "VIX 선물 구조는 ^VW1VX/^VW2VX 또는 ^VFTW1/^VFTW2로 계산하며, (VX2 - VX1) / VX1 × 100이 양수면 콘탱고, 음수면 백워데이션으로 표시합니다.",
        ],
    })


def safe_signal_status(value):
    if value in {"positive", "neutral", "negative", "warning", "manual-required", "manual-updated", "source-error", "auto-pending"}:
        return value
    return "neutral"


def compute_history_axis_counts(data):
    axis_summary = data.get("axisSummary", {}) or {}
    counts = {
        "positive": 0,
        "neutral": 0,
        "negative": 0,
        "warning": 0,
        "manual": 0,
        "total": 0,
    }

    for axis_id, axis in axis_summary.items():
        status = axis.get("status", "neutral")
        counts["total"] += 1
        if status == "positive":
            counts["positive"] += 1
        elif status == "negative":
            counts["negative"] += 1
        elif status == "warning":
            counts["warning"] += 1
        elif status in {"manual-required", "manual-updated", "source-error", "auto-pending"}:
            counts["manual"] += 1
        else:
            counts["neutral"] += 1

    return counts


def compute_history_regime(axis_counts):
    positive = axis_counts.get("positive", 0)
    negative = axis_counts.get("negative", 0) + axis_counts.get("warning", 0)

    if positive >= 4 and negative <= 2:
        return {
            "marketRegime": "위험자산 우호 / 강세 가능성",
            "riskMode": "positive",
            "actionBias": "우위 섹터 중심 분할 진입",
            "cashGuide": "현금 20~30% 유지. 단, 과열 신호가 커지면 추격 매수 제한.",
        }

    if negative >= 4:
        return {
            "marketRegime": "방어 우선 / 약세 가능성",
            "riskMode": "negative",
            "actionBias": "비중 축소 + 현금 방어",
            "cashGuide": "현금 45~60% 이상 검토. 신규 진입은 상대강도 높은 섹터로 제한.",
        }

    return {
        "marketRegime": "혼조 / 변동성 장세",
        "riskMode": "neutral",
        "actionBias": "선별 진입 + 현금 유지",
        "cashGuide": "현금 30~45% 유지. 긍정 축과 부정 축이 충돌하므로 분할 대응.",
    }


def indicator_snapshot(item):
    return {
        "id": item.get("id", "unknown"),
        "name": item.get("name", item.get("id", "unknown")),
        "axis": item.get("axis", "unknown"),
        "axisName": item.get("axisName", item.get("axis", "unknown")),
        "timing": item.get("timing", "unknown"),
        "currentValue": item.get("currentValue"),
        "unit": item.get("unit", ""),
        "signal": item.get("signal", "neutral"),
        "score": item.get("score", 0),
        "statusNote": item.get("statusNote", "unknown"),
        "sourceSeries": item.get("sourceSeries", "unknown"),
    }


def build_history_snapshot(data):
    now = datetime.now(KST)
    meta = data.get("meta", {}) or {}
    axis_counts = compute_history_axis_counts(data)
    regime = compute_history_regime(axis_counts)

    key_ids = [
        "vix",
        "vix_futures_structure",
        "us_2y_yield",
        "us_10y_yield",
        "ten_two_spread",
        "real_10y_yield",
        "fed_funds_rate",
        "initial_claims",
        "unemployment_rate",
        "nonfarm_payrolls",
        "average_hourly_earnings",
        "ism_manufacturing_pmi",
        "retail_sales_yoy",
        "cpi_yoy",
        "real_retail_sales_proxy",
        "credit_card_delinquency",
        "dollar_index_proxy",
        "wti_oil",
        "copper_price",
        "gold_price_proxy",
        "ppi_yoy",
        "wage_cost_yoy",
        "cpi_ppi_pass_through",
        "spy_flow_proxy",
        "qqq_flow_proxy",
        "iwm_flow_proxy",
        "sqqq_flow_proxy",
        "eps_beat_rate",
        "revenue_beat_rate",
    ]

    indicator_map = {item.get("id"): item for item in data.get("indicators", [])}
    key_indicators = [indicator_snapshot(indicator_map[indicator_id]) for indicator_id in key_ids if indicator_id in indicator_map]

    return {
        "snapshotId": now.strftime("%Y%m%d-%H%M%S-KST"),
        "date": now.date().isoformat(),
        "week": meta.get("week") or f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "updatedAt": meta.get("updatedAt") or now.isoformat(timespec="seconds"),
        "automationStatus": meta.get("automationStatus", "unknown"),
        "axisCounts": axis_counts,
        "marketRegime": regime["marketRegime"],
        "riskMode": regime["riskMode"],
        "actionBias": regime["actionBias"],
        "cashGuide": regime["cashGuide"],
        "axisSummary": data.get("axisSummary", {}),
        "keyIndicators": key_indicators,
    }


def load_history():
    if not HISTORY_PATH.exists():
        return {
            "schemaVersion": "1.0.0",
            "meta": {
                "createdAt": datetime.now(KST).isoformat(timespec="seconds"),
                "timezone": "Asia/Seoul",
                "maxSnapshots": HISTORY_MAX_SNAPSHOTS,
                "mode": "append-snapshot",
            },
            "snapshots": [],
        }

    try:
        with HISTORY_PATH.open("r", encoding="utf-8") as file:
            history = json.load(file)
    except Exception as exc:
        print(f"[history] existing history.json could not be parsed, recreating: {exc}", flush=True)
        history = {"schemaVersion": "1.0.0", "meta": {}, "snapshots": []}

    if not isinstance(history, dict):
        history = {"schemaVersion": "1.0.0", "meta": {}, "snapshots": []}

    history.setdefault("schemaVersion", "1.0.0")
    history.setdefault("meta", {})
    history.setdefault("snapshots", [])
    if not isinstance(history["snapshots"], list):
        history["snapshots"] = []

    return history


def save_history(history):
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    HISTORY_PATH.write_text(
        json.dumps(history, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def update_history(data):
    history = load_history()
    snapshot = build_history_snapshot(data)

    snapshots = history.get("snapshots", [])
    snapshots.append(snapshot)

    # 중복 실행으로 같은 updatedAt 스냅샷이 여러 번 생기는 경우 마지막 것만 보존합니다.
    deduped = {}
    order = []
    for item in snapshots:
        key = item.get("updatedAt") or item.get("snapshotId")
        if key not in deduped:
            order.append(key)
        deduped[key] = item

    snapshots = [deduped[key] for key in order][-HISTORY_MAX_SNAPSHOTS:]

    history["snapshots"] = snapshots
    history.setdefault("meta", {})
    history["meta"].update({
        "updatedAt": datetime.now(KST).isoformat(timespec="seconds"),
        "timezone": "Asia/Seoul",
        "maxSnapshots": HISTORY_MAX_SNAPSHOTS,
        "snapshotCount": len(snapshots),
        "latestSnapshotId": snapshot["snapshotId"],
        "mode": "append-snapshot",
        "notes": "각 자동 업데이트 실행 후 8축 스코어와 핵심 지표 스냅샷을 누적합니다.",
    })

    save_history(history)
    print(f"[history] appended snapshot {snapshot['snapshotId']} / total {len(snapshots)}", flush=True)

def assert_no_null(value, path="root"):
    if value is None:
        raise ValueError(f"{path} 값이 null입니다.")

    if isinstance(value, dict):
        for key, child in value.items():
            assert_no_null(child, f"{path}.{key}")

    elif isinstance(value, list):
        for index, child in enumerate(value):
            assert_no_null(child, f"{path}[{index}]")


def main():
    print("[start] broad stable-source auto indicator update", flush=True)

    data = load_data()

    print("[check] latest.json loaded", flush=True)
    print(f"[check] schemaVersion = {data.get('schemaVersion')}", flush=True)
    print(f"[check] indicator count = {len(data.get('indicators', []))}", flush=True)

    update_vix(data)
    update_vix_futures_structure(data)
    update_rates(data)
    update_employment(data)
    update_dollar_commodities(data)
    update_consumption(data)

    update_all_remaining_auto_indicators(data)
    update_newly_automated_indicators(data)
    update_unautomated_manual_notes(data)
    update_meta(data)

    assert_no_null(data)

    save_data(data)
    update_history(data)

    print("[done] broad stable-source auto indicator update completed", flush=True)
    print("[done] latest.json should contain full-auto-broad-indicators-history-v1", flush=True)


if __name__ == "__main__":
    main()
