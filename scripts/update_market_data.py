import csv
import json
import math
import time
import urllib.error
import urllib.request
from datetime import datetime
from io import StringIO
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")
FRED_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv?id="
STOOQ_BASE = "https://stooq.com/q/d/l/?i=d&s="

AXIS_ORDER = [
    "rates",
    "earnings",
    "flows",
    "employment",
    "consumption",
    "margins",
    "dollar-commodities",
    "volatility",
]

AXIS_NAMES = {
    "rates": "금리 / 유동성",
    "earnings": "기업 실적 / 가이던스",
    "flows": "자금 흐름",
    "employment": "고용 / 경기 사이클",
    "consumption": "소비 / 수요",
    "margins": "기업 마진",
    "dollar-commodities": "달러 / 원자재",
    "volatility": "VIX / 변동성",
}

TIMING_KEYS = ["leading", "coincident", "lagging"]

SIGNAL_SCORE = {
    "positive": 1,
    "neutral": 0,
    "negative": -1,
    "warning": 0,
    "manual-required": 0,
    "source-error": 0,
    "not-applicable": 0,
}


def fred_url(series):
    return FRED_BASE + series


def stooq_url(symbol):
    return STOOQ_BASE + symbol.lower()


def fetch_text(url, retries=3, timeout=60):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "text/csv,text/plain,application/json,*/*",
                    "Cache-Control": "no-cache",
                },
            )

            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read().decode("utf-8")

        except (TimeoutError, urllib.error.URLError, urllib.error.HTTPError) as error:
            last_error = error
            print(f"Fetch failed attempt {attempt}/{retries}: {url}")
            print(f"Error: {error}")

            if attempt < retries:
                time.sleep(5 * attempt)

    raise RuntimeError(f"데이터를 가져오지 못했습니다: {url}. 마지막 오류: {last_error}")


def fetch_fred(series, min_count=2):
    text = fetch_text(fred_url(series))
    reader = csv.DictReader(StringIO(text))
    values = []

    for row in reader:
        date = row.get("observation_date")
        raw = row.get(series)

        if not date or raw is None:
            continue

        raw = str(raw).strip()
        if raw in {"", "."}:
            continue

        values.append({"date": date, "value": round(float(raw), 4)})

    if len(values) < min_count:
        raise ValueError(f"FRED {series} 유효 데이터 부족")

    return values


def fetch_stooq(symbol, min_count=8):
    text = fetch_text(stooq_url(symbol))
    reader = csv.DictReader(StringIO(text))
    values = []

    for row in reader:
        try:
            values.append(
                {
                    "date": row["Date"],
                    "close": round(float(row["Close"]), 4),
                    "volume": float(row.get("Volume") or 0),
                }
            )
        except (KeyError, ValueError):
            continue

    if len(values) < min_count:
        raise ValueError(f"Stooq {symbol} 유효 데이터 부족")

    return values


def pct_change(now, prev):
    if prev in [0, "0", None]:
        return "not-available"
    return round((float(now) - float(prev)) / abs(float(prev)) * 100, 2)


def delta(now, prev):
    return round(float(now) - float(prev), 4)


def yoy_pair(values, periods=12):
    if len(values) <= periods + 1:
        raise ValueError("YoY 계산에 필요한 데이터가 부족합니다.")

    current = values[-1]
    current_base = values[-1 - periods]
    previous = values[-2]
    previous_base = values[-2 - periods]

    current_yoy = pct_change(current["value"], current_base["value"])
    previous_yoy = pct_change(previous["value"], previous_base["value"])

    return {
        "date": current["date"],
        "current": current_yoy,
        "previous": previous_yoy,
        "change": round(current_yoy - previous_yoy, 4),
        "changePercent": pct_change(current_yoy, previous_yoy) if previous_yoy != 0 else "not-available",
    }


def clean(value):
    if value is None:
        return "not-available"
    if isinstance(value, float) and math.isnan(value):
        return "not-available"
    return value


