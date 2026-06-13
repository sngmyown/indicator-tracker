import csv
import json
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


def fred_url(series_id):
    return FRED_BASE + series_id


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


def fetch_text(url, retries=2, timeout=8):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            print(f"[fetch] attempt {attempt}/{retries}: {url}", flush=True)

            request = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "text/csv,text/plain,*/*",
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


def fetch_fred_latest(series_id):
    text = fetch_text(fred_url(series_id))
    reader = csv.DictReader(StringIO(text))
    values = []

    for row in reader:
        date = row.get("observation_date")
        raw = row.get(series_id)

        if not date or raw is None:
            continue

        raw = str(raw).strip()

        if raw == "" or raw == ".":
            continue

        values.append({
            "date": date,
            "value": round(float(raw), 4),
        })

    if len(values) < 2:
        raise ValueError(f"{series_id} 유효 데이터가 2개 미만입니다.")

    return values[-1], values[-2]


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


def update_vix(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    vix = find_indicator(data, "vix")
    vix_change = find_indicator(data, "vix_change_rate")

    try:
        latest, previous = fetch_fred_latest("VIXCLS")

        current_value = latest["value"]
        previous_value = previous["value"]
        change = round(current_value - previous_value, 4)
        change_percent = percent_change(current_value, previous_value)
        direction = direction_from_change(change)

        signal, score = vix_signal(current_value)
        change_signal, change_score = vix_change_signal(change_percent)

        vix.update({
            "source": "FRED",
            "sourceSeries": "VIXCLS",
            "sourceUrl": fred_url("VIXCLS"),
            "currentValue": current_value,
            "previousValue": previous_value,
            "unit": "index",
            "actualDate": latest["date"],
            "direction": direction,
            "change": change,
            "changePercent": change_percent,
            "signal": signal,
            "score": score,
            "interpretation": f"VIX 최신값은 {current_value}입니다. 10~20은 정상 위험선호, 20 이상은 긴장 상승, 30 이상은 공포 구간으로 봅니다.",
            "marketReaction": "VIX가 낮고 안정적이면 위험자산에는 우호적입니다. VIX가 빠르게 상승하면 단기 조정 또는 공포 확산을 경계해야 합니다.",
            "action": "VIX만으로 매수·매도하지 말고 금리, 자금 흐름, 실적 축과 함께 확인합니다.",
            "statusNote": "auto-updated",
        })

        vix_change.update({
            "source": "Derived",
            "sourceSeries": "VIXCLS-change",
            "sourceUrl": fred_url("VIXCLS"),
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

        update_volatility_summary(data, signal, change_signal, current_value, change_percent, latest["date"])
        print("[update] VIX auto-updated", flush=True)

    except Exception as error:
        error_message = str(error)
        mark_source_error(vix, today, error_message)
        mark_source_error(vix_change, today, error_message)
        update_volatility_source_error(data, error_message)
        print("[update] VIX source-error", flush=True)


def update_volatility_summary(data, vix_status, change_status, vix_value, change_percent, actual_date):
    score = 0

    if vix_status == "positive":
        score += 1
    elif vix_status == "negative":
        score -= 1

    if change_status == "positive":
        score += 1
    elif change_status == "negative":
        score -= 1

    if score > 0:
        axis_status = "positive"
    elif score < 0:
        axis_status = "negative"
    else:
        axis_status = "neutral"

    data.setdefault("axisSummary", {})
    if "volatility" in data["axisSummary"]:
        data["axisSummary"]["volatility"].update({
            "status": axis_status,
            "score": score,
            "leadingStatus": change_status,
            "coincidentStatus": vix_status,
            "laggingStatus": "not-applicable",
            "summary": f"VIX {vix_value}, 변화율 {change_percent}%입니다.",
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

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX 자동 업데이트 1단계",
        "riskMode": "balanced",
        "summary": f"VIX 자동 업데이트가 완료되었습니다. 최신 기준일은 {actual_date}입니다.",
        "conflictSummary": "현재는 VIX 축만 실제 자동화된 상태이므로 전체 8축 충돌 판단은 보류합니다.",
        "watchAxes": ["rates", "flows", "volatility"],
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
            "interpretation": f"FRED VIXCLS 호출 오류: {error_message}",
            "action": "GitHub Actions 로그를 확인하고, 다음 실행에서 재시도합니다.",
        })

    data.setdefault("matrix", {})
    if "volatility" in data["matrix"]:
        data["matrix"]["volatility"].update({
            "leading": "source-error",
            "coincident": "source-error",
            "lagging": "not-applicable",
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "VIX 소스 오류",
        "riskMode": "balanced",
        "summary": "VIX 자동 업데이트가 실패했습니다. 사이트는 유지되지만 해당 지표는 source-error로 표시됩니다.",
        "conflictSummary": "VIX 데이터 확인 전까지 변동성 축 판단은 보류합니다.",
        "watchAxes": ["volatility"],
    })


def update_meta(data):
    now = datetime.now(KST)

    data.setdefault("meta", {})
    data["meta"].update({
        "updatedAt": now.isoformat(timespec="seconds"),
        "week": f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "timezone": "Asia/Seoul",
        "dataStatus": "partial",
        "automationStatus": "vix-auto-update-v1",
        "sourceMode": "mixed",
        "notes": [
            "VIX 자동 업데이트 1단계가 실행되었습니다.",
            "FRED 호출 성공 시 VIX는 auto-updated로 표시됩니다.",
            "FRED 호출 실패 시 VIX는 source-error로 표시됩니다.",
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
    print("[start] VIX safe auto update", flush=True)

    data = load_data()

    print("[check] latest.json loaded", flush=True)
    print(f"[check] schemaVersion = {data.get('schemaVersion')}", flush=True)
    print(f"[check] indicator count = {len(data.get('indicators', []))}", flush=True)

    update_vix(data)
    update_meta(data)
    assert_no_null(data)
    save_data(data)

    print("[done] VIX safe auto update completed", flush=True)
    print("[done] latest.json should contain auto-updated or source-error", flush=True)


if __name__ == "__main__":
    main()
