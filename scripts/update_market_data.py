import csv
import json
import math
import urllib.request
from datetime import datetime
from io import StringIO
from pathlib import Path
from zoneinfo import ZoneInfo

DATA_PATH = Path("data/latest.json")
KST = ZoneInfo("Asia/Seoul")
FRED_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv?id="
STOOQ_BASE = "https://stooq.com/q/d/l/?i=d&s="

AXES = [
    ("rates", "금리 / 유동성"),
    ("earnings", "기업 실적 / 가이던스"),
    ("flows", "자금 흐름"),
    ("employment", "고용"),
    ("consumption", "소비 / 수요"),
    ("margins", "기업 마진 구조"),
    ("dollar-commodities", "달러 / 원자재"),
    ("volatility", "변동성 / VIX")
]


def fred_url(series):
    return FRED_BASE + series


def fetch_text(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "text/csv,text/plain,application/json,*/*"
        }
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read().decode("utf-8")


def fetch_fred(series, min_count=2):
    text = fetch_text(fred_url(series))
    reader = csv.DictReader(StringIO(text))
    out = []

    for row in reader:
        date = row.get("observation_date")
        raw = row.get(series)

        if not date or raw is None:
            continue

        raw = str(raw).strip()

        if raw in {"", "."}:
            continue

        out.append({
            "date": date,
            "value": round(float(raw), 4)
        })

    if len(out) < min_count:
        raise ValueError(f"FRED {series} 유효 데이터 부족")

    return out


def latest_prev(series):
    vals = fetch_fred(series, 2)
    return vals[-1], vals[-2], vals


def pct_change(now, prev):
    if prev == 0:
        return 0
    return round((now - prev) / abs(prev) * 100, 2)


def yoy(vals, periods=12):
    if len(vals) <= periods:
        return None
    return pct_change(vals[-1]["value"], vals[-1 - periods]["value"])


def fetch_stooq(symbol, min_count=6):
    text = fetch_text(STOOQ_BASE + symbol.lower())
    reader = csv.DictReader(StringIO(text))
    out = []

    for row in reader:
        try:
            out.append({
                "date": row["Date"],
                "close": round(float(row["Close"]), 4),
                "volume": float(row.get("Volume") or 0)
            })
        except (KeyError, ValueError):
            continue

    if len(out) < min_count:
        raise ValueError(f"Stooq {symbol} 유효 데이터 부족")

    return out


def status_by(value, positive=None, negative=None):
    if positive and positive(value):
        return "positive"
    if negative and negative(value):
        return "negative"
    return "neutral"


def clean(value):
    if value is None:
        return "not-available"
    if isinstance(value, float) and math.isnan(value):
        return "not-available"
    return value


def indicator(
    name,
    previous,
    actual,
    actual_date,
    market_reaction,
    interpretation,
    signal,
    status,
    source,
    source_series,
    source_url,
    expected_checked=False
):
    item = {
        "name": name,
        "expectedChecked": bool(expected_checked),
        "previous": clean(previous),
        "actual": clean(actual),
        "actualDate": clean(actual_date),
        "marketReaction": clean(market_reaction),
        "interpretation": clean(interpretation),
        "signal": clean(signal),
        "status": clean(status),
        "source": clean(source),
        "sourceSeries": clean(source_series),
        "sourceUrl": clean(source_url)
    }

    assert_no_null(item)
    return item


def manual_indicator(name, reason, source="Manual", source_url="manual-required"):
    today = datetime.now(KST).date().isoformat()

    return indicator(
        name=name,
        previous="확인 필요",
        actual="확인 필요",
        actual_date=today,
        market_reaction="자동 수치 수집 대상이 아니므로 수동 확인 후 기록해야 합니다.",
        interpretation=reason,
        signal="manual-required",
        status="neutral",
        source=source,
        source_series="manual-required",
        source_url=source_url
    )