def assert_no_null(value, path="root"):
    if value is None:
        raise ValueError(f"{path} 값이 null입니다.")

    if isinstance(value, dict):
        for key, child in value.items():
            assert_no_null(child, f"{path}.{key}")

    elif isinstance(value, list):
        for index, child in enumerate(value):
            assert_no_null(child, f"{path}[{index}]")


def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError("data/latest.json 파일이 없습니다. v1 latest.json을 먼저 업로드하세요.")

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    if data.get("schemaVersion") != "1.0.0":
        raise ValueError("latest.json이 v1 스키마가 아닙니다. schemaVersion을 확인하세요.")

    if not isinstance(data.get("indicators"), list):
        raise ValueError("latest.json에 indicators 배열이 없습니다.")

    return data


def find_indicator(data, indicator_id):
    for item in data["indicators"]:
        if item.get("id") == indicator_id:
            return item
    raise KeyError(f"indicator id를 찾을 수 없습니다: {indicator_id}")


def apply_update(item, *, current, previous, actual_date, direction, signal, change=None, change_percent=None, interpretation=None, market_reaction=None, action=None, source=None, source_series=None, source_url=None, status_note="auto-updated"):
    current = clean(current)
    previous = clean(previous)

    if change is None:
        try:
            change = delta(current, previous)
        except Exception:
            change = "not-available"

    if change_percent is None:
        try:
            change_percent = pct_change(current, previous)
        except Exception:
            change_percent = "not-available"

    item["currentValue"] = current
    item["previousValue"] = previous
    item["actualDate"] = clean(actual_date)
    item["direction"] = clean(direction)
    item["change"] = clean(change)
    item["changePercent"] = clean(change_percent)
    item["signal"] = clean(signal)
    item["score"] = SIGNAL_SCORE.get(signal, 0)
    item["statusNote"] = status_note

    if interpretation is not None:
        item["interpretation"] = interpretation
    if market_reaction is not None:
        item["marketReaction"] = market_reaction
    if action is not None:
        item["action"] = action
    if source is not None:
        item["source"] = source
    if source_series is not None:
        item["sourceSeries"] = source_series
    if source_url is not None:
        item["sourceUrl"] = source_url

    assert_no_null(item)


def mark_source_error(item, error):
    today = datetime.now(KST).date().isoformat()
    item["currentValue"] = "source-error"
    item["previousValue"] = "source-error"
    item["actualDate"] = today
    item["direction"] = "not-available"
    item["change"] = "not-available"
    item["changePercent"] = "not-available"
    item["signal"] = "source-error"
    item["score"] = 0
    item["interpretation"] = f"자동 데이터 업데이트 실패: {error}"
    item["marketReaction"] = "데이터 오류 상태이므로 시장 반응 해석을 보류합니다. GitHub Actions 로그를 확인해야 합니다."
    item["action"] = "자동화 오류가 해결될 때까지 이 지표는 수동 확인으로 대체합니다."
    item["statusNote"] = "source-error"
    assert_no_null(item)


def direction_from_values(current, previous, flat_threshold=0.01):
    try:
        diff = float(current) - float(previous)
    except Exception:
        return "not-available"

    if abs(diff) <= flat_threshold:
        return "flat"
    return "up" if diff > 0 else "down"


def signal_yield(current, previous, high_level=4.75, low_level=4.0):
    diff = float(current) - float(previous)
    if current >= high_level or diff >= 0.15:
        return "negative"
    if current <= low_level or diff <= -0.10:
        return "positive"
    return "neutral"


