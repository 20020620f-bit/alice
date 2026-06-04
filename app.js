const STORAGE_KEY = "qing-ledger-state-v2";
const IS_PREVIEW_MODE = new URLSearchParams(window.location.search).has("preview");
const SWIPE_DELETE_WIDTH = 76;
let activeSwipeGesture = null;

const DEFAULT_CATEGORIES = {
  expense: [
    { id: "food", label: "食品餐饮", icon: "food", color: "#e45d4f", tint: "#f8dfd9" },
    { id: "daily", label: "日用百货", icon: "grocery", color: "#0b8068", tint: "#d8eee7" },
    { id: "bills", label: "生活缴费", icon: "bill", color: "#0b8068", tint: "#d8eee7" },
    { id: "health", label: "医疗健康", icon: "medkit", color: "#cc3f6d", tint: "#f8dce6" },
    { id: "traffic", label: "交通出行", icon: "train", color: "#3d56a3", tint: "#dfe5fb" },
    { id: "housing", label: "住房房租", icon: "home", color: "#1d6f8f", tint: "#dbeef5" },
    { id: "shopping", label: "购物消费", icon: "bag", color: "#b37416", tint: "#f5ead6" },
    { id: "phone-net", label: "通讯网络", icon: "phone", color: "#3d56a3", tint: "#dfe5fb" },
    { id: "education", label: "学习教育", icon: "book", color: "#3d56a3", tint: "#dfe5fb" },
    { id: "fitness", label: "运动健身", icon: "dumbbell", color: "#2e7d5b", tint: "#dcefe6" },
    { id: "fun", label: "娱乐休闲", icon: "game", color: "#8b56a3", tint: "#eadff2" },
    { id: "travel", label: "旅行出游", icon: "plane", color: "#4d7897", tint: "#dcecf5" },
    { id: "gift-expense", label: "人情礼金", icon: "gift", color: "#cc3f6d", tint: "#f8dce6" },
    { id: "childcare", label: "育儿家庭", icon: "baby", color: "#c39122", tint: "#f7edcc" },
    { id: "insurance", label: "保险保障", icon: "shield", color: "#0b8068", tint: "#d8eee7" },
    { id: "other-expense", label: "其他支出", icon: "dots", color: "#667067", tint: "#e9eee3" }
  ],
  income: [
    { id: "salary", label: "工资收入", icon: "briefcase", color: "#0b8068", tint: "#d8eee7" },
    { id: "part-time", label: "兼职副业", icon: "clock", color: "#4d7897", tint: "#dcecf5" },
    { id: "bonus", label: "奖金福利", icon: "spark", color: "#c39122", tint: "#f7edcc" },
    { id: "investment", label: "投资理财", icon: "trend", color: "#2e7d5b", tint: "#dcefe6" },
    { id: "reimburse", label: "报销收入", icon: "receipt", color: "#3d56a3", tint: "#dfe5fb" },
    { id: "gift", label: "红包礼金", icon: "gift", color: "#cc3f6d", tint: "#f8dce6" },
    { id: "refund", label: "退款返现", icon: "refund", color: "#b37416", tint: "#f5ead6" },
    { id: "other-income", label: "其他收入", icon: "wallet", color: "#667067", tint: "#e9eee3" }
  ]
};

const ICON_LIBRARY = [
  { id: "food", label: "餐饮", color: "#e45d4f", tint: "#f8dfd9" },
  { id: "coffee", label: "咖啡", color: "#875f3f", tint: "#efe3d7" },
  { id: "train", label: "交通", color: "#3d56a3", tint: "#dfe5fb" },
  { id: "car", label: "打车", color: "#4d7897", tint: "#dcecf5" },
  { id: "bag", label: "购物", color: "#b37416", tint: "#f5ead6" },
  { id: "grocery", label: "超市", color: "#0b8068", tint: "#d8eee7" },
  { id: "home", label: "住房", color: "#1d6f8f", tint: "#dbeef5" },
  { id: "bill", label: "账单", color: "#0b8068", tint: "#d8eee7" },
  { id: "medkit", label: "健康", color: "#cc3f6d", tint: "#f8dce6" },
  { id: "dumbbell", label: "运动", color: "#2e7d5b", tint: "#dcefe6" },
  { id: "game", label: "娱乐", color: "#8b56a3", tint: "#eadff2" },
  { id: "book", label: "学习", color: "#3d56a3", tint: "#dfe5fb" },
  { id: "plane", label: "旅行", color: "#4d7897", tint: "#dcecf5" },
  { id: "gift", label: "礼物", color: "#cc3f6d", tint: "#f8dce6" },
  { id: "baby", label: "育儿", color: "#c39122", tint: "#f7edcc" },
  { id: "briefcase", label: "工作", color: "#0b8068", tint: "#d8eee7" },
  { id: "spark", label: "奖金", color: "#c39122", tint: "#f7edcc" },
  { id: "clock", label: "兼职", color: "#4d7897", tint: "#dcecf5" },
  { id: "trend", label: "投资", color: "#2e7d5b", tint: "#dcefe6" },
  { id: "receipt", label: "报销", color: "#3d56a3", tint: "#dfe5fb" },
  { id: "refund", label: "退款", color: "#b37416", tint: "#f5ead6" },
  { id: "wallet", label: "收入", color: "#667067", tint: "#e9eee3" },
  { id: "heart", label: "心愿", color: "#cc3f6d", tint: "#f8dce6" },
  { id: "phone", label: "通讯", color: "#3d56a3", tint: "#dfe5fb" },
  { id: "shield", label: "保险", color: "#0b8068", tint: "#d8eee7" },
  { id: "dots", label: "其他", color: "#667067", tint: "#e9eee3" }
];

const LEGACY_DEFAULT_CATEGORY_IDS = new Set(["coffee", "taxi", "grocery"]);

const COMPOSER_GROUPS = {
  expense: [
    { id: "shopping", label: "购物", categories: ["shopping", "daily", "gift-expense", "childcare", "fitness", "other-expense"] },
    { id: "food", label: "吃喝", categories: ["food"] },
    { id: "traffic", label: "交通", categories: ["traffic", "travel"] },
    { id: "fun", label: "娱乐", categories: ["fun", "education"] },
    { id: "life", label: "生活", categories: ["bills", "health", "housing", "phone-net", "insurance"] }
  ],
  income: [
    { id: "income", label: "收入", categories: ["salary", "part-time", "bonus", "investment", "reimburse", "gift", "refund", "other-income"] }
  ]
};