def error_indicator(axis_name, err):
    today = datetime.now(KST).date().isoformat()

    return indicator(
        name=f"{axis_name} 데이터 오류",
        previous="source-error",
        actual="source-error",
        actual_date=today,
        market_reaction="데이터 소스 호출 또는 파싱에 실패했습니다.",
        interpretation=f"오류: {err}",
        signal="source-error",
        status="neutral",
        source="error",
        source_series="source-error",
        source_url="source-error"
    )


def assert_no_null(value, path="root"):
    if value is None:
        raise ValueError(f"{path} 값이 null입니다.")

    if isinstance(value, dict):
        for key, child in value.items():
            assert_no_null(child, f"{path}.{key}")

    elif isinstance(value, list):
        for index, child in enumerate(value):
            assert_no_null(child, f"{path}[{index}]")


def base_data():
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
                "name": name,
                "status": "neutral",
                "summary": "자동 업데이트 대기 중입니다.",
                "indicators": []
            }
            for axis_id, name in AXES
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
        return base_data()

    try:
        data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return base_data()

    if not isinstance(data, dict):
        return base_data()

    data.setdefault("todo", base_data()["todo"])
    return data


def set_axis(data, axis_id, status, summary, indicators):
    existing = {
        axis.get("id"): axis
        for axis in data.get("axes", [])
        if isinstance(axis, dict)
    }

    new_axes = []

    for current_id, current_name in AXES:
        if current_id == axis_id:
            new_axes.append({
                "id": axis_id,
                "name": current_name,
                "status": status,
                "summary": summary,
                "indicators": indicators
            })
        else:
            old = existing.get(current_id, {})
            new_axes.append({
                "id": current_id,
                "name": old.get("name") or current_name,
                "status": old.get("status") or "neutral",
                "summary": old.get("summary") or "자동 업데이트 대기 중입니다.",
                "indicators": old.get("indicators") if isinstance(old.get("indicators"), list) else []
            })

    data["axes"] = new_axes


def axis_status(indicators):
    positive_count = sum(1 for item in indicators if item["status"] == "positive")
    negative_count = sum(1 for item in indicators if item["status"] == "negative")

    if negative_count >= 2:
        return "negative"

    if positive_count >= 2:
        return "positive"

    return "neutral"


def update_market_summary(data):
    positive = sum(1 for axis in data["axes"] if axis["status"] == "positive")
    negative = sum(1 for axis in data["axes"] if axis["status"] == "negative")
    neutral = len(data["axes"]) - positive - negative

    data["marketSummary"] = {
        "riskMode": "risk-off" if negative >= 5 else "risk-on" if positive >= 5 else "neutral",
        "positiveAxes": positive,
        "neutralAxes": neutral,
        "negativeAxes": negative
    }


def safe_axis(data, axis_id, updater):
    axis_name = dict(AXES)[axis_id]

    try:
        updater(data)
    except Exception as err:
        set_axis(
            data,
            axis_id,
            "neutral",
            f"{axis_name} 축 데이터 업데이트 실패. 소스 확인이 필요합니다.",
            [error_indicator(axis_name, err)]
        )


