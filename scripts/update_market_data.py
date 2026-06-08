import csv
import json
import urllib.request
from datetime import datetime
from io import StringIO
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")
FRED_VIX_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS"

AXES_TEMPLATE = [
    ("rates", "금리 / 유동성"),
    ("earnings", "기업 실적 / 가이던스"),
    ("flows", "자금 흐름"),
    ("employment", "고용"),
    ("consumption", "소비 / 수요"),
    ("margins", "기업 마진 구조"),
    ("dollar-commodities", "달러 / 원자재"),
    ("volatility", "변동성 / VIX")
]


def fetch_text(url):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/csv,text/plain,*/*"
        }
    )

    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read().decode("utf-8")


def fetch_vix():
    csv_text = fetch_text(FRED_VIX_CSV_URL)
    reader = csv.DictReader(StringIO(csv_text))
    values = []

    for row in reader:
        raw_date = row.get("observation_date")
        raw_value = row.get("VIXCLS")

        if not raw_date or not raw_value:
            continue

        raw_value = raw_value.strip()

        if raw_value == ".":
            continue

        values.append({
            "date": raw_date,
            "value": round(float(raw_value), 2)
        })

    if len(values) < 2:
        raise ValueError("FRED VIXCLS에서 유효한 VIX 데이터가 2개 미만입니다.")

    return values[-1], values[-2]


def get_vix_signal(vix):
    if vix <= 10:
        return "warning-low-volatility"
    if vix <= 20:
        return "positive"
    if vix < 30:
        return "neutral"
    return "negative"


def get_axis_status(signal):
    if signal == "positive":
        return "positive"
    if signal == "negative":
        return "negative"
    return "neutral"


def get_vix_interpretation(actual, previous):
    change = round(actual - previous, 2)

    if actual <= 10:
        level_text = "VIX가 10 이하입니다. 시장은 매우 안정적으로 보이지만, 과도한 안도감과 단기 과열 가능성도 함께 점검해야 합니다."
    elif actual <= 20:
        level_text = "VIX가 정상 범위에 있습니다. 변동성 축은 스윙 매매에 비교적 우호적인 상태입니다."
    elif actual < 30:
        level_text = "VIX가 20을 넘었습니다. 시장 긴장도가 올라온 상태이므로 포지션 크기와 손절 기준을 더 엄격히 봐야 합니다."
    else:
        level_text = "VIX가 30 이상입니다. 공포 구간이므로 신규 진입보다 리스크 관리와 현금 비중을 우선해야 합니다."

    if change > 1:
        change_text = f" 전일 대비 {change}포인트 상승해 단기 긴장도가 높아졌습니다."
    elif change < -1:
        change_text = f" 전일 대비 {abs(change)}포인트 하락해 공포가 완화되었습니다."
    else:
        change_text = " 전일 대비 변화는 크지 않습니다."

    return level_text + change_text


def build_base_data():
    return {
        "week": "manual-init",
        "updatedAt": "pending-auto-update",
        "freshnessStatus": "pending-auto-update",
        "marketSummary": {
            "riskMode": "neutral",
            "positiveAxes": 0,
            "neutralAxes": 8,
            "negativeAxes": 0
        },
        "axes": [
            {
                "id": axis_id,
                "name": axis_name,
                "status": "neutral",
                "summary": "초기 데이터입니다." if axis_id != "volatility" else "VIX 자동 업데이트 대기 중입니다.",
                "indicators": []
            }
            for axis_id, axis_name in AXES_TEMPLATE
        ],
        "todo": {
            "title": "금요일 / 토요일 직접 운용 To do list",
            "items": [
                "이번 주 8축 중 긍정 / 중립 / 부정 축 분류",
                "부정 축이 5개 이상이면 현금 확보 검토",
                "현재 시장 시나리오 선택",
                "포트폴리오 비중 점검",
                "다음 주 종목 발굴 프롬프트 실행 여부 결정",
                "이번 주 원칙 위반 여부 점검"
            ]
        }
    }


def load_data():
    if not DATA_PATH.exists():
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        return build_base_data()

    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("data/latest.json JSON 형식이 깨져 있습니다.") from exc

    if not isinstance(data, dict):
        return build_base_data()

    return normalize_base_data(data)


def normalize_base_data(data):
    base = build_base_data()

    data.setdefault("week", base["week"])
    data.setdefault("updatedAt", base["updatedAt"])
    data.setdefault("freshnessStatus", base["freshnessStatus"])
    data.setdefault("marketSummary", base["marketSummary"])
    data.setdefault("todo", base["todo"])

    existing_axes = {
        axis.get("id"): axis
        for axis in data.get("axes", [])
        if isinstance(axis, dict) and axis.get("id")
    }

    normalized_axes = []

    for axis_id, axis_name in AXES_TEMPLATE:
        existing = existing_axes.get(axis_id, {})
        normalized_axes.append({
            "id": axis_id,
            "name": existing.get("name") or axis_name,
            "status": existing.get("status") or "neutral",
            "summary": existing.get("summary") or ("VIX 자동 업데이트 대기 중입니다." if axis_id == "volatility" else "초기 데이터입니다."),
            "indicators": existing.get("indicators") if isinstance(existing.get("indicators"), list) else []
        })

    data["axes"] = normalized_axes
    return data


def find_axis(data, axis_id):
    for axis in data["axes"]:
        if axis["id"] == axis_id:
            return axis

    raise ValueError(f"{axis_id} 축을 찾지 못했습니다.")


def replace_indicator(axis, indicator_name, indicator):
    cleaned = [
        item for item in axis.get("indicators", [])
        if item.get("name", "").strip().lower() != indicator_name.strip().lower()
    ]

    cleaned.insert(0, indicator)
    axis["indicators"] = cleaned


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

    data["marketSummary"] = {
        "riskMode": determine_risk_mode(positive, neutral, negative),
        "positiveAxes": positive,
        "neutralAxes": neutral,
        "negativeAxes": negative
    }


def assert_vix_indicator(indicator):
    required_keys = [
        "name",
        "expectedChecked",
        "previous",
        "actual",
        "actualDate",
        "marketReaction",
        "interpretation",
        "signal",
        "status",
        "source",
        "sourceSeries",
        "sourceUrl"
    ]

    for key in required_keys:
        if key not in indicator:
            raise ValueError(f"VIX indicator에 {key} 키가 없습니다.")

    if not isinstance(indicator["actual"], (int, float)):
        raise ValueError("VIX actual 값이 숫자가 아닙니다.")

    if not isinstance(indicator["previous"], (int, float)):
        raise ValueError("VIX previous 값이 숫자가 아닙니다.")

    if indicator["source"] != "FRED":
        raise ValueError("VIX source가 FRED가 아닙니다.")

    if indicator["sourceSeries"] != "VIXCLS":
        raise ValueError("VIX sourceSeries가 VIXCLS가 아닙니다.")

    if indicator["status"] not in {"positive", "neutral", "negative", "warning-low-volatility"}:
        raise ValueError("VIX status 값이 허용 범위를 벗어났습니다.")

    for key, value in indicator.items():
        if value is None:
            raise ValueError(f"VIX indicator의 {key} 값이 null입니다.")


def main():
    data = load_data()

    latest_vix, previous_vix = fetch_vix()

    actual = latest_vix["value"]
    previous = previous_vix["value"]
    signal = get_vix_signal(actual)
    axis_status = get_axis_status(signal)

    vix_indicator = {
        "name": "VIX",
        "expectedChecked": False,
        "previous": previous,
        "actual": actual,
        "actualDate": latest_vix["date"],
        "marketReaction": "이번 단계에서는 VIX 값만 자동 반영합니다. S&P 500, Nasdaq, 10년물 금리 반응은 다음 확장 단계에서 연결합니다.",
        "interpretation": get_vix_interpretation(actual, previous),
        "signal": signal,
        "status": signal,
        "source": "FRED",
        "sourceSeries": "VIXCLS",
        "sourceUrl": FRED_VIX_CSV_URL
    }

    assert_vix_indicator(vix_indicator)

    volatility_axis = find_axis(data, "volatility")
    volatility_axis["status"] = axis_status
    volatility_axis["summary"] = f"VIX 최신값은 {actual}입니다. 데이터 출처는 FRED VIXCLS입니다."
    replace_indicator(volatility_axis, "VIX", vix_indicator)

    now = datetime.now(KST)

    data["week"] = f"{now.isocalendar().year}-W{now.isocalendar().week:02d}"
    data["updatedAt"] = now.isoformat(timespec="seconds")
    data["freshnessStatus"] = "vix-auto-update-ok"
    data["automation"] = {
        "lastRunAt": now.isoformat(timespec="seconds"),
        "stage": "vix-auto-update",
        "note": "VIX 자동 업데이트 완료. null/manual VIX 값은 허용하지 않습니다."
    }

    update_market_summary(data)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print("VIX update completed")
    print(json.dumps(vix_indicator, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
