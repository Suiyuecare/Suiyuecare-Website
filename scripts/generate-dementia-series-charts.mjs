import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputs = [
  "assets/health3/dementia-series",
  "public/assets/health3/dementia-series"
];

const palette = {
  ink: "#3c1f0b",
  muted: "#725b4c",
  orange: "#f58a1f",
  orangeSoft: "#fff0de",
  teal: "#1595a8",
  tealSoft: "#e7f6f8",
  green: "#758d60",
  greenSoft: "#eef4e9",
  coral: "#db6547",
  coralSoft: "#fcebe6",
  blue: "#4f77a8",
  blueSoft: "#eaf1fa",
  yellow: "#d89e2b",
  yellowSoft: "#fff6d9",
  paper: "#fffaf3",
  white: "#ffffff",
  line: "#ead8bf"
};

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function start({ id, title, desc, eyebrow, heading, subheading }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${esc(title)}</title>
  <desc id="${id}-desc">${esc(desc)}</desc>
  <rect width="1200" height="675" fill="${palette.paper}"/>
  <rect x="0" y="0" width="18" height="675" fill="${palette.orange}"/>
  <text x="64" y="66" fill="${palette.orange}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="18" font-weight="800" letter-spacing="2">${esc(eyebrow)}</text>
  <text x="64" y="118" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="38" font-weight="900">${esc(heading)}</text>
  <text x="64" y="154" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="20" font-weight="650">${esc(subheading)}</text>`;
}

function end(note) {
  return `
  <line x1="64" y1="620" x2="1136" y2="620" stroke="${palette.line}" stroke-width="2"/>
  <text x="64" y="650" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="650">${esc(note)}</text>
</svg>`;
}

function multiline(x, y, lines, options = {}) {
  const size = options.size || 20;
  const gap = options.gap || Math.round(size * 1.45);
  const fill = options.fill || palette.ink;
  const weight = options.weight || 750;
  const anchor = options.anchor || "start";
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="${size}" font-weight="${weight}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${esc(line)}</tspan>`).join("")}</text>`;
}

function card({ x, y, w, h, number, title, lines = [], color, soft, titleSize = 22 }) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="8" height="${h}" rx="4" fill="${color}"/>
    ${number ? `<rect x="${x + 24}" y="${y + 22}" width="44" height="32" rx="8" fill="${soft}"/><text x="${x + 46}" y="${y + 45}" fill="${color}" text-anchor="middle" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="900">${esc(number)}</text>` : ""}
    <text x="${x + (number ? 82 : 26)}" y="${y + 47}" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="${titleSize}" font-weight="900">${esc(title)}</text>
    ${lines.length ? multiline(x + 26, y + 82, lines, { size: 17, gap: 25, fill: palette.muted, weight: 700 }) : ""}
  </g>`;
}

function pill(x, y, w, text, color, soft) {
  return `<rect x="${x}" y="${y}" width="${w}" height="40" rx="8" fill="${soft}" stroke="${color}" stroke-width="1.5"/>
  <text x="${x + w / 2}" y="${y + 27}" fill="${color}" text-anchor="middle" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="17" font-weight="850">${esc(text)}</text>`;
}