def update_rates(data):
    d10, d10_prev, _ = latest_prev("DGS10")
    d2, d2_prev, _ = latest_prev("DGS2")
    spread, spread_prev, _ = latest_prev("T10Y2Y")
    real10, real10_prev, _ = latest_prev("DFII10")
    dff, dff_prev, _ = latest_prev("DFF")

    items = [
        indicator(
            "미국 10년물 국채금리",
            d10_prev["value"],
            d10["value"],
            d10["date"],
            "10년물 금리는 장기 할인율과 성장주 밸류에이션 부담을 보여줍니다.",
            "금리 급등은 성장주에 부담, 완만한 하락은 위험자산에 우호적입니다.",
            status_by(d10["value"], lambda v: v < 4.0, lambda v: v > 4.75),
            status_by(d10["value"], lambda v: v < 4.0, lambda v: v > 4.75),
            "FRED",
            "DGS10",
            fred_url("DGS10")
        ),
        indicator(
            "미국 2년물 국채금리",
            d2_prev["value"],
            d2["value"],
            d2["date"],
            "2년물 금리는 연준 정책금리 기대에 민감합니다.",
            "2년물 상승은 금리 인하 기대 후퇴, 하락은 완화 기대 확대 신호입니다.",
            status_by(d2["value"], lambda v: v < 4.0, lambda v: v > 4.75),
            status_by(d2["value"], lambda v: v < 4.0, lambda v: v > 4.75),
            "FRED",
            "DGS2",
            fred_url("DGS2")
        ),
        indicator(
            "10Y-2Y 금리 스프레드",
            spread_prev["value"],
            spread["value"],
            spread["date"],
            "장단기 금리차는 경기 사이클과 침체 리스크를 보는 보조 지표입니다.",
            "플러스면 정상화, 깊은 마이너스면 경기 둔화/긴축 부담을 더 크게 봅니다.",
            status_by(spread["value"], lambda v: v > 0, lambda v: v < -0.5),
            status_by(spread["value"], lambda v: v > 0, lambda v: v < -0.5),
            "FRED",
            "T10Y2Y",
            fred_url("T10Y2Y")
        ),
        indicator(
            "10년 실질금리",
            real10_prev["value"],
            real10["value"],
            real10["date"],
            "실질금리는 위험자산 밸류에이션의 실질 할인율 역할을 합니다.",
            "실질금리가 높을수록 성장주와 장기 현금흐름 자산에는 부담입니다.",
            status_by(real10["value"], lambda v: v < 1.5, lambda v: v > 2.25),
            status_by(real10["value"], lambda v: v < 1.5, lambda v: v > 2.25),
            "FRED",
            "DFII10",
            fred_url("DFII10")
        ),
        indicator(
            "Effective Fed Funds Rate",
            dff_prev["value"],
            dff["value"],
            dff["date"],
            "현재 정책금리 수준을 확인하는 기본 지표입니다.",
            "CME FedWatch 확률은 별도 소스 연결이 필요하므로 다음 단계에서 확장합니다.",
            "neutral",
            "neutral",
            "FRED",
            "DFF",
            fred_url("DFF")
        )
    ]

    set_axis(
        data,
        "rates",
        axis_status(items),
        f"10Y {d10['value']}%, 2Y {d2['value']}%, 10Y-2Y {spread['value']}%p입니다.",
        items
    )


def update_earnings(data):
    items = [
        manual_indicator(
            "S&P 500 EPS Beat Rate",
            "FactSet Earnings Insight 또는 유료 실적 API가 필요합니다. 무료 안정 API 없이 정확한 beat rate 자동 수집은 제한됩니다.",
            "FactSet / Manual",
            "https://www.factset.com/earningsinsight"
        ),
        manual_indicator(
            "M7 가이던스 변화",
            "M7 가이던스는 실적 발표문과 컨퍼런스콜 텍스트 해석이 필요합니다. 현재 버전에서는 수동 확인 대상으로 표시합니다.",
            "SEC / Company filings / Manual",
            "https://www.sec.gov/edgar/search/"
        )
    ]

    set_axis(
        data,
        "earnings",
        "neutral",
        "실적/가이던스 축은 현재 수동 확인 카드로 채웁니다. API 키 연결 시 완전 자동화 가능합니다.",
        items
    )


