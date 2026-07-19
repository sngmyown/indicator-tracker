const DATA_URL = `data/latest.json?ts=${Date.now()}`;
const HISTORY_URL = `data/history.json?ts=${Date.now()}`;

const AXIS_ORDER = [
  "rates",
  "earnings",
  "flows",
  "employment",
  "consumption",
  "margins",
  "dollar-commodities",
  "volatility"
];

const STATUS_LABELS = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정",
  warning: "경고",
  "manual-required": "수동 확인",
  "manual-updated": "수동 반영",
  "proxy-auto-updated": "프록시 자동",
  "auto-updated": "자동 업데이트",
  "auto-pending": "자동 대기",
  "source-error": "소스 오류",
  "not-applicable": "해당 없음"
};

const TIMING_LABELS = {
  leading: "선행",
  coincident: "동행",
  lagging: "후행",
  "leading-coincident": "선행성 동행",
  "coincident-lagging": "동행성 후행"
};

const GOLDILOCKS_ZONES = {
  us_2y_yield: "3.5~4.5% 또는 완만한 하락. 긴축 재가속 없이 완화 기대가 살아 있는 구간.",
  us_10y_yield: "4% 전후 안정 또는 완만한 하락. 장기금리 급등으로 멀티플이 압박받지 않는 구간.",
  ten_two_spread: "-0.25~+0.75%p. 깊은 역전이 완화되되, 침체형 급격한 재스티프닝은 아닌 구간.",
  real_10y_yield: "1.5~2.2% 내외에서 안정 또는 하락. 성장주·장기자산 멀티플 부담이 제한되는 구간.",
  fed_funds_rate: "추가 인상 우려보다 동결·완화 기대가 우세한 구간. 금리 수준보다 변화 방향이 중요.",

  eps_beat_rate: "70% 이상. 단순 beat보다 가이던스와 실적 후 주가 반응이 함께 좋아야 함.",
  revenue_beat_rate: "60~70% 이상 또는 개선 추세. 매출 beat가 EPS beat보다 같이 따라오는 구간.",
  m7_guidance_change: "M7 과반이 가이던스 유지·상향. 특히 AI CAPEX와 마진 훼손 우려가 낮은 구간.",
  consensus_revision: "상향 리비전이 하향 리비전보다 우세하고, 컨센서스 바닥 통과 신호가 보이는 구간.",

  spy_flow_proxy: "단기 변화율이 플러스이되 과열 급등은 아닌 구간. 시장 전체 위험선호가 유지되는 상태.",
  qqq_flow_proxy: "QQQ가 SPY 대비 상대강도를 유지하고, 기술주 자금 선호가 살아 있는 구간.",
  iwm_flow_proxy: "IWM이 플러스로 전환하거나 상대강도가 개선되는 구간. 위험선호가 대형주 밖으로 확산되는 신호.",
  sqqq_flow_proxy: "0% 이하 또는 약세. 헤지·역방향 수요가 완화되는 구간.",

  initial_claims: "20만~25만 건. 고용이 과열도 급랭도 아닌 안정권.",
  unemployment_rate: "3.5~4.5%에서 급등 없이 안정. 절대값보다 상승 속도가 중요.",
  nonfarm_payrolls: "월 +15만~22만 명. 고용 둔화와 과열 사이의 완만한 증가 구간.",
  average_hourly_earnings: "YoY 3~4%. 임금 압력이 둔화되지만 소비 체력은 유지되는 구간.",
  ism_manufacturing_pmi: "50 전후~55. 50 미만에서 반등하거나 50 이상 확장권을 유지하는 구간.",

  retail_sales_yoy: "CPI YoY보다 높은 증가율. 명목 소비가 물가를 이겨 실질 소비 체력이 살아 있는 구간.",
  cpi_yoy: "2~3%대. 디스인플레이션이 유지되면서 디플레이션 위험은 낮은 구간.",
  real_retail_sales_proxy: "0%p 이상. 소매판매 증가율이 CPI 상승률을 이기는 구간.",
  credit_card_delinquency: "3% 이하. 소비가 신용 부실로 훼손되지 않는 골디락스 구간.",

  ppi_yoy: "0~2.5% 내외. 원가 압력이 낮고 마진 훼손 위험이 제한되는 구간.",
  wage_cost_yoy: "4% 이하. 임금 비용이 재가속하지 않는 구간.",
  cpi_ppi_pass_through: "0%p 이상. CPI가 PPI보다 강해 기업의 가격전가·마진 방어 여지가 있는 구간.",
  pricing_power_mentions: "pricing power·pass-through 언급이 cost pressure·margin headwinds보다 우세한 구간.",

  dollar_index_proxy: "DXY 기준 95~105 또는 광의 달러지수 안정. 달러 급등으로 위험자산이 압박받지 않는 구간.",
  wti_oil: "70~85달러. 수요는 살아 있지만 인플레이션 쇼크는 아닌 구간.",
  copper_price: "파운드당 3.8~4.8달러 또는 상승 추세. 경기 회복 신호는 있으나 원가 쇼크는 제한되는 구간.",
  gold_price_proxy: "실질금리 하락과 함께 금이 강한 구간. 단순 공포성 급등은 별도 경계.",

  vix: "10~20. 공포가 과도하지 않고 위험선호가 유지되는 정상 변동성 구간.",
  vix_change_rate: "-10%~+10% 내외. 변동성이 급등하지 않고 안정되는 구간.",
  vix_futures_structure: "콘탱고 유지. 단기 공포가 장기 기대보다 과도하지 않은 구간.",
  fear_greed_index: "40~65. 극단적 공포도 극단적 탐욕도 아닌 중립~완만한 위험선호 구간."
};

const MANUAL_STORAGE_KEY = "eightAxisManualOverridesV1";
const WEEKLY_REVIEW_STORAGE_KEY = "eightAxisWeeklyReviewsV1";
const PORTFOLIO_STORAGE_KEY = "eightAxisPortfolioAllocationsV1";
const CHECKLIST_STORAGE_KEY = "eightAxisChecklistStatusV1";
const ECONOMIC_EVENTS_STORAGE_KEY = "eightAxisEconomicEventsV1";
const WEEKLY_REPORT_STORAGE_KEY = "eightAxisWeeklyReportsV1";


const MANUAL_REQUIRED_IDS = [
  "m7_guidance_change",
  "consensus_revision",
  "pricing_power_mentions",
  "fear_greed_index"
];

const AUTOMATED_TODO_IDS = new Set([
  "eps_beat_rate",
  "revenue_beat_rate",
  "ism_manufacturing_pmi",
  "credit_card_delinquency",
  "vix_futures_structure",
  "sp500_eps_beat_rate",
  "sp500_revenue_beat_rate",
  "s_and_p_500_eps_beat_rate",
  "s_and_p_500_revenue_beat_rate"
]);

const AUTOMATED_TODO_KEYWORDS = [
  "S&P 500 EPS",
  "EPS Beat",
  "S&P500 EPS",
  "S&P 500 Revenue",
  "Revenue Beat",
  "S&P500 Revenue",
  "ISM Manufacturing",
  "ISM 제조업",
  "ISM PMI",
  "신용카드 연체율",
  "Credit Card Delinquency",
  "VIX 선물 구조",
  "VIX Futures Structure",
  "VIX Term Structure"
];

const MANUAL_SIGNAL_OPTIONS = [
  { value: "positive", label: "긍정" },
  { value: "neutral", label: "중립" },
  { value: "negative", label: "부정" },
  { value: "warning", label: "경고" }
];

const DEFAULT_CHECKLIST_ITEMS = [
  { id: "manual-m7-guidance", label: "M7 가이던스 변화 입력", group: "수동 지표", cadence: "화~토 / 실적 시즌" },
  { id: "manual-consensus-revision", label: "컨센서스 리비전 입력", group: "수동 지표", cadence: "금요일" },
  { id: "manual-pricing-power", label: "Pricing Power 언급 입력", group: "수동 지표", cadence: "실적 콜 확인 후" },
  { id: "manual-fear-greed", label: "Fear & Greed Index 입력", group: "수동 지표", cadence: "월요일 / 금요일" },
  { id: "final-axis-classification", label: "8축 긍정 / 중립 / 부정 최종 분류", group: "기본 점검", cadence: "금요일 또는 토요일" },
  { id: "active-market-scenario", label: "현재 유효한 시장 시나리오 확인", group: "기본 점검", cadence: "금요일 또는 토요일" },
  { id: "portfolio-allocation-check", label: "포트폴리오 현금 및 자산 비중 점검", group: "기본 점검", cadence: "월요일 / 금요일 / 리밸런싱 전" },
  { id: "weekly-backup", label: "수동 기록·포트폴리오 전체 백업", group: "기본 점검", cadence: "토요일 점검 후" }
];

const EVENT_COUNTRY_OPTIONS = [
  { value: "US", label: "미국" },
  { value: "KR", label: "한국" },
  { value: "JP", label: "일본" },
  { value: "CN", label: "중국" },
  { value: "EU", label: "EU" },
  { value: "GLOBAL", label: "글로벌" },
  { value: "OTHER", label: "기타" }
];

const EVENT_AXIS_OPTIONS = [
  { value: "rates", label: "1축 금리/유동성" },
  { value: "earnings", label: "2축 기업 실적/가이던스" },
  { value: "flows", label: "3축 자금 흐름" },
  { value: "employment", label: "4축 고용/경기 사이클" },
  { value: "consumption", label: "5축 소비/수요" },
  { value: "margins", label: "6축 기업 마진" },
  { value: "dollar-commodities", label: "7축 달러/원자재" },
  { value: "volatility", label: "8축 VIX/변동성" },
  { value: "policy", label: "정책/정치/지정학" },
  { value: "portfolio", label: "포트폴리오/리밸런싱" },
  { value: "other", label: "8축 외 기타" }
];

const EVENT_TIMING_OPTIONS = [
  { value: "leading", label: "선행" },
  { value: "coincident", label: "동행" },
  { value: "lagging", label: "후행" },
  { value: "event", label: "이벤트성" },
  { value: "other", label: "기타" }
];

const EVENT_IMPORTANCE_OPTIONS = [
  { value: "high", label: "상" },
  { value: "medium", label: "중" },
  { value: "low", label: "하" }
];

let APP_RAW_DATA = null;
let APP_VIEW_DATA = null;
let APP_HISTORY_DATA = null;


