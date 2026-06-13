import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")


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


def update_vix_test_value(data):
    now = datetime.now(KST)
    today = now.date().isoformat()

    vix = find_indicator(data, "vix")

    vix.update({
        "currentValue": 15.55,
        "previousValue": 16.20,
        "unit": "index",
        "actualDate": today,
        "direction": "down",
        "change": -0.65,
        "changePercent": -4.01,
        "signal": "positive",
        "score": 1,
        "interpretation": "파이프라인 검증용 테스트 값입니다. GitHub Actions가 latest.json을 수정할 수 있는지 확인합니다.",
        "marketReaction": "테스트 값입니다. 실제 시장 해석에는 사용하지 않습니다.",
        "action": "자동 업데이트 파이프라인 검증 후 실제 데이터 수집 코드로 교체해야 합니다.",
        "statusNote": "auto-updated"
    })

    try:
        vix_change = find_indicator(data, "vix_change_rate")
        vix_change.update({
            "currentValue": -4.01,
            "previousValue": 0,
            "unit": "%",
            "actualDate": today,
            "direction": "down",
            "change": -4.01,
            "changePercent": -4.01,
            "signal": "positive",
            "score": 1,
            "interpretation": "파이프라인 검증용 테스트 값입니다. VIX 변화율 계산 구조를 확인합니다.",
            "marketReaction": "테스트 값입니다. 실제 시장 해석에는 사용하지 않습니다.",
            "action": "실제 데이터 연결 전까지 이 값은 검증용으로만 봅니다.",
            "statusNote": "auto-updated"
        })
    except KeyError:
        print("[warning] vix_change_rate 지표가 없어 건너뜁니다.")


def update_summary_blocks(data):
    now = datetime.now(KST)

    data.setdefault("meta", {})
    data["meta"].update({
        "updatedAt": now.isoformat(timespec="seconds"),
        "week": f"{now.isocalendar().year}-W{now.isocalendar().week:02d}",
        "timezone": "Asia/Seoul",
        "dataStatus": "partial",
        "automationStatus": "pipeline-test-ok",
        "sourceMode": "mixed",
        "notes": [
            "파이프라인 검증용 업데이트입니다.",
            "VIX에 테스트 값을 넣어 GitHub Actions commit/push가 가능한지 확인합니다.",
            "실제 시장 데이터 자동화 코드는 다음 단계에서 다시 연결합니다."
        ]
    })

    data.setdefault("axisSummary", {})
    if "volatility" in data["axisSummary"]:
        data["axisSummary"]["volatility"].update({
            "status": "positive",
            "score": 1,
            "leadingStatus": "positive",
            "coincidentStatus": "positive",
            "laggingStatus": "not-applicable",
            "summary": "파이프라인 검증용으로 VIX 테스트 값이 자동 반영되었습니다.",
            "interpretation": "이 값은 실제 시장 데이터가 아니라 GitHub Actions 검증용입니다.",
            "action": "검증 성공 후 실제 FRED/Stooq 자동 수집 코드로 교체합니다."
        })

    data.setdefault("matrix", {})
    if "volatility" in data["matrix"]:
        data["matrix"]["volatility"].update({
            "leading": "positive",
            "coincident": "positive",
            "lagging": "not-applicable"
        })

    data.setdefault("timingSummary", {})
    if "leading" in data["timingSummary"]:
        data["timingSummary"]["leading"].update({
            "status": "positive",
            "summary": "파이프라인 검증용 VIX 변화율이 반영되었습니다."
        })

    if "coincident" in data["timingSummary"]:
        data["timingSummary"]["coincident"].update({
            "status": "positive",
            "summary": "파이프라인 검증용 VIX 현재값이 반영되었습니다."
        })

    data.setdefault("marketSummary", {})
    data["marketSummary"].update({
        "marketCondition": "neutral",
        "marketConditionLabel": "파이프라인 검증 상태",
        "riskMode": "balanced",
        "positiveAxes": 1,
        "neutralAxes": 7,
        "negativeAxes": 0,
        "leadingStatus": "positive",
        "coincidentStatus": "positive",
        "laggingStatus": "manual-required",
        "confidence": "low",
        "summary": "현재 값은 실제 시장 데이터가 아니라 GitHub Actions 파이프라인 검증용 테스트 값입니다.",
        "actionBias": "neutral-hold",
        "cashRatioGuide": "20~35%",
        "strongAxes": ["volatility"],
        "weakAxes": [],
        "watchAxes": ["rates", "employment", "volatility"],
        "conflictSummary": "실제 데이터 연결 전이므로 축 간 충돌 판단은 보류합니다."
    })


def assert_no_null(value, path="root"):
    if value is None:
        raise ValueError(f"{path} 값이 null입니다.")

    if isinstance(value, dict):
        for key, child in value.items():
            assert_no_null(child, f"{path}.{key}")

    if isinstance(value, list):
        for index, child in enumerate(value):
            assert_no_null(child, f"{path}[{index}]")


def main():
    print("[start] pipeline test update")

    data = load_data()

    print("[check] latest.json loaded")
    print(f"[check] schemaVersion = {data.get('schemaVersion')}")
    print(f"[check] indicator count = {len(data.get('indicators', []))}")

    update_vix_test_value(data)
    print("[update] vix test value updated")

    update_summary_blocks(data)
    print("[update] summary blocks updated")

    assert_no_null(data)
    print("[check] no null values")

    save_data(data)
    print("[done] pipeline test update completed")
    print("[done] statusNote auto-updated should now exist in data/latest.json")


if __name__ == "__main__":
    main()
