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

  $("summaryGrid").innerHTML = `
    <article class="card">
      <h3>현재 시장 국면</h3>
      <div class="metric-value">${escapeHtml(m.marketConditionLabel || "확인 필요")}</div>
      ${badge(m.riskMode || "neutral", m.riskMode || "balanced")}
    </article>
    <article class="card">
      <h3>8축 판정</h3>
      <div class="metric-value">+${m.positiveAxes ?? 0} / 0${m.neutralAxes ?? 0} / -${m.negativeAxes ?? 0}</div>
      <p class="muted">긍정 / 중립 / 부정 축 개수</p>
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
      <h3>액션 바이어스</h3>
      <div class="metric-value">${escapeHtml(m.actionBias || "확인 필요")}</div>
      <p class="muted">현금 가이드: ${escapeHtml(m.cashRatioGuide || "확인 필요")}</p>
    </article>
  `;

  $("marketNarrative").textContent = m.summary || "시장 요약이 없습니다.";
  $("conflictNarrative").textContent = m.conflictSummary || "축 간 충돌 요약이 없습니다.";
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
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    list.querySelectorAll(".indicator-card").forEach(card => {
      card.classList.toggle("hidden", query && !card.dataset.search.includes(query));
    });
  });
}

function renderTodo(data) {
  const todo = data.todo || { items: [] };
  $("todoList").innerHTML = todo.items.map(item => `
    <article class="todo-item">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p class="muted">ID: ${escapeHtml(item.id)}</p>
      </div>
      ${item.required ? '<span class="required">필수</span>' : '<span class="muted">선택</span>'}
    </article>
  `).join("");
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

    renderMeta(data);
    renderOverview(data);
    renderAxes(data);
    renderTiming(data);
    renderMatrix(data);
    renderIndicators(data);
    renderTodo(data);
  } catch (error) {
    $("dataWarning").textContent = `데이터 로딩 실패: ${error.message}`;
    $("dataWarning").classList.remove("hidden");
    console.error(error);
  }
}

init();