def update_fred_level(data, indicator_id, series, signal_func, interpretation_func):
    item = find_indicator(data, indicator_id)

    try:
        values = fetch_fred(series)
        current = values[-1]
        previous = values[-2]
        current_value = current["value"]
        previous_value = previous["value"]
        signal = signal_func(current_value, previous_value)
        direction = direction_from_values(current_value, previous_value)
        interpretation = interpretation_func(current_value, previous_value, signal)

        apply_update(
            item,
            current=current_value,
            previous=previous_value,
            actual_date=current["date"],
            direction=direction,
            signal=signal,
            interpretation=interpretation,
            source="FRED",
            source_series=series,
            source_url=fred_url(series),
        )

    except Exception as error:
        mark_source_error(item, error)


def update_fred_yoy(data, indicator_id, series, signal_func, interpretation_func):
    item = find_indicator(data, indicator_id)

    try:
        values = fetch_fred(series, min_count=14)
        pair = yoy_pair(values)
        current_value = pair["current"]
        previous_value = pair["previous"]
        signal = signal_func(current_value, previous_value)
        direction = direction_from_values(current_value, previous_value)
        interpretation = interpretation_func(current_value, previous_value, signal)

        apply_update(
            item,
            current=current_value,
            previous=previous_value,
            actual_date=pair["date"],
            direction=direction,
            signal=signal,
            change=pair["change"],
            change_percent=pair["changePercent"],
            interpretation=interpretation,
            source="FRED",
            source_series=series,
            source_url=fred_url(series),
        )

    except Exception as error:
        mark_source_error(item, error)


def update_stooq_return(data, indicator_id, symbol, signal_func, interpretation_func):
    item = find_indicator(data, indicator_id)

    try:
        values = fetch_stooq(symbol, min_count=8)
        latest = values[-1]
        previous = values[-2]
        base = values[-6]
        prev_base = values[-7]

        current_return = pct_change(latest["close"], base["close"])
        previous_return = pct_change(previous["close"], prev_base["close"])
        signal = signal_func(current_return, previous_return)
        direction = direction_from_values(current_return, previous_return)

        recent_volumes = [row["volume"] for row in values[-21:-1] if row["volume"] > 0]
        avg_volume = sum(recent_volumes) / len(recent_volumes) if recent_volumes else latest["volume"]
        volume_ratio = round(latest["volume"] / avg_volume, 2) if avg_volume else "not-available"

        interpretation = interpretation_func(current_return, previous_return, signal, volume_ratio)

        apply_update(
            item,
            current=current_return,
            previous=previous_return,
            actual_date=latest["date"],
            direction=direction,
            signal=signal,
            change=round(current_return - previous_return, 4),
            change_percent=pct_change(current_return, previous_return) if previous_return != 0 else "not-available",
            interpretation=interpretation,
            market_reaction=f"최근 5거래일 수익률은 {current_return}%이고, 거래량은 20거래일 평균 대비 {volume_ratio}배입니다. 실제 ETF fund flow가 아니라 가격/거래량 프록시입니다.",
            source="Stooq",
            source_series=symbol,
            source_url=stooq_url(symbol),
            status_note="proxy-auto-updated",
        )

    except Exception as error:
        mark_source_error(item, error)


