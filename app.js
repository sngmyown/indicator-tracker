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

function formatValue(value, unit = "") {
  if (value === null || value === undefined || value === "") return "-";
  const suffix = unit && !["index", "manual", "none"].includes(unit) ? ` ${unit}` : "";
  return `${escapeHtml(value)}${suffix}`;
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
              <span>${escapeHtml(item.timingLabel)} · 현재값 ${formatValue(item.currentValue, item.unit)} · ${escapeHtml(item.statusNote)}</span>
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
        <div class="field"><small>현재값</small><strong>${formatValue(item.currentValue, item.unit)}</strong></div>
        <div class="field"><small>이전값</small><strong>${formatValue(item.previousValue, item.unit)}</strong></div>
        <div class="field"><small>변화</small><strong>${formatValue(item.change, item.unit)} / ${formatValue(item.changePercent, "%")}</strong></div>
        <div class="field"><small>출처</small><strong>${escapeHtml(item.source)} · ${escapeHtml(item.sourceSeries)}</strong></div>
      </div>
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
