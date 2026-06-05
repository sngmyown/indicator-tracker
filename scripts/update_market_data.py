import csv
import json
import urllib.request
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")
FRED_VIX_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS"
CNN_FEAR_GREED_URLS = [
    "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
    "https://production.dataviz.cnn.io/index/fearandgreed/graphdata/2020-09-18"
]

def fetch_text(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json,text/csv,text/plain,*/*"})
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read().decode("utf-8")

def fetch_vix():
    reader = csv.DictReader(StringIO(fetch_text(FRED_VIX_CSV_URL)))
    values = []
    for row in reader:
        raw_date = row.get("observation_date")
        raw_value = row.get("VIXCLS")
        if not raw_date or not raw_value:
            continue
        raw_value = raw_value.strip()
        if raw_value == ".":
            continue
        values.append({"date": raw_date, "value": round(float(raw_value), 2)})
    if len(values) < 2:
        raise ValueError("VIX 유효 데이터가 2개 미만입니다.")
    return values[-1], values[-2]

def first_number(*values):
    for value in values:
        if isinstance(value, (int, float)):
            return round(float(value), 2)
        if isinstance(value, str):
            value = value.strip()
            if not value:
                continue
            try:
                return round(float(value), 2)
            except ValueError:
                continue
    return None

def parse_timestamp_to_date(raw_timestamp):
    if raw_timestamp is None:
        return None
    if isinstance(raw_timestamp, (int, float)):
        timestamp = float(raw_timestamp)
        if timestamp > 1_000_000_000_000:
            timestamp /= 1000
        return datetime.fromtimestamp(timestamp, timezone.utc).date().isoformat()
    if isinstance(raw_timestamp, str):
        text = raw_timestamp.strip()
        if not text:
            return None
        if text.isdigit():
            timestamp = float(text)
            if timestamp > 1_000_000_000_000:
                timestamp /= 1000
            return datetime.fromtimestamp(timestamp, timezone.utc).date().isoformat()
        return text[:10]
    return None

def fetch_fear_greed():
    last_error = None
    for url in CNN_FEAR_GREED_URLS:
        try:
            payload = json.loads(fetch_text(url))
            fg = payload.get("fear_and_greed", {})
            hist = payload.get("fear_and_greed_historical", {})
            hist_data = hist.get("data", []) if isinstance(hist, dict) else []
            actual = first_number(fg.get("score"), fg.get("value"), fg.get("y"))
            actual_date = parse_timestamp_to_date(fg.get("timestamp") or fg.get("time") or fg.get("date"))
            previous = first_number(fg.get("previous_close"), fg.get("previousClose"), fg.get("previous"))
            if previous is None and len(hist_data) >= 2:
                previous = first_number(hist_data[-2].get("y"), hist_data[-2].get("score"), hist_data[-2].get("value"))
            if actual_date is None and hist_data:
                actual_date = parse_timestamp_to_date(hist_data[-1].get("x") or hist_data[-1].get("timestamp") or hist_data[-1].get("date"))
            if actual is None:
                raise ValueError("Fear & Greed actual 값을 찾지 못했습니다.")
            return {"actual": actual, "previous": previous, "actualDate": actual_date, "sourceUrl": url}
        except Exception as error:
            last_error = error
    raise RuntimeError(f"Fear & Greed 데이터를 가져오지 못했습니다: {last_error}")

def get_vix_signal(vix):
    if vix <= 10:
        return "slightly_negative"
    if vix <= 20:
        return "positive"
    if vix < 30:
        return "neutral"
    return "negative"

def get_fear_greed_signal(score):
    if score <= 24:
        return "negative"
    if score <= 44:
        return "slightly_negative"
    if score <= 55:
        return "neutral"
    if score <= 75:
        return "positive"
    return "slightly_negative"

def get_axis_status(vix_signal, fg_signal):
    if vix_signal == "negative":
        return "negative"
    if vix_signal == "positive" and fg_signal == "positive":
        return "positive"
    if vix_signal in {"negative", "slightly_negative"} and fg_signal in {"negative", "slightly_negative"}:
        return "negative"
    return "neutral"

def get_fear_greed_label(score):
    if score <= 24:
        return "Extreme Fear"
    if score <= 44:
        return "Fear"
    if score <= 55:
        return "Neutral"
    if score <= 75:
        return "Greed"
    return "Extreme Greed"

def get_vix_interpretation(actual, previous):
    change = round(actual - previous, 2)
    if actual <= 10:
        level = "VIX가 10 이하입니다. 시장은 매우 안정적으로 보이지만 단기 과열 가능성도 함께 점검해야 합니다."
    elif actual <= 20:
        level = "VIX가 정상 범위에 있습니다. 변동성 축은 스윙 매매에 비교적 우호적인 상태입니다."
    elif actual < 30:
        level = "VIX가 20을 넘었습니다. 시장 긴장도가 올라온 상태이므로 포지션 크기와 손절 기준을 더 엄격히 봐야 합니다."
    else:
        level = "VIX가 30 이상입니다. 공포 구간이므로 신규 진입보다 리스크 관리와 현금 비중을 우선해야 합니다."
    if change > 1:
        return level + f" 전일 대비 {change}포인트 상승해 단기 긴장도가 높아졌습니다."
    if change < -1:
        return level + f" 전일 대비 {abs(change)}포인트 하락해 공포가 완화되었습니다."
    return level + " 전일 대비 변화는 크지 않습니다."

def get_fear_greed_interpretation(actual, previous):
    label = get_fear_greed_label(actual)
    level = f"Fear & Greed Index는 {actual}로 {label} 구간입니다."
    if actual <= 24:
        regime = " 시장 심리는 극단적 공포에 가깝습니다. 단기적으로는 방어가 우선이지만, 매도 압력 소진 여부를 함께 확인해야 합니다."
    elif actual <= 44:
        regime = " 시장 심리는 공포 쪽에 있습니다. 신규 진입은 가능하더라도 포지션 크기를 낮추고 확인 신호를 더 요구하는 편이 적절합니다."
    elif actual <= 55:
        regime = " 시장 심리는 중립권입니다. VIX, 금리, 자금 흐름과 함께 종합 판단해야 합니다."
    elif actual <= 75:
        regime = " 시장 심리는 탐욕 쪽에 있습니다. 리스크온 환경일 수 있지만, 추격 매수와 과열 신호를 경계해야 합니다."
    else:
        regime = " 시장 심리는 극단적 탐욕에 가깝습니다. 상승 추세가 강해도 신규 진입 손익비와 조정 위험을 엄격히 봐야 합니다."
    if previous is None:
        return level + regime
    change = round(actual - previous, 2)
    if change > 3:
        return level + regime + f" 이전치 대비 {change}포인트 상승해 위험 선호가 강화됐습니다."
    if change < -3:
        return level + regime + f" 이전치 대비 {abs(change)}포인트 하락해 위험 회피 심리가 강해졌습니다."
    return level + regime + " 이전치 대비 변화는 크지 않습니다."

def find_or_create_volatility_axis(data):
    axes = data.setdefault("axes", [])
    for axis in axes:
        if axis.get("id") == "volatility":
            return axis
    axis = {"id": "volatility", "name": "변동성 / VIX", "status": "neutral", "summary": "VIX와 Fear & Greed Index를 함께 확인합니다.", "indicators": []}
    axes.append(axis)
    return axis

def replace_indicator(axis, indicator_name, indicator):
    axis["indicators"] = [item for item in axis.setdefault("indicators", []) if item.get("name", "").strip().lower() != indicator_name.strip().lower()]
    axis["indicators"].append(indicator)

def count_axes(axes, status):
    return sum(1 for axis in axes if axis.get("status") == status)

def determine_risk_mode(positive, neutral, negative):
    if negative >= 5:
        return "risk-off"
    if positive >= 5:
        return "risk-on"
    return "neutral"

def update_market_summary(data):
    axes = data.get("axes", [])
    positive = count_axes(axes, "positive")
    neutral = count_axes(axes, "neutral")
    negative = count_axes(axes, "negative")
    data["marketSummary"] = {"riskMode": determine_risk_mode(positive, neutral, negative), "positiveAxes": positive, "neutralAxes": neutral, "negativeAxes": negative}

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError("data/latest.json 파일을 찾지 못했습니다.")
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    latest_vix, previous_vix = fetch_vix()
    fear_greed = fetch_fear_greed()
    vix_actual = latest_vix["value"]
    vix_previous = previous_vix["value"]
    vix_signal = get_vix_signal(vix_actual)
    fg_actual = fear_greed["actual"]
    fg_previous = fear_greed["previous"]
    fg_signal = get_fear_greed_signal(fg_actual)
    vol = find_or_create_volatility_axis(data)
    vol["status"] = get_axis_status(vix_signal, fg_signal)
    vol["summary"] = f"VIX 최신값은 {vix_actual}, Fear & Greed Index 최신값은 {fg_actual}입니다."
    vix_indicator = {"name": "VIX", "expectedChecked": False, "previous": vix_previous, "actual": vix_actual, "actualDate": latest_vix["date"], "marketReaction": "이번 단계에서는 VIX와 Fear & Greed 값을 자동 반영합니다. S&P 500, Nasdaq, 10년물 금리 반응은 다음 확장 단계에서 연결합니다.", "interpretation": get_vix_interpretation(vix_actual, vix_previous), "signal": vix_signal, "source": "FRED VIXCLS"}
    fg_indicator = {"name": "Fear & Greed Index", "expectedChecked": False, "previous": fg_previous, "actual": fg_actual, "actualDate": fear_greed["actualDate"], "marketReaction": "이번 단계에서는 Fear & Greed 값만 자동 반영합니다. 주요 지수와 금리의 시장 반응 연결은 다음 확장 단계에서 처리합니다.", "interpretation": get_fear_greed_interpretation(fg_actual, fg_previous), "signal": fg_signal, "source": "CNN Fear & Greed Index"}
    replace_indicator(vol, "VIX", vix_indicator)
    replace_indicator(vol, "Fear & Greed Index", fg_indicator)
    if vix_indicator["actual"] is None:
        raise ValueError("VIX actual 값이 None입니다.")
    if fg_indicator["actual"] is None:
        raise ValueError("Fear & Greed actual 값이 None입니다.")
    now = datetime.now(KST)
    data["week"] = f"{now.isocalendar().year}-W{now.isocalendar().week:02d}"
    data["updatedAt"] = now.isoformat(timespec="seconds")
    data["freshnessStatus"] = "vix-fear-greed-auto-update-ok"
    data["automation"] = {"lastRunAt": now.isoformat(timespec="seconds"), "stage": "vix-fear-greed-auto-update", "note": "VIX와 Fear & Greed Index 자동 업데이트 완료."}
    update_market_summary(data)
    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("VIX and Fear & Greed update completed")
    print(json.dumps(vix_indicator, ensure_ascii=False, indent=2))
    print(json.dumps(fg_indicator, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