def update_all_indicators(data):
    # 1축. 금리 / 유동성
    update_fred_level(
        data,
        "us_2y_yield",
        "DGS2",
        lambda current, previous: signal_yield(current, previous, high_level=4.75, low_level=4.0),
        lambda current, previous, signal: f"미국 2년물 금리는 {current}%입니다. 전값 {previous}% 대비 {round(current - previous, 4)}%p 변화했습니다. 연준 정책 기대 변화의 선행 신호로 해석합니다.",
    )

    update_fred_level(
        data,
        "us_10y_yield",
        "DGS10",
        lambda current, previous: signal_yield(current, previous, high_level=4.75, low_level=4.0),
        lambda current, previous, signal: f"미국 10년물 금리는 {current}%입니다. 장기 할인율이 성장주와 고PER 종목의 멀티플에 주는 부담을 확인해야 합니다.",
    )

    update_fred_level(
        data,
        "real_10y_yield",
        "DFII10",
        lambda current, previous: "negative" if current >= 2.25 else "positive" if current <= 1.5 else "neutral",
        lambda current, previous, signal: f"10년 실질금리는 {current}%입니다. 실질금리 고착은 장기 성장자산의 현재가치에 부담입니다.",
    )

    # 3축. 자금 흐름 프록시
    update_stooq_return(
        data,
        "spy_flow_proxy",
        "spy.us",
        lambda current, previous: "positive" if current > 1 else "negative" if current < -1 else "neutral",
        lambda current, previous, signal, volume_ratio: f"SPY 5거래일 수익률은 {current}%입니다. 대형주 위험선호 흐름의 가격/거래량 프록시로 사용합니다.",
    )

    update_stooq_return(
        data,
        "qqq_flow_proxy",
        "qqq.us",
        lambda current, previous: "positive" if current > 1.5 else "negative" if current < -1.5 else "neutral",
        lambda current, previous, signal, volume_ratio: f"QQQ 5거래일 수익률은 {current}%입니다. 기술주와 AI 내러티브 자금 흐름의 프록시로 해석합니다.",
    )

    # 4축. 고용 / 경기 사이클
    update_fred_level(
        data,
        "initial_claims",
        "ICSA",
        lambda current, previous: "positive" if 200000 <= current <= 250000 else "negative" if current >= 275000 or current - previous >= 25000 else "neutral",
        lambda current, previous, signal: f"주간 신규 실업수당 청구건수는 {int(current):,}건입니다. 고용 둔화가 먼저 나타나는 선행 신호로 봅니다.",
    )

    update_fred_level(
        data,
        "unemployment_rate",
        "UNRATE",
        lambda current, previous: "negative" if current >= 4.5 or current - previous >= 0.3 else "positive" if current <= 4.2 else "neutral",
        lambda current, previous, signal: f"실업률은 {current}%입니다. 후행지표이므로 실업률 자체보다 상승 속도와 신규 실업수당을 함께 봐야 합니다.",
    )

    # 5축. 소비 / 수요
    # Retail Sales는 CPI와 비교해서 실질 소비 프록시로 해석한다.
    retail_item = find_indicator(data, "retail_sales")
    try:
        retail_values = fetch_fred("RSXFS", min_count=14)
        cpi_values = fetch_fred("CPIAUCSL", min_count=14)
        retail = yoy_pair(retail_values)
        cpi = yoy_pair(cpi_values)
        real_gap = round(retail["current"] - cpi["current"], 4)

        if real_gap > 0:
            signal = "positive"
        elif real_gap < -1:
            signal = "negative"
        else:
            signal = "neutral"

        apply_update(
            retail_item,
            current=retail["current"],
            previous=retail["previous"],
            actual_date=retail["date"],
            direction=direction_from_values(retail["current"], retail["previous"]),
            signal=signal,
            change=retail["change"],
            change_percent=retail["changePercent"],
            interpretation=f"소매판매 YoY는 {retail['current']}%, CPI YoY는 {cpi['current']}%입니다. 소매판매-인플레이션 격차는 {real_gap}%p입니다.",
            market_reaction="명목 소비 증가율이 인플레이션을 이기면 기업 매출과 경기민감 소비주에 우호적입니다. 반대로 인플레이션보다 약하면 실질 수요 둔화로 봅니다.",
            source="FRED",
            source_series="RSXFS / CPIAUCSL",
            source_url=f"{fred_url('RSXFS')} | {fred_url('CPIAUCSL')}",
        )
    except Exception as error:
        mark_source_error(retail_item, error)

    update_fred_level(
        data,
        "credit_card_delinquency",
        "DRCCLACBS",
        lambda current, previous: "positive" if current <= 3 else "negative" if current >= 4 or current - previous >= 0.5 else "neutral",
        lambda current, previous, signal: f"신용카드 연체율은 {current}%입니다. 소비 여력과 가계 신용 부담의 후행 확인 지표입니다.",
    )

    # 6축. 기업 마진
    update_fred_yoy(
        data,
        "ppi_yoy",
        "PPIACO",
        lambda current, previous: "positive" if current <= 2.5 else "negative" if current >= 4 else "neutral",
        lambda current, previous, signal: f"PPI YoY는 {current}%입니다. 기업 원가 압박이 완화되는지 또는 재가속되는지 확인합니다.",
    )

    # 7축. 달러 / 원자재
    update_fred_level(
        data,
        "broad_dollar_index",
        "DTWEXBGS",
        lambda current, previous: "negative" if current >= previous * 1.01 else "positive" if current <= previous * 0.99 else "neutral",
        lambda current, previous, signal: f"미국 광의 달러지수는 {current}입니다. 달러 강세는 글로벌 유동성과 원자재, 해외 매출 기업에 부담이 될 수 있습니다.",
    )

    update_fred_level(
        data,
        "wti_oil",
        "DCOILWTICO",
        lambda current, previous: "positive" if 70 <= current <= 85 else "negative" if current >= 100 else "neutral",
        lambda current, previous, signal: f"WTI는 {current}달러입니다. 100달러 이상 급등은 인플레이션과 소비 여력에 부담입니다.",
    )

    update_fred_level(
        data,
        "copper_price",
        "PCOPPUSDM",
        lambda current, previous: "positive" if current > previous else "negative" if current <= previous * 0.97 else "neutral",
        lambda current, previous, signal: f"구리 가격은 {current}입니다. 제조업·건설 경기와 경기민감 수요의 선행 신호로 사용합니다.",
    )

    # 8축. VIX / 변동성
    vix_item = find_indicator(data, "vix")
    vix_change_item = find_indicator(data, "vix_change_rate")
    try:
        values = fetch_fred("VIXCLS")
        current = values[-1]
        previous = values[-2]
        current_value = current["value"]
        previous_value = previous["value"]
        change_percent = pct_change(current_value, previous_value)

        if current_value <= 10:
            signal = "warning"
        elif 10 < current_value <= 20:
            signal = "positive"
        elif current_value >= 30:
            signal = "negative"
        else:
            signal = "neutral"

        apply_update(
            vix_item,
            current=current_value,
            previous=previous_value,
            actual_date=current["date"],
            direction=direction_from_values(current_value, previous_value),
            signal=signal,
            interpretation=f"VIX 최신값은 {current_value}입니다. 10~20은 정상, 20~30은 긴장, 30 이상은 공포 구간으로 봅니다.",
            market_reaction="VIX가 낮고 안정적이면 위험자산에 우호적입니다. 다만 지나치게 낮은 변동성은 방심 구간일 수 있습니다.",
            source="FRED",
            source_series="VIXCLS",
            source_url=fred_url("VIXCLS"),
        )

        if change_percent >= 15:
            change_signal = "negative"
        elif change_percent <= -10:
            change_signal = "positive"
        else:
            change_signal = "neutral"

        apply_update(
            vix_change_item,
            current=change_percent,
            previous=0,
            actual_date=current["date"],
            direction="up" if change_percent > 0 else "down" if change_percent < 0 else "flat",
            signal=change_signal,
            change=change_percent,
            change_percent=change_percent,
            interpretation=f"VIX 하루 변화율은 {change_percent}%입니다. 급등은 공포 확산, 급락은 공포 해소 신호입니다.",
            market_reaction="VIX 변화율 급등은 단기 조정 위험을 키우며, 신규 스윙 진입보다 리스크 관리가 우선입니다.",
            source="FRED",
            source_series="VIXCLS-change",
            source_url=fred_url("VIXCLS"),
        )

    except Exception as error:
        mark_source_error(vix_item, error)
        mark_source_error(vix_change_item, error)