def update_flows(data):
    pairs = [
        ("SPY", "spy.us"),
        ("QQQ", "qqq.us"),
        ("IWM", "iwm.us"),
        ("SQQQ", "sqqq.us")
    ]

    items = []

    for ticker, symbol in pairs:
        vals = fetch_stooq(symbol)
        latest = vals[-1]
        previous = vals[-2]
        base = vals[-6]

        ret5 = pct_change(latest["close"], base["close"])
        prev_ret = pct_change(previous["close"], base["close"])

        vols = [row["volume"] for row in vals[-21:-1] if row["volume"] > 0]
        avg_vol = sum(vols) / len(vols) if vols else latest["volume"]
        volume_ratio = round(latest["volume"] / avg_vol, 2) if avg_vol else 1

        if ticker == "SQQQ":
            status = status_by(ret5, lambda v: v < 0, lambda v: v > 5)
            interpretation = "SQQQ 상승은 방어/헤지 수요 증가로 해석합니다. 하락은 위험선호 회복 신호일 수 있습니다."
        else:
            status = status_by(ret5, lambda v: v > 1, lambda v: v < -1)
            interpretation = "5거래일 가격 변화율과 거래량 비율로 ETF 상대강도와 자금 관심도를 프록시합니다. 실제 fund flow는 별도 API가 필요합니다."

        items.append(
            indicator(
                f"{ticker} 5거래일 수익률",
                prev_ret,
                ret5,
                latest["date"],
                f"거래량 비율은 최근 20거래일 평균 대비 {volume_ratio}배입니다.",
                interpretation,
                status,
                status,
                "Stooq",
                symbol,
                STOOQ_BASE + symbol
            )
        )

    set_axis(
        data,
        "flows",
        axis_status(items),
        "SPY, QQQ, IWM, SQQQ의 5거래일 상대강도와 거래량으로 자금 흐름을 프록시합니다.",
        items
    )


def update_employment(data):
    claims, claims_prev, _ = latest_prev("ICSA")
    unrate, unrate_prev, _ = latest_prev("UNRATE")
    payroll, payroll_prev, _ = latest_prev("PAYEMS")
    wage, wage_prev, wage_vals = latest_prev("CES0500000003")

    payroll_change = round(payroll["value"] - payroll_prev["value"], 1)
    wage_yoy = yoy(wage_vals) or pct_change(wage["value"], wage_prev["value"])

    items = [
        indicator(
            "주간 신규 실업수당 청구건수",
            claims_prev["value"],
            claims["value"],
            claims["date"],
            "고용 축에서 가장 빠르게 변하는 주간 신호입니다.",
            "20만~25만 건은 대체로 골디락스 구간, 급증하면 고용 둔화 신호입니다.",
            status_by(claims["value"], lambda v: 200000 <= v <= 250000, lambda v: v > 275000),
            status_by(claims["value"], lambda v: 200000 <= v <= 250000, lambda v: v > 275000),
            "FRED",
            "ICSA",
            fred_url("ICSA")
        ),
        indicator(
            "실업률",
            unrate_prev["value"],
            unrate["value"],
            unrate["date"],
            "실업률은 경기 체력과 침체 위험을 보는 핵심 지표입니다.",
            "3.8~4.2%를 골디락스에 가깝게 보고, 빠른 상승은 경기 둔화 신호로 봅니다.",
            status_by(unrate["value"], lambda v: 3.8 <= v <= 4.2, lambda v: v > 4.5),
            status_by(unrate["value"], lambda v: 3.8 <= v <= 4.2, lambda v: v > 4.5),
            "FRED",
            "UNRATE",
            fred_url("UNRATE")
        ),
        indicator(
            "비농업 고용자 수 변화",
            0,
            payroll_change,
            payroll["date"],
            "PAYEMS 전월 대비 변화입니다. 단위는 천 명입니다.",
            "15만~20만 명 내외 증가는 골디락스에 가깝고, 과도하게 강하면 금리 부담입니다.",
            status_by(payroll_change, lambda v: 150 <= v <= 220, lambda v: v < 75 or v > 300),
            status_by(payroll_change, lambda v: 150 <= v <= 220, lambda v: v < 75 or v > 300),
            "FRED",
            "PAYEMS",
            fred_url("PAYEMS")
        ),
        indicator(
            "시간당 평균 임금 YoY",
            wage_prev["value"],
            wage_yoy,
            wage["date"],
            "임금 상승률은 소비 체력과 인플레이션 압력을 동시에 보여줍니다.",
            "3~4%는 골디락스에 가깝고, 과도한 임금 상승은 마진과 금리에 부담입니다.",
            status_by(wage_yoy, lambda v: 3 <= v <= 4, lambda v: v > 4.5),
            status_by(wage_yoy, lambda v: 3 <= v <= 4, lambda v: v > 4.5),
            "FRED",
            "CES0500000003",
            fred_url("CES0500000003")
        )
    ]

    set_axis(
        data,
        "employment",
        axis_status(items),
        "고용 축은 실업수당, 실업률, NFP 변화, 임금 상승률을 함께 봅니다.",
        items
    )


