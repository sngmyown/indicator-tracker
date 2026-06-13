import csv
import json
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
KST = ZoneInfo("Asia/Seoul")

FRED_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv?id="
YAHOO_VIX_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?range=1mo&interval=1d"
STOOQ_VIX_URL = "https://stooq.com/q/d/l/?s=%5Evix&i=d"
TREASURY_YIELD_CURVE_BASE = "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml"


def fred_url(series_id):
    return FRED_BASE + series_id


def treasury_yield_curve_url(month_yyyymm):
    query = urllib.parse.urlencode({
        "data": "daily_treasury_yield_curve",
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


def fetch_fred_vix():
    return fetch_fred_series("VIXCLS")


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

        rows.append({
            "date": date[:10],
            "BC_2YEAR": row.get("BC_2YEAR"),
            "BC_10YEAR": row.get("BC_10YEAR"),
        })

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


def axis_status_from_score(score):
    if score > 0:
        return "positive"
    if score < 0:
        return "negative"
    return "neutral"


def mark_source_error(item, today, error_message):
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


def update_meta(data):
    now = datetime.now(KST)

    data.setdefault("meta", {})
    data["meta"].update({
        "updatedAt": now.isoformat(timespec="seconds"),
        "week": f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "timezone": "Asia/Seoul",
        "dataStatus": "partial",
        "automationStatus": "vix-rates-update-v1",
        "sourceMode": "mixed",
        "notes": [
            "VIX fallback 자동 업데이트와 금리 2개 지표 자동 업데이트가 실행되었습니다.",
            "VIX는 FRED, Yahoo Finance, Stooq 순서로 시도합니다.",
            "2년물/10년물 금리는 FRED, U.S. Treasury XML Feed 순서로 시도합니다.",
            "성공 시 auto-updated, 모든 소스 실패 시 source-error로 표시됩니다.",
            "나머지 지표는 다음 단계에서 순차적으로 자동화합니다.",
        ],
    })


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
    print("[start] VIX + rates safe auto update", flush=True)

    data = load_data()

    print("[check] latest.json loaded", flush=True)
    print(f"[check] schemaVersion = {data.get('schemaVersion')}", flush=True)
    print(f"[check] indicator count = {len(data.get('indicators', []))}", flush=True)

    update_vix(data)
    update_rates(data)
    update_meta(data)

    assert_no_null(data)

    save_data(data)

    print("[done] VIX + rates safe auto update completed", flush=True)
    print("[done] latest.json should contain auto-updated or source-error", flush=True)


if __name__ == "__main__":
    main()