const elements = {
  monthTitle: document.querySelector("#monthTitle"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  netBalance: document.querySelector("#netBalance"),
  savingRing: document.querySelector("#savingRing"),
  savingRate: document.querySelector("#savingRate"),
  incomeTotal: document.querySelector("#incomeTotal"),
  expenseTotal: document.querySelector("#expenseTotal"),
  budgetLeft: document.querySelector("#budgetLeft"),
  budgetRange: document.querySelector("#budgetRange"),
  budgetInput: document.querySelector("#budgetInput"),
  budgetText: document.querySelector("#budgetText"),
  budgetState: document.querySelector("#budgetState"),
  budgetProgress: document.querySelector("#budgetProgress"),
  topCategories: document.querySelector("#topCategories"),
  recentList: document.querySelector("#recentList"),
  ledgerList: document.querySelector("#ledgerList"),
  ledgerFilter: document.querySelector("#ledgerFilter"),
  searchInput: document.querySelector("#searchInput"),
  categoryChart: document.querySelector("#categoryChart"),
  chartTotal: document.querySelector("#chartTotal"),
  trendBars: document.querySelector("#trendBars"),
  breakdownList: document.querySelector("#breakdownList"),
  composerSheet: document.querySelector("#composerSheet"),
  entryForm: document.querySelector("#entryForm"),
  composerTitle: document.querySelector("#composerTitle"),
  amountInput: document.querySelector("#amountInput"),
  dateInput: document.querySelector("#dateInput"),
  noteInput: document.querySelector("#noteInput"),
  noteTrigger: document.querySelector("#noteTrigger"),
  notePreview: document.querySelector("#notePreview"),
  noteDialog: document.querySelector("#noteDialog"),
  noteTextarea: document.querySelector("#noteTextarea"),
  confirmNote: document.querySelector("#confirmNote"),
  openNoteHistory: document.querySelector("#openNoteHistory"),
  noteHistoryDialog: document.querySelector("#noteHistoryDialog"),
  noteHistoryList: document.querySelector("#noteHistoryList"),
  clearNoteHistory: document.querySelector("#clearNoteHistory"),
  confirmNoteHistory: document.querySelector("#confirmNoteHistory"),
  dateDialog: document.querySelector("#dateDialog"),
  dateDialogTitle: document.querySelector("#dateDialogTitle"),
  dateGrid: document.querySelector("#dateGrid"),
  datePrevMonth: document.querySelector("#datePrevMonth"),
  dateNextMonth: document.querySelector("#dateNextMonth"),
  dateUseToday: document.querySelector("#dateUseToday"),
  confirmDate: document.querySelector("#confirmDate"),
  composerCategoryTabs: document.querySelector("#composerCategoryTabs"),
  categoryPicker: document.querySelector("#categoryPicker"),
  composerKeypad: document.querySelector("#composerKeypad"),
  openCategoryManager: document.querySelector("#openCategoryManager"),
  categorySheet: document.querySelector("#categorySheet"),
  categoryTypeControl: document.querySelector("#categoryTypeControl"),
  categoryEditorList: document.querySelector("#categoryEditorList"),
  categoryNameInput: document.querySelector("#categoryNameInput"),
  iconGrid: document.querySelector("#iconGrid"),
  addCategory: document.querySelector("#addCategory"),
  saveCategory: document.querySelector("#saveCategory"),
  resetForm: document.querySelector("#resetForm"),
  openComposer: document.querySelector("#openComposer"),
  toast: document.querySelector("#toast")
};

const money = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0
});

let activeMonth = firstDayOfMonth(new Date());
let activeView = "overview";
let ledgerFilter = "all";
let entryType = "expense";
let selectedCategory = DEFAULT_CATEGORIES.expense[0].id;
let composerGroup = COMPOSER_GROUPS.expense[0].id;
let managerType = "expense";
let managerCategoryId = DEFAULT_CATEGORIES.expense[0].id;
let editingEntryId = null;
let toastTimer = null;
let dateViewMonth = firstDayOfMonth(new Date());
let state = loadState();

function pad(value) {
  return String(value).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayISO() {
  return toISODate(new Date());
}

function currentClockTime() {
  const date = new Date();
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function firstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function relativeDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toISODate(date);
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneCategories() {
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}

function normalizeCategory(category, fallback) {
  return {
    id: category.id || fallback.id || createId(),
    label: category.label || fallback.label || "未命名",
    icon: category.icon || fallback.icon || "dots",
    color: category.color || fallback.color || "#667067",
    tint: category.tint || fallback.tint || "#e9eee3",
    group: category.group || fallback.group || null,
    custom: Boolean(category.custom || fallback.custom),
    customLabel: Boolean(category.customLabel || fallback.customLabel)
  };
}

function normalizeCategories(savedCategories, entries = []) {
  const normalized = cloneCategories();
  const usedCategoryIds = new Set(entries.map((entry) => entry.categoryId));

  ["expense", "income"].forEach((type) => {
    const savedList = Array.isArray(savedCategories?.[type]) ? savedCategories[type] : [];
    const savedById = new Map(savedList.map((category) => [category.id, category]));
    const defaultIds = new Set(normalized[type].map((category) => category.id));

    normalized[type] = normalized[type].map((category) => {
      const saved = savedById.get(category.id);
      if (!saved) return normalizeCategory(category, category);
      const label = saved.customLabel ? saved.label : category.label;
      return normalizeCategory({ ...saved, label }, category);
    });

    savedList.forEach((category) => {
      const isOldDefault = LEGACY_DEFAULT_CATEGORY_IDS.has(category.id) && !category.custom;
      if (!defaultIds.has(category.id) && (!isOldDefault || usedCategoryIds.has(category.id))) {
        normalized[type].push(normalizeCategory(category, { custom: true }));
      }
    });
  });

  return normalized;
}

function normalizeNoteHistory(savedHistory, entries = []) {
  const source = Array.isArray(savedHistory) ? savedHistory : entries.map((entry) => entry.note);
  const seen = new Set();
  return source
    .map((note) => String(note || "").trim())
    .filter((note) => {
      if (!note || seen.has(note)) return false;
      seen.add(note);
      return true;
    })
    .slice(0, 30);
}

function defaultState() {
  return {
    budget: 6800,
    categories: cloneCategories(),
    entries: [],
    noteHistory: []
  };
}

function previewState() {
  return {
    budget: 6800,
    categories: cloneCategories(),
    noteHistory: ["早餐", "通勤", "日用品"],
    entries: [
      {
        id: "preview-1",
        type: "expense",
        categoryId: "daily",
        amount: 78,
        date: todayISO(),
        time: "17:08",
        note: "购物"
      },
      {
        id: "preview-2",
        type: "expense",
        categoryId: "shopping",
        amount: 88,
        date: todayISO(),
        time: "17:06",
        note: "购物"
      },
      {
        id: "preview-3",
        type: "expense",
        categoryId: "traffic",
        amount: 42,
        date: relativeDate(1),
        time: "08:22",
        note: "通勤"
      },
      {
        id: "preview-4",
        type: "expense",
        categoryId: "food",
        amount: 166,
        date: relativeDate(2),
        time: "19:12",
        note: "晚餐"
      },
      {
        id: "preview-5",
        type: "income",
        categoryId: "salary",
        amount: 3200,
        date: relativeDate(3),
        time: "09:30",
        note: "工资"
      }
    ]
  };
}

function loadState() {
  if (IS_PREVIEW_MODE) {
    return previewState();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.entries)) {
      return {
        budget: Number(saved.budget) || 6800,
        categories: normalizeCategories(saved.categories, saved.entries),
        entries: saved.entries,
        noteHistory: normalizeNoteHistory(saved.noteHistory, saved.entries)
      };
    }
  } catch (error) {
    console.warn("Unable to load saved ledger", error);
  }
  const initialState = defaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
}