def update_consumption(data):
    retail, retail_prev, retail_vals = latest_prev("RSXFS")
    cpi, cpi_prev, cpi_vals = latest_prev("CPIAUCSL")
    delinquency, delinquency_prev, _ = latest_prev("DRCCLACBS")

    retail_yoy = yoy(retail_vals) or pct_change(retail["value"], retail_prev["value"])
    cpi_yoy = yoy(cpi_vals) or pct_change(cpi["value"], cpi_prev["value"])
    real_proxy = round(retail_yoy - cpi_yoy, 2)

    items = [
        indicator(
            "소매판매 YoY",
            retail_prev["value"],
            retail_yoy,
            retail["date"],
            "소매판매 증가는 기업 매출의 선행 신호입니다.",
            "명목 소매판매가 인플레이션보다 강한지 여부가 중요합니다.",
            status_by(retail_yoy, lambda v: v > cpi_yoy, lambda v: v < cpi_yoy - 1),
            status_by(retail_yoy, lambda v: v > cpi_yoy, lambda v: v < cpi_yoy - 1),
            "FRED",
            "RSXFS",
            fred_url("RSXFS")
        ),
        indicator(
            "CPI YoY",
            cpi_prev["value"],
            cpi_yoy,
            cpi["date"],
            "CPI는 소비 증가가 실질인지 명목 인플레이션인지 구분하는 기준입니다.",
            "CPI가 높고 소매판매가 이를 못 이기면 실질 수요는 약한 것으로 봅니다.",
            status_by(cpi_yoy, lambda v: v < 3, lambda v: v > 4),
            status_by(cpi_yoy, lambda v: v < 3, lambda v: v > 4),
            "FRED",
            "CPIAUCSL",
            fred_url("CPIAUCSL")
        ),
        indicator(
            "Retail Sales Growth - Inflation",
            0,
            real_proxy,
            retail["date"],
            "소매판매 증가율에서 CPI 상승률을 뺀 실질 소비 프록시입니다.",
            "플러스면 소비가 인플레이션보다 강하고, 마이너스면 실질 수요 둔화로 해석합니다.",
            status_by(real_proxy, lambda v: v > 0, lambda v: v < -1),
            status_by(real_proxy, lambda v: v > 0, lambda v: v < -1),
            "Derived from FRED",
            "RSXFS-CPIAUCSL",
            f"{fred_url('RSXFS')} | {fred_url('CPIAUCSL')}"
        ),
        indicator(
            "신용카드 연체율",
            delinquency_prev["value"],
            delinquency["value"],
            delinquency["date"],
            "신용카드 연체율은 가계 신용 부담과 소비 둔화 리스크를 보여줍니다.",
            "3% 이하를 상대적으로 양호하게 보고, 상승 추세가 강하면 소비 둔화 리스크로 봅니다.",
            status_by(delinquency["value"], lambda v: v <= 3, lambda v: v > 4),
            status_by(delinquency["value"], lambda v: v <= 3, lambda v: v > 4),
            "FRED",
            "DRCCLACBS",
            fred_url("DRCCLACBS")
        )
    ]

    set_axis(
        data,
        "consumption",
        axis_status(items),
        "소비 축은 소매판매, CPI, 실질 소비 프록시, 신용카드 연체율을 함께 봅니다.",
        items
    )


