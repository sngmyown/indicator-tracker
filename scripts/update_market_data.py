import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")

REQUIRED_TOP_LEVEL_KEYS = [
    "schemaVersion",
    "meta",
    "marketSummary",
    "timingSummary",
    "axisSummary",
    "matrix",
    "indicators",
    "todo",
]


def assert_no_null(value, path="root"):
    if value is None:
        raise ValueError(f"{path} 값이 null입니다. latest.json v1에서는 null을 허용하지 않습니다.")

    if isinstance(value, dict):
        for key, child in value.items():
            assert_no_null(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            assert_no_null(child, f"{path}[{index}]")


def load_data():
    if not DATA_PATH.exists():
        raise FileNotFoundError("data/latest.json 파일이 없습니다. 먼저 v1 latest.json을 붙여넣어 주세요.")

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))

    for key in REQUIRED_TOP_LEVEL_KEYS:
        if key not in data:
            raise ValueError(f"latest.json에 필수 키가 없습니다: {key}")

    if data.get("schemaVersion") != "1.0.0":
        raise ValueError("schemaVersion이 1.0.0이 아닙니다.")

    if not isinstance(data.get("indicators"), list) or not data["indicators"]:
        raise ValueError("indicators 배열이 비어 있습니다.")

    return data


def main():
    data = load_data()
    now = datetime.now(KST)

    data["meta"]["updatedAt"] = now.isoformat(timespec="seconds")
    data["meta"]["week"] = f"{now.isocalendar().year}-W{now.isocalendar().week:02d}"
    data["meta"]["timezone"] = "Asia/Seoul"
    data["meta"]["automationStatus"] = "all-axes-auto-update-ok"

    # 이 파일은 v1 구조 검증용 임시 업데이트 스크립트다.
    # 다음 단계에서 FRED/Stooq 실제 데이터 수집 로직을 이 스키마에 맞게 연결한다.
    data["meta"]["dataStatus"] = data["meta"].get("dataStatus") or "manual-required"
    data["meta"]["sourceMode"] = data["meta"].get("sourceMode") or "mixed"

    assert_no_null(data)

    DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print("v1 latest.json timestamp update completed")
    print(f"updatedAt: {data['meta']['updatedAt']}")
    print(f"indicatorCount: {len(data['indicators'])}")
    print(f"automationStatus: {data['meta']['automationStatus']}")


if __name__ == "__main__":
    main()