function saveState() {
  if (IS_PREVIEW_MODE) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return money.format(Math.round(value));
}

function formatSignedMoney(value, type = "expense") {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatMoney(Math.abs(value))}`;
}

function getCategoryList(type) {
  return state.categories?.[type] || DEFAULT_CATEGORIES[type] || [];
}

function getComposerGroups(type = entryType) {
  return COMPOSER_GROUPS[type] || COMPOSER_GROUPS.expense;
}

function defaultComposerGroup(type = entryType) {
  return getComposerGroups(type)[0]?.id;
}

function findComposerGroupForCategory(type, categoryId) {
  const groups = getComposerGroups(type);
  const list = getCategoryList(type);
  const category = list.find((item) => item.id === categoryId);
  if (category?.group && groups.some((group) => group.id === category.group)) {
    return category.group;
  }
  return groups.find((group) => group.categories.includes(categoryId))?.id || defaultComposerGroup(type);
}

function getComposerGroupLabel(type, categoryId) {
  const groupId = findComposerGroupForCategory(type, categoryId);
  return getComposerGroups(type).find((group) => group.id === groupId)?.label || (type === "income" ? "收入" : "支出");
}

function visibleComposerCategories() {
  const list = getCategoryList(entryType);
  const groups = getComposerGroups(entryType);
  const activeGroup = groups.find((group) => group.id === composerGroup) || groups[0];
  if (!activeGroup) return list;

  const mappedIds = new Set(groups.flatMap((group) => group.categories));
  const fallbackGroupId = groups[groups.length - 1]?.id;
  return list.filter((category) => {
    if (category.group) {
      return category.group === activeGroup.id;
    }
    if (activeGroup.categories.includes(category.id)) {
      return true;
    }
    return !mappedIds.has(category.id) && activeGroup.id === fallbackGroupId;
  });
}

function getDefaultCategory(type, categoryId) {
  return DEFAULT_CATEGORIES[type]?.find((category) => category.id === categoryId);
}

function allCategories() {
  return [...getCategoryList("expense"), ...getCategoryList("income")];
}

function getCategory(entryOrId) {
  const categoryId = typeof entryOrId === "string" ? entryOrId : entryOrId.categoryId;
  return allCategories().find((category) => category.id === categoryId) || getCategoryList("expense")[0] || DEFAULT_CATEGORIES.expense[0];
}

function iconMarkup(category) {
  return `
    <span class="category-icon" style="--category-color: ${category.color}; --category-bg: ${category.tint}">
      <svg><use href="#icon-${category.icon}"></use></svg>
    </span>
  `;
}

function monthlyEntries() {
  const key = monthKey(activeMonth);
  return state.entries
    .filter((entry) => entry.date.slice(0, 7) === key)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function sumEntries(entries, type) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((total, entry) => total + Number(entry.amount), 0);
}

function groupedExpenses(entries) {
  const groups = new Map();
  entries
    .filter((entry) => entry.type === "expense")
    .forEach((entry) => {
      const current = groups.get(entry.categoryId) || 0;
      groups.set(entry.categoryId, current + Number(entry.amount));
    });

  return [...groups.entries()]
    .map(([categoryId, total]) => ({ category: getCategory(categoryId), total }))
    .sort((a, b) => b.total - a.total);
}

function updateMonthTitle() {
  elements.monthTitle.textContent = activeMonth.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long"
  });
}

function renderSummary(entries) {
  const income = sumEntries(entries, "income");
  const expense = sumEntries(entries, "expense");
  const budgetLeft = state.budget - expense;
  const budgetUsage = state.budget > 0 ? Math.min(999, Math.round((expense / state.budget) * 100)) : 0;

  elements.netBalance.textContent = formatMoney(expense);
  elements.incomeTotal.textContent = formatMoney(income);
  elements.expenseTotal.textContent = formatMoney(expense);
  elements.budgetLeft.textContent = formatMoney(budgetLeft);
  elements.savingRate.textContent = state.budget > 0 ? `预算 ${budgetUsage}%` : "未设预算";
  elements.savingRing.style.setProperty("--ring", `${Math.min(100, budgetUsage) * 3.6}deg`);
  elements.budgetText.textContent = formatMoney(state.budget);
  elements.budgetInput.value = state.budget;
  elements.budgetRange.value = Math.min(Math.max(state.budget, 1000), 30000);
  elements.budgetProgress.textContent = `${budgetUsage}% 已用`;

  if (budgetUsage >= 100) {
    elements.budgetState.textContent = "超出";
  } else if (budgetUsage >= 80) {
    elements.budgetState.textContent = "偏高";
  } else {
    elements.budgetState.textContent = "稳定";
  }
}

function renderTopCategories(entries) {
  const groups = groupedExpenses(entries).slice(0, 3);
  const fallback = getCategoryList("expense").slice(0, 3).map((category) => ({ category, total: 0 }));
  const rows = groups.length ? groups : fallback;

  elements.topCategories.innerHTML = rows
    .map(({ category, total }) => `
      <button class="category-pill" data-quick-category="${category.id}" type="button">
        ${iconMarkup(category)}
        <span>${escapeHTML(category.label)}</span>
        <strong>${formatMoney(total)}</strong>
      </button>
    `)
    .join("");
}

function renderTransactionList(container, entries, options = {}) {
  const { compact = false } = options;

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">这个月份还没有流水</div>`;
    return;
  }

  container.innerHTML = entries
    .map((entry) => {
      const category = getCategory(entry);
      const sign = entry.type === "income" ? "+" : "-";
      const amountClass = entry.type === "income" ? "income" : "";
      const note = entry.note ? escapeHTML(entry.note) : "未填写备注";
      const actions = compact
        ? ""
        : `
          <div class="transaction-actions">
            <button class="mini-button" type="button" data-edit-entry="${entry.id}" aria-label="编辑">
              <svg><use href="#icon-edit"></use></svg>
            </button>
            <button class="mini-button" type="button" data-delete-entry="${entry.id}" aria-label="删除">
              <svg><use href="#icon-trash"></use></svg>
            </button>
          </div>
        `;

      return `
        <article class="transaction-card">
          ${iconMarkup(category)}
          <div class="transaction-main">
            <div class="transaction-title">
              <strong>${escapeHTML(category.label)}</strong>
              <span>${escapeHTML(entry.date.slice(5).replace("-", "/"))}</span>
            </div>
            <div class="transaction-note">${note}</div>
          </div>
          <div class="transaction-amount">
            <strong class="${amountClass}">${sign}${formatMoney(entry.amount)}</strong>
            ${actions}
          </div>
        </article>
      `;
    })
    .join("");
}

function formatDisplayDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${dateText.replaceAll("-", "/")} ${weekdays[date.getDay()]}`;
}

function renderDailyTransactions(container, entries) {
  if (!entries.length) {
    container.innerHTML = `<div class="empty-state dashboard-empty">这个月份还没有流水</div>`;
    return;
  }

  const groups = new Map();
  entries.slice(0, 12).forEach((entry) => {
    if (!groups.has(entry.date)) {
      groups.set(entry.date, []);
    }
    groups.get(entry.date).push(entry);
  });

  container.innerHTML = [...groups.entries()]
    .map(([date, rows]) => {
      const dailyExpense = sumEntries(rows, "expense");
      const dailyIncome = sumEntries(rows, "income");
      const dailyNet = dailyIncome - dailyExpense;
      const totalClass = dailyNet > 0 ? "income" : dailyNet < 0 ? "expense" : "";
      const totalText = dailyNet === 0 ? formatMoney(0) : formatSignedMoney(Math.abs(dailyNet), dailyNet > 0 ? "income" : "expense");
      const rowsMarkup = rows
        .map((entry) => {
          const category = getCategory(entry);
          const amountText = formatSignedMoney(entry.amount, entry.type);
          const groupLabel = getComposerGroupLabel(entry.type, entry.categoryId);
          const meta = [entry.note || groupLabel, entry.time || entry.date.slice(5).replace("-", "/")].filter(Boolean).join(" ");
          return `
            <div class="expense-swipe" data-swipe-entry="${entry.id}">
              <button class="expense-delete-action" type="button" data-delete-entry="${entry.id}" aria-label="\u5220\u9664">\u5220\u9664</button>
              <article class="expense-card expense-swipe-card">
                ${iconMarkup(category)}
                <div class="expense-card-main">
                  <strong>${escapeHTML(category.label)}</strong>
                  <span>${escapeHTML(meta)}</span>
                </div>
                <strong class="expense-card-amount ${entry.type === "income" ? "income" : ""}">${amountText}</strong>
              </article>
            </div>
          `;
        })
        .join("");

      return `
        <section class="expense-day-group">
          <header class="expense-day-head">
            <strong>${escapeHTML(date)}</strong>
            <span class="${totalClass}">${totalText}</span>
          </header>
          <div class="expense-day-body">${rowsMarkup}</div>
        </section>
      `;
    })
    .join("");
}

function setSwipeOffset(item, offset) {
  item.style.setProperty("--swipe-offset", `${offset}px`);
}

function closeSwipeItem(item) {
  if (!item) return;
  item.classList.remove("open", "dragging");
  item.style.removeProperty("--swipe-offset");
}

function openSwipeItem(item) {
  if (!item) return;
  item.classList.remove("dragging");
  item.classList.add("open");
  item.style.removeProperty("--swipe-offset");
}

function closeOtherSwipeItems(exceptItem = null) {
  elements.recentList.querySelectorAll(".expense-swipe.open, .expense-swipe.dragging").forEach((item) => {
    if (item !== exceptItem) {
      closeSwipeItem(item);
    }
  });
}

function beginSwipeGesture(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const item = event.target.closest(".expense-swipe");
  if (!item || event.target.closest("[data-delete-entry]")) return;

  closeOtherSwipeItems(item);
  activeSwipeGesture = {
    item,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startOffset: item.classList.contains("open") ? -SWIPE_DELETE_WIDTH : 0,
    offset: item.classList.contains("open") ? -SWIPE_DELETE_WIDTH : 0,
    dragging: false
  };
}

function updateSwipeGesture(event) {
  if (!activeSwipeGesture || activeSwipeGesture.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - activeSwipeGesture.startX;
  const deltaY = event.clientY - activeSwipeGesture.startY;

  if (!activeSwipeGesture.dragging) {
    if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      activeSwipeGesture = null;
      return;
    }
    if (Math.abs(deltaX) < 8) return;
    activeSwipeGesture.dragging = true;
    activeSwipeGesture.item.classList.add("dragging");
  }

  const offset = Math.max(-SWIPE_DELETE_WIDTH, Math.min(0, activeSwipeGesture.startOffset + deltaX));
  activeSwipeGesture.offset = offset;
  setSwipeOffset(activeSwipeGesture.item, offset);
  event.preventDefault();
}

function endSwipeGesture(event) {
  if (!activeSwipeGesture || activeSwipeGesture.pointerId !== event.pointerId) return;

  const { item, dragging, offset } = activeSwipeGesture;
  if (dragging && offset <= -SWIPE_DELETE_WIDTH * 0.45) {
    openSwipeItem(item);
  } else if (dragging) {
    closeSwipeItem(item);
  }
  activeSwipeGesture = null;
}

function filteredLedgerEntries(entries) {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  return entries.filter((entry) => {
    const category = getCategory(entry);
    const matchesType = ledgerFilter === "all" || entry.type === ledgerFilter;
    const haystack = `${category.label} ${entry.note || ""} ${entry.amount}`.toLowerCase();
    return matchesType && (!keyword || haystack.includes(keyword));
  });
}

function renderLists(entries) {
  renderDailyTransactions(elements.recentList, entries);
  renderTransactionList(elements.ledgerList, filteredLedgerEntries(entries));
}

function renderTrend(entries) {
  const monthEnd = monthKey(new Date()) === monthKey(activeMonth) ? new Date() : endOfMonth(activeMonth);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monthEnd);
    date.setDate(monthEnd.getDate() - (6 - index));
    return date;
  });

  const values = days.map((date) => {
    const iso = toISODate(date);
    const total = entries
      .filter((entry) => entry.type === "expense" && entry.date === iso)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
    return { date, total };
  });
  const max = Math.max(...values.map((row) => row.total), 1);

  elements.trendBars.innerHTML = values
    .map((row) => {
      const height = Math.max(6, Math.round((row.total / max) * 100));
      return `
        <div class="trend-bar" title="${formatMoney(row.total)}">
          <div class="bar-track"><div class="bar-fill" style="height: ${height}%"></div></div>
          <span>${row.date.getMonth() + 1}/${row.date.getDate()}</span>
        </div>
      `;
    })
    .join("");
}

function drawCategoryChart(entries) {
  const canvas = elements.categoryChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 320;
  const height = 220;
  const dpr = window.devicePixelRatio || 1;
  const groups = groupedExpenses(entries);
  const total = groups.reduce((sum, row) => sum + row.total, 0);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  elements.chartTotal.textContent = formatMoney(total);

  const centerX = width / 2;
  const centerY = 104;
  const radius = Math.min(78, width * 0.27);
  ctx.lineWidth = 24;
  ctx.lineCap = "round";

  if (!total) {
    ctx.strokeStyle = "#dce2d6";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    let angle = -Math.PI / 2;
    groups.forEach(({ category, total: value }) => {
      const slice = (value / total) * Math.PI * 2;
      ctx.strokeStyle = category.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + slice - 0.03);
      ctx.stroke();
      angle += slice;
    });
  }

  ctx.fillStyle = "#17211d";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
  ctx.fillText(formatMoney(total), centerX, centerY - 6);
  ctx.fillStyle = "#667067";
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI'";
  ctx.fillText("本月支出", centerX, centerY + 20);
}

function renderBreakdown(entries) {
  const groups = groupedExpenses(entries);
  const total = groups.reduce((sum, row) => sum + row.total, 0);

  if (!groups.length) {
    elements.breakdownList.innerHTML = `<div class="empty-state">暂无支出分类</div>`;
    return;
  }

  elements.breakdownList.innerHTML = groups
    .map(({ category, total: value }) => {
      const percent = total > 0 ? Math.round((value / total) * 100) : 0;
      return `
        <div class="breakdown-row">
          ${iconMarkup(category)}
          <div class="breakdown-main">
            <strong>${escapeHTML(category.label)} · ${percent}%</strong>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%; background: ${category.color}"></div>
            </div>
          </div>
          <strong>${formatMoney(value)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderInsights(entries) {
  renderTrend(entries);
  drawCategoryChart(entries);
  renderBreakdown(entries);
}

function renderCategoryPicker() {
  renderComposerCategoryTabs();
  let list = visibleComposerCategories();
  if (!list.length) {
    composerGroup = defaultComposerGroup(entryType);
    list = visibleComposerCategories();
  }
  if (!list.some((category) => category.id === selectedCategory)) {
    selectedCategory = list[0]?.id;
  }

  elements.categoryPicker.innerHTML = list
    .map((category) => `
      <button class="category-option ${category.id === selectedCategory ? "active" : ""}" type="button" data-category="${category.id}">
        ${iconMarkup(category)}
        <span>${escapeHTML(category.label)}</span>
      </button>
    `)
    .join("");
}

function renderComposerCategoryTabs() {
  const groups = getComposerGroups(entryType);
  if (!groups.some((group) => group.id === composerGroup)) {
    composerGroup = defaultComposerGroup(entryType);
  }
  elements.composerCategoryTabs.innerHTML = groups
    .map((group) => `
      <button class="${group.id === composerGroup ? "active" : ""}" type="button" data-composer-group="${group.id}">
        ${escapeHTML(group.label)}
      </button>
    `)
    .join("");
}

function getManagerCategory() {
  const list = getCategoryList(managerType);
  return list.find((category) => category.id === managerCategoryId) || list[0];
}

function renderCategoryManager() {
  const list = getCategoryList(managerType);
  if (!list.length) return;

  if (!list.some((category) => category.id === managerCategoryId)) {
    managerCategoryId = list[0].id;
  }

  const category = getManagerCategory();
  elements.categoryTypeControl.querySelectorAll("[data-manager-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.managerType === managerType);
  });

  elements.categoryEditorList.innerHTML = list
    .map((item) => `
      <button class="category-editor-item ${item.id === category.id ? "active" : ""}" type="button" data-manager-category="${item.id}">
        ${iconMarkup(item)}
        <span>${escapeHTML(item.label)}</span>
      </button>
    `)
    .join("");

  elements.categoryNameInput.value = category.label;
  elements.iconGrid.innerHTML = ICON_LIBRARY
    .map((icon) => `
      <button
        class="icon-option ${icon.id === category.icon ? "active" : ""}"
        type="button"
        data-icon="${icon.id}"
        aria-label="${escapeHTML(icon.label)}"
        title="${escapeHTML(icon.label)}"
        style="--category-color: ${icon.color}; --category-bg: ${icon.tint}"
      >
        <svg><use href="#icon-${icon.id}"></use></svg>
      </button>
    `)
    .join("");
}

