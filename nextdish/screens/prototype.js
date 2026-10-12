"use strict";

const storageKey = "nextdish-design-study-v1";
const sampleData = () => ({version: 1, restaurants: [
  {id:"r1", name:"スパイス食堂 縁", branch:"駅前店", art:"curry", dishes:[
    {id:"d1", name:"チキンカレー", intent:"repeat", note:"辛さ2、ご飯少なめ。\n温玉をつけるとちょうどいい。"},
    {id:"d2", name:"季節の野菜カレー", intent:"tryNext", note:"次はこれ。野菜がたっぷり入っていた。"},
    {id:"d3", name:"激辛キーマ", intent:"skip", note:"辛さは自分には強め。頼むなら辛さを下げる。"}]},
  {id:"r2", name:"喫茶 こもれび", branch:"", art:"coffee", dishes:[
    {id:"d4", name:"カフェラテ", intent:"repeat", note:"ホット、砂糖なし。窓際の席でゆっくり。"},
    {id:"d5", name:"固めのプリン", intent:"tryNext", note:"ランチのあとに頼んでみたい。"}]},
  {id:"r3", name:"麺とだし 紬", branch:"本店", art:"bowl", dishes:[
    {id:"d6", name:"鶏だし塩そば", intent:"repeat", note:"麺かため、ねぎ多め。普通盛りで十分。"}]}]});
const intents = {repeat:"また頼む",tryNext:"次に試す",skip:"今回は合わなかった"};
const app = document.querySelector("#app");
const editor = document.querySelector("#editor");
let data = sampleData();
let view = "restaurants";
let selectedRestaurantId = null;
let selectedDishId = null;
let query = "";
let toastTimeout;

const escapeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const normalized = value => String(value).normalize("NFKC").toLowerCase().replace(/[\u30a1-\u30f6]/g, char => String.fromCharCode(char.charCodeAt(0)-0x60));
const matches = value => normalized(value).includes(normalized(query.trim()));
const id = () => crypto.randomUUID();
function icon(type) {
  const paths = {
    search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    book:'<path d="M4 4h7c2 0 3 1 3 2v15c0-2-2-3-4-3H4zM14 6c0-2 3-2 6-2v14c-3 0-6 1-6 3"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
    back:'<path d="m14 5-7 7 7 7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 2 3-1 1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-2z"/>',
    plate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4"/><path d="M2 4v6M1 4v4h2V4M2 10v10M22 4v16M22 4c-3 3-3 6 0 7"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type] ?? paths.plate}</svg>`;
}
function art(type) {
  const drawings = {
    curry:'<ellipse cx="50" cy="57" rx="37" ry="23" fill="#faf5e8" stroke="#b29372"/><ellipse cx="50" cy="55" rx="29" ry="17" fill="#b97b42"/><path d="M54 40c19 1 22 10 17 20-9 6-21 3-24-3-3-8 0-13 7-17" fill="#f1e8cf"/><path d="m26 49 8-3 5 6-8 4zM39 58l5 4-4 5-5-4z" fill="#d9a66b"/><path d="m57 43 3 4m6 4-3 4m-11 0 3 5" stroke="#d4c6a6" stroke-width="2"/><path d="m28 32 2-5m45 3 3-5" stroke="#a98762" stroke-linecap="round"/><path d="m86 29-2 23" stroke="#7d7464" stroke-width="3"/><ellipse cx="87" cy="26" rx="5" ry="8" fill="#ccc2aa" stroke="#7d7464"/>',
    coffee:'<ellipse cx="46" cy="70" rx="30" ry="8" fill="#d5d7bd"/><path d="M25 37h42l-4 26c-10 10-26 10-34 0z" fill="#fbf7e8" stroke="#798568" stroke-width="1.6"/><path d="M67 42c22-6 20 20-3 17" fill="none" stroke="#798568" stroke-width="3"/><ellipse cx="46" cy="37" rx="21" ry="7" fill="#9c7953" stroke="#798568"/><path d="M34 37c8-7 27-2 25 3-1 3-17-1-15-4 2-2 8 0 6 1" fill="none" stroke="#f4e5cd" stroke-width="2"/><path d="M36 17c-5 8 5 10 1 14m11-18c-5 8 5 10 1 15" stroke="#a6ae93" fill="none" stroke-linecap="round"/>',
    bowl:'<path d="M16 45h68c-5 23-19 32-34 32S22 68 16 45" fill="#efe8dc" stroke="#ab7f68" stroke-width="1.5"/><ellipse cx="50" cy="45" rx="34" ry="12" fill="#d4a267" stroke="#ab7f68"/><path d="M27 44c7-13 21 12 30 0s16 4 18 2M31 48c7-13 20 11 29-1" fill="none" stroke="#eed5a5" stroke-width="3"/><ellipse cx="63" cy="43" rx="7" ry="5" fill="#f7edd3"/><ellipse cx="63" cy="43" rx="3" ry="2" fill="#d6a455"/><path d="m29 38 8 3m-6-7 9 4m-1 7 8 2" stroke="#6d8b51" stroke-width="2"/><path d="m51 29 33-10m-30 14 33-10" stroke="#947558" stroke-width="2" stroke-linecap="round"/>'
  };
  return `<svg viewBox="0 0 100 100" role="img" aria-label="料理のイラスト">${drawings[type] ?? drawings.curry}</svg>`;
}
function validData(value) {
  return value?.version === 1 && Array.isArray(value.restaurants) && value.restaurants.length <= 500 && value.restaurants.every(r => typeof r.id === "string" && typeof r.name === "string" && r.name.length <= 60 && typeof r.branch === "string" && typeof r.art === "string" && Array.isArray(r.dishes) && r.dishes.length <= 2000 && r.dishes.every(d => typeof d.id === "string" && typeof d.name === "string" && d.name.length <= 80 && typeof d.note === "string" && d.note.length <= 300 && Object.hasOwn(intents,d.intent)));
}
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (validData(parsed)) data = parsed;
  }
} catch { /* 閲覧は保存不可の環境でも可能。変更時にエラーを表示する。 */ }

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => node.classList.remove("visible"), 2800);
}
function commit(next) {
  try { localStorage.setItem(storageKey,JSON.stringify(next)); data = next; return true; }
  catch { toast("保存できませんでした。ブラウザの保存設定を確認してください。"); return false; }
}
const selectedRestaurant = () => data.restaurants.find(r => r.id === selectedRestaurantId);
const selectedDish = () => selectedRestaurant()?.dishes.find(d => d.id === selectedDishId);
function nav() {
  return `<nav class="tab-bar" aria-label="メインメニュー"><button data-action="restaurants" class="${view === "restaurants" || view === "restaurant" || view === "dish" ? "active" : ""}">${icon("book")}<span>お店</span></button><button data-action="next" class="${view === "next" ? "active" : ""}">${icon("bookmark")}<span>次に試す</span></button></nav>`;
}
function heading(title,subtitle) {
  return `<header class="app-heading"><div><p class="overline">${escapeText(subtitle)}</p><h2>${escapeText(title)}</h2></div><button class="icon-button" data-action="settings" aria-label="設定を開く">${icon("settings")}</button></header>`;
}
function searchBox() {
  return `<label class="search">${icon("search")}<input id="search" aria-label="お店・料理を検索" placeholder="お店・料理を検索" value="${escapeText(query)}"><button type="button" data-action="clear-search" aria-label="検索をクリア" ${query ? "" : "hidden"}>×</button></label>`;
}
function dishCard(r,d,showStore=false) {
  return `<button class="dish-card" data-action="dish" data-restaurant="${escapeText(r.id)}" data-dish="${escapeText(d.id)}">${showStore ? `<p class="dish-store">${escapeText(r.name)}${r.branch ? ` · ${escapeText(r.branch)}` : ""}</p>` : ""}<h4>${escapeText(d.name)}</h4><span class="card-tag ${d.intent}">${intents[d.intent]}</span>${d.note ? `<p>${escapeText(d.note)}</p>` : ""}</button>`;
}
function restaurantList() {
  const filtered = data.restaurants.filter(r => matches(`${r.name} ${r.branch}`) || r.dishes.some(d => matches(`${d.name} ${d.note}`)));
  const list = filtered.map(r => `<button class="restaurant-card" data-action="restaurant" data-restaurant="${escapeText(r.id)}"><span class="art-frame ${escapeText(r.art)}">${art(r.art)}</span><span class="restaurant-copy">${r.branch ? `<span class="card-kicker">${escapeText(r.branch)}</span>` : ""}<span class="card-name" style="display:block">${escapeText(r.name)}</span><span class="counts"><span>また頼む <b>${r.dishes.filter(d=>d.intent==="repeat").length}</b></span><span>次に試す <b>${r.dishes.filter(d=>d.intent==="tryNext").length}</b></span></span></span><span class="chevron" aria-hidden="true">›</span></button>`).join("");
  return `${heading("つぎの一皿","私だけの注文手帳")}${searchBox()}${!query ? `<div class="menu-note"><p class="overline">いつものお店で。</p><h3>おいしかったを、<br>次の注文に。</h3><p>辛さ、量、好きな組み合わせ。<br>あなたのひとことを残そう。</p><div class="note-art">${art("curry")}</div></div>` : ""}<div class="section-heading"><h3>${query ? "検索結果" : "私のお店"}</h3><span class="count">${filtered.length} 店</span></div>${list || `<div class="empty">${icon("plate")}<h3>${query ? "見つかりませんでした" : "最初のお店を残そう"}</h3><p>${query ? "別の店名や料理名で検索してみてください。" : "覚えておきたい一皿があるお店を、\nひとつ登録してみませんか。"}</p></div>`}<button class="add-button" data-action="add-restaurant">${icon("plus")}<span>お店を記録する</span></button>`;
}
function restaurantDetail() {
  const r = selectedRestaurant();
  if (!r) {view="restaurants";return restaurantList();}
  const grouped = intent => r.dishes.filter(d=>d.intent===intent).map(d=>dishCard(r,d)).join("");
  return `<button class="back-button" data-action="restaurants">${icon("back")}お店一覧</button><h2 class="store-title">${escapeText(r.name)}</h2><p class="store-subtitle">${escapeText(r.branch || "私のお店")}</p><div class="heading-actions"><button class="primary" data-action="add-dish">＋ 料理を追加</button><button data-action="edit-restaurant">お店を編集</button></div>${["repeat","tryNext"].map(intent=>`<div class="section-heading"><h3>${intents[intent]}</h3><span class="count">${r.dishes.filter(d=>d.intent===intent).length} 皿</span></div>${grouped(intent) || `<p class="small-note">${intent==="repeat" ? "また食べたい一皿を残しておこう。" : "気になる料理を次の楽しみに。"}</p>`}`).join("")}${r.dishes.some(d=>d.intent==="skip") ? `<details class="fold" ${query && r.dishes.some(d=>d.intent==="skip"&&matches(`${d.name} ${d.note}`)) ? "open" : ""}><summary>今回は合わなかった · ${r.dishes.filter(d=>d.intent==="skip").length} 皿</summary>${grouped("skip")}</details>` : ""}<button class="danger-button" data-action="delete-restaurant">このお店を削除</button>`;
}
function nextList() {
  const cards = data.restaurants.flatMap(r=>r.dishes.filter(d=>d.intent==="tryNext").map(d=>({r,d})));
  return `${heading("次に試す","次の来店の楽しみに") }<p class="small-note">まだ食べていない、気になる一皿。<br>お店を開いて、次の注文を考えよう。</p><div class="section-heading"><h3>気になる料理</h3><span class="count">${cards.length} 皿</span></div>${cards.map(({r,d})=>dishCard(r,d,true)).join("") || `<div class="empty">${icon("bookmark")}<h3>次の楽しみを残そう</h3><p>お店で気になった料理を、\n「次に試す」で記録できます。</p><button class="add-button" data-action="restaurants">お店を選ぶ</button></div>`}`;
}
function dishDetail() {
  const r=selectedRestaurant(), d=selectedDish();
  if (!r || !d) {view="restaurants";return restaurantList();}
  return `<button class="back-button" data-action="restaurant" data-restaurant="${escapeText(r.id)}">${icon("back")}${escapeText(r.name)}</button><div class="detail-art">${art(r.art)}</div><span class="card-tag ${d.intent}">${intents[d.intent]}</span><h2 class="store-title">${escapeText(d.name)}</h2><p class="detail-label">次の注文に、覚えておくこと</p><p class="detail-note">${escapeText(d.note || "ひとこと残すと、次の注文がもっと楽に。")}</p><button class="add-button" data-action="edit-dish">料理・注文メモを編集</button><button class="danger-button" data-action="delete-dish">この料理を削除</button>`;
}
function settings() {
  return `<button class="back-button" data-action="restaurants">${icon("back")}お店一覧</button><h2 class="store-title">設定</h2><div class="settings-box"><h3>私の注文手帳</h3><p>${data.restaurants.length} 店舗 · ${data.restaurants.reduce((n,r)=>n+r.dishes.length,0)} 皿</p></div><div class="settings-box"><h3>手帳を整理する</h3><p>登録したお店と料理をまとめて削除できます。</p><button class="danger-button" data-action="clear-data">すべての記録を削除</button></div><p class="version">つぎの一皿</p>`;
}
function render() {
  const screens={restaurants:restaurantList,restaurant:restaurantDetail,next:nextList,dish:dishDetail,settings};
  app.innerHTML=`<div class="app-scroll">${(screens[view] ?? restaurantList)()}</div>${nav()}`;
}
function openEditor(type) {
  const r=selectedRestaurant(), d=selectedDish();
  const isShop=type.includes("restaurant"), isEdit=type.startsWith("edit");
  const title=isShop ? (isEdit ? "お店を編集" : "お店を記録") : (isEdit ? "料理を編集" : "料理を残す");
  const current=isEdit ? (isShop ? r : d) : null;
  const fields=isShop ? `<label for="name">店名 <span aria-hidden="true">*</span></label><input id="name" name="name" required maxlength="60" placeholder="例：スパイス食堂 縁" value="${escapeText(current?.name ?? query.trim().slice(0,60))}"><label for="branch">支店・場所（任意）</label><input id="branch" name="branch" maxlength="40" placeholder="例：駅前店" value="${escapeText(current?.branch ?? "")}">` : `<p class="form-hint">${escapeText(r?.name ?? "")}</p><label for="name">料理名 <span aria-hidden="true">*</span></label><input id="name" name="name" required maxlength="80" placeholder="例：チキンカレー" value="${escapeText(current?.name ?? "")}"><label for="intent">次にどうしたい？</label><select id="intent" name="intent">${Object.entries(intents).map(([key,label])=>`<option value="${key}" ${(current?.intent ?? "repeat")===key ? "selected" : ""}>${label}</option>`).join("")}</select><label for="note">注文メモ（任意）</label><textarea id="note" name="note" maxlength="300" placeholder="例：辛さ2、ご飯少なめ">${escapeText(current?.note ?? "")}</textarea><p class="form-hint">辛さ、量、好きな組み合わせ。次に思い出したいことを。</p>`;
  editor.innerHTML=`<form id="edit-form"><h2 id="editor-title">${title}</h2>${fields}<p class="form-error" id="form-error" role="alert"></p><div class="form-actions"><button type="button" data-action="cancel-editor">キャンセル</button><button class="save" type="submit">保存する</button></div></form>`;
  const form=editor.querySelector("form");
  const initial=new FormData(form);
  editor.dataset.initial=JSON.stringify(Array.from(initial.entries()));
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const f=new FormData(form), name=String(f.get("name") ?? "").trim();
    const branch=String(f.get("branch") ?? "").trim(), note=String(f.get("note") ?? "").trim();
    const intent=String(f.get("intent") ?? "repeat");
    const error=editor.querySelector("#form-error");
    if (!name || Array.from(name).length>(isShop ? 60 : 80) || Array.from(branch).length>40 || Array.from(note).length>300 || !Object.hasOwn(intents,intent)) {error.textContent="名前と入力文字数を確認してください。";return;}
    if (isShop && data.restaurants.some(other=>other.id!==current?.id && normalized(other.name.trim())===normalized(name) && normalized(other.branch.trim())===normalized(branch))) {error.textContent="同じお店が登録されています。お店一覧から選ぶか、支店名を付けてください。";return;}
    const next=structuredClone(data);
    let nextSelectedRestaurantId=selectedRestaurantId;
    let nextView=view;
    if (isShop) {
      if(isEdit) Object.assign(next.restaurants.find(other=>other.id===r.id),{name,branch});
      else {const newShop={id:id(),name,branch,art:"curry",dishes:[]};next.restaurants.unshift(newShop);nextSelectedRestaurantId=newShop.id;}
      nextView="restaurant";
    } else {
      const target=next.restaurants.find(other=>other.id===r.id);
      if(isEdit) Object.assign(target.dishes.find(other=>other.id===d.id),{name,intent,note});
      else target.dishes.unshift({id:id(),name,intent,note});
      nextView=isEdit ? "dish" : "restaurant";
    }
    if(!commit(next)) {error.textContent="保存できませんでした。入力を残したまま、もう一度お試しください。";return;}
    selectedRestaurantId=nextSelectedRestaurantId;
    view=nextView;
    if(isShop && !isEdit) query="";
    editor.close();render();toast("手帳に保存しました");
  });
  editor.showModal();
}
function closeEditor() {
  const form=editor.querySelector("form");
  const changed=JSON.stringify(Array.from(new FormData(form).entries()))!==editor.dataset.initial;
  if(changed && !confirm("入力した内容を保存せずに閉じますか？")) return;
  editor.close();
}
editor.addEventListener("cancel",event=>{event.preventDefault();closeEditor();});
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-action]");
  if(!button) return;
  const action=button.dataset.action;
  if(action==="restore-samples") {
    if(confirm("この画面試作の編集内容を破棄して、サンプルに戻しますか？") && commit(sampleData())) {view="restaurants";query="";render();toast("サンプルに戻しました");}
    return;
  }
  if(action==="cancel-editor") {closeEditor();return;}
  if(["add-restaurant","edit-restaurant","add-dish","edit-dish"].includes(action)) {openEditor(action);return;}
  if(action==="clear-search") {query="";render();document.querySelector("#search")?.focus();return;}
  if(action.startsWith("delete")) {
    const r=selectedRestaurant(),d=selectedDish();
    if(!r || (action==="delete-dish"&&!d)) return;
    const isShop=action==="delete-restaurant";
    if(!confirm(isShop ? `「${r.name}」と料理${r.dishes.length}件を削除しますか？` : `「${d.name}」を削除しますか？`)) return;
    const next=structuredClone(data);
    if(isShop) next.restaurants=next.restaurants.filter(other=>other.id!==r.id);
    else next.restaurants.find(other=>other.id===r.id).dishes=next.restaurants.find(other=>other.id===r.id).dishes.filter(other=>other.id!==d.id);
    if(commit(next)) {view=isShop ? "restaurants" : "restaurant";render();toast("削除しました");}
    return;
  }
  if(action==="clear-data") {
    if(confirm("この手帳のお店と料理をすべて削除しますか？") && commit({version:1,restaurants:[]})) {view="restaurants";query="";render();toast("記録を削除しました");}
    return;
  }
  if(action==="restaurant"||action==="dish") selectedRestaurantId=button.dataset.restaurant;
  if(action==="dish") selectedDishId=button.dataset.dish;
  if(["restaurants","restaurant","dish","next","settings"].includes(action)) {view=action;render();}
});
document.addEventListener("input",event=>{
  if(event.target.id!=="search")return;
  query=event.target.value;
  const selection=event.target.selectionStart;
  render();
  const input=document.querySelector("#search");
  input.focus();input.setSelectionRange(selection,selection);
});
render();