def timing_matches(indicator_timing, timing_key):
    if indicator_timing == timing_key:
        return True
    if indicator_timing == "leading-coincident" and timing_key in ["leading", "coincident"]:
        return True
    if indicator_timing == "coincident-lagging" and timing_key in ["coincident", "lagging"]:
        return True
    return False


def aggregate_status(indicators):
    valid = [item for item in indicators if item.get("signal") not in ["manual-required", "source-error", "not-applicable"]]

    if not valid:
        if any(item.get("signal") == "source-error" for item in indicators):
            return "source-error", 0
        if any(item.get("signal") == "manual-required" for item in indicators):
            return "neutral", 0
        return "not-applicable", 0

    score = sum(SIGNAL_SCORE.get(item.get("signal"), 0) for item in valid)

    if score >= 1:
        return "positive", score
    if score <= -1:
        return "negative", score
    return "neutral", score


def refresh_axis_summary(data):
    indicators = data["indicators"]
    axis_summary = data.get("axisSummary", {})
    matrix = {}

    for axis_id in AXIS_ORDER:
        axis_indicators = [item for item in indicators if item.get("axis") == axis_id]
        axis_status, axis_score = aggregate_status(axis_indicators)

        timing_statuses = {}
        for timing in TIMING_KEYS:
            timing_indicators = [item for item in axis_indicators if timing_matches(item.get("timing"), timing)]
            status, _ = aggregate_status(timing_indicators)
            timing_statuses[timing] = status

        old = axis_summary.get(axis_id, {})
        key_indicators = [item.get("id") for item in axis_indicators[:5]]

        axis_summary[axis_id] = {
            "order": old.get("order", AXIS_ORDER.index(axis_id) + 1),
            "name": old.get("name", AXIS_NAMES[axis_id]),
            "status": axis_status if axis_status != "not-applicable" else "neutral",
            "score": axis_score,
            "leadingStatus": timing_statuses["leading"],
            "coincidentStatus": timing_statuses["coincident"],
            "laggingStatus": timing_statuses["lagging"],
            "summary": build_axis_summary_text(axis_id, axis_status, axis_indicators),
            "interpretation": build_axis_interpretation(axis_id, axis_status),
            "action": build_axis_action(axis_id, axis_status),
            "keyIndicators": key_indicators,
        }

        matrix[axis_id] = {
            "axisName": AXIS_NAMES[axis_id],
            "leading": timing_statuses["leading"],
            "coincident": timing_statuses["coincident"],
            "lagging": timing_statuses["lagging"],
        }

    data["axisSummary"] = axis_summary
    data["matrix"] = matrix