function openCategoryManager() {
  managerType = entryType;
  const list = getCategoryList(managerType);
  managerCategoryId = list.some((category) => category.id === selectedCategory)
    ? selectedCategory
    : list[0]?.id;
  renderCategoryManager();
  elements.categorySheet.classList.add("open");
  elements.categorySheet.setAttribute("aria-hidden", "false");
  window.setTimeout(() => elements.categoryNameInput.focus(), 120);
}

function commitCategoryName(showMessage = false) {
  const category = getManagerCategory();
  const nextName = elements.categoryNameInput.value.trim();
  if (!category) return false;

  if (!nextName) {
    elements.categoryNameInput.value = category.label;
    showToast("分类名称不能为空");
    return false;
  }

  const defaultCategory = getDefaultCategory(managerType, category.id);
  category.label = nextName;
  category.customLabel = defaultCategory ? nextName !== defaultCategory.label : true;
  saveState();
  renderCategoryPicker();
  render();
  renderCategoryManager();
  if (showMessage) {
    showToast("分类已保存");
  }
  return true;
}

function closeCategoryManager() {
  if (elements.categorySheet.classList.contains("open")) {
    commitCategoryName(false);
  }
  elements.categorySheet.classList.remove("open");
  elements.categorySheet.setAttribute("aria-hidden", "true");
}