def update_margins(data):
    ppi, ppi_prev, ppi_vals = latest_prev("PPIACO")
    cpi, cpi_prev, cpi_vals = latest_prev("CPIAUCSL")
    wage, wage_prev, wage_vals = latest_prev("CES0500000003")

    ppi_yoy = yoy(ppi_vals) or pct_change(ppi["value"], ppi_prev["value"])
    cpi_yoy = yoy(cpi_vals) or pct_change(cpi["value"], cpi_prev["value"])
    wage_yoy = yoy(wage_vals) or pct_change(wage["value"], wage_prev["value"])
    pass_through = round(cpi_yoy - ppi_yoy, 2)

    items = [
        indicator(
            "PPI YoY",
            ppi_prev["value"],
            ppi_yoy,
            ppi["date"],
            "PPI는 원가 압박의 대표 프록시입니다.",
            "PPI가 빠르게 상승하면 기업 마진에는 부담입니다.",
            status_by(ppi_yoy, lambda v: v < 2.5, lambda v: v > 4),
            status_by(ppi_yoy, lambda v: v < 2.5, lambda v: v > 4),
            "FRED",
            "PPIACO",
            fred_url("PPIACO")
        ),
        indicator(
            "임금 비용 YoY",
            wage_prev["value"],
            wage_yoy,
            wage["date"],
            "평균 시간당 임금은 인건비 압박의 대표 프록시입니다.",
            "임금 상승률이 높으면 노동집약 기업의 마진 부담이 커질 수 있습니다.",
            status_by(wage_yoy, lambda v: v <= 4, lambda v: v > 4.5),
            status_by(wage_yoy, lambda v: v <= 4, lambda v: v > 4.5),
            "FRED",
            "CES0500000003",
            fred_url("CES0500000003")
        ),
        indicator(
            "CPI-PPI 가격전가 프록시",
            0,
            pass_through,
            cpi["date"],
            "CPI 상승률에서 PPI 상승률을 뺀 단순 가격전가 프록시입니다.",
            "플러스면 소비자 가격 전가 여지가 있고, 마이너스면 원가가 판매가보다 강한 압박입니다.",
            status_by(pass_through, lambda v: v > 0, lambda v: v < -1),
            status_by(pass_through, lambda v: v > 0, lambda v: v < -1),
            "Derived from FRED",
            "CPIAUCSL-PPIACO",
            f"{fred_url('CPIAUCSL')} | {fred_url('PPIACO')}"
        )
    ]

    set_axis(
        data,
        "margins",
        axis_status(items),
        "마진 축은 PPI, 임금 비용, CPI-PPI 가격전가 프록시로 비용 압박을 추적합니다.",
        items
    )


