const DATA_URL = `data/latest.json?ts=${Date.now()}`;

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

const MANUAL_REQUIRED_IDS = [
  "eps_beat_rate",
  "revenue_beat_rate",
  "m7_guidance_change",
  "consensus_revision",
  "ism_manufacturing_pmi",
  "pricing_power_mentions",
  "vix_futures_structure",
  "fear_greed_index",
  "credit_card_delinquency"
];

const MANUAL_SIGNAL_OPTIONS = [
  { value: "positive", label: "긍정" },
  { value: "neutral", label: "중립" },
  { value: "negative", label: "부정" },
  { value: "warning", label: "경고" }
];

let APP_RAW_DATA = null;
let APP_VIEW_DATA = null;


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

      .manual-form-grid {
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

function renderOverview(data) {
  const m = data.marketSummary || {};
  const t = data.timingSummary || {};
  const live = computeLiveAxisScore(data);

  $("summaryGrid").innerHTML = `
    ${renderLiveAxisScoreCard(live)}
    ${renderScenarioActionPlan(data, live)}
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

function isManualTarget(item) {
  if (!item) return false;
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

function renderTodo(data) {
  const todo = data.todo || { items: [] };
  $("todoList").innerHTML = `
    ${renderManualInputPanel(data)}
    <section class="todo-section">
      <h3>기본 점검 목록</h3>
      ${todo.items.map(item => `
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
  setupManualInputHandlers();
}

function renderAll(data) {
  renderMeta(data);
  renderOverview(data);
  renderAxes(data);
  renderTiming(data);
  renderMatrix(data);
  renderIndicators(data);
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
    todo: $("todoView")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(item => item.classList.remove("active"));
      Object.values(views).forEach(view => view.classList.remove("active"));
      tab.classList.add("active");
      views[tab.dataset.view].classList.add("active");
    });
  });
}

async function init() {
  setupTabs();
  injectCurrentValueStyles();

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (!data.schemaVersion || !Array.isArray(data.indicators)) {
      throw new Error("latest.json v1 스키마가 아닙니다. schemaVersion과 indicators를 확인하세요.");
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