function setManagerType(type) {
  commitCategoryName(false);
  managerType = type;
  managerCategoryId = getCategoryList(type)[0]?.id;
  renderCategoryManager();
}

function setManagerCategory(categoryId) {
  commitCategoryName(false);
  managerCategoryId = categoryId;
  renderCategoryManager();
}

function setManagerIcon(iconId) {
  commitCategoryName(false);
  const category = getManagerCategory();
  const icon = ICON_LIBRARY.find((item) => item.id === iconId);
  if (!category || !icon) return;

  category.icon = icon.id;
  category.color = icon.color;
  category.tint = icon.tint;
  saveState();
  renderCategoryManager();
  renderCategoryPicker();
  render();
}

function addCustomCategory() {
  commitCategoryName(false);
  const icon = ICON_LIBRARY.find((item) => item.id === (managerType === "income" ? "wallet" : "dots")) || ICON_LIBRARY[0];
  const category = {
    id: `custom-${managerType}-${Date.now()}`,
    label: managerType === "income" ? "新收入" : "新支出",
    icon: icon.id,
    color: icon.color,
    tint: icon.tint,
    group: managerType === entryType ? composerGroup : defaultComposerGroup(managerType),
    custom: true
  };

  state.categories[managerType].push(category);
  managerCategoryId = category.id;
  if (managerType === entryType) {
    selectedCategory = category.id;
  }
  saveState();
  renderCategoryManager();
  renderCategoryPicker();
  render();
  window.setTimeout(() => elements.categoryNameInput.select(), 60);
}

function setEntryType(type) {
  entryType = type;
  document.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.entryType === type);
  });
  const list = getCategoryList(type);
  composerGroup = defaultComposerGroup(type);
  selectedCategory = visibleComposerCategories()[0]?.id || list[0]?.id;
  renderCategoryPicker();
}

function setComposerGroup(groupId) {
  composerGroup = groupId;
  selectedCategory = visibleComposerCategories()[0]?.id || getCategoryList(entryType)[0]?.id;
  renderCategoryPicker();
}

function openComposer(options = {}) {
  const { type = "expense", categoryId = null, entry = null } = options;
  editingEntryId = entry ? entry.id : null;
  elements.composerTitle.textContent = entry ? "编辑流水" : "记一笔";
  entryType = entry ? entry.type : type;
  document.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.entryType === entryType);
  });
  selectedCategory = entry ? entry.categoryId : categoryId;
  composerGroup = selectedCategory ? findComposerGroupForCategory(entryType, selectedCategory) : defaultComposerGroup(entryType);
  if (!selectedCategory) {
    selectedCategory = visibleComposerCategories()[0]?.id || getCategoryList(entryType)[0]?.id;
  }
  renderCategoryPicker();

  elements.amountInput.value = entry ? entry.amount : "";
  elements.dateInput.value = entry ? entry.date : todayISO();
  elements.noteInput.value = entry ? entry.note || "" : "";
  renderNotePreview();
  elements.composerSheet.classList.add("open");
  elements.composerSheet.setAttribute("aria-hidden", "false");
}

function closeComposer() {
  elements.composerSheet.classList.remove("open");
  elements.composerSheet.setAttribute("aria-hidden", "true");
  editingEntryId = null;
}

function resetForm() {
  elements.amountInput.value = "";
  elements.noteInput.value = "";
  elements.dateInput.value = todayISO();
  renderNotePreview();
  selectedCategory = visibleComposerCategories()[0]?.id || getCategoryList(entryType)[0]?.id;
  renderCategoryPicker();
}

function renderNotePreview() {
  const note = elements.noteInput.value.trim();
  elements.notePreview.textContent = note || "可选";
  elements.notePreview.classList.toggle("has-note", Boolean(note));
}

function openNoteDialog() {
  elements.noteTextarea.value = elements.noteInput.value;
  elements.noteDialog.classList.add("open");
  elements.noteDialog.setAttribute("aria-hidden", "false");
  window.setTimeout(() => elements.noteTextarea.focus(), 80);
}

function closeNoteDialog() {
  elements.noteDialog.classList.remove("open");
  elements.noteDialog.setAttribute("aria-hidden", "true");
}

function confirmNote() {
  elements.noteInput.value = elements.noteTextarea.value.trim();
  renderNotePreview();
  closeNoteDialog();
}

function noteHistoryItems() {
  return normalizeNoteHistory(state.noteHistory, []);
}