function arrow(x1, y1, x2, y2, color = palette.orange) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 10;
  const ax = x2 - size * Math.cos(angle - Math.PI / 6);
  const ay = y2 - size * Math.sin(angle - Math.PI / 6);
  const bx = x2 - size * Math.cos(angle + Math.PI / 6);
  const by = y2 - size * Math.sin(angle + Math.PI / 6);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
  <polygon points="${x2},${y2} ${ax},${ay} ${bx},${by}" fill="${color}"/>`;
}

const charts = {
  "midlife-habits-chart.svg": `${start({
    id: "midlife-habits",
    title: "護腦生活十件事",
    desc: "以十張卡片整理中年到高齡可持續的失智風險降低行動。",
    eyebrow: "BRAIN HEALTH CHECKLIST",
    heading: "護腦不是做一件大事，是把 10 件小事做久",
    subheading: "先選最容易開始的兩項，四週後再加，不需要一天全部完成。"
  })}
  ${[
    ["01", "每週活動", "有氧＋肌力＋平衡", palette.orange, palette.orangeSoft],
    ["02", "三高管理", "按時追蹤與用藥", palette.teal, palette.tealSoft],
    ["03", "停止吸菸", "需要時尋求戒菸支持", palette.green, palette.greenSoft],
    ["04", "飲酒減量", "能不喝就不必開始", palette.coral, palette.coralSoft],
    ["05", "均衡飲食", "原型食物與多樣蔬果", palette.blue, palette.blueSoft],
    ["06", "保護聽力", "聽不清就安排評估", palette.yellow, palette.yellowSoft],
    ["07", "睡眠就醫", "持續異常找原因", palette.orange, palette.orangeSoft],
    ["08", "維持連結", "固定與人互動", palette.teal, palette.tealSoft],
    ["09", "學新任務", "難度剛好、有回饋", palette.green, palette.greenSoft],
    ["10", "防跌護頭", "視力、環境與安全", palette.coral, palette.coralSoft]
  ].map((item, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    return card({ x: 64 + col * 216, y: 190 + row * 190, w: 196, h: 164, number: item[0], title: item[1], lines: [item[2]], color: item[3], soft: item[4], titleSize: 20 });
  }).join("\n")}
  ${end("降低風險不等於保證不會失智；有慢性病或活動限制者，請和醫療專業討論適合做法。")}`,

  "exercise-week-chart.svg": `${start({
    id: "exercise-week",
    title: "一週護腦運動配置",
    desc: "以一週七天範例說明有氧、肌力與平衡訓練如何分配。",
    eyebrow: "WEEKLY MOVEMENT PLAN",
    heading: "有氧打底、肌力撐住、平衡守安全",
    subheading: "這是配置範例，不是處方；從能說話但微喘的強度慢慢累積。"
  })}
  <g>
    ${["一", "二", "三", "四", "五", "六", "日"].map((day, i) => `<rect x="${64 + i * 154}" y="198" width="136" height="294" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/><text x="${132 + i * 154}" y="237" text-anchor="middle" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="21" font-weight="900">週${day}</text>`).join("")}
    ${pill(78, 265, 108, "快走 30分", palette.orange, palette.orangeSoft)}
    ${pill(232, 265, 108, "肌力 20分", palette.teal, palette.tealSoft)}
    ${pill(386, 265, 108, "快走 30分", palette.orange, palette.orangeSoft)}
    ${pill(540, 265, 108, "平衡 15分", palette.green, palette.greenSoft)}
    ${pill(694, 265, 108, "快走 30分", palette.orange, palette.orangeSoft)}
    ${pill(848, 265, 108, "肌力 20分", palette.teal, palette.tealSoft)}
    ${pill(1002, 265, 108, "散步 30分", palette.orange, palette.orangeSoft)}
    ${pill(78, 331, 108, "平衡 10分", palette.green, palette.greenSoft)}
    ${pill(386, 331, 108, "平衡 10分", palette.green, palette.greenSoft)}
    ${pill(694, 331, 108, "平衡 10分", palette.green, palette.greenSoft)}
    ${pill(1002, 331, 108, "伸展 10分", palette.blue, palette.blueSoft)}
    <text x="132" y="444" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="700">可拆成<br/>3 次 10 分</text>
    <text x="286" y="444" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="700">椅子起立<br/>推牆</text>
    <text x="594" y="444" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="700">扶穩練習<br/>安全第一</text>
    <text x="902" y="444" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="700">彈力帶<br/>提踵</text>
  </g>
  ${pill(64, 530, 318, "每週至少 150 分鐘中等強度有氧", palette.orange, palette.orangeSoft)}
  ${pill(402, 530, 258, "每週至少 2 天肌力", palette.teal, palette.tealSoft)}
  ${pill(680, 530, 456, "行動較不穩者：每週至少 3 天平衡練習", palette.green, palette.greenSoft)}
  ${end("胸痛、暈眩、喘不過氣或新出現疼痛時先停止；久未運動者可先從 5–10 分鐘開始。")}`,

  "brain-healthy-plate-chart.svg": `${start({
    id: "brain-healthy-plate",
    title: "一日護腦餐盤",
    desc: "依國民健康署我的餐盤口訣整理蔬菜、水果、全穀、蛋白質、乳品與堅果。",
    eyebrow: "BRAIN-HEALTHY PLATE",
    heading: "先把餐盤吃完整，再談保健品",
    subheading: "沒有單一護腦食物；重點是多樣、原型、吃得下，而且能長期維持。"
  })}
  <circle cx="350" cy="385" r="182" fill="${palette.white}" stroke="${palette.line}" stroke-width="8"/>
  <path d="M350 203 A182 182 0 0 0 168 385 L350 385 Z" fill="${palette.greenSoft}"/>
  <path d="M168 385 A182 182 0 0 0 350 567 L350 385 Z" fill="${palette.orangeSoft}"/>
  <path d="M350 203 A182 182 0 0 1 532 385 L350 385 Z" fill="${palette.yellowSoft}"/>
  <path d="M532 385 A182 182 0 0 1 350 567 L350 385 Z" fill="${palette.tealSoft}"/>
  ${multiline(260, 320, ["蔬菜", "量比水果多"], { size: 21, gap: 29, fill: palette.green, weight: 900, anchor: "middle" })}
  ${multiline(260, 445, ["全穀雜糧", "至少 1/3 未精製"], { size: 20, gap: 29, fill: palette.orange, weight: 900, anchor: "middle" })}
  ${multiline(440, 320, ["水果", "每餐約一拳"], { size: 21, gap: 29, fill: palette.yellow, weight: 900, anchor: "middle" })}
  ${multiline(440, 445, ["豆魚蛋肉", "一掌心"], { size: 21, gap: 29, fill: palette.teal, weight: 900, anchor: "middle" })}
  ${card({ x: 600, y: 205, w: 536, h: 100, title: "每天早晚一杯奶", lines: ["乳品可依個人耐受與營養需求選擇。"], color: palette.blue, soft: palette.blueSoft })}
  ${card({ x: 600, y: 325, w: 536, h: 100, title: "每天一茶匙堅果種子", lines: ["原味、少鹽；吞嚥或咀嚼困難者需調整質地。"], color: palette.orange, soft: palette.orangeSoft })}
  ${card({ x: 600, y: 445, w: 536, h: 100, title: "喝水、少糖、少加工", lines: ["以水為主；加工肉品、含糖飲料與過量鹽分少一點。"], color: palette.teal, soft: palette.tealSoft })}
  ${end("食量下降、體重快速減輕、常嗆咳或有腎臟病等狀況，請依醫療與營養專業建議調整。")}`,

  "cardiometabolic-brain-chart.svg": `${start({
    id: "cardiometabolic-brain",
    title: "三高與腦健康路徑",
    desc: "說明血壓、血糖與膽固醇透過血管與心腦血管事件影響腦健康，並列出可行管理步驟。",
    eyebrow: "HEART–BRAIN CONNECTION",
    heading: "顧好血管，就是替大腦保留空間",
    subheading: "不是追求一個人人相同的數字，而是規律測量、就醫與持續管理。"
  })}
  ${card({ x: 64, y: 210, w: 230, h: 112, number: "01", title: "血壓", lines: ["長期過高會增加", "血管負擔"], color: palette.coral, soft: palette.coralSoft })}
  ${card({ x: 64, y: 350, w: 230, h: 112, number: "02", title: "血糖", lines: ["忽高忽低也會", "影響全身血管"], color: palette.orange, soft: palette.orangeSoft })}
  ${card({ x: 64, y: 490, w: 230, h: 112, number: "03", title: "血脂", lines: ["依整體風險設定", "治療目標"], color: palette.yellow, soft: palette.yellowSoft })}
  ${arrow(315, 405, 425, 405, palette.orange)}
  <rect x="445" y="258" width="290" height="294" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/>
  <text x="590" y="312" text-anchor="middle" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="26" font-weight="900">共同影響：血管健康</text>
  ${multiline(590, 360, ["小血管受損", "中風與心血管事件", "腦部供血與復原能力"], { size: 19, gap: 43, fill: palette.muted, weight: 750, anchor: "middle" })}
  ${arrow(755, 405, 850, 405, palette.teal)}
  <rect x="870" y="225" width="266" height="360" rx="8" fill="${palette.tealSoft}" stroke="${palette.teal}" stroke-width="2"/>
  <text x="1003" y="278" text-anchor="middle" fill="${palette.teal}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="25" font-weight="900">家庭管理四步驟</text>
  ${multiline(920, 330, ["1  固定時間測量", "2  帶紀錄回診", "3  按醫囑用藥", "4  活動、飲食、睡眠一起顧"], { size: 19, gap: 52, fill: palette.ink, weight: 800 })}
  ${end("血壓、血糖與血脂目標需依年齡、共病與用藥個別設定；勿自行停藥或追求過低數值。")}`,

  "hearing-connection-chart.svg": `${start({
    id: "hearing-connection",
    title: "聽力與認知連結",
    desc: "呈現聽不清楚可能增加溝通負荷與社交退縮，並說明從觀察到評估的處理流程。",
    eyebrow: "HEARING & CONNECTION",
    heading: "聽不清，不只是把音量調大",
    subheading: "先排除耳垢與疾病，再評估聽力、輔具與溝通環境。"
  })}
  ${card({ x: 64, y: 230, w: 230, h: 175, number: "01", title: "聽不清楚", lines: ["常請人重說", "電視越開越大"], color: palette.orange, soft: palette.orangeSoft })}
  ${arrow(312, 318, 402, 318, palette.orange)}
  ${card({ x: 420, y: 230, w: 230, h: 175, number: "02", title: "溝通更費力", lines: ["要猜語意", "容易疲累與誤會"], color: palette.teal, soft: palette.tealSoft })}
  ${arrow(668, 318, 758, 318, palette.teal)}
  ${card({ x: 776, y: 230, w: 230, h: 175, number: "03", title: "減少互動", lines: ["少參與對話", "可能逐漸退縮"], color: palette.green, soft: palette.greenSoft })}
  <path d="M890 422 C890 520 185 520 185 422" fill="none" stroke="${palette.line}" stroke-width="4" stroke-dasharray="8 8"/>
  ${pill(64, 475, 240, "先看耳鼻喉／聽力評估", palette.orange, palette.orangeSoft)}
  ${pill(326, 475, 234, "需要時試配與追蹤", palette.teal, palette.tealSoft)}
  ${pill(582, 475, 250, "面對面、慢一點說", palette.green, palette.greenSoft)}
  ${pill(854, 475, 282, "降低背景噪音、保持互動", palette.blue, palette.blueSoft)}
  ${end("研究並未證明助聽器對所有人都能防失智；但改善聽見、溝通與參與，本身就很重要。")}`,

  "sleep-mood-check-chart.svg": `${start({
    id: "sleep-mood-check",
    title: "睡眠與心情觀察流程",
    desc: "整理睡眠與情緒變化時可先記錄的項目、需就醫評估的線索與日常支持。",
    eyebrow: "SLEEP & MOOD CHECK",
    heading: "先找原因，不把所有記憶變化都怪在年齡",
    subheading: "睡眠、心情與認知互相影響；持續變化需要評估，而不是只靠硬撐。"
  })}
  <rect x="64" y="210" width="322" height="348" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/>
  <text x="225" y="260" text-anchor="middle" fill="${palette.orange}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="24" font-weight="900">先記錄 2 週</text>
  ${multiline(105, 312, ["• 上床、醒來與午睡時間", "• 打鼾、喘醒、夜間頻尿", "• 白天嗜睡與活動量", "• 情緒、食慾、興趣", "• 新藥物與咖啡因"], { size: 18, gap: 46, fill: palette.ink, weight: 750 })}
  ${arrow(406, 383, 493, 383, palette.orange)}
  <rect x="512" y="210" width="270" height="348" rx="8" fill="${palette.coralSoft}" stroke="${palette.coral}" stroke-width="2"/>
  <text x="647" y="260" text-anchor="middle" fill="${palette.coral}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="24" font-weight="900">出現這些情況</text>
  ${multiline(550, 315, ["持續兩週以上", "明顯影響日常", "疑似睡眠呼吸中止", "強烈無望或自傷想法", "突然混亂或急劇改變"], { size: 19, gap: 50, fill: palette.ink, weight: 800 })}
  ${arrow(802, 383, 882, 383, palette.coral)}
  <rect x="902" y="210" width="234" height="348" rx="8" fill="${palette.tealSoft}" stroke="${palette.teal}" stroke-width="2"/>
  <text x="1019" y="260" text-anchor="middle" fill="${palette.teal}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="24" font-weight="900">安排評估</text>
  ${multiline(1019, 325, ["家醫／身心科", "睡眠門診", "藥物與慢性病檢視", "必要時認知評估", "同步調整白天作息"], { size: 18, gap: 49, fill: palette.ink, weight: 800, anchor: "middle" })}
  ${end("睡太久或睡太少與失智風險的關聯，不等於單一因果；突然意識改變應優先就醫。")}`,

  "cognitive-15-minute-chart.svg": `${start({
    id: "cognitive-15-minute",
    title: "每天十五分鐘護腦活動",
    desc: "把十五分鐘分為定向、回想、任務與分享四個區段，鼓勵有意義且難度合適的活動。",
    eyebrow: "15-MINUTE BRAIN ROUTINE",
    heading: "不是考記憶，是讓大腦在生活裡持續參與",
    subheading: "活動要有意義、可完成、能回饋；答錯不責備，太難就把步驟拆小。"
  })}
  <line x1="126" y1="360" x2="1074" y2="360" stroke="${palette.line}" stroke-width="14" stroke-linecap="round"/>
  ${[
    [126, "3 分", "看今天", ["日期、天氣", "今天要做什麼"], palette.orange, palette.orangeSoft],
    [422, "4 分", "聊一件事", ["一張照片", "熟悉歌曲或新聞"], palette.teal, palette.tealSoft],
    [718, "4 分", "做一任務", ["分類、配對", "備餐、摺衣"], palette.green, palette.greenSoft],
    [1014, "4 分", "說出感受", ["哪裡有趣", "下次想做什麼"], palette.coral, palette.coralSoft]
  ].map(([x, time, title, lines, color, soft]) => `<g>
    <circle cx="${x}" cy="360" r="62" fill="${soft}" stroke="${color}" stroke-width="5"/>
    <text x="${x}" y="370" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="25" font-weight="900">${time}</text>
    <text x="${x}" y="250" text-anchor="middle" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="24" font-weight="900">${title}</text>
    ${multiline(x, 458, lines, { size: 18, gap: 30, fill: palette.muted, weight: 750, anchor: "middle" })}
  </g>`).join("\n")}
  ${end("若活動讓人焦躁、羞愧或反覆失敗，就降低難度或換題；陪伴感比答對幾題更重要。")}`,

  "living-well-wheel-chart.svg": `${start({
    id: "living-well-wheel",
    title: "確診後維持生活能力",
    desc: "以保留能力為中心，整理運動、作息、社交、醫療、環境與決策參與六個面向。",
    eyebrow: "LIVING WELL AFTER DIAGNOSIS",
    heading: "確診後的目標：把還能做的事留得更久",
    subheading: "支持不是全部接手，而是調整環境與步驟，讓本人繼續參與。"
  })}
  <circle cx="590" cy="390" r="112" fill="${palette.orangeSoft}" stroke="${palette.orange}" stroke-width="5"/>
  ${multiline(590, 378, ["保留能力", "與生活品質"], { size: 25, gap: 36, fill: palette.ink, weight: 900, anchor: "middle" })}
  ${[
    [590, 215, "規律活動", "依能力安排", palette.orange, palette.orangeSoft],
    [837, 300, "固定作息", "降低混亂", palette.teal, palette.tealSoft],
    [837, 485, "持續社交", "保留角色", palette.green, palette.greenSoft],
    [590, 565, "醫療追蹤", "藥物與共病", palette.coral, palette.coralSoft],
    [343, 485, "安全環境", "提示與輔具", palette.blue, palette.blueSoft],
    [343, 300, "本人參與", "選擇與尊嚴", palette.yellow, palette.yellowSoft]
  ].map(([x, y, title, sub, color, soft]) => `<g>
    <line x1="590" y1="390" x2="${x}" y2="${y}" stroke="${palette.line}" stroke-width="5"/>
    <rect x="${x - 100}" y="${y - 47}" width="200" height="94" rx="8" fill="${soft}" stroke="${color}" stroke-width="2"/>
    <text x="${x}" y="${y - 5}" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="21" font-weight="900">${title}</text>
    <text x="${x}" y="${y + 25}" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="750">${sub}</text>
  </g>`).join("\n")}
  ${end("若出現突然混亂、跌倒、快速退化、幻覺明顯增加或照顧安全疑慮，請及早尋求醫療評估。")}`,

  "cue-wait-flow-chart.svg": `${start({
    id: "cue-wait-flow",
    title: "提示等待再協助",
    desc: "以四階段流程說明失智照顧中如何先觀察、給一個提示、等待，再只協助必要部分。",
    eyebrow: "CUE · WAIT · SUPPORT",
    heading: "少做一點替代，多留一點成功機會",
    subheading: "以穿衣為例：一次只給一個提示，留足反應時間，再協助卡住的步驟。"
  })}
  ${[
    [64, "01", "先觀察", ["他卡在哪一步？", "環境是否太吵？"], palette.orange, palette.orangeSoft],
    [336, "02", "給一個提示", ["短句、手勢或示範", "不要連續下指令"], palette.teal, palette.tealSoft],
    [608, "03", "安靜等待", ["至少留幾秒反應", "不急著糾正"], palette.green, palette.greenSoft],
    [880, "04", "只幫必要部分", ["幫他越過卡點", "完成後肯定努力"], palette.coral, palette.coralSoft]
  ].map(([x, num, title, lines, color, soft]) => card({ x, y: 245, w: 242, h: 260, number: num, title, lines, color, soft, titleSize: 21 })).join("\n")}
  ${arrow(306, 375, 326, 375, palette.orange)}
  ${arrow(578, 375, 598, 375, palette.teal)}
  ${arrow(850, 375, 870, 375, palette.green)}
  ${pill(64, 545, 1072, "安全優先：火源、跌倒、吞嚥或走失等危險情境，要立即介入，不必硬等。", palette.coral, palette.coralSoft)}
  ${end("目標不是考驗記憶，而是保留參與、選擇與尊嚴；每個人的反應時間都不同。")}`,

  "supplement-evidence-chart.svg": `${start({
    id: "supplement-evidence",
    title: "護腦保健品判讀流程",
    desc: "從是否有確診缺乏、藥物交互作用與研究證據，判斷保健品使用前該問的問題。",
    eyebrow: "SUPPLEMENT DECISION GUIDE",
    heading: "買保健品前，先問三個問題",
    subheading: "沒有任何保健品被證明能保證預防或治療失智；先處理真正缺乏與可改變風險。"
  })}
  <rect x="64" y="220" width="310" height="130" rx="8" fill="${palette.white}" stroke="${palette.orange}" stroke-width="3"/>
  ${multiline(219, 270, ["1  有檢驗或診斷證實", "營養素缺乏嗎？"], { size: 22, gap: 34, fill: palette.ink, weight: 900, anchor: "middle" })}
  ${arrow(390, 285, 475, 285, palette.orange)}
  <rect x="495" y="220" width="270" height="130" rx="8" fill="${palette.greenSoft}" stroke="${palette.green}" stroke-width="3"/>
  ${multiline(630, 270, ["有缺乏", "依醫囑補充與追蹤"], { size: 21, gap: 34, fill: palette.green, weight: 900, anchor: "middle" })}
  ${arrow(219, 370, 219, 430, palette.coral)}
  <rect x="64" y="450" width="310" height="130" rx="8" fill="${palette.coralSoft}" stroke="${palette.coral}" stroke-width="3"/>
  ${multiline(219, 500, ["沒有缺乏／不確定", "不要只因廣告就長期吃"], { size: 20, gap: 34, fill: palette.coral, weight: 900, anchor: "middle" })}
  ${arrow(390, 515, 475, 515, palette.coral)}
  <rect x="495" y="420" width="641" height="160" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/>
  <text x="815" y="463" text-anchor="middle" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="22" font-weight="900">2  和藥物衝突嗎？　3  證據支持誰、什麼劑量、多久？</text>
  ${pill(530, 492, 126, "魚油", palette.blue, palette.blueSoft)}
  ${pill(674, 492, 126, "銀杏", palette.orange, palette.orangeSoft)}
  ${pill(818, 492, 126, "維他命", palette.teal, palette.tealSoft)}
  ${pill(962, 492, 138, "綜合補充品", palette.green, palette.greenSoft)}
  <text x="815" y="560" text-anchor="middle" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="17" font-weight="750">先帶完整用藥與保健品清單，詢問醫師或藥師。</text>
  ${end("世界衛生組織不建議在沒有診斷缺乏時，例行以 B／E 維生素、Omega-3 或綜合維他命預防認知退化。")}`
};

for (const directory of outputs) {
  await mkdir(directory, { recursive: true });
  await Promise.all(Object.entries(charts).map(([filename, svg]) => writeFile(join(directory, filename), svg, "utf8")));
}

console.log(`Generated ${Object.keys(charts).length} dementia-series charts in ${outputs.length} directories.`);
