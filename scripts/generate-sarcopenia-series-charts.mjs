import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputs = [
  "assets/health3/sarcopenia-series",
  "public/assets/health3/sarcopenia-series"
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
  blue: "#4f77a8",
  blueSoft: "#eaf1fa",
  coral: "#d95f45",
  coralSoft: "#fce9e4",
  paper: "#fffaf3",
  white: "#ffffff",
  line: "#ead8bf"
};

const tones = [
  [palette.orange, palette.orangeSoft],
  [palette.teal, palette.tealSoft],
  [palette.green, palette.greenSoft],
  [palette.blue, palette.blueSoft],
  [palette.coral, palette.coralSoft]
];

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function estimatedTextWidth(text, size) {
  return [...String(text)].reduce((width, char) => {
    if (/\s/.test(char)) return width + size * 0.32;
    if (/[\x00-\x7F]/.test(char)) return width + size * 0.58;
    return width + size;
  }, 0);
}

function wrapText(text, maxWidth, size, maxLines = 5) {
  const tokens = String(text).match(/[A-Za-z0-9.&／/＋+\-]+\s*|./gu) || [];
  const lines = [];
  let current = "";
  tokens.forEach((token) => {
    const candidate = `${current}${token}`.trimEnd();
    if (current && estimatedTextWidth(candidate, size) > maxWidth) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = `${current}${token}`;
    }
  });
  if (current.trim()) lines.push(current.trim());
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  visible[maxLines - 1] = `${visible[maxLines - 1].replace(/[，、。；：,.!?！？]?$/, "")}…`;
  return visible;
}