function rememberNote(note) {
  const trimmed = String(note || "").trim();
  if (!trimmed) return;
  state.noteHistory = normalizeNoteHistory([trimmed, ...noteHistoryItems()], []);
}

function renderNoteHistory() {
  const notes = noteHistoryItems();
  if (!notes.length) {
    elements.noteHistoryList.innerHTML = `<div class="empty-state note-history-empty">暂无历史备注</div>`;
    return;
  }

  elements.noteHistoryList.innerHTML = notes
    .map((note) => `
      <button type="button" data-note-history="${escapeHTML(note)}">
        ${escapeHTML(note)}
      </button>
    `)
    .join("");
}

function openNoteHistoryDialog() {
  closeNoteDialog();
  renderNoteHistory();
  elements.noteHistoryDialog.classList.add("open");
  elements.noteHistoryDialog.setAttribute("aria-hidden", "false");
}

function closeNoteHistoryDialog() {
  elements.noteHistoryDialog.classList.remove("open");
  elements.noteHistoryDialog.setAttribute("aria-hidden", "true");
}

function clearNoteHistory() {
  state.noteHistory = [];
  saveState();
  renderNoteHistory();
}

function setNoteFromHistory(note) {
  elements.noteInput.value = note;
  renderNotePreview();
  closeNoteHistoryDialog();
}