def build_axis_summary_text(axis_id, status, items):
    auto_count = sum(1 for item in items if item.get("statusNote") in ["auto-updated", "proxy-auto-updated"])
    manual_count = sum(1 for item in items if item.get("signal") == "manual-required")
    error_count = sum(1 for item in items if item.get("signal") == "source-error")

    status_text = {
        "positive": "긍정 우위",
        "neutral": "중립",
        "negative": "부정 우위",
        "source-error": "데이터 오류",
    }.get(status, "중립")

    return f"{AXIS_NAMES[axis_id]} 축은 현재 {status_text}입니다. 자동 업데이트 {auto_count}개, 수동 확인 {manual_count}개, 오류 {error_count}개입니다."


def build_axis_interpretation(axis_id, status):
    if axis_id == "rates":
        return "금리 축은 돈의 가격입니다. 금리 하락의 이유가 인플레 안정인지 경기침체 우려인지 구분해야 합니다."
    if axis_id == "earnings":
        return "실적 축은 시장 기대 대비 결과와 가이던스가 핵심입니다. 현재는 수동 확인 지표가 중심입니다."
    if axis_id == "flows":
        return "자금 흐름 축은 실제 fund flow가 아니라 우선 가격/거래량 프록시로 해석합니다."
    if axis_id == "employment":
        return "고용 축은 신규 실업수당 같은 선행 신호와 실업률 같은 후행 신호를 분리해서 봐야 합니다."
    if axis_id == "consumption":
        return "소비 축은 명목 소비가 인플레이션을 이기는지와 신용 부담이 커지는지를 함께 봅니다."
    if axis_id == "margins":
        return "마진 축은 PPI와 임금 비용뿐 아니라 기업의 가격 결정력 언어가 중요합니다."
    if axis_id == "dollar-commodities":
        return "달러와 원자재는 글로벌 유동성, 인플레이션, 경기 민감 수요를 함께 보여줍니다."
    if axis_id == "volatility":
        return "VIX는 단기 공포의 가격입니다. 급등은 위험이지만 동시에 단기 바닥 가능성도 만듭니다."
    return "해석 대기"