def update_dollar_commodities(data):
    dollar, dollar_prev, _ = latest_prev("DTWEXBGS")
    wti, wti_prev, _ = latest_prev("DCOILWTICO")
    copper, copper_prev, _ = latest_prev("PCOPPUSDM")

    items = [
        indicator(
            "미국 광의 달러지수",
            dollar_prev["value"],
            dollar["value"],
            dollar["date"],
            "DXY 대신 FRED의 broad dollar index를 달러 강도 프록시로 사용합니다.",
            "달러 강세는 원자재와 해외 매출 비중이 큰 기업에는 부담일 수 있습니다.",
            status_by(dollar["value"], lambda v: v < dollar_prev["value"], lambda v: v > dollar_prev["value"] * 1.01),
            status_by(dollar["value"], lambda v: v < dollar_prev["value"], lambda v: v > dollar_prev["value"] * 1.01),
            "FRED",
            "DTWEXBGS",
            fred_url("DTWEXBGS")
        ),
        indicator(
            "WTI 원유",
            wti_prev["value"],
            wti["value"],
            wti["date"],
            "WTI는 에너지 인플레이션과 지정학 리스크를 반영합니다.",
            "70~85달러는 상대적 골디락스, 100달러 이상은 인플레이션 부담으로 봅니다.",
            status_by(wti["value"], lambda v: 70 <= v <= 85, lambda v: v >= 100),
            status_by(wti["value"], lambda v: 70 <= v <= 85, lambda v: v >= 100),
            "FRED",
            "DCOILWTICO",
            fred_url("DCOILWTICO")
        ),
        indicator(
            "구리 가격",
            copper_prev["value"],
            copper["value"],
            copper["date"],
            "구리는 제조업과 건설 경기의 경기 민감 신호로 사용합니다.",
            "상승 추세는 경기 회복 기대, 하락 추세는 제조업 둔화 가능성으로 봅니다.",
            status_by(copper["value"], lambda v: v > copper_prev["value"], lambda v: v < copper_prev["value"] * 0.97),
            status_by(copper["value"], lambda v: v > copper_prev["value"], lambda v: v < copper_prev["value"] * 0.97),
            "FRED",
            "PCOPPUSDM",
            fred_url("PCOPPUSDM")
        )
    ]

    set_axis(
        data,
        "dollar-commodities",
        axis_status(items),
        "달러, WTI, 구리 가격으로 글로벌 유동성·인플레이션·경기 민감도를 확인합니다.",
        items
    )


def update_volatility(data):
    vix, vix_prev, _ = latest_prev("VIXCLS")
    actual = vix["value"]

    signal = status_by(actual, lambda v: 10 < v <= 20, lambda v: v >= 30)

    if actual <= 10:
        signal = "warning-low-volatility"

    item = indicator(
        "VIX",
        vix_prev["value"],
        actual,
        vix["date"],
        "이번 단계에서는 VIX 값만 자동 반영합니다. S&P 500, Nasdaq, 10년물 금리 반응은 다음 확장 단계에서 연결합니다.",
        "VIX가 10~20이면 정상/우호, 20 이상이면 긴장 상승, 30 이상이면 공포 구간으로 해석합니다.",
        signal,
        signal,
        "FRED",
        "VIXCLS",
        fred_url("VIXCLS")
    )

    if not isinstance(item["actual"], (int, float)):
        raise ValueError("VIX actual 값이 숫자가 아닙니다.")

    set_axis(
        data,
        "volatility",
        "negative" if signal == "negative" else "positive" if signal == "positive" else "neutral",
        f"VIX 최신값은 {actual}입니다. 데이터 출처는 FRED VIXCLS입니다.",
        [item]
    )


def main():
    data = load_data()

    safe_axis(data, "rates", update_rates)
    safe_axis(data, "earnings", update_earnings)
    safe_axis(data, "flows", update_flows)
    safe_axis(data, "employment", update_employment)
    safe_axis(data, "consumption", update_consumption)
    safe_axis(data, "margins", update_margins)
    safe_axis(data, "dollar-commodities", update_dollar_commodities)

    # VIX는 핵심 검증 대상이므로 실패하면 workflow 자체를 실패시킨다.
    update_volatility(data)

    now = datetime.now(KST)

    data["week"] = f"{now.isocalendar().year}-W{now.isocalendar().week:02d}"
    data["updatedAt"] = now.isoformat(timespec="seconds")
    data["freshnessStatus"] = "all-axes-auto-update-ok"
    data["automation"] = {
        "lastRunAt": now.isoformat(timespec="seconds"),
        "stage": "all-axes-update",
        "note": "FRED/Stooq 기반 자동 지표와 수동 확인 지표를 모두 채웠습니다. null 값은 허용하지 않습니다."
    }

    update_market_summary(data)
    assert_no_null(data)

    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print("All axes update completed")
    print(json.dumps(data["marketSummary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