function formatDateLabel(dateText) {
  if (!dateText) return "今天";
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "今天";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function parseISODate(dateText) {
  const date = new Date(`${dateText || todayISO()}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function openDatePicker() {
  elements.dateInput.value = elements.dateInput.value || todayISO();
  dateViewMonth = firstDayOfMonth(parseISODate(elements.dateInput.value));
  renderDateDialog();
  elements.dateDialog.classList.add("open");
  elements.dateDialog.setAttribute("aria-hidden", "false");
}

function closeDateDialog() {
  elements.dateDialog.classList.remove("open");
  elements.dateDialog.setAttribute("aria-hidden", "true");
}

function renderDateDialog() {
  const selected = elements.dateInput.value || todayISO();
  const today = todayISO();
  const year = dateViewMonth.getFullYear();
  const month = dateViewMonth.getMonth();
  const first = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: first.getDay() }, () => `<span class="date-blank"></span>`);
  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const dateText = toISODate(new Date(year, month, day));
    const classes = [
      dateText === selected ? "active" : "",
      dateText === today ? "today" : ""
    ]
      .filter(Boolean)
      .join(" ");
    return `<button class="${classes}" type="button" data-date="${dateText}">${day}</button>`;
  });

  elements.dateDialogTitle.textContent = `${year}年${month + 1}月`;
  elements.dateGrid.innerHTML = [...blanks, ...days].join("");
}

function setComposerDate(dateText) {
  elements.dateInput.value = dateText;
  dateViewMonth = firstDayOfMonth(parseISODate(dateText));
  renderDateDialog();
}

function shiftDateMonth(offset) {
  dateViewMonth = new Date(dateViewMonth.getFullYear(), dateViewMonth.getMonth() + offset, 1);
  renderDateDialog();
}

function confirmDateSelection() {
  closeDateDialog();
  showToast(`日期：${formatDateLabel(elements.dateInput.value || todayISO())}`);
}

function appendAmountToken(token) {
  const current = elements.amountInput.value;
  const raw = token === "00" ? "00" : token;
  if (raw === ".") {
    elements.amountInput.value = current.includes(".") ? current : `${current || "0"}.`;
    return;
  }

  const [integerPart, decimalPart = ""] = current.split(".");
  if (current.includes(".") && decimalPart.length >= 2) return;
  if (!current || current === "0") {
    elements.amountInput.value = raw === "00" ? "0" : raw;
    return;
  }
  if (!current.includes(".") && integerPart.length >= 7) return;
  elements.amountInput.value = `${current}${raw}`;
}

function handleKeypadAction(action) {
  if (/^\d$/.test(action) || action === "00") {
    appendAmountToken(action);
    return;
  }
  if (action === ".") {
    appendAmountToken(action);
    return;
  }
  if (action === "back") {
    elements.amountInput.value = elements.amountInput.value.slice(0, -1);
    return;
  }
  if (action === "clear") {
    resetForm();
    return;
  }
  if (action === "today") {
    openDatePicker();
    return;
  }
  if (action === "save") {
    elements.entryForm.requestSubmit();
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 1800);
}

function handleSubmit(event) {
  event.preventDefault();
  const amount = Number(elements.amountInput.value);
  const date = elements.dateInput.value || todayISO();
  elements.dateInput.value = date;

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("请输入有效金额");
    return;
  }

  const existingEntry = editingEntryId ? state.entries.find((item) => item.id === editingEntryId) : null;
  const entry = {
    id: editingEntryId || createId(),
    type: entryType,
    categoryId: selectedCategory,
    amount: Math.round(amount * 100) / 100,
    date,
    time: existingEntry?.time || currentClockTime(),
    note: elements.noteInput.value.trim()
  };
  const wasEditing = Boolean(editingEntryId);

  if (editingEntryId) {
    state.entries = state.entries.map((item) => (item.id === editingEntryId ? entry : item));
  } else {
    state.entries = [entry, ...state.entries];
    activeMonth = firstDayOfMonth(new Date(`${date}T00:00:00`));
  }

  rememberNote(entry.note);
  saveState();
  closeComposer();
  render();
  showToast(wasEditing ? "已更新" : "已保存");
}

function setActiveView(view) {
  activeView = view;
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  if (view === "insights") {
    window.requestAnimationFrame(() => renderInsights(monthlyEntries()));
  }
}

function deleteEntry(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry) return;
  const category = getCategory(entry);
  const confirmed = window.confirm(`删除「${category.label}」这笔流水？`);
  if (!confirmed) return;

  state.entries = state.entries.filter((item) => item.id !== entryId);
  saveState();
  render();
  showToast("已删除");
}

function editEntry(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (entry) {
    openComposer({ entry });
  }
}

function render() {
  const entries = monthlyEntries();
  updateMonthTitle();
  renderSummary(entries);
  renderTopCategories(entries);
  renderLists(entries);
  renderInsights(entries);
}

function bindEvents() {
  elements.prevMonth.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1);
    render();
  });

  elements.nextMonth.addEventListener("click", () => {
    activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);
    render();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });

  document.querySelectorAll("[data-jump-view]").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.jumpView));
  });

  elements.openComposer.addEventListener("click", () => openComposer());
  elements.entryForm.addEventListener("submit", handleSubmit);
  elements.resetForm.addEventListener("click", resetForm);
  elements.openCategoryManager.addEventListener("click", openCategoryManager);
  elements.composerCategoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-composer-group]");
    if (!button) return;
    setComposerGroup(button.dataset.composerGroup);
  });
  elements.composerKeypad.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    handleKeypadAction(button.dataset.key);
  });
  elements.noteTrigger.addEventListener("click", openNoteDialog);
  elements.confirmNote.addEventListener("click", confirmNote);
  elements.openNoteHistory.addEventListener("click", openNoteHistoryDialog);
  elements.clearNoteHistory.addEventListener("click", clearNoteHistory);
  elements.confirmNoteHistory.addEventListener("click", closeNoteHistoryDialog);
  elements.noteHistoryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-note-history]");
    if (!button) return;
    setNoteFromHistory(button.dataset.noteHistory);
  });
  elements.datePrevMonth.addEventListener("click", () => shiftDateMonth(-1));
  elements.dateNextMonth.addEventListener("click", () => shiftDateMonth(1));
  elements.dateUseToday.addEventListener("click", () => setComposerDate(todayISO()));
  elements.confirmDate.addEventListener("click", confirmDateSelection);
  elements.dateGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) return;
    setComposerDate(button.dataset.date);
  });

  document.querySelectorAll("[data-close-note-dialog]").forEach((control) => {
    control.addEventListener("click", closeNoteDialog);
  });

  document.querySelectorAll("[data-close-note-history]").forEach((control) => {
    control.addEventListener("click", closeNoteHistoryDialog);
  });

  document.querySelectorAll("[data-close-date-dialog]").forEach((control) => {
    control.addEventListener("click", closeDateDialog);
  });

  document.querySelectorAll("[data-close-sheet]").forEach((control) => {
    control.addEventListener("click", closeComposer);
  });

  document.querySelectorAll("[data-close-category-sheet]").forEach((control) => {
    control.addEventListener("click", closeCategoryManager);
  });

  document.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.addEventListener("click", () => setEntryType(button.dataset.entryType));
  });

  elements.categoryTypeControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-manager-type]");
    if (!button) return;
    setManagerType(button.dataset.managerType);
  });

  elements.categoryEditorList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-manager-category]");
    if (!button) return;
    setManagerCategory(button.dataset.managerCategory);
  });

  elements.iconGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-icon]");
    if (!button) return;
    setManagerIcon(button.dataset.icon);
  });

  elements.addCategory.addEventListener("click", addCustomCategory);
  elements.saveCategory.addEventListener("click", () => {
    if (commitCategoryName(true)) {
      closeCategoryManager();
    }
  });

  elements.categoryPicker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    renderCategoryPicker();
  });

  elements.topCategories.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-category]");
    if (!button) return;
    openComposer({ type: "expense", categoryId: button.dataset.quickCategory });
  });

  elements.recentList.addEventListener("pointerdown", beginSwipeGesture);
  window.addEventListener("pointermove", updateSwipeGesture);
  window.addEventListener("pointerup", endSwipeGesture);
  window.addEventListener("pointercancel", endSwipeGesture);

  elements.ledgerFilter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    ledgerFilter = button.dataset.filter;
    elements.ledgerFilter.querySelectorAll("button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    renderLists(monthlyEntries());
  });

  elements.searchInput.addEventListener("input", () => renderLists(monthlyEntries()));

  elements.budgetRange.addEventListener("input", () => {
    state.budget = Number(elements.budgetRange.value);
    saveState();
    renderSummary(monthlyEntries());
  });

  elements.budgetInput.addEventListener("change", () => {
    const next = Number(elements.budgetInput.value);
    if (Number.isFinite(next) && next >= 0) {
      state.budget = Math.round(next);
      saveState();
      renderSummary(monthlyEntries());
    }
  });

  document.body.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-entry]");
    const deleteButton = event.target.closest("[data-delete-entry]");

    if (deleteButton) {
      deleteEntry(deleteButton.dataset.deleteEntry);
      return;
    }

    const openSwipeItemElement = event.target.closest(".expense-swipe.open");
    if (openSwipeItemElement) {
      closeSwipeItem(openSwipeItemElement);
      return;
    }

    if (editButton) {
      editEntry(editButton.dataset.editEntry);
    }
  });

  window.addEventListener("resize", () => {
    if (activeView === "insights") {
      drawCategoryChart(monthlyEntries());
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.dateDialog.classList.contains("open")) {
      closeDateDialog();
      return;
    }
    if (event.key === "Escape" && elements.noteHistoryDialog.classList.contains("open")) {
      closeNoteHistoryDialog();
      return;
    }
    if (event.key === "Escape" && elements.noteDialog.classList.contains("open")) {
      closeNoteDialog();
      return;
    }
    if (event.key === "Escape" && elements.categorySheet.classList.contains("open")) {
      closeCategoryManager();
      return;
    }
    if (event.key === "Escape" && elements.composerSheet.classList.contains("open")) {
      closeComposer();
    }
  });
}

function registerServiceWorker() {
  const canRegister =
    "serviceWorker" in navigator &&
    (location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1");

  if (!canRegister) return;

  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Service worker registration failed", error);
  });
}

function applyLayoutTunerCss(cssText) {
  if (!IS_PREVIEW_MODE || typeof cssText !== "string") return;
  let style = document.querySelector("#layout-tuner-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "layout-tuner-style";
    document.head.appendChild(style);
  }
  style.textContent = cssText;
}

if (IS_PREVIEW_MODE) {
  window.addEventListener("message", (event) => {
    if (event.data?.type !== "qing-layout-tuner-css") return;
    applyLayoutTunerCss(event.data.css);
    window.parent?.postMessage({ type: "qing-layout-tuner-applied" }, "*");
  });
}

bindEvents();
renderCategoryPicker();
render();
if (IS_PREVIEW_MODE) {
  window.parent?.postMessage({ type: "qing-layout-preview-ready" }, "*");
}
registerServiceWorker();