def build_axis_action(axis_id, status):
    if status == "positive":
        return "해당 축은 위험자산에 우호적입니다. 다만 다른 축과 충돌하는지 확인한 뒤 선택적으로 비중 확대를 검토합니다."
    if status == "negative":
        return "해당 축은 리스크 요인입니다. 신규 진입은 줄이고 보유 논리와 현금 비중을 점검합니다."
    return "중립 상태입니다. 단일 축만으로 판단하지 말고 다른 축과의 연결성을 확인합니다."


def refresh_timing_summary(data):
    result = {}

    for timing in TIMING_KEYS:
        items = [item for item in data["indicators"] if timing_matches(item.get("timing"), timing)]
        status, score = aggregate_status(items)
        positive = sum(1 for item in items if item.get("signal") == "positive")
        neutral = sum(1 for item in items if item.get("signal") in ["neutral", "warning", "manual-required"])
        negative = sum(1 for item in items if item.get("signal") == "negative")

        label = {"leading": "선행지표", "coincident": "동행지표", "lagging": "후행지표"}[timing]

        if timing == "leading":
            summary = "선행지표는 시장이 앞으로 반영할 가능성이 있는 변화를 먼저 보여줍니다."
        elif timing == "coincident":
            summary = "동행지표는 현재 경기와 시장 상태를 확인하는 역할을 합니다."
        else:
            summary = "후행지표는 이미 진행된 시나리오가 실제로 확인되는지 검증합니다."

        result[timing] = {
            "label": label,
            "status": status if status != "not-applicable" else "neutral",
            "score": score,
            "positiveCount": positive,
            "neutralCount": neutral,
            "negativeCount": negative,
            "summary": summary,
        }

    data["timingSummary"] = result


def refresh_market_summary(data):
    axis_summary = data["axisSummary"]
    positive_axes = [axis for axis in AXIS_ORDER if axis_summary[axis]["status"] == "positive"]
    negative_axes = [axis for axis in AXIS_ORDER if axis_summary[axis]["status"] == "negative"]
    neutral_axes = [axis for axis in AXIS_ORDER if axis_summary[axis]["status"] not in ["positive", "negative"]]

    positive_count = len(positive_axes)
    negative_count = len(negative_axes)
    neutral_count = len(neutral_axes)

    if positive_count >= 4 and negative_count <= 2:
        condition = "bullish"
        label = "강세 가능성 우위"
        risk_mode = "risk-on"
        action_bias = "selective-risk-on"
        cash = "20~30%"
    elif negative_count >= 4:
        condition = "bearish"
        label = "약세 가능성 우위"
        risk_mode = "defensive"
        action_bias = "raise-cash"
        cash = "35~50%"
    elif positive_count >= 3 and negative_count >= 3:
        condition = "volatile"
        label = "충돌 / 변동성 장세"
        risk_mode = "balanced"
        action_bias = "neutral-hold"
        cash = "25~40%"
    else:
        condition = "neutral"
        label = "횡보 / 중립 장세"
        risk_mode = "balanced"
        action_bias = "neutral-hold"
        cash = "20~35%"

    timing = data.get("timingSummary", {})

    data["marketSummary"] = {
        "marketCondition": condition,
        "marketConditionLabel": label,
        "riskMode": risk_mode,
        "positiveAxes": positive_count,
        "neutralAxes": neutral_count,
        "negativeAxes": negative_count,
        "leadingStatus": timing.get("leading", {}).get("status", "neutral"),
        "coincidentStatus": timing.get("coincident", {}).get("status", "neutral"),
        "laggingStatus": timing.get("lagging", {}).get("status", "neutral"),
        "confidence": "medium",
        "summary": build_market_summary_text(positive_axes, negative_axes, neutral_axes),
        "actionBias": action_bias,
        "cashRatioGuide": cash,
        "strongAxes": positive_axes,
        "weakAxes": negative_axes,
        "watchAxes": list(dict.fromkeys(negative_axes + ["rates", "volatility", "dollar-commodities"]))[:4],
        "conflictSummary": build_conflict_summary(data),
    }