function textLines(x, y, values, { size = 20, gap = 30, fill = palette.ink, weight = 750, anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="${size}" font-weight="${weight}">${values.map((value, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(value)}</tspan>`).join("")}</text>`;
}

function frame({ id, title, desc, eyebrow, heading, subheading, body, note }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${esc(title)}</title>
  <desc id="${id}-desc">${esc(desc)}</desc>
  <rect width="1200" height="675" fill="${palette.paper}"/>
  <rect width="18" height="675" fill="${palette.orange}"/>
  <text x="64" y="62" fill="${palette.orange}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="18" font-weight="850">${esc(eyebrow)}</text>
  <text x="64" y="112" fill="${palette.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="38" font-weight="900">${esc(heading)}</text>
  <text x="64" y="151" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="20" font-weight="650">${esc(subheading)}</text>
  ${body}
  <line x1="64" y1="620" x2="1136" y2="620" stroke="${palette.line}" stroke-width="2"/>
  <text x="64" y="650" fill="${palette.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="650">${esc(note)}</text>
</svg>`;
}

function card({ x, y, w, h, index, title, detail, tone = 0 }) {
  const [color, soft] = tones[tone % tones.length];
  const narrow = w <= 210;
  const titleX = narrow ? x + 22 : x + 76;
  const titleY = narrow ? y + 88 : y + 39;
  const detailY = narrow ? y + 151 : y + 91;
  const titleWidth = narrow ? w - 42 : w - 100;
  const detailWidth = w - 44;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="8" height="${h}" rx="4" fill="${color}"/>
    <circle cx="${x + 40}" cy="${y + 40}" r="22" fill="${soft}"/>
    <text x="${x + 40}" y="${y + 48}" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="17" font-weight="900">${esc(index)}</text>
    ${textLines(titleX, titleY, wrapText(title, titleWidth, 20, 2), { size: 20, gap: 25, weight: 900 })}
    ${textLines(x + 22, detailY, wrapText(detail, detailWidth, 16, narrow ? 5 : 3), { size: 16, gap: 24, fill: palette.muted, weight: 700 })}
  </g>`;
}

function arrow(x1, y1, x2, y2, color = palette.orange) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><polygon points="${x2},${y2} ${x2 - 13},${y2 - 8} ${x2 - 13},${y2 + 8}" fill="${color}"/>`;
}

function flowChart(config) {
  const count = config.items.length;
  const width = count === 6 ? 164 : count === 5 ? 196 : 250;
  const gap = count === 6 ? 18 : count === 5 ? 22 : 24;
  const body = config.items.map((item, index) => {
    const x = 64 + index * (width + gap);
    return card({ x, y: 224, w: width, h: 300, index: String(index + 1).padStart(2, "0"), title: item[0], detail: item[1], tone: index })
      + (index < count - 1 ? arrow(x + width + 3, 374, x + width + gap - 4, 374, tones[index % tones.length][0]) : "");
  }).join("");
  return frame({ ...config, body });
}

function gridChart(config) {
  const positions = [[64, 205], [344, 205], [624, 205], [904, 205], [204, 400], [484, 400], [764, 400]];
  const body = config.items.map((item, index) => card({ x: positions[index][0], y: positions[index][1], w: 250, h: 166, index: String(index + 1).padStart(2, "0"), title: item[0], detail: item[1], tone: index })).join("");
  return frame({ ...config, body });
}

function splitChart(config) {
  const side = (x, label, items, tone) => {
    const [color, soft] = tones[tone];
    return `<rect x="${x}" y="205" width="510" height="374" rx="8" fill="${soft}" stroke="${color}" stroke-width="2"/>
    <text x="${x + 255}" y="255" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="27" font-weight="900">${esc(label)}</text>
    ${items.map((item, index) => `<rect x="${x + 28}" y="${286 + index * 86}" width="454" height="66" rx="8" fill="${palette.white}"/>${textLines(x + 50, 314 + index * 86, wrapText(item, 410, 17, 2), { size: 17, gap: 22, weight: 800 })}`).join("")}`;
  };
  return frame({ ...config, body: side(64, config.left.label, config.left.items, 1) + side(626, config.right.label, config.right.items, 4) });
}

const charts = {
  "muscle-health-framework-chart.svg": flowChart({
    id: "muscle-health", title: "肌肉健康四個觀察面向", desc: "從肌力、肌肉量、功能與生活變化理解肌少症。", eyebrow: "MUSCLE HEALTH", heading: "別只看瘦不瘦：肌肉健康要看四件事", subheading: "低肌力與低肌肉量是診斷核心，功能變化則告訴我們生活受到多少影響。", note: "體重、外觀與小腿圍只能提供線索，不能單獨診斷肌少症。",
    items: [["肌力", "握力、起身與提物能力"], ["肌肉量", "由 DXA、BIA 等專業工具評估"], ["功能", "步行、轉位、平衡與耐力"], ["生活", "跌倒、活動下降、住院與自理變化"]]
  }),
  "screening-funnel-chart.svg": flowChart({
    id: "screening-funnel", title: "肌少症篩檢到診斷流程", desc: "從日常警訊、小腿圍與問卷，到握力和肌肉量檢查。", eyebrow: "SCREEN, THEN CONFIRM", heading: "篩檢陽性不是確診，是提醒下一步", subheading: "先找風險，再由專業人員量肌力與肌肉量；不要獨自在家做高風險測試。", note: "小腿圍：男性小於 34 公分、女性小於 33 公分為常用亞洲篩檢門檻。",
    items: [["看到變化", "起身慢、提物難、走路慢或反覆跌倒"], ["簡易篩檢", "小腿圍、SARC-F 或長者功能評估"], ["量肌力", "標準化握力；必要時專業起立測試"], ["量肌肉", "BIA、DXA 或合適影像工具"], ["找原因", "營養、疾病、藥物、活動與居家風險"]]
  }),
  "awgs-diagnosis-chart.svg": splitChart({
    id: "awgs-diagnosis", title: "AWGS 2025 肌少症診斷核心", desc: "分開說明低肌力、低肌肉量與功能結果。", eyebrow: "AWGS 2025", heading: "低肌力 + 低肌肉量，才進入正式診斷", subheading: "亞洲 2025 共識把走路速度與起立表現視為功能結果，不再單獨取代握力。", note: "數值需依年齡、性別、儀器與測量方法解讀；請由受訓人員完成。",
    left: { label: "診斷核心｜兩項都低", items: ["肌力：標準化握力測量", "肌肉量：DXA、BIA、CT 或 MRI", "50–64 歲與 65 歲以上採分齡門檻"] },
    right: { label: "功能結果｜追蹤影響", items: ["五次坐站所需時間", "六公尺平常步速", "SPPB 與真實生活活動能力"] }
  }),
  "exercise-week-chart.svg": gridChart({
    id: "exercise-week", title: "肌少症一週運動配置", desc: "阻力、平衡、有氧、恢復與安全觀察的組合。", eyebrow: "MOVE WITH A PLAN", heading: "練肌力是主角，平衡與有氧一起補齊", subheading: "從做得到的量開始，品質優先；症狀與功能不同，處方也要不同。", note: "若近期胸痛、昏厥、急性病、未評估跌倒或疼痛，先由醫療／復健專業人員確認。",
    items: [["阻力訓練", "每週至少 2 天，主要肌群分次練"], ["平衡訓練", "靠近穩固支撐，逐步增加挑戰"], ["有氧活動", "走路或踩車，從短時間累積"], ["功能練習", "坐站、跨步、轉身與上下階"], ["恢復", "睡眠、餐食、補水與間隔"], ["漸進", "次數、阻力或組數一次只加一項"], ["安全", "胸痛、暈厥或新神經症狀立即停止"]]
  }),
  "nutrition-plate-chart.svg": gridChart({
    id: "nutrition-plate", title: "肌少症飲食七個重點", desc: "蛋白質、總熱量、三餐分配、質地與疾病調整。", eyebrow: "FOOD SUPPORTS TRAINING", heading: "蛋白質重要，但不能少了熱量與真正的餐", subheading: "先把每天吃得到、吞得下、消化得了的餐食安排好，再談補充品。", note: "腎臟病、肝病、吞嚥困難、糖尿病或近期體重下降者，請個別諮詢醫師與營養師。",
    items: [["足夠總量", "高齡者常以至少 1 g/kg/日作起點"], ["三餐分配", "不要把多數蛋白質集中在晚餐"], ["食物優先", "豆魚蛋肉奶輪替"], ["熱量要夠", "吃太少時蛋白質可能被拿來供能"], ["好咬好吞", "切碎、軟煮與適合的質地"], ["搭配運動", "阻力訓練是核心夥伴"], ["個別調整", "共病、體重與耐受度都要納入"]]
  }),
  "breakfast-builder-chart.svg": flowChart({
    id: "breakfast-builder", title: "肌力早餐組合公式", desc: "用主蛋白、主食、蔬果和飲品組成可執行早餐。", eyebrow: "BUILD A BETTER BREAKFAST", heading: "早餐不是只加一顆蛋，是把整餐補完整", subheading: "從長輩吃得習慣的食物開始，依牙口、吞嚥、血糖與腎功能調整。", note: "無糖豆漿、蛋、豆腐、魚、雞肉與乳品都可輪替；份量由營養需求決定。",
    items: [["選主蛋白", "蛋、豆腐、魚肉、乳品或無糖豆漿"], ["補主食", "粥飯、燕麥、地瓜或全穀吐司"], ["加蔬果", "選好咬、好吞、當季食材"], ["看質地", "乾硬、易碎或太黏者需調整"], ["記反應", "食量、嗆咳、脹氣與血糖一起看"]]
  }),
  "sarcopenic-obesity-chart.svg": splitChart({
    id: "sarcopenic-obesity", title: "肌少型肥胖處理方向", desc: "比較只追體重與同時保留肌肉功能的做法。", eyebrow: "FUNCTION OVER THE SCALE", heading: "體重正常或偏高，也可能同時低肌力", subheading: "重點不是快速變輕，而是降低多餘脂肪時保住肌肉、肌力與活動能力。", note: "高齡者減重應個別評估；避免極低熱量、只做有氧或快速節食。",
    left: { label: "容易踩雷", items: ["只看 BMI 或體重", "快速節食、蛋白質不足", "只走路、不做阻力訓練"] },
    right: { label: "較完整做法", items: ["量腰圍、肌力、肌肉量與功能", "溫和能量調整並維持蛋白質", "阻力、平衡與有氧搭配追蹤"] }
  }),
  "recovery-staircase-chart.svg": flowChart({
    id: "recovery-staircase", title: "住院後肌力恢復階梯", desc: "從醫療穩定、床椅活動到居家與社區的漸進恢復。", eyebrow: "RECOVER AFTER HOSPITAL", heading: "先恢復安全移動，再逐步加回生活量", subheading: "急性病與臥床會讓功能快速下降；返家計畫應同時處理活動、營養與環境。", note: "早期活動需在醫療穩定並依專業指示下進行；喘、胸痛、暈厥或新症狀立即停止。",
    items: [["醫療穩定", "確認生命徵象、疼痛與活動限制"], ["床椅活動", "翻身、坐起、移位與短站"], ["短距步行", "使用正確輔具與有人守護"], ["日常功能", "如廁、洗澡、穿衣與簡單家務"], ["社區回復", "門診復健、活動與定期追蹤"]]
  }),
  "fall-prevention-zones-chart.svg": gridChart({
    id: "fall-prevention-zones", title: "肌少症家庭防跌七區", desc: "檢查床邊、浴廁、通道、鞋子、藥物與夜間活動。", eyebrow: "FALL-PROOF THE ROUTE", heading: "先改每天會走的路，再增加更多設備", subheading: "防跌不是叫長輩不要動，而是讓他能在更安全的環境持續練力量與平衡。", note: "跌倒撞頭、無法承重、明顯變形或意識改變時，立即就醫。",
    items: [["床邊", "床高、夜燈、起身支撐"], ["浴廁", "止滑、扶手、洗澡椅"], ["通道", "收線、移地墊、加照明"], ["鞋與輔具", "合腳止滑、尺寸正確"], ["藥物", "頭暈、嗜睡與降壓藥回顧"], ["視聽", "眼鏡、助聽器與光線"], ["練功能", "坐站、轉身、跨步與平衡"]]
  }),
  "twelve-week-track-chart.svg": flowChart({
    id: "twelve-week-track", title: "肌少症 12 週追蹤路線", desc: "以基線、建立習慣、漸進、複測和延續安排追蹤。", eyebrow: "12-WEEK MUSCLE PLAN", heading: "不是追求速成，是讓每週都有可追蹤的進步", subheading: "固定少數指標，搭配運動、餐食與恢復；沒有改善時先找卡點，而不是硬加量。", note: "結果因疾病與起點不同；計畫需依醫療、復健與營養專業建議個別化。",
    items: [["第 0 週", "量基線：握力、坐站、步行與食量"], ["第 1–2 週", "建立固定時段與安全動作"], ["第 3–6 週", "逐步增加阻力、次數或組數"], ["第 7–10 週", "把力量接回家務與外出"], ["第 11–12 週", "複測、回顧卡點並安排下一階段"]]
  })
};

await Promise.all(outputs.map((output) => mkdir(output, { recursive: true })));
await Promise.all(Object.entries(charts).flatMap(([file, svg]) => outputs.map((output) => writeFile(join(output, file), svg, "utf8"))));

console.log(`Generated ${Object.keys(charts).length} sarcopenia charts in ${outputs.length} asset roots.`);