function $(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function readManualOverrides() {
  try {
    const raw = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn("Manual override load failed", error);
    return {};
  }
}

function writeManualOverrides(overrides) {
  localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(overrides, null, 2));
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeManualValue(rawValue) {
  const trimmed = String(rawValue ?? "").trim();
  if (!trimmed) return "manual-required";
  const cleaned = trimmed.replaceAll(",", "");
  const numeric = Number(cleaned);
  if (Number.isFinite(numeric) && cleaned !== "") return numeric;
  return trimmed;
}

function formatDateForInput(dateLike) {
  const parsed = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function applyManualOverrides(rawData) {
  const data = cloneData(rawData);
  const overrides = readManualOverrides();

  data.indicators = (data.indicators || []).map(item => {
    const override = overrides[item.id];
    if (!override || !override.enabled) return item;

    const updated = { ...item };
    updated.currentValue = normalizeManualValue(override.rawValue);
    updated.signal = override.signal || item.signal || "neutral";
    updated.statusNote = "manual-updated";
    updated.source = "수동 입력";
    updated.sourceSeries = "localStorage";
    updated.updateCycle = "수동 확인";
    updated.manualNote = override.note || "";
    updated.manualCheckedAt = override.checkedAt || "";
    updated.manualUpdatedAt = override.updatedAt || "";

    const note = override.note ? `수동 메모: ${override.note}` : "수동으로 확인된 지표입니다.";
    updated.interpretation = note;
    updated.marketReaction = item.marketReaction || "수동 입력 신호를 8축 판단에 반영합니다.";
    updated.action = item.action || "수동 입력값이 바뀌면 8축 스코어와 시나리오를 다시 확인합니다.";

    return updated;
  });

  return data;
}

function labelStatus(status) {
  return STATUS_LABELS[status] || status || "확인 필요";
}

function badge(status, label) {
  return `<span class="badge ${escapeHtml(status)}">${escapeHtml(label || labelStatus(status))}</span>`;
}

function getGoldilocksZone(item) {
  if (!item) return "";
  if (item.goldilocksZone) return item.goldilocksZone;
  if (item.goldilocks) return item.goldilocks;
  if (item.targetZone) return item.targetZone;
  return GOLDILOCKS_ZONES[item.id] || "";
}

function renderGoldilocksZone(item, compact = false) {
  const zone = getGoldilocksZone(item);
  if (!zone) return "";
  const signalClass = currentValueStatusClass(item);
  return `
    <div class="goldilocks-zone ${compact ? "compact" : ""} ${signalClass}">
      <span class="goldilocks-label">골디락스 존</span>
      <span class="goldilocks-text">${escapeHtml(zone)}</span>
    </div>
  `;
}


function formatValue(value, unit = "") {
  if (value === null || value === undefined || value === "") return "-";
  const suffix = unit && !["index", "manual", "none"].includes(unit) ? ` ${unit}` : "";
  return `${escapeHtml(value)}${suffix}`;
}

function currentValueStatusClass(item) {
  const status = item?.statusNote || "";
  const signal = item?.signal || "";

  if (status === "source-error") return "value-error";
  if (status === "auto-pending") return "value-pending";
  if (status === "manual-required") return "value-manual";

  if (signal === "positive") return "value-signal-positive";
  if (signal === "negative") return "value-signal-negative";
  if (signal === "neutral") return "value-signal-neutral";
  if (signal === "warning") return "value-signal-warning";

  if (status === "auto-updated") return "value-live";
  if (status === "proxy-auto-updated") return "value-live";

  return "value-default";
}

function renderCurrentValue(item, extraClass = "") {
  return `<strong class="current-value-strong ${currentValueStatusClass(item)} ${extraClass}">${formatValue(item.currentValue, item.unit)}</strong>`;
}

function injectCurrentValueStyles() {
  if (document.getElementById("current-value-highlight-style")) return;

  const style = document.createElement("style");
  style.id = "current-value-highlight-style";
  style.textContent = `
    .field-current-value {
      border-color: rgba(255, 255, 255, 0.24) !important;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04)) !important;
    }

    .current-value-strong {
      display: inline-block;
      min-width: 104px;
      text-align: right;
      color: #ffffff;
      font-size: 1.55rem;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: 0.01em;
      padding: 7px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.05) inset,
        0 10px 26px rgba(0, 0, 0, 0.18);
      text-shadow: 0 1px 14px rgba(255, 255, 255, 0.18);
    }

    .current-value-strong.value-live {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.28);
    }

    .current-value-strong.value-signal-positive {
      color: #d8ffe4;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.28), rgba(34, 197, 94, 0.10));
      border-color: rgba(34, 197, 94, 0.48);
      box-shadow:
        0 0 0 1px rgba(187, 247, 208, 0.10) inset,
        0 10px 26px rgba(0, 0, 0, 0.18),
        0 0 18px rgba(34, 197, 94, 0.12);
    }

    .current-value-strong.value-signal-neutral {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.08));
      border-color: rgba(203, 213, 225, 0.35);
    }

    .current-value-strong.value-signal-negative {
      color: #ffe1e1;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.30), rgba(239, 68, 68, 0.10));
      border-color: rgba(248, 113, 113, 0.50);
      box-shadow:
        0 0 0 1px rgba(254, 202, 202, 0.10) inset,
        0 10px 26px rgba(0, 0, 0, 0.18),
        0 0 18px rgba(239, 68, 68, 0.12);
    }

    .current-value-strong.value-signal-warning {
      color: #fff2c2;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.30), rgba(245, 158, 11, 0.10));
      border-color: rgba(251, 191, 36, 0.50);
      box-shadow:
        0 0 0 1px rgba(254, 243, 199, 0.10) inset,
        0 10px 26px rgba(0, 0, 0, 0.18),
        0 0 18px rgba(245, 158, 11, 0.12);
    }

    .current-value-strong.value-pending {
      color: rgba(255, 255, 255, 0.68);
      background: rgba(255, 255, 255, 0.055);
      border-color: rgba(255, 255, 255, 0.11);
      box-shadow: none;
    }

    .current-value-strong.value-manual {
      color: #ffe9a8;
      background: rgba(255, 208, 0, 0.09);
      border-color: rgba(255, 208, 0, 0.22);
    }

    .current-value-strong.value-error {
      color: #ffb3b3;
      background: rgba(255, 80, 80, 0.11);
      border-color: rgba(255, 80, 80, 0.25);
    }

    .current-value-inline {
      min-width: auto;
      margin-left: 4px;
      margin-right: 4px;
      padding: 2px 7px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 850;
      vertical-align: baseline;
      box-shadow: none;
    }


    .goldilocks-zone {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      margin: 10px 0 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: rgba(255, 255, 255, 0.86);
      line-height: 1.45;
    }

    .goldilocks-zone.compact {
      margin: 7px 0 0;
      padding: 7px 9px;
      border-radius: 10px;
      font-size: 0.82rem;
    }

    .goldilocks-label {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 850;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      white-space: nowrap;
    }

    .goldilocks-text {
      font-size: 0.92rem;
      font-weight: 650;
    }

    .goldilocks-zone.value-signal-positive {
      background: rgba(34, 197, 94, 0.10);
      border-color: rgba(34, 197, 94, 0.28);
    }

    .goldilocks-zone.value-signal-positive .goldilocks-label {
      background: rgba(34, 197, 94, 0.25);
      border-color: rgba(34, 197, 94, 0.42);
      color: #d8ffe4;
    }

    .goldilocks-zone.value-signal-negative,
    .goldilocks-zone.value-error {
      background: rgba(239, 68, 68, 0.10);
      border-color: rgba(239, 68, 68, 0.28);
    }

    .goldilocks-zone.value-signal-negative .goldilocks-label,
    .goldilocks-zone.value-error .goldilocks-label {
      background: rgba(239, 68, 68, 0.24);
      border-color: rgba(239, 68, 68, 0.42);
      color: #ffe1e1;
    }

    .goldilocks-zone.value-signal-warning,
    .goldilocks-zone.value-manual {
      background: rgba(245, 158, 11, 0.10);
      border-color: rgba(245, 158, 11, 0.28);
    }

    .goldilocks-zone.value-signal-warning .goldilocks-label,
    .goldilocks-zone.value-manual .goldilocks-label {
      background: rgba(245, 158, 11, 0.24);
      border-color: rgba(245, 158, 11, 0.42);
      color: #fff2c2;
    }



    .live-score-card {
      border-color: rgba(255, 255, 255, 0.18);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
    }

    .live-score-card .metric-value {
      color: #ffffff;
      text-shadow: 0 1px 16px rgba(255, 255, 255, 0.12);
    }



    .scenario-card {
      border-color: rgba(255, 255, 255, 0.18);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.070), rgba(255, 255, 255, 0.030));
    }

    .scenario-card.primary-scenario {
      border-color: rgba(34, 197, 94, 0.38);
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.13), rgba(255, 255, 255, 0.035));
    }

    .scenario-card.defensive-scenario {
      border-color: rgba(239, 68, 68, 0.34);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.11), rgba(255, 255, 255, 0.030));
    }

    .scenario-card.neutral-scenario {
      border-color: rgba(148, 163, 184, 0.30);
      background: linear-gradient(135deg, rgba(148, 163, 184, 0.10), rgba(255, 255, 255, 0.030));
    }

    .scenario-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .scenario-title-row h3 {
      margin: 0;
    }

    .scenario-rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 850;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      white-space: nowrap;
    }

    .scenario-list {
      margin: 10px 0 0;
      padding-left: 18px;
      color: rgba(255, 255, 255, 0.84);
      line-height: 1.55;
      font-size: 0.92rem;
    }

    .scenario-list li + li {
      margin-top: 5px;
    }

    .scenario-section-label {
      display: block;
      margin-top: 12px;
      margin-bottom: 4px;
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.78rem;
      font-weight: 850;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .axis-mini-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .axis-mini-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 750;
      background: rgba(255, 255, 255, 0.075);
      border: 1px solid rgba(255, 255, 255, 0.13);
      color: rgba(255, 255, 255, 0.82);
    }

    .axis-mini-pill.positive {
      color: #d8ffe4;
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.28);
    }

    .axis-mini-pill.negative {
      color: #ffe1e1;
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.28);
    }

    .axis-mini-pill.neutral {
      color: #ffffff;
      background: rgba(148, 163, 184, 0.12);
      border-color: rgba(148, 163, 184, 0.24);
    }



    .badge.manual-updated {
      color: #dbeafe;
      background: rgba(59, 130, 246, 0.16);
      border-color: rgba(96, 165, 250, 0.38);
    }

    .manual-panel {
      margin-bottom: 22px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .manual-panel-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .manual-panel-header h3 {
      margin: 0 0 6px;
    }

    .manual-storage-note {
      margin: 8px 0 16px;
      color: rgba(255, 255, 255, 0.68);
      font-size: 0.88rem;
    }

    .manual-card-list {
      display: grid;
      gap: 14px;
    }

    .manual-card {
      padding: 15px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .manual-card header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .manual-card h4 {
      margin: 0 0 5px;
      color: #ffffff;
    }

    .manual-form-grid {
      display: grid;
      grid-template-columns: minmax(180px, 1.2fr) minmax(120px, 0.7fr) minmax(140px, 0.7fr);
      gap: 10px;
      margin-top: 12px;
    }

    .manual-note-label {
      display: block;
      margin-top: 10px;
    }

    .manual-form-grid label,
    .manual-note-label {
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .manual-form-grid label span,
    .manual-note-label span {
      display: block;
      margin-bottom: 6px;
    }

    .manual-input {
      width: 100%;
      box-sizing: border-box;
      color: #ffffff;
      background: rgba(15, 23, 42, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 10px;
      padding: 9px 10px;
      outline: none;
      font: inherit;
    }

    .manual-input:focus {
      border-color: rgba(96, 165, 250, 0.58);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14);
    }

    .manual-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 12px;
    }

    .manual-save,
    .manual-clear {
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      padding: 8px 12px;
      color: #ffffff;
      font-weight: 850;
      cursor: pointer;
    }

    .manual-save {
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(96, 165, 250, 0.42);
    }

    .manual-clear {
      background: rgba(255, 255, 255, 0.08);
    }

    .todo-section h3 {
      margin-top: 4px;
    }


    .history-card {
      border-color: rgba(96, 165, 250, 0.22);
    }

    .history-card .metric-value.small {
      font-size: 1.15rem;
      line-height: 1.35;
    }

    .history-delta-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    .history-delta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
    }

    .history-delta-name {
      color: rgba(255, 255, 255, 0.78);
      font-weight: 750;
      font-size: 0.86rem;
    }

    .history-delta-value {
      color: #ffffff;
      font-weight: 900;
      white-space: nowrap;
    }

    .history-delta-positive {
      color: #86efac;
    }

    .history-delta-negative {
      color: #fca5a5;
    }

    .history-delta-neutral {
      color: #e5e7eb;
    }



    .weekly-review-panel,
    .portfolio-panel {
      margin-bottom: 22px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .review-grid,
    .portfolio-form-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .review-grid label,
    .portfolio-form-grid label,
    .review-note-label {
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .review-grid label span,
    .portfolio-form-grid label span,
    .review-note-label span {
      display: block;
      margin-bottom: 6px;
    }

    .review-note-label {
      display: block;
      margin-top: 10px;
    }

    .weekly-review-actions,
    .portfolio-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .review-save,
    .review-delete,
    .portfolio-save,
    .portfolio-cancel,
    .portfolio-clear,
    .portfolio-edit,
    .portfolio-delete {
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      padding: 8px 12px;
      color: #ffffff;
      font-weight: 850;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.08);
    }

    .review-save,
    .portfolio-save {
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(96, 165, 250, 0.42);
    }

    .portfolio-edit,
    .portfolio-cancel {
      background: rgba(245, 158, 11, 0.16);
      border-color: rgba(251, 191, 36, 0.34);
    }

    .review-delete,
    .portfolio-clear,
    .portfolio-delete {
      background: rgba(239, 68, 68, 0.13);
      border-color: rgba(248, 113, 113, 0.30);
    }

    .portfolio-row-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
    }

    .portfolio-editing-note {
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.11);
      border: 1px solid rgba(251, 191, 36, 0.22);
      color: #fde68a;
      font-size: 0.84rem;
      font-weight: 800;
      display: none;
    }

    .portfolio-editing-note.is-active {
      display: block;
    }

    .review-calendar-card select,
    .review-calendar-card input {
      width: 100%;
      box-sizing: border-box;
      margin-top: 8px;
    }

    .saved-review-box {
      margin-top: 12px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .saved-review-box dl {
      margin: 8px 0 0;
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 7px 10px;
      color: rgba(255, 255, 255, 0.84);
      font-size: 0.88rem;
    }

    .saved-review-box dt {
      color: rgba(255, 255, 255, 0.58);
      font-weight: 850;
    }

    .portfolio-layout {
      display: grid;
      grid-template-columns: minmax(260px, 0.85fr) minmax(260px, 1.15fr);
      gap: 18px;
      align-items: start;
      margin-top: 14px;
    }

    .portfolio-chart-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.055);
      border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .portfolio-pie-svg {
      width: min(280px, 100%);
      height: auto;
      overflow: visible;
    }

    .portfolio-slice {
      cursor: pointer;
      stroke: rgba(15, 23, 42, 0.85);
      stroke-width: 1.2;
      transition: transform 0.14s ease, filter 0.14s ease;
      transform-origin: 100px 100px;
    }

    .portfolio-slice:hover {
      transform: scale(1.025);
      filter: brightness(1.22);
    }

    .portfolio-center-label {
      fill: #ffffff;
      font-weight: 900;
      text-anchor: middle;
      dominant-baseline: middle;
    }

    .portfolio-hover-box {
      width: 100%;
      min-height: 88px;
      box-sizing: border-box;
      padding: 12px;
      border-radius: 14px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .portfolio-logo,
    .portfolio-logo-fallback {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.12);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      flex: 0 0 auto;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.16);
    }

    .portfolio-logo img,
    .portfolio-row-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #ffffff;
    }

    .portfolio-row-list {
      display: grid;
      gap: 8px;
    }

    .portfolio-row {
      display: grid;
      grid-template-columns: 42px 1fr auto auto;
      gap: 10px;
      align-items: center;
      padding: 9px 10px;
      border-radius: 13px;
      background: rgba(255, 255, 255, 0.055);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .portfolio-row-logo {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 900;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .portfolio-row-name strong {
      display: block;
      color: #ffffff;
      font-size: 0.92rem;
    }

    .portfolio-row-name span,
    .portfolio-row-amount,
    .portfolio-row-percent {
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.83rem;
      font-weight: 800;
    }

    .portfolio-summary-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .portfolio-mode-toggle {
      display: inline-flex;
      gap: 6px;
      padding: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.13);
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .portfolio-mode-btn {
      border: 0;
      border-radius: 999px;
      padding: 7px 11px;
      color: rgba(255, 255, 255, 0.76);
      background: transparent;
      cursor: pointer;
      font-weight: 900;
      font-size: 0.8rem;
    }

    .portfolio-mode-btn.is-active {
      color: #ffffff;
      background: rgba(59, 130, 246, 0.28);
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.36);
    }

    .portfolio-row-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 5px;
    }

    .portfolio-mini-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.10);
      color: rgba(255, 255, 255, 0.76);
      font-size: 0.74rem;
      font-weight: 850;
    }

    .portfolio-rebalance-box {
      margin-top: 12px;
      padding: 12px;
      border-radius: 15px;
      background: rgba(15, 23, 42, 0.48);
      border: 1px solid rgba(255, 255, 255, 0.13);
    }

    .portfolio-rebalance-box strong {
      color: #ffffff;
    }

    .portfolio-rebalance-list {
      display: grid;
      gap: 7px;
      margin-top: 9px;
    }

    .portfolio-rebalance-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
      padding: 7px 9px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.055);
    }

    .portfolio-rebalance-row span:first-child {
      color: rgba(255, 255, 255, 0.82);
      font-weight: 850;
    }

    .portfolio-rebalance-row span:last-child {
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.8rem;
      font-weight: 850;
      text-align: right;
    }

    @media (max-width: 860px) {
      .portfolio-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .current-value-strong {
        min-width: 88px;
        font-size: 1.35rem;
        padding: 6px 10px;
      }

      .current-value-inline {
        font-size: 0.95rem;
        padding: 2px 6px;
      }

      .manual-form-grid,
      .review-grid,
      .portfolio-form-grid {
        grid-template-columns: 1fr;
      }

      .manual-card header,
      .manual-panel-header,
      .manual-actions {
        align-items: stretch;
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(style);
}

function isStale(updatedAt) {
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) return true;
  const diffHours = Math.abs(Date.now() - parsed) / 1000 / 60 / 60;
  return diffHours > 48;
}

function indicatorsByAxis(data, axisId) {
  return data.indicators.filter(item => item.axis === axisId);
}

function indicatorsByTiming(data, timing) {
  return data.indicators.filter(item => item.timing === timing || item.timing?.includes(timing));
}


function countSignals(items) {
  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
    warning: 0,
    manual: 0,
    error: 0,
    pending: 0,
    automated: 0,
    manualUpdated: 0,
    total: items.length
  };

  items.forEach(item => {
    const statusNote = item.statusNote || "";
    const signal = item.signal || "neutral";

    if (statusNote === "manual-required") counts.manual += 1;
    if (statusNote === "manual-updated") counts.manualUpdated += 1;
    if (statusNote === "source-error") counts.error += 1;
    if (statusNote === "auto-pending") counts.pending += 1;
    if (statusNote === "auto-updated" || statusNote === "proxy-auto-updated") counts.automated += 1;

    if (signal === "positive") counts.positive += 1;
    else if (signal === "negative") counts.negative += 1;
    else if (signal === "warning") counts.warning += 1;
    else counts.neutral += 1;
  });

  return counts;
}

function deriveAxisStatus(items) {
  const active = items.filter(item => !["manual-required", "auto-pending", "source-error"].includes(item.statusNote));
  if (!active.length) return "manual-required";

  const c = countSignals(active);
  const bearishWeight = c.negative + c.warning * 0.75;
  const bullishWeight = c.positive;

  if (bearishWeight >= bullishWeight + 1) return "negative";
  if (bullishWeight >= bearishWeight + 1) return "positive";
  return "neutral";
}

function computeLiveAxisScore(data) {
  const axes = AXIS_ORDER.map(axisId => {
    const axisMeta = data.axisSummary?.[axisId] || {};
    const items = indicatorsByAxis(data, axisId);
    const status = deriveAxisStatus(items);
    const counts = countSignals(items);
    return {
      axisId,
      name: axisMeta.name || axisId,
      status,
      counts,
      items
    };
  });

  const axisCounts = {
    positive: axes.filter(axis => axis.status === "positive").length,
    neutral: axes.filter(axis => axis.status === "neutral").length,
    negative: axes.filter(axis => axis.status === "negative").length,
    manual: axes.filter(axis => axis.status === "manual-required").length
  };

  const allCounts = countSignals(data.indicators || []);
  const conflictAxes = axes.filter(axis => {
    const active = axis.items.filter(item => !["manual-required", "auto-pending", "source-error"].includes(item.statusNote));
    const c = countSignals(active);
    return c.positive > 0 && (c.negative > 0 || c.warning > 0);
  });

  let regime = "혼조 / 변동성 장세";
  let riskMode = "neutral";
  let actionBias = "선별 진입 + 현금 유지";
  let cashGuide = "현금 30~45% 유지. 긍정 축과 부정 축이 충돌하므로 분할 대응.";

  if (axisCounts.positive >= 4 && axisCounts.negative <= 2) {
    regime = "위험자산 우호 / 강세 가능성";
    riskMode = "positive";
    actionBias = "우위 섹터 중심 분할 진입";
    cashGuide = "현금 20~30% 유지. 단, 과열 신호가 커지면 추격 매수 제한.";
  }

  if (axisCounts.negative >= 4) {
    regime = "방어 우선 / 약세 가능성";
    riskMode = "negative";
    actionBias = "비중 축소 + 현금 방어";
    cashGuide = "현금 45~60% 이상 검토. 신규 진입은 상대강도 높은 섹터로 제한.";
  }

  const automatedRatio = allCounts.total ? Math.round((allCounts.automated / allCounts.total) * 100) : 0;

  return {
    axes,
    axisCounts,
    allCounts,
    conflictAxes,
    regime,
    riskMode,
    actionBias,
    cashGuide,
    automatedRatio
  };
}

function renderLiveAxisScoreCard(live) {
  const conflictNames = live.conflictAxes.length
    ? live.conflictAxes.map(axis => axis.name).slice(0, 4).join(", ")
    : "뚜렷한 축 내부 충돌 없음";

  return `
    <article class="card live-score-card">
      <h3>실시간 8축 스코어</h3>
      <div class="metric-value">+${live.axisCounts.positive} / 0${live.axisCounts.neutral} / -${live.axisCounts.negative}</div>
      <p class="muted">자동 계산 기준. 수동 확인 축 ${live.axisCounts.manual}개.</p>
      <div class="badge-row">
        ${badge("positive", `긍정축 ${live.axisCounts.positive}`)}
        ${badge("neutral", `중립축 ${live.axisCounts.neutral}`)}
        ${badge("negative", `부정축 ${live.axisCounts.negative}`)}
      </div>
    </article>
    <article class="card live-score-card">
      <h3>자동 판정 시장 국면</h3>
      <div class="metric-value">${escapeHtml(live.regime)}</div>
      ${badge(live.riskMode, live.riskMode === "positive" ? "위험선호 우세" : live.riskMode === "negative" ? "방어 우세" : "혼조")}
      <p class="muted">사용자 8축 기준: 4축 이상 긍정/부정 여부를 우선 반영.</p>
    </article>
    <article class="card live-score-card">
      <h3>데이터 품질</h3>
      <div class="metric-value">${live.automatedRatio}%</div>
      <p class="muted">자동 업데이트 ${live.allCounts.automated}개 / 전체 ${live.allCounts.total}개</p>
      <div class="badge-row">
        ${badge("manual-required", `수동 ${live.allCounts.manual}`)}
        ${badge("manual-updated", `수동 반영 ${live.allCounts.manualUpdated || 0}`)}
        ${badge("source-error", `오류 ${live.allCounts.error}`)}
      </div>
    </article>
    <article class="card live-score-card">
      <h3>실행 바이어스</h3>
      <div class="metric-value">${escapeHtml(live.actionBias)}</div>
      <p class="muted">${escapeHtml(live.cashGuide)}</p>
      <p class="muted">충돌 축: ${escapeHtml(conflictNames)}</p>
    </article>
  `;
}


function getIndicator(data, id) {
  return (data.indicators || []).find(item => item.id === id);
}

function activeSignalLabel(item) {
  if (!item) return "확인 필요";
  const value = formatValue(item.currentValue, item.unit);
  return `${item.name}: ${value} · ${labelStatus(item.signal)} · ${item.statusNote || "상태 미확인"}`;
}

function axisPills(axes, status) {
  return axes
    .filter(axis => axis.status === status)
    .map(axis => `<span class="axis-mini-pill ${escapeHtml(status)}">${escapeHtml(axis.name)}</span>`)
    .join("") || `<span class="axis-mini-pill neutral">해당 축 없음</span>`;
}

function buildScenarioPlan(data, live) {
  const positive = live.axisCounts.positive;
  const negative = live.axisCounts.negative;
  const neutral = live.axisCounts.neutral;

  let primary = "base";
  if (positive >= 4 && negative <= 2) primary = "bull";
  if (negative >= 4) primary = "bear";

  const vix = getIndicator(data, "vix");
  const real10y = getIndicator(data, "real_10y_yield");
  const spread = getIndicator(data, "ten_two_spread");
  const claims = getIndicator(data, "initial_claims");
  const unrate = getIndicator(data, "unemployment_rate");
  const retailReal = getIndicator(data, "real_retail_sales_proxy");
  const dollar = getIndicator(data, "dollar_index_proxy");
  const wti = getIndicator(data, "wti_oil");

  const commonSignals = [
    activeSignalLabel(vix),
    activeSignalLabel(real10y),
    activeSignalLabel(claims),
    activeSignalLabel(retailReal)
  ];

  return [
    {
      key: "bull",
      cardClass: primary === "bull" ? "primary-scenario" : "scenario-card",
      rank: primary === "bull" ? "현재 우선 시나리오" : "대기 시나리오",
      badgeStatus: "positive",
      title: "상승 지속 시나리오",
      thesis: "금리·고용·소비·변동성 중 4축 이상이 긍정으로 유지되면 위험자산 우호 국면으로 판단한다.",
      triggers: [
        `긍정축 4개 이상 유지. 현재 +${positive} / 0${neutral} / -${negative}.`,
        "VIX가 골디락스 존 안에서 안정되고 급등하지 않을 것.",
        "실질금리 또는 10년물이 재상승하지 않고 멀티플 압박이 제한될 것.",
        "소비 프록시가 0%p 이상이거나 고용 악화 신호가 제한될 것."
      ],
      actions: [
        "현금 20~30%를 유지하면서 상대강도 높은 섹터 중심으로 분할 진입.",
        "추격 매수보다 눌림·지지 확인 후 진입. 기존 강세 섹터의 리더를 우선 검토.",
        "SQQQ 등 헤지 프록시가 강해지면 신규 진입 속도 축소."
      ],
      watch: commonSignals
    },
    {
      key: "base",
      cardClass: primary === "base" ? "primary-scenario neutral-scenario" : "scenario-card neutral-scenario",
      rank: primary === "base" ? "현재 우선 시나리오" : "대기 시나리오",
      badgeStatus: "neutral",
      title: "혼조·구간 대응 시나리오",
      thesis: "긍정축과 부정축이 동시에 존재하면 방향 예측보다 구간별 비중 조절을 우선한다.",
      triggers: [
        `긍정/부정 축이 명확히 한쪽으로 쏠리지 않음. 현재 +${positive} / 0${neutral} / -${negative}.`,
        "금리 또는 달러/원자재가 위험자산과 충돌하는 신호를 낼 것.",
        "선행지표는 개선되지만 후행지표가 아직 따라오지 않는 전환 구간일 것.",
        "주가 지수는 강하지만 소비·마진·고용 중 일부가 약해지는 상태."
      ],
      actions: [
        "현금 30~45% 유지. 신규 진입은 소액·분할·상대강도 우위 종목으로 제한.",
        "비중 조절과 종목 교체를 분리. 시장 판단이 애매할수록 한 번에 크게 움직이지 않음.",
        "축 내부 충돌이 큰 영역은 관찰 대상으로 두고, 확정 신호 2~3개가 쌓일 때만 증액."
      ],
      watch: [
        activeSignalLabel(spread),
        activeSignalLabel(dollar),
        activeSignalLabel(wti),
        activeSignalLabel(retailReal)
      ]
    },
    {
      key: "bear",
      cardClass: primary === "bear" ? "primary-scenario defensive-scenario" : "scenario-card defensive-scenario",
      rank: primary === "bear" ? "현재 우선 시나리오" : "대기 시나리오",
      badgeStatus: "negative",
      title: "방어 전환 시나리오",
      thesis: "부정축이 4개 이상으로 늘어나거나 변동성·고용·소비가 동시에 악화되면 방어를 우선한다.",
      triggers: [
        `부정축 4개 이상. 현재 부정축 ${negative}개.`,
        "VIX 급등, SQQQ 상승, SPY/QQQ/IWM 약세가 동시에 나타날 것.",
        "신규 실업수당과 실업률이 동시에 악화되며 고용축이 부정으로 전환될 것.",
        "Retail Sales - CPI 프록시가 음수로 악화되고 PPI·임금 비용이 마진을 압박할 것."
      ],
      actions: [
        "현금 45~60% 이상 검토. 신규 매수보다 손실 한도와 논리 붕괴 조건을 먼저 점검.",
        "스윙 계좌는 비중 축소·헤지·관찰 대기 중심. 장기 계좌는 추가매수 조건을 더 엄격히 적용.",
        "반등이 나와도 축 개선이 없으면 기술적 반등으로 보고 추격을 제한."
      ],
      watch: [
        activeSignalLabel(vix),
        activeSignalLabel(claims),
        activeSignalLabel(unrate),
        activeSignalLabel(retailReal)
      ]
    }
  ];
}

function renderScenarioCard(scenario) {
  return `
    <article class="card scenario-card ${escapeHtml(scenario.cardClass)}">
      <div class="scenario-title-row">
        <h3>${escapeHtml(scenario.title)}</h3>
        <span class="scenario-rank">${escapeHtml(scenario.rank)}</span>
      </div>
      ${badge(scenario.badgeStatus, labelStatus(scenario.badgeStatus))}
      <p class="muted">${escapeHtml(scenario.thesis)}</p>
      <span class="scenario-section-label">발동 조건</span>
      <ul class="scenario-list">
        ${scenario.triggers.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <span class="scenario-section-label">대응 원칙</span>
      <ul class="scenario-list">
        ${scenario.actions.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <span class="scenario-section-label">핵심 확인 신호</span>
      <ul class="scenario-list">
        ${scenario.watch.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderScenarioActionPlan(data, live) {
  const scenarios = buildScenarioPlan(data, live);
  return `
    <article class="card live-score-card">
      <h3>긍정 축</h3>
      <div class="axis-mini-list">${axisPills(live.axes, "positive")}</div>
      <p class="muted">강한 축은 신규 진입 후보를 좁히는 상위 필터로 사용.</p>
    </article>
    <article class="card live-score-card">
      <h3>부정 축</h3>
      <div class="axis-mini-list">${axisPills(live.axes, "negative")}</div>
      <p class="muted">부정 축은 현금 비중과 손실 한도를 결정하는 방어 필터로 사용.</p>
    </article>
    <article class="card live-score-card">
      <h3>중립 축</h3>
      <div class="axis-mini-list">${axisPills(live.axes, "neutral")}</div>
      <p class="muted">중립 축은 다음 방향 전환 신호를 기다리는 관찰 영역.</p>
    </article>
    ${scenarios.map(renderScenarioCard).join("")}
  `;
}

function renderMeta(data) {
  const meta = data.meta || {};
  $("metaPanel").innerHTML = `
    <div><strong>마지막 업데이트</strong><br>${escapeHtml(meta.updatedAt || "확인 필요")}</div>
    <div class="mini-row">
      ${badge(meta.dataStatus || "manual-required", `데이터: ${meta.dataStatus || "확인 필요"}`)}
      ${badge("neutral", `모드: ${meta.sourceMode || "확인 필요"}`)}
    </div>
  `;

  const warning = $("dataWarning");
  if (isStale(meta.updatedAt)) {
    warning.textContent = "데이터가 오래되었습니다. GitHub Actions 자동 업데이트 상태를 확인하세요.";
    warning.classList.remove("hidden");
  } else if (meta.dataStatus && meta.dataStatus !== "ok") {
    warning.textContent = `현재 데이터 상태: ${meta.dataStatus}. 일부 지표는 수동 확인 또는 자동화 연결 대기 상태입니다.`;
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}


function getHistorySnapshots(history) {
  if (!history || !Array.isArray(history.snapshots)) return [];
  return history.snapshots.filter(Boolean);
}

function getSnapshotIndicator(snapshot, id) {
  return (snapshot?.keyIndicators || []).find(item => item.id === id);
}

function numericOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatDeltaNumber(value, unit = "") {
  const numeric = numericOrNull(value);
  if (numeric === null) return "-";
  const sign = numeric > 0 ? "+" : "";
  const absValue = Math.abs(numeric);
  const decimals = absValue >= 100 ? 0 : absValue >= 10 ? 2 : 2;
  const suffix = unit && !["index", "manual", "none"].includes(unit) ? ` ${unit}` : "";
  return `${sign}${numeric.toFixed(decimals)}${suffix}`;
}

function deltaClass(delta) {
  const numeric = numericOrNull(delta);
  if (numeric === null || Math.abs(numeric) < 0.00001) return "history-delta-neutral";
  return numeric > 0 ? "history-delta-positive" : "history-delta-negative";
}

function renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, id, label, unitOverride = null) {
  const latest = getSnapshotIndicator(latestSnapshot, id);
  const previous = getSnapshotIndicator(previousSnapshot, id);
  const latestValue = numericOrNull(latest?.currentValue);
  const previousValue = numericOrNull(previous?.currentValue);
  const unit = unitOverride ?? latest?.unit ?? previous?.unit ?? "";

  if (latestValue === null || previousValue === null) {
    return `
      <div class="history-delta-row">
        <span class="history-delta-name">${escapeHtml(label)}</span>
        <span class="history-delta-value history-delta-neutral">비교 대기</span>
      </div>
    `;
  }

  const delta = latestValue - previousValue;
  return `
    <div class="history-delta-row">
      <span class="history-delta-name">${escapeHtml(label)}</span>
      <span class="history-delta-value ${deltaClass(delta)}">${formatDeltaNumber(delta, unit)}</span>
    </div>
  `;
}

function renderAxisCountDelta(label, currentValue, previousValue, status) {
  const delta = Number(currentValue || 0) - Number(previousValue || 0);
  return `
    <div class="history-delta-row">
      <span class="history-delta-name">${escapeHtml(label)}</span>
      <span class="history-delta-value ${deltaClass(delta)}">${previousValue ?? 0} → ${currentValue ?? 0} (${formatDeltaNumber(delta)})</span>
    </div>
  `;
}

function renderHistoryOverview(data, history, live) {
  const snapshots = getHistorySnapshots(history);
  const latestSnapshot = snapshots[snapshots.length - 1];
  const previousSnapshot = snapshots[snapshots.length - 2];

  if (!latestSnapshot) {
    return `
      <article class="card history-card">
        <h3>히스토리 저장 상태</h3>
        <div class="metric-value small">대기 중</div>
        <p class="muted">data/history.json이 아직 없거나 스냅샷이 없습니다. 다음 데이터 업데이트 후 주간 변화 추적이 시작됩니다.</p>
      </article>
    `;
  }

  const currentCounts = latestSnapshot.axisCounts || live.axisCounts || {};
  const previousCounts = previousSnapshot?.axisCounts || {};
  const previousRegime = previousSnapshot?.marketRegime || "이전 기록 없음";
  const currentRegime = latestSnapshot.marketRegime || live.regime || "확인 필요";

  const axisDeltaBody = previousSnapshot ? `
        ${renderAxisCountDelta("긍정 축", currentCounts.positive, previousCounts.positive, "positive")}
        ${renderAxisCountDelta("중립 축", currentCounts.neutral, previousCounts.neutral, "neutral")}
        ${renderAxisCountDelta("부정 축", currentCounts.negative, previousCounts.negative, "negative")}
      ` : `
        <div class="history-delta-row">
          <span class="history-delta-name">비교 기준</span>
          <span class="history-delta-value history-delta-neutral">첫 스냅샷 저장 완료</span>
        </div>
      `;

  return `
    <article class="card history-card">
      <h3>히스토리 저장 상태</h3>
      <div class="metric-value small">${escapeHtml(String(snapshots.length))}회 기록</div>
      <p class="muted">최신 스냅샷: ${escapeHtml(latestSnapshot.updatedAt || latestSnapshot.date || "확인 필요")}</p>
      <p class="muted">저장 파일: data/history.json</p>
    </article>

    <article class="card history-card">
      <h3>전회 대비 8축 변화</h3>
      <div class="history-delta-list">
        ${axisDeltaBody}
      </div>
    </article>

    <article class="card history-card">
      <h3>시장 국면 변화</h3>
      <div class="metric-value small">${escapeHtml(currentRegime)}</div>
      <p class="muted">이전: ${escapeHtml(previousRegime)}</p>
      <p class="muted">${escapeHtml(latestSnapshot.cashGuide || "현금 비중 가이드는 다음 스냅샷부터 비교합니다.")}</p>
    </article>

    <article class="card history-card">
      <h3>핵심 지표 변화</h3>
      <div class="history-delta-list">
        ${renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, "vix", "VIX")}
        ${renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, "us_10y_yield", "10년물 금리")}
        ${renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, "initial_claims", "신규 실업수당")}
        ${renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, "real_retail_sales_proxy", "Retail Sales - CPI")}
        ${renderIndicatorHistoryDelta(latestSnapshot, previousSnapshot, "eps_beat_rate", "EPS Beat Rate")}
      </div>
    </article>
  `;
}

function renderOverview(data, history) {
  const m = data.marketSummary || {};
  const t = data.timingSummary || {};
  const live = computeLiveAxisScore(data);

  $("summaryGrid").innerHTML = `
    ${renderLiveAxisScoreCard(live)}
    ${renderScenarioActionPlan(data, live)}
    ${renderHistoryOverview(data, history, live)}
    ${renderWeeklyReviewCalendar()}
    ${renderEconomicEventCalendar()}
    ${renderChecklistProgressCard()}
    ${renderPortfolioOverviewCard()}
    <article class="card">
      <h3>기존 시장 국면 메모</h3>
      <div class="metric-value">${escapeHtml(m.marketConditionLabel || "확인 필요")}</div>
      ${badge(m.riskMode || "neutral", m.riskMode || "balanced")}
    </article>
    <article class="card">
      <h3>기존 8축 판정</h3>
      <div class="metric-value">+${m.positiveAxes ?? 0} / 0${m.neutralAxes ?? 0} / -${m.negativeAxes ?? 0}</div>
      <p class="muted">latest.json에 저장된 긍정 / 중립 / 부정 축 개수</p>
    </article>
    <article class="card">
      <h3>시간성 신호</h3>
      <div class="badge-row">
        ${badge(t.leading?.status || "neutral", `선행 ${labelStatus(t.leading?.status)}`)}
        ${badge(t.coincident?.status || "neutral", `동행 ${labelStatus(t.coincident?.status)}`)}
        ${badge(t.lagging?.status || "neutral", `후행 ${labelStatus(t.lagging?.status)}`)}
      </div>
    </article>
    <article class="card">
      <h3>기존 액션 바이어스</h3>
      <div class="metric-value">${escapeHtml(m.actionBias || "확인 필요")}</div>
      <p class="muted">현금 가이드: ${escapeHtml(m.cashRatioGuide || "확인 필요")}</p>
    </article>
  `;

  $("marketNarrative").textContent = `자동 판정: ${live.regime}. ${live.cashGuide}`;
  $("conflictNarrative").textContent = live.conflictAxes.length
    ? `축 내부 충돌 감지: ${live.conflictAxes.map(axis => axis.name).join(", ")}. 긍정 신호와 부정/경고 신호가 같은 축 안에서 동시에 존재합니다.`
    : (m.conflictSummary || "현재 자동 신호 기준으로 뚜렷한 축 내부 충돌은 제한적입니다.");
}

function renderAxes(data) {
  const axisSummary = data.axisSummary || {};

  $("axisGrid").innerHTML = AXIS_ORDER.map(axisId => {
    const axis = axisSummary[axisId];
    if (!axis) return "";
    const items = indicatorsByAxis(data, axisId).slice(0, 5);

    return `
      <article class="axis-card">
        <header>
          <div>
            <h3>${escapeHtml(axis.order)}축. ${escapeHtml(axis.name)}</h3>
            <p class="muted">${escapeHtml(axis.summary)}</p>
          </div>
          ${badge(axis.status, labelStatus(axis.status))}
        </header>
        <div class="badge-row">
          ${badge(axis.leadingStatus, `선행 ${labelStatus(axis.leadingStatus)}`)}
          ${badge(axis.coincidentStatus, `동행 ${labelStatus(axis.coincidentStatus)}`)}
          ${badge(axis.laggingStatus, `후행 ${labelStatus(axis.laggingStatus)}`)}
        </div>
        <p><strong>해석:</strong> ${escapeHtml(axis.interpretation)}</p>
        <p><strong>액션:</strong> ${escapeHtml(axis.action)}</p>
        <div class="key-list">
          ${items.map(item => `
            <div class="key-item">
              <strong>${escapeHtml(item.name)} ${badge(item.signal, labelStatus(item.signal))}</strong>
              <span>${escapeHtml(item.timingLabel)} · 현재값 ${renderCurrentValue(item, "current-value-inline")} · ${escapeHtml(item.statusNote)}</span>
              ${renderGoldilocksZone(item, true)}
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderTiming(data) {
  const summary = data.timingSummary || {};
  const groups = ["leading", "coincident", "lagging"];

  $("timingGrid").innerHTML = groups.map(key => {
    const group = summary[key] || {};
    const items = indicatorsByTiming(data, key).slice(0, 8);

    return `
      <article class="card">
        <h3>${escapeHtml(group.label || TIMING_LABELS[key])}</h3>
        ${badge(group.status || "neutral", labelStatus(group.status))}
        <p class="muted">${escapeHtml(group.summary || "요약 없음")}</p>
        <div class="key-list">
          ${items.map(item => `
            <div class="key-item">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.axisName)} · ${badge(item.signal, labelStatus(item.signal))}</span>
            </div>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderMatrix(data) {
  const matrix = data.matrix || {};
  const rows = AXIS_ORDER.map(axisId => matrix[axisId]).filter(Boolean);

  $("matrixTable").innerHTML = `
    <thead>
      <tr>
        <th>축</th>
        <th>선행지표</th>
        <th>동행지표</th>
        <th>후행지표</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr>
          <td><strong>${escapeHtml(row.axisName)}</strong></td>
          <td>${badge(row.leading, labelStatus(row.leading))}</td>
          <td>${badge(row.coincident, labelStatus(row.coincident))}</td>
          <td>${badge(row.lagging, labelStatus(row.lagging))}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function indicatorCard(item) {
  return `
    <article class="indicator-card" data-search="${escapeHtml(`${item.name} ${item.axisName} ${item.source} ${item.sourceSeries}`.toLowerCase())}">
      <header>
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p class="muted">${escapeHtml(item.axisName)} · ${escapeHtml(item.timingLabel)} · ${escapeHtml(item.updateCycle)}</p>
        </div>
        ${badge(item.signal, labelStatus(item.signal))}
      </header>
      <div class="indicator-grid">
        <div class="field field-current-value"><small>현재값</small>${renderCurrentValue(item)}</div>
        <div class="field"><small>이전값</small><strong>${formatValue(item.previousValue, item.unit)}</strong></div>
        <div class="field"><small>변화</small><strong>${formatValue(item.change, item.unit)} / ${formatValue(item.changePercent, "%")}</strong></div>
        <div class="field"><small>출처</small><strong>${escapeHtml(item.source)} · ${escapeHtml(item.sourceSeries)}</strong></div>
      </div>
      ${renderGoldilocksZone(item)}
      <p><strong>의미:</strong> ${escapeHtml(item.meaning)}</p>
      <p><strong>해석:</strong> ${escapeHtml(item.interpretation)}</p>
      <p><strong>시장 반응:</strong> ${escapeHtml(item.marketReaction)}</p>
      <p><strong>액션:</strong> ${escapeHtml(item.action)}</p>
      <div class="badge-row">
        ${badge("positive", `긍정 기준: ${item.positiveCondition}`)}
        ${badge("neutral", `중립 기준: ${item.neutralCondition}`)}
        ${badge("negative", `부정 기준: ${item.negativeCondition}`)}
      </div>
    </article>
  `;
}

function renderIndicators(data) {
  const list = $("indicatorList");
  list.innerHTML = data.indicators.map(indicatorCard).join("");

  const search = $("indicatorSearch");
  if (search) {
    search.oninput = () => {
      const query = search.value.trim().toLowerCase();
      list.querySelectorAll(".indicator-card").forEach(card => {
        card.classList.toggle("hidden", query && !card.dataset.search.includes(query));
      });
    };
  }
}

function isAutomatedTodoItem(item) {
  if (!item) return false;
  const id = String(item.id || "");
  const text = [item.id, item.label, item.name, item.title, item.summary, item.description].filter(Boolean).join(" ");
  return AUTOMATED_TODO_IDS.has(id) || AUTOMATED_TODO_KEYWORDS.some(keyword => text.includes(keyword));
}

function isManualTarget(item) {
  if (!item) return false;
  if (isAutomatedTodoItem(item)) return false;
  return item.statusNote === "manual-required"
    || item.statusNote === "manual-updated"
    || MANUAL_REQUIRED_IDS.includes(item.id);
}

function manualSignalOptionsHtml(selected) {
  return MANUAL_SIGNAL_OPTIONS.map(option => `
    <option value="${escapeHtml(option.value)}" ${selected === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function renderManualInputPanel(data) {
  const overrides = readManualOverrides();
  const manualItems = (data.indicators || []).filter(isManualTarget);

  if (!manualItems.length) {
    return `
      <section class="manual-panel">
        <div class="manual-panel-header">
          <div>
            <h3>수동 확인 지표 입력</h3>
            <p class="muted">현재 수동 입력 대상 지표가 없습니다.</p>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="manual-panel">
      <div class="manual-panel-header">
        <div>
          <h3>수동 확인 지표 입력 패널</h3>
          <p class="muted">자동화가 어려운 정성·해석형 지표를 직접 입력하면 8축 스코어와 시나리오 판단에 즉시 반영됩니다.</p>
        </div>
        ${badge("manual-updated", "브라우저 저장")}
      </div>
      <p class="manual-storage-note">저장 위치: 이 브라우저의 localStorage. 다른 PC·브라우저에는 자동 동기화되지 않습니다.</p>
      <div class="manual-card-list">
        ${manualItems.map(item => {
          const override = overrides[item.id] || {};
          const rawValue = override.rawValue ?? (item.statusNote === "manual-updated" ? item.currentValue : "");
          const signal = override.signal || item.signal || "neutral";
          const note = override.note || item.manualNote || "";
          const checkedAt = override.checkedAt || item.manualCheckedAt || formatDateForInput(new Date());

          return `
            <article class="manual-card" data-manual-card="${escapeHtml(item.id)}">
              <header>
                <div>
                  <h4>${escapeHtml(item.name)}</h4>
                  <p class="muted">${escapeHtml(item.axisName)} · ${escapeHtml(item.timingLabel)} · ID: ${escapeHtml(item.id)}</p>
                </div>
                <div class="badge-row">
                  ${badge(item.signal || "neutral", labelStatus(item.signal))}
                  ${badge(item.statusNote || "manual-required", labelStatus(item.statusNote))}
                </div>
              </header>
              ${renderGoldilocksZone(item, true)}
              <div class="manual-form-grid">
                <label>
                  <span>현재값 / 요약</span>
                  <input class="manual-input" data-manual-id="${escapeHtml(item.id)}" data-manual-field="rawValue" value="${escapeHtml(rawValue)}" placeholder="예: 72%, 상향, 콘탱고, 58" />
                </label>
                <label>
                  <span>판정</span>
                  <select class="manual-input" data-manual-id="${escapeHtml(item.id)}" data-manual-field="signal">
                    ${manualSignalOptionsHtml(signal)}
                  </select>
                </label>
                <label>
                  <span>확인일</span>
                  <input class="manual-input" type="date" data-manual-id="${escapeHtml(item.id)}" data-manual-field="checkedAt" value="${escapeHtml(checkedAt)}" />
                </label>
              </div>
              <label class="manual-note-label">
                <span>메모</span>
                <textarea class="manual-input" data-manual-id="${escapeHtml(item.id)}" data-manual-field="note" rows="3" placeholder="근거, 출처, 다음 확인 신호를 적어두세요.">${escapeHtml(note)}</textarea>
              </label>
              <div class="manual-actions">
                <button type="button" class="manual-save" data-manual-action="save" data-manual-id="${escapeHtml(item.id)}">저장 · 8축 반영</button>
                <button type="button" class="manual-clear" data-manual-action="clear" data-manual-id="${escapeHtml(item.id)}">입력 삭제</button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function setupManualInputHandlers() {
  document.querySelectorAll("[data-manual-action]").forEach(button => {
    button.onclick = () => {
      const id = button.dataset.manualId;
      const action = button.dataset.manualAction;
      const overrides = readManualOverrides();

      if (action === "clear") {
        delete overrides[id];
        writeManualOverrides(overrides);
        APP_VIEW_DATA = applyManualOverrides(APP_RAW_DATA);
        renderAll(APP_VIEW_DATA);
        return;
      }

      const fields = Array.from(document.querySelectorAll("[data-manual-id]")).filter(field => field.dataset.manualId === id);
      const next = {
        enabled: true,
        rawValue: "",
        signal: "neutral",
        checkedAt: formatDateForInput(new Date()),
        note: "",
        updatedAt: new Date().toISOString()
      };

      fields.forEach(field => {
        const key = field.dataset.manualField;
        if (!key) return;
        next[key] = field.value;
      });

      overrides[id] = next;
      writeManualOverrides(overrides);
      APP_VIEW_DATA = applyManualOverrides(APP_RAW_DATA);
      renderAll(APP_VIEW_DATA);
    };
  });
}


function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.warn(`Storage read failed: ${key}`, error);
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value, null, 2));
}

function readWeeklyReviews() {
  const reviews = readJsonStorage(WEEKLY_REVIEW_STORAGE_KEY, []);
  return Array.isArray(reviews) ? reviews : [];
}

function writeWeeklyReviews(reviews) {
  const sorted = [...reviews].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  writeJsonStorage(WEEKLY_REVIEW_STORAGE_KEY, sorted);
}

function readPortfolioHoldings() {
  const holdings = readJsonStorage(PORTFOLIO_STORAGE_KEY, []);
  return Array.isArray(holdings) ? holdings : [];
}

function writePortfolioHoldings(holdings) {
  writeJsonStorage(PORTFOLIO_STORAGE_KEY, holdings);
}


function readChecklistStatus() {
  const checklist = readJsonStorage(CHECKLIST_STORAGE_KEY, {});
  return checklist && typeof checklist === "object" && !Array.isArray(checklist) ? checklist : {};
}

function writeChecklistStatus(checklist) {
  writeJsonStorage(CHECKLIST_STORAGE_KEY, checklist || {});
}

function readEconomicEvents() {
  const events = readJsonStorage(ECONOMIC_EVENTS_STORAGE_KEY, []);
  return Array.isArray(events) ? events : [];
}

function writeEconomicEvents(events) {
  const sorted = [...events].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.title || "").localeCompare(String(b.title || "")));
  writeJsonStorage(ECONOMIC_EVENTS_STORAGE_KEY, sorted);
}

function readWeeklyReports() {
  const reports = readJsonStorage(WEEKLY_REPORT_STORAGE_KEY, []);
  return Array.isArray(reports) ? reports : [];
}

function writeWeeklyReports(reports) {
  const sorted = [...reports].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  writeJsonStorage(WEEKLY_REPORT_STORAGE_KEY, sorted);
}

function latestWeeklyReport() {
  const reports = readWeeklyReports();
  return reports.length ? reports[reports.length - 1] : null;
}

function optionHtml(options, selected) {
  return options.map(option => `
    <option value="${escapeHtml(option.value)}" ${selected === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function labelFromOptions(options, value) {
  return options.find(option => option.value === value)?.label || value || "-";
}

function todayKoreaDate() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

function latestReview() {
  const reviews = readWeeklyReviews();
  return reviews.length ? reviews[reviews.length - 1] : null;
}

function getReviewByDate(date) {
  return readWeeklyReviews().find(item => item.date === date) || null;
}

function getManualOverrideValue(id) {
  const override = readManualOverrides()[id];
  if (!override || !override.enabled) return "";
  return override.rawValue || "";
}

function getManualOverrideSignal(id, fallback = "neutral") {
  const override = readManualOverrides()[id];
  if (!override || !override.enabled) return fallback;
  return override.signal || fallback;
}

function reviewValue(review, key, fallback = "") {
  return escapeHtml(review?.[key] ?? fallback);
}


function eventsForDate(date) {
  return readEconomicEvents().filter(event => event.date === date);
}

function upcomingEconomicEvents(limit = 5) {
  const today = todayKoreaDate();
  return readEconomicEvents()
    .filter(event => String(event.date || "") >= today)
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .slice(0, limit);
}

function renderEventBadges(event) {
  return `
    ${badge("neutral", labelFromOptions(EVENT_COUNTRY_OPTIONS, event.country))}
    ${badge(event.importance === "high" ? "warning" : event.importance === "medium" ? "neutral" : "not-applicable", `중요도 ${labelFromOptions(EVENT_IMPORTANCE_OPTIONS, event.importance)}`)}
    ${badge("neutral", labelFromOptions(EVENT_AXIS_OPTIONS, event.axis))}
    ${badge("neutral", labelFromOptions(EVENT_TIMING_OPTIONS, event.timing))}
  `;
}

const CALENDAR_STATE_STORAGE_KEY = "market-dashboard-calendar-state-v1";
const MONTHLY_FOCUS_STORAGE_KEY = "market-dashboard-monthly-focus-v1";

function readMonthlyFocusMap() {
  const raw = readJsonStorage(MONTHLY_FOCUS_STORAGE_KEY, {});
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw;
}

function writeMonthlyFocusMap(map) {
  const clean = {};
  Object.entries(map || {}).forEach(([month, value]) => {
    if (/^\d{4}-\d{2}$/.test(month) && String(value || "").trim()) {
      clean[month] = String(value || "").trim();
    }
  });
  writeJsonStorage(MONTHLY_FOCUS_STORAGE_KEY, clean);
}

function getMonthlyFocus(monthString) {
  return String(readMonthlyFocusMap()[monthString] || "").trim();
}

function setMonthlyFocus(monthString, title) {
  const map = readMonthlyFocusMap();
  const cleanTitle = String(title || "").trim();
  if (!/^\d{4}-\d{2}$/.test(monthString || "")) return;
  if (cleanTitle) {
    map[monthString] = cleanTitle.slice(0, 80);
  } else {
    delete map[monthString];
  }
  writeMonthlyFocusMap(map);
}

function readCalendarState() {
  const today = todayKoreaDate();
  const raw = readJsonStorage(CALENDAR_STATE_STORAGE_KEY, null);
  if (!raw || typeof raw !== "object") {
    return { selectedDate: today, month: today.slice(0, 7) };
  }
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.selectedDate || "") ? raw.selectedDate : today;
  const month = /^\d{4}-\d{2}$/.test(raw.month || "") ? raw.month : selectedDate.slice(0, 7);
  return { selectedDate, month };
}

function writeCalendarState(state) {
  const today = todayKoreaDate();
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(state?.selectedDate || "") ? state.selectedDate : today;
  const month = /^\d{4}-\d{2}$/.test(state?.month || "") ? state.month : selectedDate.slice(0, 7);
  writeJsonStorage(CALENDAR_STATE_STORAGE_KEY, { selectedDate, month });
}

function ymdParts(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  return { year: year || 1970, month: month || 1, day: day || 1 };
}

function makeYmd(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shiftMonth(monthString, delta) {
  const [year, month] = String(monthString || todayKoreaDate().slice(0, 7)).split("-").map(Number);
  const date = new Date(year, (month || 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthString) {
  const [year, month] = String(monthString).split("-");
  return `${year}년 ${Number(month)}월`;
}

function checklistItemsForDate(dateString) {
  const status = readChecklistStatus();
  return DEFAULT_CHECKLIST_ITEMS
    .map(item => ({ item, state: status[item.id] || {} }))
    .filter(row => row.state.doneAt && String(row.state.doneAt).slice(0, 10) === dateString);
}

function economicEventsForMonth(monthString) {
  return readEconomicEvents().filter(event => String(event.date || "").startsWith(monthString));
}

function renderCalendarCell(dateString, currentMonth, selectedDate, today) {
  const { day } = ymdParts(dateString);
  const inMonth = dateString.startsWith(currentMonth);
  const eventCount = eventsForDate(dateString).length;
  const checklistCount = checklistItemsForDate(dateString).length;
  const review = getReviewByDate(dateString);
  const classes = [
    "calendar-day",
    inMonth ? "is-current-month" : "is-out-month",
    dateString === today ? "is-today" : "",
    dateString === selectedDate ? "is-selected" : "",
    eventCount ? "has-events" : "",
    checklistCount ? "has-checklist" : "",
    review ? "has-review" : ""
  ].filter(Boolean).join(" ");

  const dotHtml = `
    <span class="calendar-dots">
      ${eventCount ? `<i class="dot event-dot" title="이벤트 ${eventCount}개"></i>` : ""}
      ${checklistCount ? `<i class="dot checklist-dot" title="체크리스트 ${checklistCount}개"></i>` : ""}
      ${review ? `<i class="dot review-dot" title="주간 점검 기록"></i>` : ""}
    </span>
  `;

  return `
    <button type="button" class="${classes}" data-calendar-date="${escapeHtml(dateString)}" aria-label="${escapeHtml(dateString)}">
      <span class="calendar-day-number">${day}</span>
      ${dotHtml}
      ${eventCount ? `<span class="calendar-day-mini">이벤트 ${eventCount}</span>` : ""}
      ${review ? `<span class="calendar-day-mini review-mini">점검</span>` : ""}
    </button>
  `;
}

function buildMonthGrid(monthString, selectedDate) {
  const [year, month] = monthString.split("-").map(Number);
  const today = todayKoreaDate();
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month - 1, 1 - startOffset);
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    const dateString = makeYmd(d.getFullYear(), d.getMonth() + 1, d.getDate());
    cells.push(renderCalendarCell(dateString, monthString, selectedDate, today));
  }
  return cells.join("");
}

function renderSelectedDateDetails(selectedDate) {
  const events = eventsForDate(selectedDate);
  const checklistRows = checklistItemsForDate(selectedDate);
  const review = getReviewByDate(selectedDate);

  const eventList = events.length ? events.map(event => `
    <div class="economic-event-row">
      <strong>${escapeHtml(event.title)}</strong>
      <div class="badge-row">${renderEventBadges(event)}</div>
      <p class="muted">${escapeHtml(event.memo || "메모 없음")}</p>
    </div>
  `).join("") : `<p class="muted">선택한 날짜에 저장된 경제·증시 이벤트가 없습니다.</p>`;

  const checklistList = checklistRows.length ? checklistRows.map(row => `
    <div class="calendar-checklist-row">
      <strong>${escapeHtml(row.item.label)}</strong>
      <span>${escapeHtml(row.item.cadence)}</span>
      ${row.state.note ? `<p class="muted">${escapeHtml(row.state.note)}</p>` : ""}
    </div>
  `).join("") : `<p class="muted">이 날짜에 완료 처리된 체크리스트가 없습니다.</p>`;

  const reviewBox = review ? `
    <div class="saved-review-box calendar-review-box">
      <strong>주간 점검 기록</strong>
      <dl>
        <dt>M7</dt><dd>${reviewValue(review, "m7Guidance", "-")} · ${labelStatus(review.m7Signal)}</dd>
        <dt>컨센서스</dt><dd>${reviewValue(review, "consensusRevision", "-")} · ${labelStatus(review.consensusSignal)}</dd>
        <dt>Pricing Power</dt><dd>${reviewValue(review, "pricingPower", "-")} · ${labelStatus(review.pricingSignal)}</dd>
        <dt>Fear & Greed</dt><dd>${reviewValue(review, "fearGreed", "-")} · ${labelStatus(review.fearGreedSignal)}</dd>
        <dt>최종 8축</dt><dd>${reviewValue(review, "finalAxisClass", "-")}</dd>
        <dt>시나리오</dt><dd>${reviewValue(review, "activeScenario", "-")}</dd>
        <dt>현금/자산</dt><dd>${reviewValue(review, "cashAllocationNote", "-")}</dd>
        <dt>메모</dt><dd>${reviewValue(review, "weeklyMemo", "-")}</dd>
      </dl>
    </div>
  ` : `<p class="muted">이 날짜에 저장된 주간 점검 기록이 없습니다.</p>`;

  return `
    <div class="calendar-detail-box">
      <div class="calendar-detail-header">
        <strong>${escapeHtml(selectedDate)}</strong>
        <span>${events.length}개 이벤트 · ${checklistRows.length}개 완료 · ${review ? "점검 기록 있음" : "점검 기록 없음"}</span>
      </div>
      <div class="calendar-detail-grid">
        <section>
          <h4>이벤트</h4>
          ${eventList}
        </section>
        <section>
          <h4>체크리스트 완료</h4>
          ${checklistList}
        </section>
        <section>
          <h4>주간 점검 기록</h4>
          ${reviewBox}
        </section>
      </div>
    </div>
  `;
}

function renderEconomicEventCalendar() {
  const state = readCalendarState();
  const currentMonth = state.month;
  const selectedDate = state.selectedDate;
  const monthEvents = economicEventsForMonth(currentMonth);
  const monthlyFocus = getMonthlyFocus(currentMonth);
  const upcoming = upcomingEconomicEvents(6);
  const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const upcomingList = upcoming.length ? upcoming.map(event => `
    <button type="button" class="economic-event-mini event-jump" data-calendar-date="${escapeHtml(event.date)}">
      <span>${escapeHtml(event.date)}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <em>${escapeHtml(labelFromOptions(EVENT_COUNTRY_OPTIONS, event.country))} · ${escapeHtml(labelFromOptions(EVENT_AXIS_OPTIONS, event.axis))}</em>
    </button>
  `).join("") : `<p class="muted">예정 이벤트가 없습니다. To do / 점검 탭에서 직접 추가하세요.</p>`;

  return `
    <article class="card economic-calendar-card full-calendar-card">
      <div class="calendar-topbar">
        <div>
          <h3>증시·경제 이벤트 캘린더</h3>
          <p class="muted">이벤트, 체크리스트 완료, 주간 점검 기록을 월간 달력에서 확인합니다.</p>
        </div>
        <div class="calendar-actions">
          <button type="button" data-calendar-shift="-1">이전달</button>
          <button type="button" data-calendar-today="1">오늘</button>
          <button type="button" data-calendar-shift="1">다음달</button>
        </div>
      </div>
      <div class="calendar-month-focus-row">
        <div class="calendar-month-label">${escapeHtml(monthLabel(currentMonth))}</div>
        <div class="calendar-month-focus-title ${monthlyFocus ? "has-focus" : "is-empty"}">
          <span>월간 포커스</span>
          <strong>${escapeHtml(monthlyFocus || "이번 달 핵심 이벤트/집중 주제를 입력하세요")}</strong>
        </div>
      </div>
      <div class="calendar-month-focus-editor">
        <input id="calendarMonthFocusInput" type="text" maxlength="80" value="${escapeHtml(monthlyFocus)}" placeholder="예: FOMC·CPI 확인 / M7 실적 시즌 / 방어적 리밸런싱" />
        <button type="button" data-calendar-focus-save="1">저장</button>
        <button type="button" data-calendar-focus-clear="1">삭제</button>
      </div>
      <div class="calendar-legend">
        <span><i class="dot event-dot"></i> 이벤트</span>
        <span><i class="dot checklist-dot"></i> 체크리스트</span>
        <span><i class="dot review-dot"></i> 주간 점검</span>
      </div>
      <div class="calendar-weekdays">
        ${weekdayLabels.map(day => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">
        ${buildMonthGrid(currentMonth, selectedDate)}
      </div>
      ${renderSelectedDateDetails(selectedDate)}
      <h4>다가오는 이벤트</h4>
      <div class="economic-upcoming-list">${upcomingList}</div>
      <p class="muted">이번 달 저장 이벤트: ${monthEvents.length}개. 이벤트 추가·수정은 To do / 점검 탭에서 합니다.</p>
    </article>
  `;
}

function setupEconomicCalendarOverviewHandlers() {
  document.querySelectorAll("[data-calendar-date]").forEach(button => {
    button.onclick = () => {
      const selectedDate = button.dataset.calendarDate;
      if (!selectedDate) return;
      writeCalendarState({ selectedDate, month: selectedDate.slice(0, 7) });
      renderAll(APP_VIEW_DATA);
    };
  });

  document.querySelectorAll("[data-calendar-shift]").forEach(button => {
    button.onclick = () => {
      const state = readCalendarState();
      const nextMonth = shiftMonth(state.month, Number(button.dataset.calendarShift || 0));
      const selectedDay = ymdParts(state.selectedDate).day;
      const [year, month] = nextMonth.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const nextDate = makeYmd(year, month, Math.min(selectedDay, lastDay));
      writeCalendarState({ selectedDate: nextDate, month: nextMonth });
      renderAll(APP_VIEW_DATA);
    };
  });

  const todayButton = document.querySelector("[data-calendar-today]");
  if (todayButton) {
    todayButton.onclick = () => {
      const today = todayKoreaDate();
      writeCalendarState({ selectedDate: today, month: today.slice(0, 7) });
      renderAll(APP_VIEW_DATA);
    };
  }

  const focusInput = $("calendarMonthFocusInput");
  const saveFocus = document.querySelector("[data-calendar-focus-save]");
  const clearFocus = document.querySelector("[data-calendar-focus-clear]");

  if (saveFocus && focusInput) {
    saveFocus.onclick = () => {
      const state = readCalendarState();
      setMonthlyFocus(state.month, focusInput.value);
      renderAll(APP_VIEW_DATA);
    };
  }

  if (focusInput) {
    focusInput.onkeydown = event => {
      if (event.key === "Enter") {
        const state = readCalendarState();
        setMonthlyFocus(state.month, focusInput.value);
        renderAll(APP_VIEW_DATA);
      }
    };
  }

  if (clearFocus) {
    clearFocus.onclick = () => {
      const state = readCalendarState();
      setMonthlyFocus(state.month, "");
      renderAll(APP_VIEW_DATA);
    };
  }
}

function checklistCompletedCount() {
  const status = readChecklistStatus();
  return DEFAULT_CHECKLIST_ITEMS.filter(item => status[item.id]?.done).length;
}

function renderChecklistProgressCard() {
  const completed = checklistCompletedCount();
  const total = DEFAULT_CHECKLIST_ITEMS.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return `
    <article class="card checklist-progress-card">
      <h3>체크리스트 진행률</h3>
      <div class="metric-value small">${completed}/${total}</div>
      <p class="muted">이번 브라우저 기준 수동 점검 완료율 ${pct}%</p>
      <div class="checklist-progress-bar"><span style="width:${pct}%"></span></div>
    </article>
  `;
}

function renderWeeklyReviewCalendar() {
  const reviews = readWeeklyReviews();
  const latest = latestReview();
  const options = reviews.map(item => `
    <option value="${escapeHtml(item.date)}" ${latest?.date === item.date ? "selected" : ""}>${escapeHtml(item.date)} · ${escapeHtml(item.activeScenario || "시나리오 미기록")}</option>
  `).join("");

  const body = latest ? `
    <div class="saved-review-box" id="overviewReviewSnapshot">
      <strong>${escapeHtml(latest.date)} 저장 기록</strong>
      <dl>
        <dt>M7</dt><dd>${reviewValue(latest, "m7Guidance", "-")} · ${labelStatus(latest.m7Signal)}</dd>
        <dt>컨센서스</dt><dd>${reviewValue(latest, "consensusRevision", "-")} · ${labelStatus(latest.consensusSignal)}</dd>
        <dt>Pricing Power</dt><dd>${reviewValue(latest, "pricingPower", "-")} · ${labelStatus(latest.pricingSignal)}</dd>
        <dt>Fear & Greed</dt><dd>${reviewValue(latest, "fearGreed", "-")} · ${labelStatus(latest.fearGreedSignal)}</dd>
        <dt>최종 8축</dt><dd>${reviewValue(latest, "finalAxisClass", "-")}</dd>
        <dt>시나리오</dt><dd>${reviewValue(latest, "activeScenario", "-")}</dd>
        <dt>현금/자산</dt><dd>${reviewValue(latest, "cashAllocationNote", "-")}</dd>
      </dl>
    </div>
  ` : `<p class="muted">아직 저장된 주간 점검 기록이 없습니다. To do / 점검 탭에서 금요일 또는 토요일에 기록을 저장하세요.</p>`;

  return `
    <article class="card review-calendar-card">
      <h3>수동 점검 캘린더</h3>
      <p class="muted">저장한 주간 점검 기록을 날짜별로 다시 확인합니다. 금요일·토요일 최종 점검용입니다.</p>
      <select class="manual-input" id="reviewCalendarSelect" ${reviews.length ? "" : "disabled"}>
        ${options || `<option>저장 기록 없음</option>`}
      </select>
      ${body}
    </article>
  `;
}

function renderPortfolioOverviewCard() {
  const holdings = normalizedPortfolioHoldings();
  const total = portfolioCurrentTotal(holdings);
  const cash = holdings.filter(item => isCashAsset(item)).reduce((sum, item) => sum + portfolioBasisAmount(item, "market"), 0);
  const invested = Math.max(0, total - cash);
  const cashPct = total ? (cash / total) * 100 : 0;
  const investedPct = total ? (invested / total) * 100 : 0;

  return `
    <article class="card history-card">
      <h3>포트폴리오 자산 배분</h3>
      <div class="metric-value small">현금 ${cashPct.toFixed(1)}%</div>
      <p class="muted">총액 ${formatCurrency(total)} · 투자자산 ${investedPct.toFixed(1)}%</p>
      <div class="portfolio-summary-line">
        ${badge(cashPct >= 20 ? "positive" : cashPct >= 10 ? "warning" : "negative", `현금 ${cashPct.toFixed(1)}%`)}
        ${badge("neutral", `보유 ${holdings.length}개`)}
      </div>
    </article>
  `;
}

function setupReviewCalendarHandlers() {
  const select = $("reviewCalendarSelect");
  if (!select) return;
  select.onchange = () => {
    const review = getReviewByDate(select.value);
    const box = $("overviewReviewSnapshot");
    if (!box || !review) return;
    box.innerHTML = `
      <strong>${escapeHtml(review.date)} 저장 기록</strong>
      <dl>
        <dt>M7</dt><dd>${reviewValue(review, "m7Guidance", "-")} · ${labelStatus(review.m7Signal)}</dd>
        <dt>컨센서스</dt><dd>${reviewValue(review, "consensusRevision", "-")} · ${labelStatus(review.consensusSignal)}</dd>
        <dt>Pricing Power</dt><dd>${reviewValue(review, "pricingPower", "-")} · ${labelStatus(review.pricingSignal)}</dd>
        <dt>Fear & Greed</dt><dd>${reviewValue(review, "fearGreed", "-")} · ${labelStatus(review.fearGreedSignal)}</dd>
        <dt>최종 8축</dt><dd>${reviewValue(review, "finalAxisClass", "-")}</dd>
        <dt>시나리오</dt><dd>${reviewValue(review, "activeScenario", "-")}</dd>
        <dt>현금/자산</dt><dd>${reviewValue(review, "cashAllocationNote", "-")}</dd>
        <dt>메모</dt><dd>${reviewValue(review, "weeklyMemo", "-")}</dd>
      </dl>
    `;
  };
}

function renderWeeklyReviewPanel(data) {
  const latest = latestReview() || {};
  const date = latest.date || todayKoreaDate();
  return `
    <section class="weekly-review-panel">
      <div class="manual-panel-header">
        <div>
          <h3>주간 최종 점검 저장</h3>
          <p class="muted">금요일 장 마감 후 또는 토요일에 10분 안에 입력하는 최종 점검 기록입니다. 저장하면 상단 캘린더에서 과거 기록을 볼 수 있습니다.</p>
        </div>
        ${badge("manual-updated", "localStorage 저장")}
      </div>
      <div class="review-grid">
        <label><span>점검일</span><input class="manual-input" type="date" id="reviewDate" value="${escapeHtml(date)}" /></label>
        <label><span>M7 가이던스 변화</span><input class="manual-input" id="reviewM7" value="${reviewValue(latest, "m7Guidance", getManualOverrideValue("m7_guidance_change"))}" placeholder="예: AI CAPEX 유지, 일부 상향" /></label>
        <label><span>M7 판정</span><select class="manual-input" id="reviewM7Signal">${manualSignalOptionsHtml(latest.m7Signal || getManualOverrideSignal("m7_guidance_change"))}</select></label>
        <label><span>컨센서스 리비전</span><input class="manual-input" id="reviewConsensus" value="${reviewValue(latest, "consensusRevision", getManualOverrideValue("consensus_revision"))}" placeholder="예: EPS 상향 우세" /></label>
        <label><span>컨센서스 판정</span><select class="manual-input" id="reviewConsensusSignal">${manualSignalOptionsHtml(latest.consensusSignal || getManualOverrideSignal("consensus_revision"))}</select></label>
        <label><span>Pricing Power 언급</span><input class="manual-input" id="reviewPricing" value="${reviewValue(latest, "pricingPower", getManualOverrideValue("pricing_power_mentions"))}" placeholder="예: pass-through 우세" /></label>
        <label><span>Pricing 판정</span><select class="manual-input" id="reviewPricingSignal">${manualSignalOptionsHtml(latest.pricingSignal || getManualOverrideSignal("pricing_power_mentions"))}</select></label>
        <label><span>Fear & Greed Index</span><input class="manual-input" id="reviewFearGreed" value="${reviewValue(latest, "fearGreed", getManualOverrideValue("fear_greed_index"))}" placeholder="예: 58" /></label>
        <label><span>Fear & Greed 판정</span><select class="manual-input" id="reviewFearGreedSignal">${manualSignalOptionsHtml(latest.fearGreedSignal || getManualOverrideSignal("fear_greed_index"))}</select></label>
        <label><span>8축 최종 분류</span><input class="manual-input" id="reviewAxisClass" value="${reviewValue(latest, "finalAxisClass")}" placeholder="예: +5 / 0 2 / -1" /></label>
        <label><span>유효한 시장 시나리오</span><input class="manual-input" id="reviewScenario" value="${reviewValue(latest, "activeScenario")}" placeholder="예: 상승 지속 / 혼조 / 방어" /></label>
        <label><span>현금·자산 비중 판단</span><input class="manual-input" id="reviewCashNote" value="${reviewValue(latest, "cashAllocationNote")}" placeholder="예: 현금 25%, 공격 55%, 방어 20%" /></label>
      </div>
      <label class="review-note-label"><span>주간 메모</span><textarea class="manual-input" id="reviewMemo" rows="3" placeholder="이번 주 시장 판단과 다음 주 확인 신호를 적어두세요.">${reviewValue(latest, "weeklyMemo")}</textarea></label>
      <div class="weekly-review-actions">
        <button type="button" class="review-save" id="saveWeeklyReview">주간 점검 저장</button>
        <button type="button" class="review-delete" id="deleteWeeklyReview">선택일 기록 삭제</button>
      </div>
    </section>
  `;
}

function collectWeeklyReviewFromForm() {
  const get = id => $(id)?.value ?? "";
  return {
    date: get("reviewDate") || todayKoreaDate(),
    m7Guidance: get("reviewM7"),
    m7Signal: get("reviewM7Signal"),
    consensusRevision: get("reviewConsensus"),
    consensusSignal: get("reviewConsensusSignal"),
    pricingPower: get("reviewPricing"),
    pricingSignal: get("reviewPricingSignal"),
    fearGreed: get("reviewFearGreed"),
    fearGreedSignal: get("reviewFearGreedSignal"),
    finalAxisClass: get("reviewAxisClass"),
    activeScenario: get("reviewScenario"),
    cashAllocationNote: get("reviewCashNote"),
    weeklyMemo: get("reviewMemo"),
    updatedAt: new Date().toISOString()
  };
}

function setupWeeklyReviewHandlers() {
  const save = $("saveWeeklyReview");
  const del = $("deleteWeeklyReview");
  if (save) {
    save.onclick = () => {
      const next = collectWeeklyReviewFromForm();
      const reviews = readWeeklyReviews().filter(item => item.date !== next.date);
      reviews.push(next);
      writeWeeklyReviews(reviews);
      renderAll(APP_VIEW_DATA);
    };
  }
  if (del) {
    del.onclick = () => {
      const date = $("reviewDate")?.value;
      if (!date) return;
      writeWeeklyReviews(readWeeklyReviews().filter(item => item.date !== date));
      renderAll(APP_VIEW_DATA);
    };
  }
}

function isCashAsset(item) {
  const raw = [item?.type, item?.symbol, item?.name].map(value => String(value || "").trim()).join(" ");
  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();
  return (
    lower.includes("cash") ||
    upper.includes("CASH") ||
    upper.includes("USD") ||
    upper.includes("KRW") ||
    raw.includes("현금") ||
    raw.includes("예수금") ||
    raw.includes("원화") ||
    raw.includes("달러") ||
    raw.includes("대기자금") ||
    raw.includes("MMF")
  );
}

const PORTFOLIO_BASIS_STORAGE_KEY = "eightAxisPortfolioBasisModeV1";

function readPortfolioBasisMode() {
  const mode = localStorage.getItem(PORTFOLIO_BASIS_STORAGE_KEY);
  return mode === "principal" ? "principal" : "market";
}

function writePortfolioBasisMode(mode) {
  localStorage.setItem(PORTFOLIO_BASIS_STORAGE_KEY, mode === "principal" ? "principal" : "market");
}

function parsePortfolioNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "0").trim();
  if (!raw) return 0;

  let text = raw
    .replace(/[₩$%원\s]/g, "")
    .replace(/,/g, "")
    .replace(/＋/g, "+")
    .replace(/－/g, "-");

  const negative = text.startsWith("-");
  text = text.replace(/^[-+]/, "");

  // Korean unit support: 3억 5000만, 250만, 1.2억, 100만원
  let total = 0;
  const eokMatch = text.match(/([0-9.]+)억/);
  if (eokMatch) total += Number(eokMatch[1]) * 100000000;
  const manMatch = text.match(/([0-9.]+)만/);
  if (manMatch) total += Number(manMatch[1]) * 10000;

  if (total === 0) {
    const numericText = text.replace(/[^0-9.]/g, "");
    total = Number(numericText || "0");
  }

  const numeric = negative ? -total : total;
  return Number.isFinite(numeric) ? numeric : 0;
}

function firstPositivePortfolioNumber(values = []) {
  for (const value of values) {
    const parsed = parsePortfolioNumber(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function maxPositivePortfolioNumber(values = []) {
  return values.reduce((max, value) => {
    const parsed = parsePortfolioNumber(value);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
}

function normalizedPortfolioHoldings() {
  return readPortfolioHoldings()
    .map((item, index) => {
      const name = String(item.name || item.symbol || "자산");
      const symbol = String(item.symbol || "").toUpperCase();
      const type = String(item.type || "주식/ETF");
      const cashLike = isCashAsset({ name, symbol, type });

      const currentCandidates = [
        item.currentAmount,
        item.amount,
        item.marketAmount,
        item.marketValue,
        item.currentValue,
        item.evaluationAmount,
        item.value,
        item.balance,
        item.cashAmount,
        item.cashBalance
      ];
      const principalCandidates = [
        item.principalAmount,
        item.costAmount,
        item.originalAmount,
        item.initialAmount,
        item.costBasis,
        item.investedAmount,
        item.purchaseAmount,
        item.amount
      ];

      let currentAmount = firstPositivePortfolioNumber(currentCandidates);
      let principalAmount = firstPositivePortfolioNumber(principalCandidates);

      // 현금성 자산은 원금과 평가금액의 경제적 의미가 거의 같으므로,
      // 둘 중 하나만 입력되어도 양쪽 계산에 반드시 포함한다.
      if (cashLike) {
        const cashAmount = maxPositivePortfolioNumber([...currentCandidates, ...principalCandidates]);
        if (currentAmount <= 0 && cashAmount > 0) currentAmount = cashAmount;
        if (principalAmount <= 0 && cashAmount > 0) principalAmount = cashAmount;
      }

      // 일반 자산도 한쪽 금액만 입력된 경우 파이차트에서 누락되지 않도록 보수적으로 보정한다.
      if (currentAmount <= 0 && principalAmount > 0) currentAmount = principalAmount;
      if (principalAmount <= 0 && currentAmount > 0) principalAmount = currentAmount;

      const targetPctRaw = parsePortfolioNumber(item.targetPct);
      return {
        id: item.id || `asset-${index}`,
        name,
        symbol,
        type,
        amount: currentAmount,
        currentAmount,
        principalAmount,
        targetPct: targetPctRaw >= 0 ? targetPctRaw : 0,
        logoUrl: String(item.logoUrl || "")
      };
    })
    .filter(item => portfolioBasisAmount(item, "market") > 0 || portfolioBasisAmount(item, "principal") > 0);
}

function portfolioBasisAmount(item, mode = readPortfolioBasisMode()) {
  const current = Number(item?.currentAmount || item?.amount || 0);
  const principal = Number(item?.principalAmount || 0);
  if (mode === "principal") return principal > 0 ? principal : current;
  return current > 0 ? current : principal;
}

function portfolioModeLabel(mode = readPortfolioBasisMode()) {
  return mode === "principal" ? "원금 기준" : "평가금액 기준";
}

function portfolioReturnPct(item) {
  const principal = portfolioBasisAmount(item, "principal");
  const current = portfolioBasisAmount(item, "market");
  if (!principal) return null;
  return ((current - principal) / principal) * 100;
}

function portfolioCurrentTotal(holdings = normalizedPortfolioHoldings()) {
  return holdings.reduce((sum, item) => sum + portfolioBasisAmount(item, "market"), 0);
}

function portfolioPrincipalTotal(holdings = normalizedPortfolioHoldings()) {
  return holdings.reduce((sum, item) => sum + portfolioBasisAmount(item, "principal"), 0);
}

function portfolioTargetTotal(holdings = normalizedPortfolioHoldings()) {
  return holdings.reduce((sum, item) => sum + (Number(item.targetPct) || 0), 0);
}

function formatCurrency(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString("ko-KR", { maximumFractionDigits: 0 });
}

function signedPct(value, decimals = 1) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(decimals)}%`;
}

function signedPp(value, decimals = 1) {
  const numeric = Number(value || 0);
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(decimals)}%p`;
}

function portfolioRebalanceSignal(diffPct, item) {
  const isCash = isCashAsset(item);
  if (!Number.isFinite(diffPct)) return { signal: "neutral", label: "목표 없음", memo: "목표 비중 미입력" };
  const abs = Math.abs(diffPct);
  if (abs <= 3) return { signal: "positive", label: "유지", memo: "목표 범위 내" };
  if (diffPct > 12) return { signal: "negative", label: "집중 경고", memo: isCash ? "현금 과다" : "초과 집중" };
  if (diffPct > 7) return { signal: "warning", label: "축소 검토", memo: isCash ? "현금 비중 높음" : "초과 비중" };
  if (diffPct > 3) return { signal: "neutral", label: "추가 제한", memo: "목표보다 높음" };
  if (diffPct < -12) return { signal: "negative", label: isCash ? "BATNA 부족" : "현저히 부족", memo: isCash ? "현금 대응력 약함" : "계획 대비 낮음" };
  if (diffPct < -7) return { signal: "warning", label: "부족", memo: isCash ? "현금 보강 필요" : "추가 후보" };
  return { signal: "neutral", label: "소폭 부족", memo: "목표보다 낮음" };
}

function portfolioColor(index) {
  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee", "#fb7185", "#c084fc", "#f97316", "#84cc16"];
  return colors[index % colors.length];
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", cx, cy, "L", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y, "Z"].join(" ");
}

function logoUrlForHolding(item) {
  if (item.logoUrl) return item.logoUrl;
  if (!item.symbol || item.symbol === "CASH") return "";
  return `https://financialmodelingprep.com/image-stock/${encodeURIComponent(item.symbol)}.png`;
}

function renderLogoElement(item, className = "portfolio-logo") {
  const url = logoUrlForHolding(item);
  const fallback = escapeHtml((item.symbol || item.name || "?").slice(0, 4));
  if (!url) return `<span class="${className}-fallback">${fallback}</span>`;
  return `<span class="${className}"><img src="${escapeHtml(url)}" alt="${escapeHtml(item.symbol || item.name)}" onerror="this.parentElement.textContent='${fallback}'" /></span>`;
}

function renderPortfolioModeToggle(mode = readPortfolioBasisMode()) {
  return `
    <div class="portfolio-mode-toggle" role="group" aria-label="portfolio basis mode">
      <button type="button" class="portfolio-mode-btn ${mode === "market" ? "is-active" : ""}" data-portfolio-mode="market">평가금액 기준</button>
      <button type="button" class="portfolio-mode-btn ${mode === "principal" ? "is-active" : ""}" data-portfolio-mode="principal">원금 기준</button>
    </div>
  `;
}

function renderPortfolioMiniMetrics(item, currentTotal, principalTotal) {
  const currentPct = currentTotal ? (portfolioBasisAmount(item, "market") / currentTotal) * 100 : 0;
  const principalPct = principalTotal ? (portfolioBasisAmount(item, "principal") / principalTotal) * 100 : 0;
  const ret = portfolioReturnPct(item);
  const retText = ret === null ? "수익률 -" : `수익률 ${signedPct(ret)}`;
  const retSignal = ret === null ? "neutral" : ret >= 0 ? "positive" : "negative";
  return `
    <span class="portfolio-mini-pill">평가 ${currentPct.toFixed(1)}%</span>
    <span class="portfolio-mini-pill">원금 ${principalPct.toFixed(1)}%</span>
    <span class="portfolio-mini-pill">목표 ${(item.targetPct || 0).toFixed(1)}%</span>
    <span class="portfolio-mini-pill ${retSignal}">${escapeHtml(retText)}</span>
  `;
}

function renderPortfolioRebalanceSummary(holdings = normalizedPortfolioHoldings()) {
  const total = portfolioCurrentTotal(holdings);
  if (!holdings.length || total <= 0) return "";

  const targetTotal = portfolioTargetTotal(holdings);
  const rows = holdings.map(item => {
    const currentAmount = portfolioBasisAmount(item, "market");
    const currentPct = total ? (currentAmount / total) * 100 : 0;
    const hasTarget = Number(item.targetPct) > 0;
    const diff = hasTarget ? currentPct - item.targetPct : null;
    const signal = hasTarget ? portfolioRebalanceSignal(diff, item) : { signal: "neutral", label: "목표 없음", memo: "목표 비중 미입력" };
    return { item, currentAmount, currentPct, hasTarget, diff, signal };
  }).sort((a, b) => {
    const ad = a.diff === null ? 0 : Math.abs(a.diff);
    const bd = b.diff === null ? 0 : Math.abs(b.diff);
    return bd - ad;
  });

  const cashRows = rows.filter(row => isCashAsset(row.item));
  const cashCurrent = cashRows.reduce((sum, row) => sum + row.currentAmount, 0);
  const cashPct = total ? (cashCurrent / total) * 100 : 0;
  const cashTarget = cashRows.reduce((sum, row) => sum + (Number(row.item.targetPct) || 0), 0);
  const cashHasTarget = cashTarget > 0;
  const cashDiff = cashHasTarget ? cashPct - cashTarget : null;

  const targetRows = rows.filter(row => row.hasTarget);
  const biggest = targetRows[0];
  const totalWarning = Math.abs(targetTotal - 100) > 1
    ? `목표 비중 합계가 ${targetTotal.toFixed(1)}%입니다. 100% 기준으로 조정이 필요합니다.`
    : "목표 비중 합계가 100%에 가깝습니다.";
  const cashWarning = !cashRows.length
    ? "현금 항목이 입력되지 않았습니다. 시장과의 협상력 판단이 빠질 수 있습니다."
    : !cashHasTarget
      ? `현금은 현재 ${cashPct.toFixed(1)}%로 계산에 포함되어 있으나, 목표 현금 비중은 아직 없습니다.`
      : cashDiff < -7
        ? "현금 목표 대비 부족으로 시장 조정 시 BATNA가 약해진 상태입니다."
        : "현금 목표 비중이 유지되면 조정 시 대응 여력이 보존됩니다.";

  return `
    <div class="portfolio-rebalance-box">
      <strong>리밸런싱 요약</strong>
      <p class="muted">평가금액 기준 총액 ${formatCurrency(total)}에 현금 ${formatCurrency(cashCurrent)}(${cashPct.toFixed(1)}%)를 포함해 계산합니다. ${escapeHtml(totalWarning)} ${escapeHtml(cashWarning)}</p>
      ${biggest ? `<p class="muted">목표가 입력된 자산 중 가장 큰 차이는 <strong>${escapeHtml(biggest.item.name)}</strong> ${signedPp(biggest.diff)}입니다. 판단: ${escapeHtml(biggest.signal.label)}.</p>` : `<p class="muted">목표 비중을 입력하면 초과/부족 비중을 자동 계산합니다. 목표가 없어도 현재 비중 계산에는 포함됩니다.</p>`}
      <div class="portfolio-rebalance-list">
        ${rows.slice(0, 8).map(row => `
          <div class="portfolio-rebalance-row">
            <span>${escapeHtml(row.item.name)} · 현재 ${row.currentPct.toFixed(1)}%</span>
            <span>${row.hasTarget ? `${escapeHtml(row.signal.label)} · 목표 ${row.item.targetPct.toFixed(1)}% / 차이 ${signedPp(row.diff)}` : "목표 없음 · 현재 비중에는 포함"}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPortfolioChart() {
  const holdings = normalizedPortfolioHoldings();
  const mode = readPortfolioBasisMode();
  const chartHoldings = holdings.filter(item => portfolioBasisAmount(item, mode) > 0);
  const total = chartHoldings.reduce((sum, item) => sum + portfolioBasisAmount(item, mode), 0);
  const currentTotal = portfolioCurrentTotal(holdings);
  const principalTotal = portfolioPrincipalTotal(holdings);
  if (!chartHoldings.length || total <= 0) {
    return `<p class="muted">포트폴리오 자산을 입력하면 파이 차트가 표시됩니다.</p>`;
  }

  let angle = 0;
  const slices = chartHoldings.map((item, index) => {
    const amount = portfolioBasisAmount(item, mode);
    const pct = total ? (amount / total) * 100 : 0;
    const nextAngle = angle + pct * 3.6;
    const path = pct >= 99.999
      ? `M 100 100 m -88 0 a 88 88 0 1 0 176 0 a 88 88 0 1 0 -176 0`
      : describeArc(100, 100, 88, angle, nextAngle);
    const html = `<path class="portfolio-slice" d="${path}" fill="${portfolioColor(index)}" data-portfolio-index="${index}"></path>`;
    angle = nextAngle;
    return html;
  }).join("");

  const first = chartHoldings[0];
  const firstAmount = portfolioBasisAmount(first, mode);
  const firstPct = total ? ((firstAmount / total) * 100).toFixed(1) : "0.0";
  const cashAmount = chartHoldings.filter(item => isCashAsset(item)).reduce((sum, item) => sum + portfolioBasisAmount(item, mode), 0);
  const cashPct = total ? (cashAmount / total) * 100 : 0;

  return `
    ${renderPortfolioModeToggle(mode)}
    <div class="portfolio-layout">
      <div class="portfolio-chart-card">
        <svg class="portfolio-pie-svg" viewBox="0 0 200 200" role="img" aria-label="portfolio allocation pie chart">
          ${slices}
          <circle cx="100" cy="100" r="48" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(255,255,255,0.12)" />
          <text x="100" y="82" class="portfolio-center-label" font-size="12">${escapeHtml(portfolioModeLabel(mode))}</text>
          <text x="100" y="102" class="portfolio-center-label" font-size="12">${escapeHtml(formatCurrency(total))}</text>
          <text x="100" y="119" class="portfolio-center-label" font-size="9">현금 ${cashPct.toFixed(1)}%</text>
          <text x="100" y="133" class="portfolio-center-label" font-size="8">총 평가 ${escapeHtml(formatCurrency(currentTotal))}</text>
        </svg>
        <div class="portfolio-hover-box" id="portfolioHoverBox">
          ${renderLogoElement(first)}
          <div>
            <strong>${escapeHtml(first.name)} ${first.symbol ? `(${escapeHtml(first.symbol)})` : ""}</strong><br>
            <span class="muted">${escapeHtml(first.type)} · ${portfolioModeLabel(mode)} ${formatCurrency(firstAmount)} · ${firstPct}%</span><br>
            <span class="muted">평가 ${formatCurrency(portfolioBasisAmount(first, "market"))} · 원금 ${formatCurrency(portfolioBasisAmount(first, "principal"))} · 목표 ${(first.targetPct || 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div class="portfolio-row-list">
        ${chartHoldings.map((item, index) => {
          const amount = portfolioBasisAmount(item, mode);
          const pct = total ? ((amount / total) * 100).toFixed(1) : "0.0";
          const currentPct = currentTotal ? (portfolioBasisAmount(item, "market") / currentTotal) * 100 : 0;
          const diff = Number(item.targetPct) > 0 ? currentPct - item.targetPct : null;
          const signal = diff === null ? null : portfolioRebalanceSignal(diff, item);
          return `
            <div class="portfolio-row" data-portfolio-index="${index}">
              <span class="portfolio-row-logo">${renderLogoElement(item, "portfolio-row-logo").replace('class="portfolio-row-logo"', 'class="portfolio-row-logo-inner"')}</span>
              <span class="portfolio-row-name">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.symbol || "-")} · ${escapeHtml(item.type)} · ${portfolioModeLabel(mode)} ${pct}%</span>
                <span class="portfolio-row-metrics">${renderPortfolioMiniMetrics(item, currentTotal, principalTotal)}</span>
              </span>
              <span class="portfolio-row-amount">${formatCurrency(amount)}</span>
              <span class="portfolio-row-percent">${diff === null ? `${pct}%` : `${signedPp(diff)}<br>${escapeHtml(signal.label)}`}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
    ${renderPortfolioRebalanceSummary(holdings)}
  `;
}

function renderPortfolioPanel() {
  const holdings = normalizedPortfolioHoldings();
  const currentTotal = portfolioCurrentTotal(holdings);
  const principalTotal = portfolioPrincipalTotal(holdings);
  const rows = holdings.length ? holdings.map(item => {
    const currentPct = currentTotal ? (portfolioBasisAmount(item, "market") / currentTotal) * 100 : 0;
    const principalPct = principalTotal ? (portfolioBasisAmount(item, "principal") / principalTotal) * 100 : 0;
    const ret = portfolioReturnPct(item);
    return `
      <div class="portfolio-row">
        <span class="portfolio-row-logo">${renderLogoElement(item, "portfolio-row-logo").replace('class="portfolio-row-logo"', 'class="portfolio-row-logo-inner"')}</span>
        <span class="portfolio-row-name">
          <strong>${escapeHtml(item.name)}</strong>
          <span>${escapeHtml(item.symbol || "-")} · ${escapeHtml(item.type)}</span>
          <span class="portfolio-row-metrics">
            <span class="portfolio-mini-pill">평가 ${currentPct.toFixed(1)}%</span>
            <span class="portfolio-mini-pill">원금 ${principalPct.toFixed(1)}%</span>
            <span class="portfolio-mini-pill">수익률 ${ret === null ? "-" : signedPct(ret)}</span>
            <span class="portfolio-mini-pill">목표 ${(item.targetPct || 0).toFixed(1)}%</span>
          </span>
        </span>
        <span class="portfolio-row-amount">평가 ${formatCurrency(portfolioBasisAmount(item, "market"))}<br><span class="muted">원금 ${formatCurrency(portfolioBasisAmount(item, "principal"))}</span></span>
        <span class="portfolio-row-actions">
          <button type="button" class="portfolio-edit" data-portfolio-edit="${escapeHtml(item.id)}">수정</button>
          <button type="button" class="portfolio-delete" data-portfolio-delete="${escapeHtml(item.id)}">삭제</button>
        </span>
      </div>
    `;
  }).join("") : `<p class="muted">아직 입력된 자산이 없습니다. 현금은 symbol을 CASH로 입력하면 현금 비중으로 분류됩니다.</p>`;

  return `
    <section class="portfolio-panel">
      <div class="manual-panel-header">
        <div>
          <h3>포트폴리오 원금·평가금액 이중 기준 점검</h3>
          <p class="muted">평가금액 기준은 현재 계좌의 실제 리스크를, 원금 기준은 처음 배치한 자본 구조를 보여줍니다. 리밸런싱 판단은 평가금액 기준으로 계산하고, 원금 기준은 매수 원칙 점검용으로 사용합니다.</p>
        </div>
        ${badge("manual-updated", "브라우저 저장")}
      </div>
      ${renderPortfolioChart()}
      <input type="hidden" id="portfolioEditId" value="" />
      <div class="portfolio-editing-note" id="portfolioEditingNote">편집 모드입니다. 원금·평가금액·목표 비중 등을 수정한 뒤 <strong>수정 저장</strong>을 누르세요.</div>
      <div class="portfolio-form-grid">
        <label><span>자산명</span><input class="manual-input" id="portfolioName" placeholder="예: NVIDIA, 현금, QQQ" /></label>
        <label><span>티커 / 심볼</span><input class="manual-input" id="portfolioSymbol" placeholder="예: NVDA, CASH, QQQ" /></label>
        <label><span>분류</span><input class="manual-input" id="portfolioType" placeholder="예: 주식, ETF, 현금, 채권" /></label>
        <label><span>투입 원금</span><input class="manual-input" id="portfolioPrincipal" inputmode="decimal" placeholder="예: 1000000" /></label>
        <label><span>현재 평가금액</span><input class="manual-input" id="portfolioAmount" inputmode="decimal" placeholder="예: 1350000" /></label>
        <label><span>목표 비중 (%)</span><input class="manual-input" id="portfolioTargetPct" inputmode="decimal" placeholder="예: 25" /></label>
        <label><span>로고 URL 선택</span><input class="manual-input" id="portfolioLogo" placeholder="비워두면 티커 기반 자동 시도" /></label>
      </div>
      <div class="portfolio-actions">
        <button type="button" class="portfolio-save" id="addPortfolioHolding">자산 추가 / 저장</button>
        <button type="button" class="portfolio-cancel" id="cancelPortfolioEdit" style="display:none;">편집 취소</button>
        <button type="button" class="portfolio-clear" id="clearPortfolioHoldings">전체 삭제</button>
      </div>
      <div class="portfolio-row-list" style="margin-top: 12px;">${rows}</div>
    </section>
  `;
}

function portfolioFormPayload() {
  const name = $("portfolioName")?.value.trim() || "자산";
  const symbol = $("portfolioSymbol")?.value.trim().toUpperCase() || "";
  const type = $("portfolioType")?.value.trim() || (symbol === "CASH" || name.includes("현금") ? "현금" : "주식/ETF");
  const rawAmount = parsePortfolioNumber($("portfolioAmount")?.value || "0");
  const principalInput = parsePortfolioNumber($("portfolioPrincipal")?.value || "0");
  const cashLike = isCashAsset({ name, symbol, type });
  const amount = rawAmount > 0 ? rawAmount : (cashLike && principalInput > 0 ? principalInput : rawAmount);
  const principalAmount = principalInput > 0 ? principalInput : amount;
  const targetPct = Math.max(0, parsePortfolioNumber($("portfolioTargetPct")?.value || "0"));
  const logoUrl = $("portfolioLogo")?.value.trim() || "";
  return { name, symbol, type, amount, currentAmount: amount, principalAmount, targetPct, logoUrl };
}

function clearPortfolioForm() {
  ["portfolioName", "portfolioSymbol", "portfolioType", "portfolioPrincipal", "portfolioAmount", "portfolioTargetPct", "portfolioLogo"].forEach(id => {
    const el = $(id);
    if (el) el.value = "";
  });
  const edit = $("portfolioEditId");
  if (edit) edit.value = "";
  const save = $("addPortfolioHolding");
  if (save) save.textContent = "자산 추가 / 저장";
  const cancel = $("cancelPortfolioEdit");
  if (cancel) cancel.style.display = "none";
  const note = $("portfolioEditingNote");
  if (note) note.classList.remove("is-active");
}

function enterPortfolioEditMode(item) {
  if (!item) return;
  const normalized = normalizedPortfolioHoldings().find(entry => entry.id === item.id) || item;
  const edit = $("portfolioEditId");
  if (edit) edit.value = normalized.id;
  const name = $("portfolioName");
  const symbol = $("portfolioSymbol");
  const type = $("portfolioType");
  const principal = $("portfolioPrincipal");
  const amount = $("portfolioAmount");
  const target = $("portfolioTargetPct");
  const logo = $("portfolioLogo");
  if (name) name.value = normalized.name || "";
  if (symbol) symbol.value = normalized.symbol || "";
  if (type) type.value = normalized.type || "";
  if (principal) principal.value = String(normalized.principalAmount || "");
  if (amount) amount.value = String(normalized.currentAmount || normalized.amount || "");
  if (target) target.value = String(normalized.targetPct || "");
  if (logo) logo.value = normalized.logoUrl || "";
  const save = $("addPortfolioHolding");
  if (save) save.textContent = "수정 저장";
  const cancel = $("cancelPortfolioEdit");
  if (cancel) cancel.style.display = "inline-flex";
  const note = $("portfolioEditingNote");
  if (note) note.classList.add("is-active");
  name?.focus();
  $("portfolioName")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setupPortfolioHandlers() {
  const add = $("addPortfolioHolding");
  const clear = $("clearPortfolioHoldings");
  const cancelEdit = $("cancelPortfolioEdit");
  document.querySelectorAll("[data-portfolio-mode]").forEach(button => {
    button.onclick = () => {
      writePortfolioBasisMode(button.dataset.portfolioMode);
      renderAll(APP_VIEW_DATA);
    };
  });
  if (add) {
    add.onclick = () => {
      const payload = portfolioFormPayload();
      if ((!Number.isFinite(payload.currentAmount) || payload.currentAmount <= 0) && (!Number.isFinite(payload.principalAmount) || payload.principalAmount <= 0)) return;
      if (payload.currentAmount <= 0 && payload.principalAmount > 0) {
        payload.currentAmount = payload.principalAmount;
        payload.amount = payload.principalAmount;
      }
      const editId = $("portfolioEditId")?.value || "";
      const holdings = readPortfolioHoldings();
      if (editId) {
        const next = holdings.map(item => item.id === editId ? { ...item, ...payload, id: editId } : item);
        writePortfolioHoldings(next);
      } else {
        holdings.push({ id: `asset-${Date.now()}`, ...payload });
        writePortfolioHoldings(holdings);
      }
      clearPortfolioForm();
      renderAll(APP_VIEW_DATA);
    };
  }
  if (cancelEdit) {
    cancelEdit.onclick = () => clearPortfolioForm();
  }
  if (clear) {
    clear.onclick = () => {
      if (!confirm("포트폴리오 입력값을 모두 삭제할까요?")) return;
      writePortfolioHoldings([]);
      clearPortfolioForm();
      renderAll(APP_VIEW_DATA);
    };
  }
  document.querySelectorAll("[data-portfolio-edit]").forEach(button => {
    button.onclick = () => {
      const id = button.dataset.portfolioEdit;
      const item = readPortfolioHoldings().find(entry => entry.id === id);
      enterPortfolioEditMode(item);
    };
  });
  document.querySelectorAll("[data-portfolio-delete]").forEach(button => {
    button.onclick = () => {
      const id = button.dataset.portfolioDelete;
      writePortfolioHoldings(readPortfolioHoldings().filter(item => item.id !== id));
      if ($("portfolioEditId")?.value === id) clearPortfolioForm();
      renderAll(APP_VIEW_DATA);
    };
  });
  setupPortfolioHoverHandlers();
}

function setupPortfolioHoverHandlers() {
  const box = $("portfolioHoverBox");
  if (!box) return;
  const holdings = normalizedPortfolioHoldings();
  const mode = readPortfolioBasisMode();
  const chartHoldings = holdings.filter(item => portfolioBasisAmount(item, mode) > 0);
  const total = chartHoldings.reduce((sum, item) => sum + portfolioBasisAmount(item, mode), 0);
  const currentTotal = portfolioCurrentTotal(holdings);
  const update = index => {
    const item = chartHoldings[Number(index)];
    if (!item) return;
    const amount = portfolioBasisAmount(item, mode);
    const pct = total ? ((amount / total) * 100).toFixed(1) : "0.0";
    const currentPct = currentTotal ? (portfolioBasisAmount(item, "market") / currentTotal) * 100 : 0;
    const diff = Number(item.targetPct) > 0 ? currentPct - item.targetPct : null;
    const signal = diff === null ? null : portfolioRebalanceSignal(diff, item);
    box.innerHTML = `
      ${renderLogoElement(item)}
      <div>
        <strong>${escapeHtml(item.name)} ${item.symbol ? `(${escapeHtml(item.symbol)})` : ""}</strong><br>
        <span class="muted">${escapeHtml(item.type)} · ${portfolioModeLabel(mode)} ${formatCurrency(amount)} · ${pct}%</span><br>
        <span class="muted">평가 ${formatCurrency(portfolioBasisAmount(item, "market"))} · 원금 ${formatCurrency(portfolioBasisAmount(item, "principal"))} · 목표 ${(item.targetPct || 0).toFixed(1)}%</span>${diff === null ? "" : `<br><span class="muted">목표 대비 ${signedPp(diff)} · ${escapeHtml(signal.label)}</span>`}
      </div>
    `;
  };
  document.querySelectorAll("[data-portfolio-index]").forEach(el => {
    el.addEventListener("mouseenter", () => update(el.dataset.portfolioIndex));
    el.addEventListener("focus", () => update(el.dataset.portfolioIndex));
  });
}



const BACKUP_FILE_VERSION = "eight-axis-market-dashboard-backup-v1";

function localDataSummary() {
  const manualOverrides = readManualOverrides();
  const weeklyReviews = readWeeklyReviews();
  const portfolioHoldings = readPortfolioHoldings();
  const checklistStatus = readChecklistStatus();
  const economicEvents = readEconomicEvents();
  const weeklyReports = readWeeklyReports();
  const calendarState = readCalendarState();
  const monthlyFocuses = readMonthlyFocusMap();
  const indicatorDrawings = readIndicatorDrawings();
  const indicatorChartRanges = readIndicatorChartRanges();
  const drawingCount = Object.values(indicatorDrawings).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  return {
    manualCount: Object.keys(manualOverrides || {}).length,
    reviewCount: weeklyReviews.length,
    portfolioCount: portfolioHoldings.length,
    checklistCount: Object.values(checklistStatus || {}).filter(item => item?.done).length,
    eventCount: economicEvents.length,
    reportCount: weeklyReports.length,
    calendarMonth: calendarState.month,
    monthlyFocusCount: Object.keys(monthlyFocuses || {}).length,
    drawingCount,
    chartRangeCount: Object.keys(indicatorChartRanges || {}).length
  };
}

function backupDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function buildBackupPayload(scope = "full") {
  const manualOverrides = readManualOverrides();
  const weeklyReviews = readWeeklyReviews();
  const portfolioHoldings = readPortfolioHoldings();
  const checklistStatus = readChecklistStatus();
  const economicEvents = readEconomicEvents();
  const weeklyReports = readWeeklyReports();
  const calendarState = readCalendarState();
  const monthlyFocuses = readMonthlyFocusMap();
  const indicatorDrawings = readIndicatorDrawings();
  const indicatorChartState = readIndicatorChartState(APP_VIEW_DATA);
  const indicatorChartRanges = readIndicatorChartRanges();

  const data = {};
  if (scope === "full" || scope === "manual") {
    data.manualOverrides = manualOverrides;
    data.weeklyReviews = weeklyReviews;
    data.checklistStatus = checklistStatus;
    data.economicEvents = economicEvents;
    data.weeklyReports = weeklyReports;
    data.calendarState = calendarState;
    data.monthlyFocuses = monthlyFocuses;
    data.indicatorDrawings = indicatorDrawings;
    data.indicatorChartState = indicatorChartState;
    data.indicatorChartRanges = indicatorChartRanges;
  }
  if (scope === "full" || scope === "portfolio") {
    data.portfolioHoldings = portfolioHoldings;
    data.portfolioBasisMode = readPortfolioBasisMode();
  }

  return {
    type: BACKUP_FILE_VERSION,
    version: 1,
    scope,
    exportedAt: new Date().toISOString(),
    source: "eight-axis-market-dashboard-localStorage",
    data
  };
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportBackup(scope) {
  const payload = buildBackupPayload(scope);
  const label = scope === "portfolio" ? "portfolio" : scope === "manual" ? "manual-review" : "full";
  downloadJsonFile(`market-dashboard-${label}-backup-${backupDateStamp()}.json`, payload);
}

function restoreBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("백업 파일 형식이 올바르지 않습니다.");
  }

  const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
  let restored = [];

  if (data.manualOverrides && typeof data.manualOverrides === "object" && !Array.isArray(data.manualOverrides)) {
    writeManualOverrides(data.manualOverrides);
    restored.push("수동 지표 입력값");
  }

  if (Array.isArray(data.weeklyReviews)) {
    writeWeeklyReviews(data.weeklyReviews);
    restored.push("주간 점검 캘린더 기록");
  }

  if (Array.isArray(data.portfolioHoldings)) {
    writePortfolioHoldings(data.portfolioHoldings);
    if (data.portfolioBasisMode) writePortfolioBasisMode(data.portfolioBasisMode);
    restored.push("포트폴리오 자산 배분");
  }

  if (data.checklistStatus && typeof data.checklistStatus === "object" && !Array.isArray(data.checklistStatus)) {
    writeChecklistStatus(data.checklistStatus);
    restored.push("체크리스트 완료 기록");
  }

  if (Array.isArray(data.economicEvents)) {
    writeEconomicEvents(data.economicEvents);
    restored.push("경제 이벤트 캘린더");
  }

  if (Array.isArray(data.weeklyReports)) {
    writeWeeklyReports(data.weeklyReports);
    restored.push("주간 시장 리포트");
  }

  if (data.calendarState && typeof data.calendarState === "object" && !Array.isArray(data.calendarState)) {
    writeCalendarState(data.calendarState);
    restored.push("캘린더 선택 상태");
  }

  if (data.monthlyFocuses && typeof data.monthlyFocuses === "object" && !Array.isArray(data.monthlyFocuses)) {
    writeMonthlyFocusMap(data.monthlyFocuses);
    restored.push("월간 캘린더 포커스");
  }

  if (data.indicatorDrawings && typeof data.indicatorDrawings === "object" && !Array.isArray(data.indicatorDrawings)) {
    writeIndicatorDrawings(data.indicatorDrawings);
    restored.push("지표 차트 작도");
  }

  if (data.indicatorChartState && typeof data.indicatorChartState === "object" && !Array.isArray(data.indicatorChartState)) {
    writeIndicatorChartState(data.indicatorChartState);
    restored.push("지표 차트 선택 상태");
  }

  if (data.indicatorChartRanges && typeof data.indicatorChartRanges === "object" && !Array.isArray(data.indicatorChartRanges)) {
    writeIndicatorChartRanges(data.indicatorChartRanges);
    restored.push("지표 차트 Y축 범위");
  }

  if (!restored.length) {
    throw new Error("복원 가능한 데이터가 없습니다. 수동 기록, 포트폴리오 또는 지표 작도 데이터가 필요합니다.");
  }

  return restored;
}

function renderBackupPanel() {
  const summary = localDataSummary();
  return `
    <section class="backup-panel">
      <div class="manual-panel-header">
        <div>
          <h3>백업 · 복원</h3>
          <p class="muted">수동 입력, 주간 점검 캘린더, 포트폴리오 자산 배분, 지표 차트 작도는 브라우저에 저장됩니다. 다른 기기로 옮기기 전에 JSON 백업 파일로 내보내면 복원할 수 있습니다.</p>
        </div>
        ${badge("manual-updated", "localStorage")}
      </div>
      <div class="backup-summary-grid">
        <div><strong>${summary.manualCount}</strong><span>수동 지표 입력</span></div>
        <div><strong>${summary.reviewCount}</strong><span>주간 점검 기록</span></div>
        <div><strong>${summary.portfolioCount}</strong><span>포트폴리오 자산</span></div>
        <div><strong>${summary.checklistCount}</strong><span>체크 완료</span></div>
        <div><strong>${summary.eventCount}</strong><span>경제 이벤트</span></div>
        <div><strong>${summary.reportCount}</strong><span>시장 리포트</span></div>
        <div><strong>${summary.monthlyFocusCount}</strong><span>월간 포커스</span></div>
        <div><strong>${summary.drawingCount}</strong><span>차트 작도</span></div>
        <div><strong>${summary.chartRangeCount}</strong><span>수동 Y축 범위</span></div>
      </div>
      <div class="backup-actions">
        <button type="button" class="backup-primary" id="exportFullBackup">전체 데이터 백업</button>
        <button type="button" class="backup-secondary" id="exportManualBackup">수동 점검 기록만 백업</button>
        <button type="button" class="backup-secondary" id="exportPortfolioBackup">포트폴리오만 백업</button>
        <button type="button" class="backup-secondary" id="importBackupButton">백업 파일 불러오기</button>
        <button type="button" class="backup-danger" id="clearLocalDashboardData">전체 데이터 초기화</button>
        <input type="file" id="backupFileInput" accept="application/json,.json" class="hidden" />
      </div>
      <p class="manual-storage-note">권장: 매주 토요일 점검 후 전체 백업 1회. 맥북으로 이동할 때는 이 JSON 파일을 가져와서 복원하면 됩니다.</p>
      <div id="backupStatus" class="backup-status muted"></div>
    </section>
  `;
}

function setupBackupHandlers() {
  const full = $("exportFullBackup");
  const manual = $("exportManualBackup");
  const portfolio = $("exportPortfolioBackup");
  const importButton = $("importBackupButton");
  const input = $("backupFileInput");
  const clear = $("clearLocalDashboardData");
  const status = $("backupStatus");

  if (full) full.onclick = () => exportBackup("full");
  if (manual) manual.onclick = () => exportBackup("manual");
  if (portfolio) portfolio.onclick = () => exportBackup("portfolio");
  if (importButton && input) importButton.onclick = () => input.click();

  if (input) {
    input.onchange = event => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const payload = JSON.parse(String(reader.result || "{}"));
          const restored = restoreBackupPayload(payload);
          if (status) status.textContent = `복원 완료: ${restored.join(", ")}`;
          APP_VIEW_DATA = applyManualOverrides(APP_RAW_DATA);
          renderAll(APP_VIEW_DATA);
        } catch (error) {
          if (status) status.textContent = `복원 실패: ${error.message}`;
          alert(`복원 실패: ${error.message}`);
        } finally {
          input.value = "";
        }
      };
      reader.readAsText(file);
    };
  }

  if (clear) {
    clear.onclick = () => {
      const ok = confirm("수동 입력값, 주간 점검 기록, 포트폴리오 자산 배분, 지표 차트 작도를 모두 삭제할까요? 이 작업은 백업 없이는 되돌릴 수 없습니다.");
      if (!ok) return;
      localStorage.removeItem(MANUAL_STORAGE_KEY);
      localStorage.removeItem(WEEKLY_REVIEW_STORAGE_KEY);
      localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
      localStorage.removeItem(PORTFOLIO_BASIS_STORAGE_KEY);
      localStorage.removeItem(CHECKLIST_STORAGE_KEY);
      localStorage.removeItem(ECONOMIC_EVENTS_STORAGE_KEY);
      localStorage.removeItem(WEEKLY_REPORT_STORAGE_KEY);
      localStorage.removeItem(CALENDAR_STATE_STORAGE_KEY);
      localStorage.removeItem(MONTHLY_FOCUS_STORAGE_KEY);
      localStorage.removeItem(INDICATOR_DRAWINGS_STORAGE_KEY);
      localStorage.removeItem(INDICATOR_CHART_STATE_STORAGE_KEY);
      localStorage.removeItem(INDICATOR_CHART_RANGE_STORAGE_KEY);
      INDICATOR_CHART_PENDING_POINT = null;
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      INDICATOR_CHART_DRAG_STATE = null;
      APP_VIEW_DATA = applyManualOverrides(APP_RAW_DATA);
      renderAll(APP_VIEW_DATA);
    };
  }
}

function injectBackupStyles() {
  if (document.getElementById("backup-panel-style")) return;
  const style = document.createElement("style");
  style.id = "backup-panel-style";
  style.textContent = `
    .backup-panel {
      margin-bottom: 22px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.10), rgba(255, 255, 255, 0.035));
      border: 1px solid rgba(96, 165, 250, 0.22);
    }

    .backup-summary-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin: 14px 0;
    }

    .backup-summary-grid div {
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .backup-summary-grid strong {
      display: block;
      color: #ffffff;
      font-size: 1.3rem;
      font-weight: 900;
      margin-bottom: 3px;
    }

    .backup-summary-grid span {
      color: rgba(255, 255, 255, 0.70);
      font-size: 0.84rem;
    }

    .backup-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .backup-actions button {
      border: 0;
      border-radius: 999px;
      padding: 9px 13px;
      color: #ffffff;
      font-weight: 850;
      cursor: pointer;
    }

    .backup-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
    .backup-secondary { background: rgba(255, 255, 255, 0.11); border: 1px solid rgba(255,255,255,0.14) !important; }
    .backup-danger { background: rgba(239, 68, 68, 0.72); }

    .backup-actions button:hover {
      transform: translateY(-1px);
      filter: brightness(1.08);
    }

    .backup-status {
      margin-top: 10px;
      min-height: 18px;
    }

    @media (max-width: 720px) {
      .backup-summary-grid { grid-template-columns: 1fr; }
      .backup-actions button { width: 100%; }
    }
  `;
  document.head.appendChild(style);
}



function numericValueOfIndicator(data, id) {
  const item = getIndicator(data, id);
  const value = Number(item?.currentValue);
  return Number.isFinite(value) ? value : null;
}

function formatReportMetric(data, id, fallback = "확인 필요") {
  const item = getIndicator(data, id);
  if (!item) return fallback;
  return `${item.name}: ${formatValue(item.currentValue, item.unit)} · ${labelStatus(item.signal)}`;
}

function newsImpactOptionsHtml(selected = "neutral") {
  return MANUAL_SIGNAL_OPTIONS.map(option => `
    <option value="${escapeHtml(option.value)}" ${selected === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function reportLengthOptionsHtml(selected = "medium") {
  const options = [
    { value: "short", label: "짧게 · 1페이지" },
    { value: "medium", label: "보통 · 2페이지" },
    { value: "long", label: "자세히 · 3페이지" }
  ];
  return options.map(option => `
    <option value="${escapeHtml(option.value)}" ${selected === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
  `).join("");
}

function collectReportNewsInputs() {
  return [1, 2, 3].map(index => ({
    title: $(`reportNewsTitle${index}`)?.value?.trim() || "",
    url: $(`reportNewsUrl${index}`)?.value?.trim() || "",
    axis: $(`reportNewsAxis${index}`)?.value || "other",
    signal: $(`reportNewsSignal${index}`)?.value || "neutral",
    summary: $(`reportNewsSummary${index}`)?.value?.trim() || ""
  })).filter(item => item.title || item.summary || item.url);
}

function scoreLineFromLive(live) {
  return `긍정 ${live.axisCounts.positive}개, 중립 ${live.axisCounts.neutral}개, 부정 ${live.axisCounts.negative}개`;
}

function axisNamesByStatus(live, status) {
  const names = live.axes.filter(axis => axis.status === status).map(axis => axis.name);
  return names.length ? names.join(", ") : "해당 없음";
}

function buildFactSetSummary(data) {
  const eps = getIndicator(data, "eps_beat_rate");
  const rev = getIndicator(data, "revenue_beat_rate");
  const epsText = eps ? formatValue(eps.currentValue, eps.unit) : "확인 필요";
  const revText = rev ? formatValue(rev.currentValue, rev.unit) : "확인 필요";
  const epsSignal = eps ? labelStatus(eps.signal) : "확인 필요";
  const revSignal = rev ? labelStatus(rev.signal) : "확인 필요";
  return `FactSet 실적 지표는 EPS Beat Rate ${epsText}(${epsSignal}), Revenue Beat Rate ${revText}(${revSignal})로 집계된다. EPS와 Revenue가 동시에 양호하면 실적의 질이 높고, EPS만 강하면 비용 통제 또는 일회성 이익 가능성을 별도로 확인해야 한다.`;
}

function buildNewsNarrative(newsItems) {
  if (!newsItems.length) {
    return "Investing.com 인기 뉴스 3개는 아직 입력되지 않았다. 이번 주 리포트에는 자동 지표와 FactSet 실적 지표 중심으로 판단을 작성한다.";
  }
  return newsItems.map((item, index) => {
    const axisLabel = labelFromOptions(EVENT_AXIS_OPTIONS, item.axis);
    const signal = labelStatus(item.signal);
    const summary = item.summary || "요약 미입력";
    const url = item.url ? ` / 링크: ${item.url}` : "";
    return `${index + 1}) ${item.title || "제목 미입력"} — 관련 축: ${axisLabel}, 방향: ${signal}. ${summary}${url}`;
  }).join("\n");
}

function generateWeeklyMarketReportPayload(data) {
  const live = computeLiveAxisScore(data);
  const newsItems = collectReportNewsInputs();
  const date = $("reportDate")?.value || todayKoreaDate();
  const length = $("reportLength")?.value || "medium";
  const extraMemo = $("reportExtraMemo")?.value?.trim() || "";
  const portfolio = normalizedPortfolioHoldings();
  const total = portfolioCurrentTotal(portfolio);
  const cash = portfolio.filter(isCashAsset).reduce((sum, item) => sum + portfolioBasisAmount(item, "market"), 0);
  const cashPct = total ? (cash / total) * 100 : 0;
  const topHoldings = portfolio
    .filter(item => !isCashAsset(item))
    .sort((a, b) => portfolioBasisAmount(b, "market") - portfolioBasisAmount(a, "market"))
    .slice(0, 5)
    .map(item => `${item.name}${item.symbol ? `(${item.symbol})` : ""} ${total ? ((portfolioBasisAmount(item, "market") / total) * 100).toFixed(1) : "0.0"}%`)
    .join(", ") || "입력된 투자자산 없음";

  const keyPositive = live.axes.filter(axis => axis.status === "positive").slice(0, 4).map(axis => axis.name);
  const keyNegative = live.axes.filter(axis => axis.status === "negative").slice(0, 4).map(axis => axis.name);
  const conflict = live.conflictAxes.map(axis => axis.name).slice(0, 4);

  const sections = [];
  sections.push(`주간 시장 리포트 · ${date}`);
  sections.push(`\n1. 한 줄 결론\n현재 시장은 ${scoreLineFromLive(live)} 기준으로 '${live.regime}'에 가깝다. 실행 바이어스는 '${live.actionBias}'이며, ${live.cashGuide}`);
  sections.push(`\n2. 8축 신호 요약\n긍정 축: ${axisNamesByStatus(live, "positive")}\n중립 축: ${axisNamesByStatus(live, "neutral")}\n부정 축: ${axisNamesByStatus(live, "negative")}\n축 내부 충돌: ${conflict.length ? conflict.join(", ") : "뚜렷한 충돌 없음"}`);
  sections.push(`\n3. 핵심 자동 지표\n- 금리/유동성: ${formatReportMetric(data, "us_10y_yield")}, ${formatReportMetric(data, "real_10y_yield")}, ${formatReportMetric(data, "ten_two_spread")}\n- 고용: ${formatReportMetric(data, "initial_claims")}, ${formatReportMetric(data, "unemployment_rate")}, ${formatReportMetric(data, "nonfarm_payrolls")}\n- 소비/물가: ${formatReportMetric(data, "retail_sales_yoy")}, ${formatReportMetric(data, "cpi_yoy")}, ${formatReportMetric(data, "real_retail_sales_proxy")}\n- 변동성/자금: ${formatReportMetric(data, "vix")}, ${formatReportMetric(data, "vix_futures_structure")}, ${formatReportMetric(data, "spy_flow_proxy")}, ${formatReportMetric(data, "sqqq_flow_proxy")}`);
  sections.push(`\n4. FactSet 실적 시즌 해석\n${buildFactSetSummary(data)}`);
  sections.push(`\n5. Investing.com 인기 뉴스 3개와 내러티브\n${buildNewsNarrative(newsItems)}`);

  if (length !== "short") {
    sections.push(`\n6. 긍정/부정/충돌 신호 해석\n긍정 신호는 ${keyPositive.length ? keyPositive.join(", ") : "제한적"}에서 나온다. 부정 또는 경계 신호는 ${keyNegative.length ? keyNegative.join(", ") : "제한적"}에서 나온다. 현재 판단의 핵심은 단일 지표가 아니라 금리, 실적, 고용, 소비, 변동성 축이 같은 방향으로 움직이는지 여부다. 뉴스 내러티브가 강해도 8축 지표가 뒷받침하지 않으면 추격은 제한한다.`);
    sections.push(`\n7. 포트폴리오 대응\n현재 입력된 포트폴리오 기준 현금 비중은 ${cashPct.toFixed(1)}%다. 상위 보유 자산은 ${topHoldings}이다. 시장이 위험자산 우호이면 현금 20~30%를 유지하며 상대강도 높은 자산을 분할 증액하고, 혼조이면 현금 30~45%, 방어 우선이면 45~60% 이상을 검토한다.`);
  }

  if (length === "long") {
    const upcoming = readEconomicEvents().filter(event => String(event.date || "") >= date).slice(0, 8);
    const upcomingText = upcoming.length ? upcoming.map(event => `- ${event.date} ${event.title} · ${labelFromOptions(EVENT_COUNTRY_OPTIONS, event.country)} · ${labelFromOptions(EVENT_AXIS_OPTIONS, event.axis)} · 중요도 ${labelFromOptions(EVENT_IMPORTANCE_OPTIONS, event.importance)}`).join("\n") : "등록된 다음 주 이벤트가 없습니다.";
    sections.push(`\n8. 다음 주 확인할 이벤트\n${upcomingText}`);
    sections.push(`\n9. 다음 주 전환 신호\n공격 전환은 긍정 축 4개 이상 유지, VIX 안정, EPS/Revenue beat 동시 양호, SQQQ 약세가 같이 확인될 때 우선한다. 방어 전환은 부정 축 4개 이상, VIX 급등, 실질금리 재상승, 고용 악화, 소비 프록시 음전환이 동시에 나타날 때 고려한다.`);
  }

  if (extraMemo) {
    sections.push(`\n추가 메모\n${extraMemo}`);
  }

  const reportText = sections.join("\n");
  return {
    id: `report-${Date.now()}`,
    date,
    length,
    createdAt: new Date().toISOString(),
    axisCounts: live.axisCounts,
    regime: live.regime,
    actionBias: live.actionBias,
    cashGuide: live.cashGuide,
    newsItems,
    reportText
  };
}

function renderSavedReportsList() {
  const reports = readWeeklyReports().slice().reverse();
  if (!reports.length) return `<p class="muted">저장된 주간 리포트가 없습니다.</p>`;
  return reports.slice(0, 8).map(report => `
    <div class="weekly-report-saved-row">
      <button type="button" class="report-load" data-report-load="${escapeHtml(report.id)}">
        <strong>${escapeHtml(report.date)} · ${escapeHtml(report.regime || "시장 리포트")}</strong>
        <span>${escapeHtml(report.actionBias || "대응 미기록")} · ${escapeHtml(report.length || "medium")}</span>
      </button>
      <button type="button" class="portfolio-delete" data-report-delete="${escapeHtml(report.id)}">삭제</button>
    </div>
  `).join("");
}

function renderWeeklyReportPanel(data) {
  const last = latestWeeklyReport();
  return `
    <section class="weekly-report-panel">
      <div class="manual-panel-header">
        <div>
          <h3>FactSet + Investing.com + 8축 주간 리포트</h3>
          <p class="muted">FactSet 실적 지표와 8축 자동 신호를 바탕으로, Investing.com 인기 뉴스 3개를 직접 입력해 1~3페이지 시장 판단문을 생성합니다.</p>
        </div>
        ${badge("manual-updated", "리포트 저장")}
      </div>
      <div class="review-grid">
        <label><span>리포트 날짜</span><input class="manual-input" type="date" id="reportDate" value="${escapeHtml(todayKoreaDate())}" /></label>
        <label><span>길이</span><select class="manual-input" id="reportLength">${reportLengthOptionsHtml("medium")}</select></label>
      </div>
      <div class="report-news-grid">
        ${[1,2,3].map(index => `
          <div class="report-news-card">
            <h4>Investing.com 인기 뉴스 ${index}</h4>
            <input class="manual-input" id="reportNewsTitle${index}" placeholder="뉴스 제목" />
            <input class="manual-input" id="reportNewsUrl${index}" placeholder="뉴스 링크 선택 입력" />
            <div class="report-news-selects">
              <select class="manual-input" id="reportNewsAxis${index}">${optionHtml(EVENT_AXIS_OPTIONS, "other")}</select>
              <select class="manual-input" id="reportNewsSignal${index}">${newsImpactOptionsHtml("neutral")}</select>
            </div>
            <textarea class="manual-input" id="reportNewsSummary${index}" rows="3" placeholder="핵심 요약: 시장이 무엇을 걱정/기대하는지, 8축 중 어디에 연결되는지 적기"></textarea>
          </div>
        `).join("")}
      </div>
      <label class="review-note-label"><span>추가 메모</span><textarea class="manual-input" id="reportExtraMemo" rows="3" placeholder="내 해석, 다음 주 확인 신호, 포트폴리오 대응 원칙 등"></textarea></label>
      <div class="weekly-review-actions">
        <button type="button" class="review-save" id="generateWeeklyReport">리포트 생성</button>
        <button type="button" class="backup-secondary" id="copyWeeklyReport">리포트 복사</button>
        <button type="button" class="backup-secondary" id="downloadWeeklyReport">TXT 다운로드</button>
        <button type="button" class="review-delete" id="deleteCurrentWeeklyReport">현재 리포트 삭제</button>
      </div>
      <textarea class="manual-input weekly-report-output" id="weeklyReportOutput" rows="18" placeholder="리포트 생성 버튼을 누르면 여기에 결과가 표시됩니다.">${escapeHtml(last?.reportText || "")}</textarea>
      <div class="weekly-report-saved-list">
        <h4>저장된 리포트</h4>
        ${renderSavedReportsList()}
      </div>
    </section>
  `;
}

function setupWeeklyReportHandlers() {
  const output = $("weeklyReportOutput");
  const generate = $("generateWeeklyReport");
  const copy = $("copyWeeklyReport");
  const download = $("downloadWeeklyReport");
  const delCurrent = $("deleteCurrentWeeklyReport");

  if (generate) {
    generate.onclick = () => {
      const payload = generateWeeklyMarketReportPayload(APP_VIEW_DATA);
      const reports = readWeeklyReports().filter(item => item.id !== payload.id);
      reports.push(payload);
      writeWeeklyReports(reports);
      if (output) output.value = payload.reportText;
      renderAll(APP_VIEW_DATA);
    };
  }

  if (copy) {
    copy.onclick = async () => {
      const text = output?.value || "";
      if (!text) return alert("복사할 리포트가 없습니다.");
      try {
        await navigator.clipboard.writeText(text);
        alert("리포트를 클립보드에 복사했습니다.");
      } catch (error) {
        alert("복사에 실패했습니다. 텍스트를 직접 선택해 복사하세요.");
      }
    };
  }

  if (download) {
    download.onclick = () => {
      const text = output?.value || "";
      if (!text) return alert("다운로드할 리포트가 없습니다.");
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `weekly-market-report-${($("reportDate")?.value || todayKoreaDate())}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };
  }

  if (delCurrent) {
    delCurrent.onclick = () => {
      const currentText = output?.value || "";
      const reports = readWeeklyReports();
      const target = [...reports].reverse().find(item => item.reportText === currentText) || latestWeeklyReport();
      if (!target) return alert("삭제할 저장 리포트가 없습니다.");
      if (!confirm(`${target.date} 리포트를 삭제할까요?`)) return;
      writeWeeklyReports(reports.filter(item => item.id !== target.id));
      renderAll(APP_VIEW_DATA);
    };
  }

  document.querySelectorAll("[data-report-load]").forEach(button => {
    button.onclick = () => {
      const report = readWeeklyReports().find(item => item.id === button.dataset.reportLoad);
      if (!report) return;
      if ($("reportDate")) $("reportDate").value = report.date || todayKoreaDate();
      if ($("reportLength")) $("reportLength").value = report.length || "medium";
      if (output) output.value = report.reportText || "";
      (report.newsItems || []).slice(0,3).forEach((item, idx) => {
        const index = idx + 1;
        if ($(`reportNewsTitle${index}`)) $(`reportNewsTitle${index}`).value = item.title || "";
        if ($(`reportNewsUrl${index}`)) $(`reportNewsUrl${index}`).value = item.url || "";
        if ($(`reportNewsAxis${index}`)) $(`reportNewsAxis${index}`).value = item.axis || "other";
        if ($(`reportNewsSignal${index}`)) $(`reportNewsSignal${index}`).value = item.signal || "neutral";
        if ($(`reportNewsSummary${index}`)) $(`reportNewsSummary${index}`).value = item.summary || "";
      });
      window.scrollTo({ top: $("todoView")?.offsetTop || 0, behavior: "smooth" });
    };
  });

  document.querySelectorAll("[data-report-delete]").forEach(button => {
    button.onclick = () => {
      if (!confirm("이 리포트를 삭제할까요?")) return;
      writeWeeklyReports(readWeeklyReports().filter(item => item.id !== button.dataset.reportDelete));
      renderAll(APP_VIEW_DATA);
    };
  });
}

function injectWeeklyReportStyles() {
  if (document.getElementById("weekly-report-style")) return;
  const style = document.createElement("style");
  style.id = "weekly-report-style";
  style.textContent = `
    .weekly-report-panel {
      margin-bottom: 22px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.10), rgba(255, 255, 255, 0.035));
      border: 1px solid rgba(192, 132, 252, 0.24);
    }
    .report-news-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 14px 0;
    }
    .report-news-card {
      padding: 13px;
      border-radius: 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      display: grid;
      gap: 8px;
    }
    .report-news-card h4 {
      margin: 0;
      color: #fff;
    }
    .report-news-selects {
      display: grid;
      grid-template-columns: 1fr 120px;
      gap: 8px;
    }
    .weekly-report-output {
      width: 100%;
      box-sizing: border-box;
      margin-top: 12px;
      line-height: 1.55;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    .weekly-report-saved-list {
      margin-top: 14px;
      display: grid;
      gap: 8px;
    }
    .weekly-report-saved-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: stretch;
    }
    .report-load {
      text-align: left;
      border: 1px solid rgba(255,255,255,0.13);
      border-radius: 14px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.06);
      color: #fff;
      cursor: pointer;
    }
    .report-load strong,
    .report-load span {
      display: block;
    }
    .report-load span {
      margin-top: 3px;
      color: rgba(255,255,255,0.64);
      font-size: 0.82rem;
      font-weight: 800;
    }
    @media (max-width: 920px) {
      .report-news-grid { grid-template-columns: 1fr; }
      .report-news-selects { grid-template-columns: 1fr; }
      .weekly-report-saved-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

function renderChecklistPanel() {
  const status = readChecklistStatus();
  const grouped = DEFAULT_CHECKLIST_ITEMS.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const groupHtml = Object.entries(grouped).map(([group, items]) => `
    <div class="checklist-group">
      <h4>${escapeHtml(group)}</h4>
      ${items.map(item => {
        const state = status[item.id] || {};
        return `
          <label class="checklist-row ${state.done ? "is-done" : ""}">
            <input type="checkbox" data-checklist-id="${escapeHtml(item.id)}" ${state.done ? "checked" : ""} />
            <span class="checklist-main">
              <strong>${escapeHtml(item.label)}</strong>
              <em>${escapeHtml(item.cadence)}</em>
            </span>
            <span class="checklist-date">${state.doneAt ? `완료 ${escapeHtml(state.doneAt.slice(0, 10))}` : "미완료"}</span>
          </label>
          <textarea class="manual-input checklist-note" data-checklist-note="${escapeHtml(item.id)}" rows="2" placeholder="이 항목에 대한 짧은 메모">${escapeHtml(state.note || "")}</textarea>
        `;
      }).join("")}
    </div>
  `).join("");

  return `
    <section class="checklist-panel">
      <div class="manual-panel-header">
        <div>
          <h3>체크리스트 완료 기록</h3>
          <p class="muted">완료 체크를 누르면 현재 날짜가 저장됩니다. 금요일·토요일 최종 점검 또는 월요일 장 시작 전 점검용입니다.</p>
        </div>
        ${badge("manual-updated", "완료일 저장")}
      </div>
      ${groupHtml}
      <div class="weekly-review-actions">
        <button type="button" class="review-delete" id="resetChecklistStatus">체크리스트 초기화</button>
      </div>
    </section>
  `;
}

function setupChecklistHandlers() {
  document.querySelectorAll("[data-checklist-id]").forEach(input => {
    input.onchange = () => {
      const id = input.dataset.checklistId;
      const state = readChecklistStatus();
      const previous = state[id] || {};
      state[id] = {
        ...previous,
        done: input.checked,
        doneAt: input.checked ? new Date().toISOString() : "",
        updatedAt: new Date().toISOString()
      };
      writeChecklistStatus(state);
      renderAll(APP_VIEW_DATA);
    };
  });

  document.querySelectorAll("[data-checklist-note]").forEach(textarea => {
    textarea.onchange = () => {
      const id = textarea.dataset.checklistNote;
      const state = readChecklistStatus();
      state[id] = {
        ...(state[id] || {}),
        note: textarea.value,
        updatedAt: new Date().toISOString()
      };
      writeChecklistStatus(state);
    };
  });

  const reset = $("resetChecklistStatus");
  if (reset) {
    reset.onclick = () => {
      if (!confirm("체크리스트 완료 여부와 메모를 모두 초기화할까요?")) return;
      writeChecklistStatus({});
      renderAll(APP_VIEW_DATA);
    };
  }
}

function eventFormValue(id) {
  return $(id)?.value ?? "";
}

function renderEconomicEventPanel() {
  const events = readEconomicEvents();
  const rows = events.length ? events.map(event => `
    <div class="economic-event-admin-row">
      <div>
        <strong>${escapeHtml(event.date)} · ${escapeHtml(event.title)}</strong>
        <div class="badge-row">${renderEventBadges(event)}</div>
        <p class="muted">${escapeHtml(event.memo || "메모 없음")}</p>
      </div>
      <div class="portfolio-row-actions">
        <button type="button" class="portfolio-edit" data-event-edit="${escapeHtml(event.id)}">수정</button>
        <button type="button" class="portfolio-delete" data-event-delete="${escapeHtml(event.id)}">삭제</button>
      </div>
    </div>
  `).join("") : `<p class="muted">아직 저장된 경제 이벤트가 없습니다.</p>`;

  return `
    <section class="economic-event-panel">
      <div class="manual-panel-header">
        <div>
          <h3>증시·경제 이벤트 직접 등록</h3>
          <p class="muted">중요 이벤트를 국가, 8축, 선행/동행/후행 기준으로 분류해 캘린더에 저장합니다. 8축에 없는 사건은 정책/기타로 표시할 수 있습니다.</p>
        </div>
        ${badge("manual-updated", "캘린더 저장")}
      </div>
      <input type="hidden" id="eventEditId" value="" />
      <div class="review-grid">
        <label><span>날짜</span><input class="manual-input" type="date" id="eventDate" value="${escapeHtml(todayKoreaDate())}" /></label>
        <label><span>이벤트명</span><input class="manual-input" id="eventTitle" placeholder="예: FOMC, CPI, BOJ 회의, 한국 수출" /></label>
        <label><span>국가/지역</span><select class="manual-input" id="eventCountry">${optionHtml(EVENT_COUNTRY_OPTIONS, "US")}</select></label>
        <label><span>시장 8축/분류</span><select class="manual-input" id="eventAxis">${optionHtml(EVENT_AXIS_OPTIONS, "rates")}</select></label>
        <label><span>시간성</span><select class="manual-input" id="eventTiming">${optionHtml(EVENT_TIMING_OPTIONS, "leading")}</select></label>
        <label><span>중요도</span><select class="manual-input" id="eventImportance">${optionHtml(EVENT_IMPORTANCE_OPTIONS, "medium")}</select></label>
      </div>
      <label class="review-note-label"><span>메모</span><textarea class="manual-input" id="eventMemo" rows="3" placeholder="예상치, 실제치, 시장 반응, 내 시나리오에 미치는 영향을 적어두세요."></textarea></label>
      <div class="weekly-review-actions">
        <button type="button" class="review-save" id="saveEconomicEvent">이벤트 저장</button>
        <button type="button" class="portfolio-cancel" id="cancelEconomicEventEdit" style="display:none;">편집 취소</button>
      </div>
      <div class="economic-event-list">${rows}</div>
    </section>
  `;
}

function clearEconomicEventForm() {
  const ids = ["eventEditId", "eventTitle", "eventMemo"];
  ids.forEach(id => { const el = $(id); if (el) el.value = ""; });
  const date = $("eventDate"); if (date) date.value = todayKoreaDate();
  const country = $("eventCountry"); if (country) country.value = "US";
  const axis = $("eventAxis"); if (axis) axis.value = "rates";
  const timing = $("eventTiming"); if (timing) timing.value = "leading";
  const importance = $("eventImportance"); if (importance) importance.value = "medium";
  const save = $("saveEconomicEvent"); if (save) save.textContent = "이벤트 저장";
  const cancel = $("cancelEconomicEventEdit"); if (cancel) cancel.style.display = "none";
}

function setupEconomicEventHandlers() {
  const save = $("saveEconomicEvent");
  const cancel = $("cancelEconomicEventEdit");
  if (save) {
    save.onclick = () => {
      const title = eventFormValue("eventTitle").trim();
      if (!title) {
        alert("이벤트명을 입력하세요.");
        return;
      }
      const editId = eventFormValue("eventEditId");
      const events = readEconomicEvents();
      const payload = {
        id: editId || `event-${Date.now()}`,
        date: eventFormValue("eventDate") || todayKoreaDate(),
        title,
        country: eventFormValue("eventCountry") || "US",
        axis: eventFormValue("eventAxis") || "other",
        timing: eventFormValue("eventTiming") || "other",
        importance: eventFormValue("eventImportance") || "medium",
        memo: eventFormValue("eventMemo"),
        updatedAt: new Date().toISOString()
      };
      if (editId) writeEconomicEvents(events.map(event => event.id === editId ? payload : event));
      else writeEconomicEvents([...events, payload]);
      clearEconomicEventForm();
      renderAll(APP_VIEW_DATA);
    };
  }
  if (cancel) cancel.onclick = () => clearEconomicEventForm();

  document.querySelectorAll("[data-event-edit]").forEach(button => {
    button.onclick = () => {
      const event = readEconomicEvents().find(item => item.id === button.dataset.eventEdit);
      if (!event) return;
      $("eventEditId").value = event.id;
      $("eventDate").value = event.date || todayKoreaDate();
      $("eventTitle").value = event.title || "";
      $("eventCountry").value = event.country || "US";
      $("eventAxis").value = event.axis || "other";
      $("eventTiming").value = event.timing || "other";
      $("eventImportance").value = event.importance || "medium";
      $("eventMemo").value = event.memo || "";
      const save = $("saveEconomicEvent"); if (save) save.textContent = "이벤트 수정 저장";
      const cancel = $("cancelEconomicEventEdit"); if (cancel) cancel.style.display = "inline-flex";
      window.scrollTo({ top: $("todoView")?.offsetTop || 0, behavior: "smooth" });
    };
  });

  document.querySelectorAll("[data-event-delete]").forEach(button => {
    button.onclick = () => {
      if (!confirm("이 이벤트를 삭제할까요?")) return;
      writeEconomicEvents(readEconomicEvents().filter(event => event.id !== button.dataset.eventDelete));
      renderAll(APP_VIEW_DATA);
    };
  });
}


const INDICATOR_DRAWINGS_STORAGE_KEY = "eightAxisIndicatorDrawingsV1";
const INDICATOR_CHART_STATE_STORAGE_KEY = "eightAxisIndicatorChartStateV1";
const INDICATOR_CHART_RANGE_STORAGE_KEY = "eightAxisIndicatorChartRangesV1";

let INDICATOR_CHART_RUNTIME = null;
let INDICATOR_CHART_PENDING_POINT = null;
let INDICATOR_CHART_SELECTED_DRAWING_ID = null;
let INDICATOR_CHART_DRAG_STATE = null;
let INDICATOR_CHART_RESIZE_BOUND = false;

function readIndicatorDrawings() {
  const drawings = readJsonStorage(INDICATOR_DRAWINGS_STORAGE_KEY, {});
  return drawings && typeof drawings === "object" && !Array.isArray(drawings) ? drawings : {};
}

function writeIndicatorDrawings(drawings) {
  writeJsonStorage(INDICATOR_DRAWINGS_STORAGE_KEY, drawings || {});
}

function readIndicatorChartRanges() {
  const ranges = readJsonStorage(INDICATOR_CHART_RANGE_STORAGE_KEY, {});
  return ranges && typeof ranges === "object" && !Array.isArray(ranges) ? ranges : {};
}

function readIndicatorChartRange(indicatorId) {
  const range = readIndicatorChartRanges()[indicatorId];
  const min = Number(range?.min);
  const max = Number(range?.max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return null;
  return { min, max };
}

function writeIndicatorChartRange(indicatorId, range) {
  const ranges = readIndicatorChartRanges();
  const min = Number(range?.min);
  const max = Number(range?.max);
  if (Number.isFinite(min) && Number.isFinite(max) && min < max) {
    ranges[indicatorId] = { min, max };
  } else {
    delete ranges[indicatorId];
  }
  writeJsonStorage(INDICATOR_CHART_RANGE_STORAGE_KEY, ranges);
}

function writeIndicatorChartRanges(ranges) {
  const clean = {};
  Object.entries(ranges || {}).forEach(([indicatorId, range]) => {
    const min = Number(range?.min);
    const max = Number(range?.max);
    if (Number.isFinite(min) && Number.isFinite(max) && min < max) {
      clean[indicatorId] = { min, max };
    }
  });
  writeJsonStorage(INDICATOR_CHART_RANGE_STORAGE_KEY, clean);
}

function readIndicatorChartState(data = APP_VIEW_DATA) {
  const saved = readJsonStorage(INDICATOR_CHART_STATE_STORAGE_KEY, {});
  const candidates = (data?.indicators || []).filter(item => {
    const current = Number(item.currentValue);
    const previous = Number(item.previousValue);
    return Number.isFinite(current) || Number.isFinite(previous);
  });
  const fallbackId = candidates[0]?.id || "";
  const indicatorId = candidates.some(item => item.id === saved.indicatorId) ? saved.indicatorId : fallbackId;
  const mode = ["select", "trend", "horizontal"].includes(saved.mode) ? saved.mode : "select";
  return { indicatorId, mode };
}

function writeIndicatorChartState(state) {
  writeJsonStorage(INDICATOR_CHART_STATE_STORAGE_KEY, {
    indicatorId: state?.indicatorId || "",
    mode: ["select", "trend", "horizontal"].includes(state?.mode) ? state.mode : "select"
  });
}

function indicatorDrawingsFor(indicatorId) {
  const all = readIndicatorDrawings();
  return Array.isArray(all[indicatorId]) ? all[indicatorId] : [];
}

function writeIndicatorDrawingsFor(indicatorId, drawings) {
  const all = readIndicatorDrawings();
  if (drawings.length) all[indicatorId] = drawings;
  else delete all[indicatorId];
  writeIndicatorDrawings(all);
}

function indicatorChartCandidates(data) {
  return (data?.indicators || []).filter(item => {
    const current = Number(item.currentValue);
    const previous = Number(item.previousValue);
    return Number.isFinite(current) || Number.isFinite(previous);
  });
}

function parseChartTimestamp(value, fallbackIndex = 0) {
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;
  return Date.now() + fallbackIndex * 86400000;
}

function getIndicatorChartSeries(data, history, indicatorId) {
  const rows = [];
  getHistorySnapshots(history).forEach((snapshot, index) => {
    const item = getSnapshotIndicator(snapshot, indicatorId);
    const value = Number(item?.currentValue);
    if (!Number.isFinite(value)) return;
    rows.push({
      time: parseChartTimestamp(snapshot.date || snapshot.updatedAt, index),
      value,
      label: snapshot.date || String(snapshot.updatedAt || "").slice(0, 10) || `기록 ${index + 1}`
    });
  });

  const current = getIndicator(data, indicatorId);
  const currentValue = Number(current?.currentValue);
  const previousValue = Number(current?.previousValue);
  const currentTime = parseChartTimestamp(data?.meta?.updatedAt || new Date().toISOString(), rows.length);

  if (!rows.length && Number.isFinite(previousValue)) {
    rows.push({
      time: currentTime - 7 * 86400000,
      value: previousValue,
      label: "이전값"
    });
  }

  if (Number.isFinite(currentValue)) {
    const duplicate = rows.some(row => Math.abs(row.time - currentTime) < 60000 && row.value === currentValue);
    if (!duplicate) {
      rows.push({
        time: currentTime,
        value: currentValue,
        label: String(data?.meta?.updatedAt || "").slice(0, 10) || "현재"
      });
    }
  }

  return rows
    .filter(row => Number.isFinite(row.time) && Number.isFinite(row.value))
    .sort((a, b) => a.time - b.time);
}

function formatChartValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  const abs = Math.abs(numeric);
  const maximumFractionDigits = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 4;
  return numeric.toLocaleString("ko-KR", { maximumFractionDigits });
}

function formatChartDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatChartTooltipDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short"
  }).format(date);
}

function renderIndicatorChartView(data, history) {
  const panel = $("indicatorChartPanel");
  if (!panel) return;

  const candidates = indicatorChartCandidates(data);
  if (!candidates.length) {
    panel.innerHTML = `<div class="chart-empty">차트로 표시할 숫자형 지표가 없습니다.</div>`;
    return;
  }

  const state = readIndicatorChartState(data);
  const selected = candidates.find(item => item.id === state.indicatorId) || candidates[0];
  const series = getIndicatorChartSeries(data, history, selected.id);
  const drawings = indicatorDrawingsFor(selected.id);
  const yRange = readIndicatorChartRange(selected.id);

  panel.innerHTML = `
    <div class="indicator-chart-shell">
      <div class="indicator-chart-controls">
        <label class="indicator-select-control">
          <span>지표</span>
          <select id="indicatorChartSelect">
            ${candidates.map(item => `
              <option value="${escapeHtml(item.id)}" ${item.id === selected.id ? "selected" : ""}>
                ${escapeHtml(item.axisName || "")} · ${escapeHtml(item.name)}
              </option>
            `).join("")}
          </select>
        </label>
        <div class="drawing-toolbar" role="toolbar" aria-label="차트 작도 도구">
          <button type="button" data-chart-mode="select" class="${state.mode === "select" ? "active" : ""}">선택·이동</button>
          <button type="button" data-chart-mode="trend" class="${state.mode === "trend" ? "active" : ""}">추세선</button>
          <button type="button" data-chart-mode="horizontal" class="${state.mode === "horizontal" ? "active" : ""}">수평선</button>
          <button type="button" id="undoIndicatorDrawing" ${drawings.length ? "" : "disabled"}>마지막 취소</button>
          <button type="button" id="deleteIndicatorDrawing" ${INDICATOR_CHART_SELECTED_DRAWING_ID ? "" : "disabled"}>선택 삭제</button>
          <button type="button" id="clearIndicatorDrawings" ${drawings.length ? "" : "disabled"}>전체 삭제</button>
        </div>
      </div>

      <div class="indicator-y-range-controls" aria-label="Y축 범위 설정">
        <div class="indicator-y-range-inputs">
          <label>
            <span>Y축 최소</span>
            <input id="indicatorYMin" type="number" step="any" value="${yRange ? escapeHtml(yRange.min) : ""}" placeholder="자동" />
          </label>
          <label>
            <span>Y축 최대</span>
            <input id="indicatorYMax" type="number" step="any" value="${yRange ? escapeHtml(yRange.max) : ""}" placeholder="자동" />
          </label>
        </div>
        <div class="indicator-y-range-actions">
          <button type="button" id="applyIndicatorYRange">직접 적용</button>
          <button type="button" id="widenIndicatorYRange">범위 넓게</button>
          <button type="button" id="narrowIndicatorYRange">범위 좁게</button>
          <button type="button" id="resetIndicatorYRange" class="${yRange ? "" : "active"}">자동 맞춤</button>
        </div>
      </div>

      <div class="indicator-chart-meta">
        <div>
          <strong>${escapeHtml(selected.name)}</strong>
          <span>${escapeHtml(selected.axisName || "")} · ${escapeHtml(selected.timingLabel || "")}</span>
        </div>
        <div>
          <strong>${formatValue(selected.currentValue, selected.unit)}</strong>
          <span>기록 ${series.length}개 · 작도 ${drawings.length}개 · Y축 ${yRange ? "수동" : "자동"}</span>
        </div>
      </div>

      <div class="indicator-chart-stage" id="indicatorChartStage">
        <canvas id="indicatorChartCanvas" aria-label="${escapeHtml(selected.name)} 시계열 차트"></canvas>
        <div class="indicator-chart-help" id="indicatorChartHelp">선택·이동 모드: 선 자체를 드래그해 이동하고, 추세선 끝점을 드래그해 기울기를 수정합니다.</div>
        <div class="indicator-chart-tooltip hidden" id="indicatorChartTooltip" role="status"></div>
      </div>

      <div class="indicator-chart-status">
        <span id="indicatorChartStatus">${state.mode === "trend" ? "차트에서 시작점과 끝점을 차례로 선택하세요." : state.mode === "horizontal" ? "차트에서 원하는 값 위치를 선택하세요." : "추세선 몸통을 드래그하면 선 전체가 이동하고, 양 끝점을 드래그하면 기울기가 수정됩니다. 수평선도 선 자체를 위아래로 드래그할 수 있습니다."}</span>
        <span>작도와 Y축 범위는 이 브라우저에 자동 저장됩니다.</span>
      </div>
    </div>
  `;

  setupIndicatorChartHandlers(data, history, selected.id);
  requestAnimationFrame(() => renderIndicatorChartCanvas(data, history, selected.id));
}

function chartCanvasGeometry(canvas, series, drawings, manualRange = null) {
  const width = Math.max(320, canvas.clientWidth || 320);
  const height = Math.max(360, canvas.clientHeight || 360);
  const padding = { left: 72, right: 24, top: 26, bottom: 46 };
  const plotWidth = Math.max(1, width - padding.left - padding.right);
  const plotHeight = Math.max(1, height - padding.top - padding.bottom);

  let minTime = Math.min(...series.map(row => row.time));
  let maxTime = Math.max(...series.map(row => row.time));
  if (!Number.isFinite(minTime) || !Number.isFinite(maxTime)) {
    minTime = Date.now() - 7 * 86400000;
    maxTime = Date.now();
  }
  if (minTime === maxTime) {
    minTime -= 86400000;
    maxTime += 86400000;
  }

  const values = series.map(row => row.value);
  drawings.forEach(drawing => {
    if (Number.isFinite(Number(drawing.y1))) values.push(Number(drawing.y1));
    if (Number.isFinite(Number(drawing.y2))) values.push(Number(drawing.y2));
    if (Number.isFinite(Number(drawing.value))) values.push(Number(drawing.value));
  });

  let minValue;
  let maxValue;
  if (manualRange && Number.isFinite(manualRange.min) && Number.isFinite(manualRange.max) && manualRange.min < manualRange.max) {
    minValue = manualRange.min;
    maxValue = manualRange.max;
  } else {
    minValue = Math.min(...values);
    maxValue = Math.max(...values);
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      minValue = 0;
      maxValue = 1;
    }
    const span = maxValue - minValue;
    const valuePadding = span > 0 ? span * 0.12 : Math.max(Math.abs(maxValue) * 0.08, 1);
    minValue -= valuePadding;
    maxValue += valuePadding;
  }

  if (minValue === maxValue) {
    const fallback = Math.max(Math.abs(minValue) * 0.05, 0.01);
    minValue -= fallback;
    maxValue += fallback;
  }

  const xToPixel = time => padding.left + ((time - minTime) / (maxTime - minTime)) * plotWidth;
  const yToPixel = value => padding.top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;
  const pixelToTime = x => minTime + ((x - padding.left) / plotWidth) * (maxTime - minTime);
  const pixelToValue = y => maxValue - ((y - padding.top) / plotHeight) * (maxValue - minValue);

  return {
    width,
    height,
    padding,
    plotWidth,
    plotHeight,
    minTime,
    maxTime,
    minValue,
    maxValue,
    xToPixel,
    yToPixel,
    pixelToTime,
    pixelToValue
  };
}

function resizeChartCanvas(canvas) {
  const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const width = Math.max(320, canvas.clientWidth || 320);
  const height = Math.max(360, canvas.clientHeight || 360);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return context;
}

function activeIndicatorDrawings(indicatorId) {
  if (INDICATOR_CHART_DRAG_STATE?.indicatorId === indicatorId) {
    return INDICATOR_CHART_DRAG_STATE.drawings;
  }
  return indicatorDrawingsFor(indicatorId);
}

function drawIndicatorChartHandle(context, x, y, color = "#ffffff") {
  context.save();
  context.setLineDash([]);
  context.beginPath();
  context.arc(x, y, 7.5, 0, Math.PI * 2);
  context.fillStyle = "#080d1b";
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.arc(x, y, 2.4, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.restore();
}

function renderIndicatorChartCanvas(data, history, indicatorId, previewPoint = null) {
  const canvas = $("indicatorChartCanvas");
  if (!canvas) return;

  const series = getIndicatorChartSeries(data, history, indicatorId);
  const drawings = activeIndicatorDrawings(indicatorId);
  const selectedIndicator = getIndicator(data, indicatorId);
  const context = resizeChartCanvas(canvas);
  const g = chartCanvasGeometry(canvas, series, drawings, readIndicatorChartRange(indicatorId));
  INDICATOR_CHART_RUNTIME = {
    indicatorId,
    series,
    drawings,
    geometry: g,
    indicatorName: selectedIndicator?.name || indicatorId,
    unit: selectedIndicator?.unit || ""
  };

  context.clearRect(0, 0, g.width, g.height);
  context.fillStyle = "rgba(8, 13, 27, 0.96)";
  context.fillRect(0, 0, g.width, g.height);

  context.font = "12px system-ui, sans-serif";
  context.textBaseline = "middle";
  context.lineWidth = 1;

  for (let i = 0; i <= 5; i += 1) {
    const y = g.padding.top + (g.plotHeight / 5) * i;
    const value = g.maxValue - ((g.maxValue - g.minValue) / 5) * i;
    context.strokeStyle = "rgba(255,255,255,0.08)";
    context.beginPath();
    context.moveTo(g.padding.left, y);
    context.lineTo(g.width - g.padding.right, y);
    context.stroke();
    context.fillStyle = "rgba(238,243,255,0.62)";
    context.textAlign = "right";
    context.fillText(formatChartValue(value), g.padding.left - 10, y);
  }

  const tickCount = Math.min(5, Math.max(2, series.length));
  for (let i = 0; i < tickCount; i += 1) {
    const ratio = tickCount === 1 ? 0 : i / (tickCount - 1);
    const x = g.padding.left + g.plotWidth * ratio;
    const time = g.minTime + (g.maxTime - g.minTime) * ratio;
    context.strokeStyle = "rgba(255,255,255,0.06)";
    context.beginPath();
    context.moveTo(x, g.padding.top);
    context.lineTo(x, g.height - g.padding.bottom);
    context.stroke();
    context.fillStyle = "rgba(238,243,255,0.55)";
    context.textAlign = i === 0 ? "left" : i === tickCount - 1 ? "right" : "center";
    context.fillText(formatChartDate(time), x, g.height - 20);
  }

  context.save();
  context.beginPath();
  context.rect(g.padding.left, g.padding.top, g.plotWidth, g.plotHeight);
  context.clip();

  if (series.length > 1) {
    context.strokeStyle = "#8ec5ff";
    context.lineWidth = 2.4;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.beginPath();
    series.forEach((row, index) => {
      const x = g.xToPixel(row.time);
      const y = g.yToPixel(row.value);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }

  series.forEach(row => {
    context.beginPath();
    context.arc(g.xToPixel(row.time), g.yToPixel(row.value), 3.8, 0, Math.PI * 2);
    context.fillStyle = "#eef3ff";
    context.fill();
    context.strokeStyle = "#8ec5ff";
    context.lineWidth = 1.5;
    context.stroke();
  });

  drawings.forEach(drawing => {
    const selected = drawing.id === INDICATOR_CHART_SELECTED_DRAWING_ID;
    context.strokeStyle = selected ? "#ffffff" : drawing.type === "horizontal" ? "#37d67a" : "#ffd166";
    context.lineWidth = selected ? 3 : 2;
    context.setLineDash(selected ? [] : [8, 5]);
    context.beginPath();

    if (drawing.type === "horizontal") {
      const y = g.yToPixel(Number(drawing.value));
      context.moveTo(g.padding.left, y);
      context.lineTo(g.width - g.padding.right, y);
      context.stroke();
      context.fillStyle = selected ? "#ffffff" : "#37d67a";
      context.textAlign = "right";
      context.fillText(formatChartValue(drawing.value), g.width - g.padding.right - 8, y - 11);
      if (selected) {
        drawIndicatorChartHandle(context, g.width - g.padding.right - 10, y, "#37d67a");
      }
    } else {
      const x1 = g.xToPixel(Number(drawing.x1));
      const y1 = g.yToPixel(Number(drawing.y1));
      const x2 = g.xToPixel(Number(drawing.x2));
      const y2 = g.yToPixel(Number(drawing.y2));
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      if (selected) {
        drawIndicatorChartHandle(context, x1, y1, "#ffd166");
        drawIndicatorChartHandle(context, x2, y2, "#ffd166");
      }
    }
  });

  if (INDICATOR_CHART_PENDING_POINT && previewPoint) {
    context.strokeStyle = "rgba(255, 209, 102, 0.8)";
    context.lineWidth = 2;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(g.xToPixel(INDICATOR_CHART_PENDING_POINT.time), g.yToPixel(INDICATOR_CHART_PENDING_POINT.value));
    context.lineTo(g.xToPixel(previewPoint.time), g.yToPixel(previewPoint.value));
    context.stroke();
  }

  context.restore();
  context.setLineDash([]);

  if (!series.length) {
    context.fillStyle = "rgba(238,243,255,0.62)";
    context.font = "14px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("history.json에 이 지표의 기록이 없습니다.", g.width / 2, g.height / 2);
  }
}

function canvasPointerPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function chartPointFromPointer(canvas, event) {
  if (!INDICATOR_CHART_RUNTIME) return null;
  const point = canvasPointerPosition(canvas, event);
  const g = INDICATOR_CHART_RUNTIME.geometry;
  const x = Math.max(g.padding.left, Math.min(g.width - g.padding.right, point.x));
  const y = Math.max(g.padding.top, Math.min(g.height - g.padding.bottom, point.y));
  return {
    pixelX: x,
    pixelY: y,
    time: g.pixelToTime(x),
    value: g.pixelToValue(y)
  };
}

function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function findNearestIndicatorDrawing(pointer, maxDistance = 15) {
  if (!INDICATOR_CHART_RUNTIME) return null;
  const g = INDICATOR_CHART_RUNTIME.geometry;
  let nearest = null;
  let nearestDistance = Infinity;

  INDICATOR_CHART_RUNTIME.drawings.forEach(drawing => {
    let distance;
    if (drawing.type === "horizontal") {
      distance = Math.abs(pointer.pixelY - g.yToPixel(Number(drawing.value)));
    } else {
      distance = pointSegmentDistance(
        pointer.pixelX,
        pointer.pixelY,
        g.xToPixel(Number(drawing.x1)),
        g.yToPixel(Number(drawing.y1)),
        g.xToPixel(Number(drawing.x2)),
        g.yToPixel(Number(drawing.y2))
      );
    }
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = drawing;
    }
  });

  return nearestDistance <= maxDistance ? nearest : null;
}

function findNearestIndicatorDrawingHandle(pointer, maxDistance = 18) {
  if (!INDICATOR_CHART_RUNTIME) return null;
  const g = INDICATOR_CHART_RUNTIME.geometry;
  const drawings = [...INDICATOR_CHART_RUNTIME.drawings].sort((a, b) => {
    if (a.id === INDICATOR_CHART_SELECTED_DRAWING_ID) return -1;
    if (b.id === INDICATOR_CHART_SELECTED_DRAWING_ID) return 1;
    return 0;
  });
  let nearest = null;
  let nearestDistance = Infinity;

  drawings.forEach(drawing => {
    if (drawing.type !== "trend") return;
    [
      { handle: "start", x: g.xToPixel(Number(drawing.x1)), y: g.yToPixel(Number(drawing.y1)) },
      { handle: "end", x: g.xToPixel(Number(drawing.x2)), y: g.yToPixel(Number(drawing.y2)) }
    ].forEach(candidate => {
      const distance = Math.hypot(pointer.pixelX - candidate.x, pointer.pixelY - candidate.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = { drawing, handle: candidate.handle };
      }
    });
  });

  return nearestDistance <= maxDistance ? nearest : null;
}

function findNearestIndicatorSeriesPoint(pointer, maxDistance = 28) {
  if (!INDICATOR_CHART_RUNTIME) return null;
  const g = INDICATOR_CHART_RUNTIME.geometry;
  let nearest = null;
  let nearestDistance = Infinity;

  INDICATOR_CHART_RUNTIME.series.forEach(row => {
    const x = g.xToPixel(row.time);
    const y = g.yToPixel(row.value);
    const distance = Math.hypot(pointer.pixelX - x, pointer.pixelY - y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { row, x, y };
    }
  });

  return nearestDistance <= maxDistance ? nearest : null;
}

function hideIndicatorChartTooltip() {
  const tooltip = $("indicatorChartTooltip");
  if (tooltip) tooltip.classList.add("hidden");
}

function updateIndicatorChartTooltip(pointer) {
  const tooltip = $("indicatorChartTooltip");
  const stage = $("indicatorChartStage");
  if (!tooltip || !stage || INDICATOR_CHART_DRAG_STATE) return;

  const nearest = findNearestIndicatorSeriesPoint(pointer);
  if (!nearest) {
    tooltip.classList.add("hidden");
    return;
  }

  const unit = INDICATOR_CHART_RUNTIME?.unit || "";
  const suffix = unit && !["index", "manual", "none"].includes(unit) ? ` ${unit}` : "";
  tooltip.innerHTML = `
    <strong>${escapeHtml(formatChartTooltipDate(nearest.row.time))}</strong>
    <span>${escapeHtml(INDICATOR_CHART_RUNTIME?.indicatorName || "지표")}</span>
    <em>${escapeHtml(formatChartValue(nearest.row.value))}${escapeHtml(suffix)}</em>
  `;
  tooltip.classList.remove("hidden");

  const stageWidth = stage.clientWidth;
  const stageHeight = stage.clientHeight;
  const tooltipWidth = tooltip.offsetWidth || 180;
  const tooltipHeight = tooltip.offsetHeight || 78;
  const left = Math.max(8, Math.min(stageWidth - tooltipWidth - 8, nearest.x + 14));
  const top = Math.max(8, Math.min(stageHeight - tooltipHeight - 8, nearest.y - tooltipHeight - 12));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function cloneIndicatorDrawings(drawings) {
  return drawings.map(item => ({ ...item }));
}

function beginIndicatorDrawingDrag(canvas, event, indicatorId, pointer, target) {
  const drawings = cloneIndicatorDrawings(indicatorDrawingsFor(indicatorId));
  const drawing = drawings.find(item => item.id === target.drawing.id);
  if (!drawing) return;

  const originalDrawing = { ...drawing };
  INDICATOR_CHART_SELECTED_DRAWING_ID = drawing.id;
  INDICATOR_CHART_DRAG_STATE = {
    pointerId: event.pointerId,
    indicatorId,
    drawingId: drawing.id,
    type: target.type,
    handle: target.handle || null,
    drawings,
    originalDrawings: cloneIndicatorDrawings(drawings),
    originalDrawing,
    startPointer: { time: pointer.time, value: pointer.value },
    moved: false
  };

  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);
  canvas.style.cursor = "grabbing";
  hideIndicatorChartTooltip();

  const deleteButton = $("deleteIndicatorDrawing");
  if (deleteButton) deleteButton.disabled = false;

  const status = $("indicatorChartStatus");
  if (status) {
    if (target.type === "horizontal") {
      status.textContent = "수평선 전체를 위아래로 이동 중입니다.";
    } else if (target.handle === "start" || target.handle === "end") {
      status.textContent = "추세선 끝점을 이동해 길이와 기울기를 수정 중입니다.";
    } else {
      status.textContent = "추세선 전체를 이동 중입니다. 기울기와 길이는 유지됩니다.";
    }
  }

  renderIndicatorChartCanvas(APP_VIEW_DATA, APP_HISTORY_DATA, indicatorId);
}

function updateIndicatorDrawingDrag(point) {
  const drag = INDICATOR_CHART_DRAG_STATE;
  if (!drag || !INDICATOR_CHART_RUNTIME) return;

  const drawing = drag.drawings.find(item => item.id === drag.drawingId);
  if (!drawing) return;

  const original = drag.originalDrawing;
  const g = INDICATOR_CHART_RUNTIME.geometry;
  drag.moved = true;

  if (drag.type === "horizontal") {
    const deltaValue = point.value - drag.startPointer.value;
    drawing.value = Math.max(g.minValue, Math.min(g.maxValue, Number(original.value) + deltaValue));
    return;
  }

  if (drag.handle === "start") {
    drawing.x1 = point.time;
    drawing.y1 = point.value;
    return;
  }

  if (drag.handle === "end") {
    drawing.x2 = point.time;
    drawing.y2 = point.value;
    return;
  }

  const rawDeltaTime = point.time - drag.startPointer.time;
  const rawDeltaValue = point.value - drag.startPointer.value;

  const originalMinTime = Math.min(Number(original.x1), Number(original.x2));
  const originalMaxTime = Math.max(Number(original.x1), Number(original.x2));
  const minDeltaTime = g.minTime - originalMinTime;
  const maxDeltaTime = g.maxTime - originalMaxTime;
  const deltaTime = Math.max(minDeltaTime, Math.min(maxDeltaTime, rawDeltaTime));

  const originalMinValue = Math.min(Number(original.y1), Number(original.y2));
  const originalMaxValue = Math.max(Number(original.y1), Number(original.y2));
  const minDeltaValue = g.minValue - originalMinValue;
  const maxDeltaValue = g.maxValue - originalMaxValue;
  const deltaValue = Math.max(minDeltaValue, Math.min(maxDeltaValue, rawDeltaValue));

  drawing.x1 = Number(original.x1) + deltaTime;
  drawing.x2 = Number(original.x2) + deltaTime;
  drawing.y1 = Number(original.y1) + deltaValue;
  drawing.y2 = Number(original.y2) + deltaValue;
}

function finishIndicatorDrawingDrag(commit = true) {
  const drag = INDICATOR_CHART_DRAG_STATE;
  if (!drag) return;
  if (commit) writeIndicatorDrawingsFor(drag.indicatorId, drag.drawings);
  INDICATOR_CHART_DRAG_STATE = null;
  const canvas = $("indicatorChartCanvas");
  if (canvas) canvas.style.cursor = "default";
  const status = $("indicatorChartStatus");
  if (status) status.textContent = commit
    ? "작도 위치를 저장했습니다. 선 자체 또는 끝점을 다시 드래그해 계속 수정할 수 있습니다."
    : "작도 이동을 취소했습니다.";
  renderIndicatorChartCanvas(APP_VIEW_DATA, APP_HISTORY_DATA, drag.indicatorId);
}

function refreshIndicatorChart(data = APP_VIEW_DATA, history = APP_HISTORY_DATA) {
  INDICATOR_CHART_PENDING_POINT = null;
  INDICATOR_CHART_DRAG_STATE = null;
  renderIndicatorChartView(data, history);
}

function addIndicatorDrawing(indicatorId, drawing) {
  const drawings = indicatorDrawingsFor(indicatorId);
  drawings.push({ id: `drawing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...drawing });
  writeIndicatorDrawingsFor(indicatorId, drawings);
}

function currentIndicatorYRange(indicatorId) {
  const saved = readIndicatorChartRange(indicatorId);
  if (saved) return saved;
  const g = INDICATOR_CHART_RUNTIME?.indicatorId === indicatorId ? INDICATOR_CHART_RUNTIME.geometry : null;
  if (!g) return null;
  return { min: g.minValue, max: g.maxValue };
}

function adjustIndicatorYRange(indicatorId, factor) {
  const range = currentIndicatorYRange(indicatorId);
  if (!range) return;
  const center = (range.min + range.max) / 2;
  const currentSpan = range.max - range.min;
  const minimumSpan = Math.max(Math.abs(center) * 0.000001, 0.000001);
  const nextSpan = Math.max(minimumSpan, currentSpan * factor);
  writeIndicatorChartRange(indicatorId, {
    min: center - nextSpan / 2,
    max: center + nextSpan / 2
  });
}

function setupIndicatorChartHandlers(data, history, indicatorId) {
  const select = $("indicatorChartSelect");
  const canvas = $("indicatorChartCanvas");
  const state = readIndicatorChartState(data);

  if (select) {
    select.onchange = () => {
      INDICATOR_CHART_PENDING_POINT = null;
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      INDICATOR_CHART_DRAG_STATE = null;
      writeIndicatorChartState({ indicatorId: select.value, mode: state.mode });
      refreshIndicatorChart(data, history);
    };
  }

  document.querySelectorAll("[data-chart-mode]").forEach(button => {
    button.onclick = () => {
      const nextMode = button.dataset.chartMode;
      INDICATOR_CHART_PENDING_POINT = null;
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      INDICATOR_CHART_DRAG_STATE = null;
      writeIndicatorChartState({ indicatorId, mode: nextMode });
      refreshIndicatorChart(data, history);
    };
  });

  const applyYRange = $("applyIndicatorYRange");
  if (applyYRange) {
    applyYRange.onclick = () => {
      const min = Number($("indicatorYMin")?.value);
      const max = Number($("indicatorYMax")?.value);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
        alert("Y축 최소값과 최대값을 숫자로 입력하고, 최소값이 최대값보다 작게 설정하세요.");
        return;
      }
      writeIndicatorChartRange(indicatorId, { min, max });
      refreshIndicatorChart(data, history);
    };
  }

  const widenYRange = $("widenIndicatorYRange");
  if (widenYRange) {
    widenYRange.onclick = () => {
      adjustIndicatorYRange(indicatorId, 1.5);
      refreshIndicatorChart(data, history);
    };
  }

  const narrowYRange = $("narrowIndicatorYRange");
  if (narrowYRange) {
    narrowYRange.onclick = () => {
      adjustIndicatorYRange(indicatorId, 1 / 1.5);
      refreshIndicatorChart(data, history);
    };
  }

  const resetYRange = $("resetIndicatorYRange");
  if (resetYRange) {
    resetYRange.onclick = () => {
      writeIndicatorChartRange(indicatorId, null);
      refreshIndicatorChart(data, history);
    };
  }

  [$("indicatorYMin"), $("indicatorYMax")].filter(Boolean).forEach(input => {
    input.onkeydown = event => {
      if (event.key === "Enter") applyYRange?.click();
    };
  });

  const undo = $("undoIndicatorDrawing");
  if (undo) {
    undo.onclick = () => {
      const drawings = indicatorDrawingsFor(indicatorId);
      drawings.pop();
      writeIndicatorDrawingsFor(indicatorId, drawings);
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      refreshIndicatorChart(data, history);
    };
  }

  const deleteSelected = $("deleteIndicatorDrawing");
  if (deleteSelected) {
    deleteSelected.onclick = () => {
      if (!INDICATOR_CHART_SELECTED_DRAWING_ID) return;
      writeIndicatorDrawingsFor(
        indicatorId,
        indicatorDrawingsFor(indicatorId).filter(item => item.id !== INDICATOR_CHART_SELECTED_DRAWING_ID)
      );
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      refreshIndicatorChart(data, history);
    };
  }

  const clear = $("clearIndicatorDrawings");
  if (clear) {
    clear.onclick = () => {
      if (!confirm("이 지표의 작도를 모두 삭제할까요?")) return;
      writeIndicatorDrawingsFor(indicatorId, []);
      INDICATOR_CHART_PENDING_POINT = null;
      INDICATOR_CHART_SELECTED_DRAWING_ID = null;
      INDICATOR_CHART_DRAG_STATE = null;
      refreshIndicatorChart(data, history);
    };
  }

  if (canvas) {
    canvas.onpointerdown = event => {
      const point = chartPointFromPointer(canvas, event);
      if (!point) return;
      const currentState = readIndicatorChartState(data);
      hideIndicatorChartTooltip();

      if (currentState.mode === "select") {
        event.preventDefault();
      }

      if (currentState.mode === "horizontal") {
        addIndicatorDrawing(indicatorId, { type: "horizontal", value: point.value });
        refreshIndicatorChart(data, history);
        return;
      }

      if (currentState.mode === "trend") {
        if (!INDICATOR_CHART_PENDING_POINT) {
          INDICATOR_CHART_PENDING_POINT = { time: point.time, value: point.value };
          const status = $("indicatorChartStatus");
          if (status) status.textContent = "끝점을 선택하세요. Esc를 누르면 취소됩니다.";
          renderIndicatorChartCanvas(data, history, indicatorId, point);
        } else {
          addIndicatorDrawing(indicatorId, {
            type: "trend",
            x1: INDICATOR_CHART_PENDING_POINT.time,
            y1: INDICATOR_CHART_PENDING_POINT.value,
            x2: point.time,
            y2: point.value
          });
          INDICATOR_CHART_PENDING_POINT = null;
          refreshIndicatorChart(data, history);
        }
        return;
      }

      const handle = findNearestIndicatorDrawingHandle(point);
      if (handle) {
        beginIndicatorDrawingDrag(canvas, event, indicatorId, point, {
          drawing: handle.drawing,
          type: "trend",
          handle: handle.handle
        });
        return;
      }

      const nearest = findNearestIndicatorDrawing(point);
      INDICATOR_CHART_SELECTED_DRAWING_ID = nearest?.id || null;
      const deleteButton = $("deleteIndicatorDrawing");
      if (deleteButton) deleteButton.disabled = !INDICATOR_CHART_SELECTED_DRAWING_ID;

      if (nearest?.type === "horizontal") {
        beginIndicatorDrawingDrag(canvas, event, indicatorId, point, {
          drawing: nearest,
          type: "horizontal"
        });
        return;
      }

      if (nearest?.type === "trend") {
        beginIndicatorDrawingDrag(canvas, event, indicatorId, point, {
          drawing: nearest,
          type: "trend",
          handle: "body"
        });
        return;
      }

      renderIndicatorChartCanvas(data, history, indicatorId);
    };

    canvas.onpointermove = event => {
      const point = chartPointFromPointer(canvas, event);
      if (!point) return;

      if (INDICATOR_CHART_DRAG_STATE) {
        event.preventDefault();
        updateIndicatorDrawingDrag(point);
        renderIndicatorChartCanvas(data, history, indicatorId);
        return;
      }

      updateIndicatorChartTooltip(point);

      if (INDICATOR_CHART_PENDING_POINT) {
        canvas.style.cursor = "crosshair";
        renderIndicatorChartCanvas(data, history, indicatorId, point);
        return;
      }

      const currentState = readIndicatorChartState(data);
      if (currentState.mode !== "select") {
        canvas.style.cursor = "crosshair";
        return;
      }

      const handle = findNearestIndicatorDrawingHandle(point);
      const nearest = findNearestIndicatorDrawing(point);
      if (handle) {
        canvas.style.cursor = "move";
      } else if (nearest?.type === "horizontal") {
        canvas.style.cursor = "ns-resize";
      } else if (nearest?.type === "trend") {
        canvas.style.cursor = "grab";
      } else {
        canvas.style.cursor = "default";
      }
    };

    canvas.onpointerup = event => {
      if (!INDICATOR_CHART_DRAG_STATE || INDICATOR_CHART_DRAG_STATE.pointerId !== event.pointerId) return;
      canvas.releasePointerCapture?.(event.pointerId);
      finishIndicatorDrawingDrag(true);
    };

    canvas.onpointercancel = event => {
      if (!INDICATOR_CHART_DRAG_STATE || INDICATOR_CHART_DRAG_STATE.pointerId !== event.pointerId) return;
      finishIndicatorDrawingDrag(false);
    };

    canvas.onpointerleave = () => {
      hideIndicatorChartTooltip();
      if (INDICATOR_CHART_PENDING_POINT) {
        renderIndicatorChartCanvas(data, history, indicatorId, INDICATOR_CHART_PENDING_POINT);
      }
      if (!INDICATOR_CHART_DRAG_STATE) canvas.style.cursor = "default";
    };
  }

  if (!INDICATOR_CHART_RESIZE_BOUND) {
    INDICATOR_CHART_RESIZE_BOUND = true;
    window.addEventListener("resize", () => {
      const chartState = readIndicatorChartState(APP_VIEW_DATA);
      if ($("indicatorChartCanvas") && chartState.indicatorId) {
        renderIndicatorChartCanvas(APP_VIEW_DATA, APP_HISTORY_DATA, chartState.indicatorId);
      }
    });

    document.addEventListener("keydown", event => {
      if (!$("chartView")?.classList.contains("active")) return;
      if (event.key === "Escape") {
        if (INDICATOR_CHART_DRAG_STATE) finishIndicatorDrawingDrag(false);
        INDICATOR_CHART_PENDING_POINT = null;
        const chartState = readIndicatorChartState(APP_VIEW_DATA);
        renderIndicatorChartCanvas(APP_VIEW_DATA, APP_HISTORY_DATA, chartState.indicatorId);
      }
      if ((event.key === "Delete" || event.key === "Backspace") && INDICATOR_CHART_SELECTED_DRAWING_ID) {
        const activeElement = document.activeElement;
        if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) return;
        const chartState = readIndicatorChartState(APP_VIEW_DATA);
        writeIndicatorDrawingsFor(
          chartState.indicatorId,
          indicatorDrawingsFor(chartState.indicatorId).filter(item => item.id !== INDICATOR_CHART_SELECTED_DRAWING_ID)
        );
        INDICATOR_CHART_SELECTED_DRAWING_ID = null;
        refreshIndicatorChart(APP_VIEW_DATA, APP_HISTORY_DATA);
      }
    });
  }
}

function renderTodo(data) {
  const todo = data.todo || { items: [] };
  const visibleTodoItems = (todo.items || []).filter(item => !isAutomatedTodoItem(item));
  $("todoList").innerHTML = `
    ${renderChecklistPanel()}
    ${renderManualInputPanel(data)}
    ${renderWeeklyReviewPanel(data)}
    ${renderEconomicEventPanel()}
    ${renderWeeklyReportPanel(data)}
    ${renderPortfolioPanel()}
    ${renderBackupPanel()}
    <section class="todo-section">
      <h3>기본 점검 목록</h3>
      ${visibleTodoItems.map(item => `
        <article class="todo-item">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p class="muted">ID: ${escapeHtml(item.id)}</p>
          </div>
          ${item.required ? '<span class="required">필수</span>' : '<span class="muted">선택</span>'}
        </article>
      `).join("")}
    </section>
  `;
  setupChecklistHandlers();
  setupManualInputHandlers();
  setupWeeklyReviewHandlers();
  setupEconomicEventHandlers();
  setupWeeklyReportHandlers();
  setupPortfolioHandlers();
  setupBackupHandlers();
}

function renderAll(data) {
  renderMeta(data);
  renderOverview(data, APP_HISTORY_DATA);
  setupReviewCalendarHandlers();
  setupEconomicCalendarOverviewHandlers();
  renderAxes(data);
  renderTiming(data);
  renderMatrix(data);
  renderIndicators(data);
  renderIndicatorChartView(data, APP_HISTORY_DATA);
  renderTodo(data);
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = {
    overview: $("overviewView"),
    axes: $("axesView"),
    timing: $("timingView"),
    matrix: $("matrixView"),
    indicators: $("indicatorsView"),
    chart: $("chartView"),
    todo: $("todoView")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(item => item.classList.remove("active"));
      Object.values(views).filter(Boolean).forEach(view => view.classList.remove("active"));
      tab.classList.add("active");
      const nextView = views[tab.dataset.view];
      if (!nextView) return;
      nextView.classList.add("active");
      if (tab.dataset.view === "chart") {
        requestAnimationFrame(() => {
          const state = readIndicatorChartState(APP_VIEW_DATA);
          if (state.indicatorId) renderIndicatorChartCanvas(APP_VIEW_DATA, APP_HISTORY_DATA, state.indicatorId);
        });
      }
    });
  });
}


function injectChecklistCalendarStyles() {
  if (document.getElementById("checklist-calendar-style")) return;
  const style = document.createElement("style");
  style.id = "checklist-calendar-style";
  style.textContent = `
    .checklist-panel,
    .economic-event-panel {
      margin-bottom: 22px;
      padding: 18px;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.09), rgba(255, 255, 255, 0.035));
      border: 1px solid rgba(74, 222, 128, 0.20);
    }

    .checklist-group {
      margin-top: 14px;
      display: grid;
      gap: 8px;
    }

    .checklist-group h4,
    .economic-calendar-card h4 {
      margin: 10px 0 4px;
      color: rgba(255,255,255,0.88);
    }

    .checklist-row {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
    }

    .checklist-row.is-done {
      background: rgba(34, 197, 94, 0.11);
      border-color: rgba(74, 222, 128, 0.28);
    }

    .checklist-row input {
      width: 18px;
      height: 18px;
      accent-color: #22c55e;
    }

    .checklist-main strong {
      display: block;
      color: #ffffff;
      font-size: 0.92rem;
    }

    .checklist-main em,
    .checklist-date {
      color: rgba(255,255,255,0.66);
      font-size: 0.80rem;
      font-style: normal;
      font-weight: 800;
    }

    .checklist-note {
      margin: -4px 0 8px 30px;
      width: calc(100% - 30px);
      box-sizing: border-box;
    }

    .checklist-progress-bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255,255,255,0.10);
      margin-top: 12px;
    }

    .checklist-progress-bar span {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #22c55e, #86efac);
    }

    .economic-event-row,
    .economic-event-admin-row,
    .economic-event-mini {
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      margin-top: 8px;
    }

    .economic-event-admin-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
    }

    .economic-event-mini {
      display: grid;
      grid-template-columns: 86px 1fr;
      gap: 8px 10px;
      align-items: center;
    }

    .economic-event-mini span {
      color: rgba(255,255,255,0.62);
      font-weight: 850;
      font-size: 0.80rem;
    }

    .economic-event-mini strong,
    .economic-event-row strong,
    .economic-event-admin-row strong {
      color: #ffffff;
    }

    .economic-event-mini em {
      grid-column: 2;
      color: rgba(255,255,255,0.62);
      font-style: normal;
      font-size: 0.78rem;
      margin-top: -4px;
    }

    .economic-event-list {
      margin-top: 14px;
      display: grid;
      gap: 8px;
    }

    .full-calendar-card {
      grid-column: 1 / -1;
    }

    .calendar-topbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .calendar-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .calendar-actions button,
    .event-jump {
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 999px;
      padding: 7px 11px;
      background: rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
      font-weight: 850;
    }

    .calendar-month-label {
      margin: 14px 0 10px;
      font-size: 1.35rem;
      font-weight: 950;
      color: #ffffff;
    }

    .calendar-month-focus-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .calendar-month-focus-row .calendar-month-label {
      margin: 8px 0;
    }

    .calendar-month-focus-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: 100%;
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid rgba(250, 204, 21, 0.26);
      background: rgba(250, 204, 21, 0.10);
      color: #fef3c7;
    }

    .calendar-month-focus-title span {
      color: rgba(254, 243, 199, 0.72);
      font-size: 0.78rem;
      font-weight: 900;
      white-space: nowrap;
    }

    .calendar-month-focus-title strong {
      color: #ffffff;
      font-size: 0.92rem;
      font-weight: 950;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .calendar-month-focus-title.is-empty {
      border-color: rgba(255, 255, 255, 0.13);
      background: rgba(255, 255, 255, 0.055);
      color: rgba(255, 255, 255, 0.68);
    }

    .calendar-month-focus-title.is-empty strong {
      color: rgba(255, 255, 255, 0.60);
    }

    .calendar-month-focus-editor {
      display: grid;
      grid-template-columns: minmax(220px, 1fr) auto auto;
      gap: 8px;
      align-items: center;
      margin: 2px 0 12px;
    }

    .calendar-month-focus-editor input {
      min-width: 0;
    }

    .calendar-month-focus-editor button {
      border: 1px solid rgba(255,255,255,0.16);
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
      font-weight: 850;
    }

    .calendar-legend {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 10px;
      color: rgba(255,255,255,0.72);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .calendar-legend span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .calendar-weekdays,
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 7px;
    }

    .calendar-weekdays span {
      text-align: center;
      color: rgba(255,255,255,0.56);
      font-size: 0.76rem;
      font-weight: 900;
      padding: 4px 0;
    }

    .calendar-day {
      min-height: 92px;
      padding: 9px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.045);
      color: rgba(255,255,255,0.86);
      text-align: left;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 5px;
      transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease;
    }

    .calendar-day:hover {
      transform: translateY(-1px);
      border-color: rgba(96,165,250,0.45);
      background: rgba(59,130,246,0.10);
    }

    .calendar-day.is-out-month {
      opacity: 0.34;
    }

    .calendar-day.is-today {
      border-color: rgba(74,222,128,0.50);
      box-shadow: 0 0 0 1px rgba(74,222,128,0.18) inset;
    }

    .calendar-day.is-selected {
      background: rgba(96,165,250,0.18);
      border-color: rgba(147,197,253,0.70);
    }

    .calendar-day-number {
      font-weight: 950;
      font-size: 0.95rem;
      color: #ffffff;
    }

    .calendar-dots {
      min-height: 10px;
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      display: inline-block;
      border-radius: 50%;
    }

    .event-dot { background: #60a5fa; }
    .checklist-dot { background: #22c55e; }
    .review-dot { background: #f59e0b; }

    .calendar-day-mini {
      display: inline-block;
      width: fit-content;
      max-width: 100%;
      border-radius: 999px;
      padding: 2px 7px;
      background: rgba(96,165,250,0.14);
      color: rgba(219,234,254,0.98);
      font-size: 0.70rem;
      font-weight: 900;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .calendar-day-mini.review-mini {
      background: rgba(245,158,11,0.16);
      color: #fde68a;
    }

    .calendar-detail-box {
      margin-top: 14px;
      padding: 14px;
      border-radius: 18px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.13);
    }

    .calendar-detail-header {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .calendar-detail-header strong {
      color: #ffffff;
      font-size: 1.05rem;
    }

    .calendar-detail-header span {
      color: rgba(255,255,255,0.62);
      font-weight: 850;
      font-size: 0.82rem;
    }

    .calendar-detail-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .calendar-checklist-row {
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(74,222,128,0.18);
      margin-top: 8px;
    }

    .calendar-checklist-row strong {
      display: block;
      color: #ffffff;
    }

    .calendar-checklist-row span {
      color: rgba(255,255,255,0.60);
      font-size: 0.78rem;
      font-weight: 850;
    }

    .event-jump {
      width: 100%;
      display: grid;
      grid-template-columns: 86px 1fr;
      border-radius: 14px;
      text-align: left;
      background: rgba(255,255,255,0.06);
    }

    @media (max-width: 920px) {
      .calendar-month-focus-editor {
        grid-template-columns: 1fr;
      }

      .calendar-detail-grid {
        grid-template-columns: 1fr;
      }
      .calendar-day {
        min-height: 78px;
      }
    }

    @media (max-width: 720px) {
      .checklist-row,
      .economic-event-admin-row,
      .economic-event-mini {
        grid-template-columns: 1fr;
      }
      .checklist-date,
      .portfolio-row-actions {
        justify-self: start;
      }
      .checklist-note {
        margin-left: 0;
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

async function init() {
  setupTabs();
  injectCurrentValueStyles();
  injectBackupStyles();
  injectChecklistCalendarStyles();
  injectWeeklyReportStyles();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (!data.schemaVersion || !Array.isArray(data.indicators)) {
      throw new Error("latest.json v1 스키마가 아닙니다. schemaVersion과 indicators를 확인하세요.");
    }

    try {
      const historyResponse = await fetch(HISTORY_URL);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        APP_HISTORY_DATA = historyData && Array.isArray(historyData.snapshots) ? historyData : null;
      } else {
        APP_HISTORY_DATA = null;
      }
    } catch (historyError) {
      console.warn("history.json load failed", historyError);
      APP_HISTORY_DATA = null;
    }

    APP_RAW_DATA = data;
    APP_VIEW_DATA = applyManualOverrides(APP_RAW_DATA);
    renderAll(APP_VIEW_DATA);
  } catch (error) {
    $("dataWarning").textContent = `데이터 로딩 실패: ${error.message}`;
    $("dataWarning").classList.remove("hidden");
    console.error(error);
  }
}

init();
