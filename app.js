const RARE_RATE = 0.1;

const SITE_URL = "https://vending.chipshokai.com";
const SOCIAL = {
  official: "https://chipshokai.com",
  x: "https://x.com/chip_shokai",
  note: "https://note.com/chip_shokai"
};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);
const machineView = $("#machine-view");
const resultView = $("#result-view");
const machineWrap = $("#machine-wrap");
const clerkWrap = $("#clerk-wrap");
const clerkSpeech = $("#clerk-speech");
const categoryButtons = $("#category-buttons");
const coin = $("#coin");
const impactText = $("#onomatopoeia");
const canFlight = $("#can-flight");
const shareOverlay = $("#share-overlay");
const toast = $("#toast");

let data;
let currentPrompt;
let currentCategory;
let isRare = false;
let busy = false;
let toastTimer;
let previousByCategory = new Map();
let typingTimer;
let lastFocus;

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, reducedMotion ? Math.min(ms, 90) : ms));
}
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}
function renderCategories() {
  categoryButtons.replaceChildren();
  data.categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.dataset.category = category.id;
    button.setAttribute("aria-label", category.label + "のプロンプトを買う");
    button.innerHTML = '<span class="icon" aria-hidden="true"></span><span class="label"></span>';
    button.querySelector(".icon").textContent = category.icon;
    button.querySelector(".label").textContent = category.label;
    button.addEventListener("click", () => purchase(category, button));
    categoryButtons.append(button);
  });
}
function promptFor(category) {
  const options = data.prompts.filter(item => item.category === category.id);
  const lastId = previousByCategory.get(category.id);
  const available = options.filter(item => item.id !== lastId);
  return randomItem(available.length ? available : options);
}
function setBusy(value, selectedButton) {
  busy = value;
  categoryButtons.querySelectorAll("button").forEach(button => {
    button.disabled = value;
    button.classList.toggle("selected", value && button === selectedButton);
  });
}
function setSpeech(text) {
  clerkSpeech.textContent = text;
}
function clearEffects() {
  document.body.classList.remove("is-rare", "flash", "fast-rays");
  machineWrap.classList.remove("roulette", "winner", "shake");
  machineView.classList.remove("shake");
  clerkWrap.classList.remove("jump");
  impactText.classList.remove("pop");
  canFlight.classList.remove("fly");
  coin.classList.remove("insert");
}
async function purchase(category, button) {
  if (busy) return;
  setBusy(true, button);
  clearEffects();
  currentCategory = category;
  isRare = Math.random() < RARE_RATE;
  currentPrompt = isRare ? randomItem(data.rare) : promptFor(category);
  if (!isRare) previousByCategory.set(category.id, currentPrompt.id);

  coin.classList.add("insert");
  await wait(300);
  machineWrap.classList.add("shake");
  await wait(800);
  machineWrap.classList.remove("shake");

  if (isRare) {
    document.body.classList.add("is-rare", "flash");
    machineWrap.classList.add("roulette");
    setSpeech("当たりだ！ もう1本……じゃなくて、すごいやつ出た！");
    await wait(620);
    machineWrap.classList.remove("roulette");
    machineWrap.classList.add("winner");
    if (!reducedMotion && typeof window.confetti === "function") {
      window.confetti({ particleCount: 130, spread: 105, origin: { y: 0.45 }, colors: ["#ffd928", "#fff", "#ef4238", "#50c878"] });
      window.confetti({ particleCount: 65, angle: 60, spread: 65, origin: { x: 0, y: 0.65 } });
      window.confetti({ particleCount: 65, angle: 120, spread: 65, origin: { x: 1, y: 0.65 } });
    }
    await wait(260);
  }

  machineView.classList.add("shake");
  impactText.textContent = "ガコン！";
  impactText.classList.add("pop");
  document.body.classList.add("fast-rays");
  clerkWrap.classList.add("jump");
  setSpeech(isRare ? "当たりだ！ もう1本……じゃなくて、すごいやつ出た！" : "はいどうぞ！");
  await wait(410);
  document.body.classList.remove("fast-rays");
  canFlight.classList.add("fly");
  impactText.textContent = "プシュッ！";
  impactText.classList.remove("pop");
  void impactText.offsetWidth;
  impactText.classList.add("pop");
  await wait(650);

  machineView.hidden = true;
  resultView.hidden = false;
  document.body.classList.remove("flash");
  renderResult();
  setBusy(false);
}
function renderHighlighted(text) {
  const fragment = document.createDocumentFragment();
  const parts = text.split(/(【[^】]*】)/g);
  parts.forEach(part => {
    if (part.startsWith("【") && part.endsWith("】")) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      fragment.append(mark);
    } else {
      fragment.append(document.createTextNode(part));
    }
  });
  return fragment;
}
function renderResult() {
  $("#result-category").textContent = isRare ? "スペシャル" : currentCategory.label;
  $("#result-title").textContent = currentPrompt.title;
  $("#rare-badge").hidden = !isRare;
  $("#prompt-body").replaceChildren(renderHighlighted(currentPrompt.body));
  $("#result-tip").textContent = "💡 " + currentPrompt.tip;
  $("#result-card").classList.toggle("result-rare", isRare);
  typePrompt();
  resultView.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}