def build_market_summary_text(positive_axes, negative_axes, neutral_axes):
    if len(positive_axes) >= 4 and len(negative_axes) <= 2:
        return "4축 이상이 긍정에 가까워 강세 가능성이 우위입니다. 다만 약한 축이 금리·달러·VIX인지 확인해야 합니다."
    if len(negative_axes) >= 4:
        return "4축 이상이 부정에 가까워 방어적 운용이 우선입니다. 신규 진입보다 현금 비중과 손실 제한 기준을 점검해야 합니다."
    return "긍정과 부정 신호가 혼재되어 있습니다. 단일 지표보다 8축 간 연결성과 충돌 여부를 우선 확인해야 합니다."


def build_conflict_summary(data):
    leading = data.get("timingSummary", {}).get("leading", {}).get("status", "neutral")
    lagging = data.get("timingSummary", {}).get("lagging", {}).get("status", "neutral")

    if leading == "negative" and lagging in ["positive", "neutral"]:
        return "선행지표가 먼저 악화되고 후행지표가 아직 버티는 구간입니다. 시장이 미래 위험을 선반영할 수 있습니다."
    if leading == "positive" and lagging == "negative":
        return "선행지표는 개선되지만 후행지표는 아직 나쁜 구간입니다. 저점 매수 또는 상승 초입 가능성을 검토할 수 있습니다."
    if leading == "positive" and lagging == "positive":
        return "선행·후행 지표가 같은 방향으로 개선되는 구간입니다. 시장 확신이 강해질 수 있습니다."
    if leading == "negative" and lagging == "negative":
        return "선행·후행 지표가 함께 악화되는 구간입니다. 방어적 운용이 우선입니다."
    return "선행·동행·후행 신호가 뚜렷하게 한 방향으로 정렬되지는 않았습니다."


def refresh_meta(data):
    now = datetime.now(KST)
    has_source_error = any(item.get("signal") == "source-error" for item in data["indicators"])

    data["schemaVersion"] = "1.0.0"
    data["meta"] = {
        "updatedAt": now.isoformat(timespec="seconds"),
        "week": f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "timezone": "Asia/Seoul",
        "dataStatus": "partial" if has_source_error else "ok",
        "automationStatus": "all-axes-auto-update-ok" if not has_source_error else "partial-auto-update-source-error",
        "sourceMode": "mixed",
        "notes": [
            "A등급 지표는 FRED 기반으로 자동 업데이트합니다.",
            "B등급 지표는 Stooq 가격/거래량 프록시 또는 파생 계산으로 업데이트합니다.",
            "C등급 지표는 수동 확인이 필요합니다.",
        ],
    }


def main():
    data = load_data()
    update_all_indicators(data)
    refresh_axis_summary(data)
    refresh_timing_summary(data)
    refresh_market_summary(data)
    refresh_meta(data)
    assert_no_null(data)

    DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("v1 market data update completed")
    print(json.dumps(data["meta"], ensure_ascii=False, indent=2))
    print(json.dumps(data["marketSummary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
