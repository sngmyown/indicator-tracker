const DATA_URL = `data/latest.json?ts=${Date.now()}`;

const updatedAtEl = document.getElementById("updatedAt");
const staleWarningEl = document.getElementById("staleWarning");
const riskModeEl = document.getElementById("riskMode");
const positiveAxesEl = document.getElementById("positiveAxes");
const neutralAxesEl = document.getElementById("neutralAxes");
const negativeAxesEl = document.getElementById("negativeAxes");
const axesGridEl = document.getElementById("axesGrid");
const todoTitleEl = document.getElementById("todoTitle");
const todoListEl = document.getElementById("todoList");
const refreshButtonEl = document.getElementById("refreshButton");

refreshButtonEl.addEventListener("click", () => {
  window.location.reload();
});

loadDashboard();

async function loadDashboard() {
  try {
    const response = await fetch(DATA_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("data/latest.json 파일을 불러오지 못했습니다.");
    }

    const data = await response.json();

    renderFreshness(data);
    renderSummary(data.marketSummary || {});
    renderAxes(data.axes || []);
    renderTodo(data.todo || { title: "To do list", items: [] });
  } catch (error) {
    updatedAtEl.textContent = "데이터 로딩 실패";
    staleWarningEl.textContent = error.message;
    staleWarningEl.classList.remove("hidden");
  }
}

function renderFreshness(data) {
  const updatedAt = new Date(data.updatedAt);

  if (Number.isNaN(updatedAt.getTime())) {
    updatedAtEl.textContent = "업데이트 시각 없음";
    staleWarningEl.classList.remove("hidden");
    return;
  }

  updatedAtEl.textContent = formatDateTime(updatedAt);

  const now = new Date();
  const diffHours = Math.abs(now - updatedAt) / 1000 / 60 / 60;

  if (diffHours > 48) {
    staleWarningEl.classList.remove("hidden");
  } else {
    staleWarningEl.classList.add("hidden");
  }
}

function renderSummary(summary) {
  riskModeEl.textContent = summary.riskMode || "-";
  positiveAxesEl.textContent = summary.positiveAxes ?? "-";
  neutralAxesEl.textContent = summary.neutralAxes ?? "-";
  negativeAxesEl.textContent = summary.negativeAxes ?? "-";
}

function renderAxes(axes) {
  axesGridEl.innerHTML = "";

  axes.forEach((axis) => {
    const card = document.createElement("article");
    card.className = `axis-card ${axis.status || "neutral"}`;

    const indicators = Array.isArray(axis.indicators) ? axis.indicators : [];
    const indicatorsHtml = indicators.length
      ? indicators.map(createIndicatorHtml).join("")
      : `<p class="empty">아직 등록된 지표가 없습니다.</p>`;

    card.innerHTML = `
      <div class="axis-header">
        <h3>${escapeHtml(axis.name || axis.id || "Unknown")}</h3>
        <span class="status">${escapeHtml(axis.status || "neutral")}</span>
      </div>
      <p class="axis-summary">${escapeHtml(axis.summary || "")}</p>
      <div class="indicators">
        ${indicatorsHtml}
      </div>
    `;

    axesGridEl.appendChild(card);
  });
}

function createIndicatorHtml(indicator) {
  return `
    <div class="indicator">
      <div class="indicator-top">
        <strong>${escapeHtml(indicator.name || "-")}</strong>
        <span>${escapeHtml(indicator.signal || "-")}</span>
      </div>
      <dl>
        <div>
          <dt>예상치 확인</dt>
          <dd>${indicator.expectedChecked ? "확인" : "미확인 / 해당 없음"}</dd>
        </div>
        <div>
          <dt>이전치</dt>
          <dd>${formatValue(indicator.previous)}</dd>
        </div>
        <div>
          <dt>실제치</dt>
          <dd>${formatValue(indicator.actual)}</dd>
        </div>
        <div>
          <dt>실제치 날짜</dt>
          <dd>${formatValue(indicator.actualDate)}</dd>
        </div>
        <div>
          <dt>시장 반응</dt>
          <dd>${escapeHtml(indicator.marketReaction || "-")}</dd>
        </div>
      </dl>
      <p class="interpretation">${escapeHtml(indicator.interpretation || "-")}</p>
      <p class="source">Source: ${escapeHtml(indicator.source || "manual")}</p>
    </div>
  `;
}

function renderTodo(todo) {
  todoTitleEl.textContent = todo.title || "금요일 / 토요일 To do list";
  todoListEl.innerHTML = "";

  (todo.items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    todoListEl.appendChild(li);
  });
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return Number(value).toLocaleString("ko-KR");
  }

  return escapeHtml(String(value));
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