function typePrompt() {
  window.clearInterval(typingTimer);
  const body = $("#prompt-body");
  const fullText = currentPrompt.body;
  const fragment = renderHighlighted(fullText);
  body.replaceChildren();
  // Markers remain highlighted after typing; text itself comes unchanged from prompts.json.
  const wrapper = document.createElement("span");
  body.append(wrapper);
  let index = 0;
  const step = Math.max(2, Math.floor(fullText.length / 100));
  typingTimer = window.setInterval(() => {
    index = Math.min(index + step, fullText.length);
    wrapper.textContent = fullText.slice(0, index);
    if (index >= fullText.length) {
      window.clearInterval(typingTimer);
      body.replaceChildren(fragment);
    }
  }, reducedMotion ? 1 : 12);
  body.addEventListener("click", reveal, { once: true });
  function reveal() {
    window.clearInterval(typingTimer);
    body.replaceChildren(renderHighlighted(fullText));
  }
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    if (!ok) throw new Error("copy failed");
  }
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}
function shareText(platform) {
  const rareLine = isRare ? "★レア引いた！\n" : "";
  const handle = platform === "threads" ? "" : " @chip_shokai";
  return `プロンプト自販機で「${currentPrompt.title}」が出た🥫
${rareLine}押すだけでAIへの頼み方が出てくる

${SITE_URL}
#チップ商会${handle}`;
}
function encoded(url, params) {
  const target = new URL(url);
  Object.entries(params).forEach(([key, value]) => target.searchParams.set(key, value));
  return target.toString();
}
function configureShare() {
  const textX = shareText("x");
  const textThreads = shareText("threads");
  const encodedText = encodeURIComponent(textX);
  $("#share-x").href = "https://x.com/intent/post?text=" + encodedText;
  $("#share-line").href = encoded("https://social-plugins.line.me/lineit/share", { url: SITE_URL, text: textX });
  $("#share-facebook").href = encoded("https://www.facebook.com/sharer/sharer.php", { u: SITE_URL });
  $("#share-threads").href = "https://threads.com/intent/post?text=" + encodeURIComponent(textThreads);
  $("#share-native").hidden = !("share" in navigator);
}
function openShare() {
  configureShare();
  lastFocus = document.activeElement;
  shareOverlay.hidden = false;
  $("#close-share").focus();
}
function closeShare() {
  shareOverlay.hidden = true;
  if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
}
function returnToMachine() {
  window.clearInterval(typingTimer);
  clearEffects();
  document.body.classList.remove("is-rare");
  resultView.hidden = true;
  machineView.hidden = false;
  setSpeech("いらっしゃい！ 何にする？");
  canFlight.classList.remove("fly");
  categoryButtons.querySelectorAll("button").forEach(button => {
    button.disabled = false;
    button.classList.remove("selected");
  });
  machineView.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
}
$("#copy-prompt").addEventListener("click", async () => {
  try { await copyText(currentPrompt.body); showToast("コピーした！"); }
  catch { showToast("コピーできませんでした"); }
});
$("#buy-again").addEventListener("click", returnToMachine);
$("#open-share").addEventListener("click", openShare);
$("#close-share").addEventListener("click", closeShare);
$("#share-backdrop").addEventListener("click", closeShare);
$("#copy-url").addEventListener("click", async () => {
  try { await copyText(SITE_URL); showToast("URLをコピーした！"); closeShare(); }
  catch { showToast("コピーできませんでした"); }
});
$("#share-native").addEventListener("click", async () => {
  try {
    await navigator.share({ title: "プロンプト自販機", text: shareText("native"), url: SITE_URL });
    closeShare();
  } catch (error) {
    if (error.name !== "AbortError") showToast("共有を開けませんでした");
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !shareOverlay.hidden) closeShare();
});
fetch("prompts.json")
  .then(response => {
    if (!response.ok) throw new Error("prompts.json を読み込めませんでした");
    return response.json();
  })
  .then(json => {
    if (!json.categories?.length || !json.prompts?.length || !json.rare?.length) throw new Error("プロンプトデータの形式が正しくありません");
    data = json;
    renderCategories();
    $("#loading").hidden = true;
  })
  .catch(error => {
    $("#loading").hidden = true;
    const message = $("#error-message");
    message.hidden = false;
    message.textContent = error.message + "。ページを再読み込みしてください。";
  });
