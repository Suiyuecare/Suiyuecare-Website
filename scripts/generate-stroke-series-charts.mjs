import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputs = [
  "assets/health3/stroke-series",
  "public/assets/health3/stroke-series"
];

const c = {
  ink: "#3c1f0b",
  muted: "#725b4c",
  orange: "#f58a1f",
  orangeSoft: "#fff0de",
  teal: "#1595a8",
  tealSoft: "#e7f6f8",
  green: "#758d60",
  greenSoft: "#eef4e9",
  coral: "#d95f45",
  coralSoft: "#fce9e4",
  blue: "#4f77a8",
  blueSoft: "#eaf1fa",
  paper: "#fffaf3",
  white: "#ffffff",
  line: "#ead8bf"
};

const tones = [
  [c.orange, c.orangeSoft],
  [c.teal, c.tealSoft],
  [c.green, c.greenSoft],
  [c.blue, c.blueSoft],
  [c.coral, c.coralSoft]
];

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function estimatedTextWidth(text, size) {
  return [...String(text)].reduce((width, char) => {
    if (/\s/.test(char)) return width + size * 0.32;
    if (/[\x00-\x7F]/.test(char)) return width + size * 0.58;
    return width + size;
  }, 0);
}

function wrapText(text, maxWidth, size, maxLines = 6) {
  const tokens = String(text).match(/[A-Za-z0-9.&／/+\-]+\s*|./gu) || [];
  const result = [];
  let current = "";

  tokens.forEach((token) => {
    const candidate = `${current}${token}`.trimEnd();
    if (current && estimatedTextWidth(candidate, size) > maxWidth) {
      result.push(current.trim());
      current = token.trimStart();
      return;
    }
    current = `${current}${token}`;
  });
  if (current.trim()) result.push(current.trim());

  if (result.length <= maxLines) return result;
  const visible = result.slice(0, maxLines);
  visible[maxLines - 1] = `${visible[maxLines - 1].replace(/[，、。；：,.!?！？]?$/, "")}…`;
  return visible;
}

function textLines(x, y, values, { size = 20, gap = 30, fill = c.ink, weight = 750, anchor = "start" } = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="${size}" font-weight="${weight}">${values.map((value, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(value)}</tspan>`).join("")}</text>`;
}

function frame({ id, title, desc, eyebrow, heading, subheading, body, note }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">${esc(title)}</title>
  <desc id="${id}-desc">${esc(desc)}</desc>
  <rect width="1200" height="675" fill="${c.paper}"/>
  <rect width="18" height="675" fill="${c.orange}"/>
  <text x="64" y="62" fill="${c.orange}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="18" font-weight="850">${esc(eyebrow)}</text>
  <text x="64" y="112" fill="${c.ink}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="38" font-weight="900">${esc(heading)}</text>
  <text x="64" y="151" fill="${c.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="20" font-weight="650">${esc(subheading)}</text>
  ${body}
  <line x1="64" y1="620" x2="1136" y2="620" stroke="${c.line}" stroke-width="2"/>
  <text x="64" y="650" fill="${c.muted}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="16" font-weight="650">${esc(note)}</text>
</svg>`;
}

function card({ x, y, w, h, index, title, detail, tone = 0 }) {
  const [color, soft] = tones[tone % tones.length];
  const isNarrow = w <= 205;
  const titleSize = isNarrow ? 19 : 20;
  const detailSize = isNarrow ? 16 : 16;
  const titleX = isNarrow ? x + 24 : x + 78;
  const titleY = isNarrow ? y + 91 : y + 39;
  const titleWidth = isNarrow ? w - 44 : w - 104;
  const detailY = isNarrow ? y + 157 : y + 94;
  const detailWidth = w - 48;
  const detailLines = wrapText(detail, detailWidth, detailSize, isNarrow ? 5 : 3);
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c.white}" stroke="${c.line}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="8" height="${h}" rx="4" fill="${color}"/>
    <circle cx="${x + 42}" cy="${y + 42}" r="23" fill="${soft}"/>
    <text x="${x + 42}" y="${y + 50}" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="17" font-weight="900">${esc(index)}</text>
    ${textLines(titleX, titleY, wrapText(title, titleWidth, titleSize, 2), { size: titleSize, gap: 25, weight: 900 })}
    ${textLines(x + 24, detailY, detailLines, { size: detailSize, gap: 24, fill: c.muted, weight: 700 })}
  </g>`;
}

function arrow(x1, y1, x2, y2, color = c.orange) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/><polygon points="${x2},${y2} ${x2 - 13},${y2 - 8} ${x2 - 13},${y2 + 8}" fill="${color}"/>`;
}

function flowBody(items) {
  const width = items.length === 6 ? 164 : items.length === 5 ? 196 : 250;
  const gap = items.length === 6 ? 18 : items.length === 5 ? 22 : 24;
  return items.map((item, i) => {
    const x = 64 + i * (width + gap);
    const node = card({ x, y: 224, w: width, h: 300, index: String(i + 1).padStart(2, "0"), title: item[0], detail: item[1], tone: i });
    const connector = i < items.length - 1 ? arrow(x + width + 3, 374, x + width + gap - 4, 374, tones[i % tones.length][0]) : "";
    return node + connector;
  }).join("");
}

function flowChart(config) {
  return frame({ ...config, body: flowBody(config.items) });
}

function splitChart(config) {
  const left = config.left;
  const right = config.right;
  const side = (x, label, data, tone) => {
    const [color, soft] = tones[tone];
    return `<rect x="${x}" y="205" width="510" height="374" rx="8" fill="${soft}" stroke="${color}" stroke-width="2"/>
    <text x="${x + 255}" y="255" text-anchor="middle" fill="${color}" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="27" font-weight="900">${esc(label)}</text>
    ${data.map((item, index) => `<rect x="${x + 28}" y="${286 + index * 86}" width="454" height="66" rx="8" fill="${c.white}"/>${textLines(x + 50, 314 + index * 86, wrapText(item, 410, 17, 2), { size: 17, gap: 22, weight: 800 })}`).join("")}`;
  };
  return frame({ ...config, body: side(64, left.label, left.items, 1) + side(626, right.label, right.items, 4) });
}

function gridChart(config) {
  const positions = [[64, 205], [344, 205], [624, 205], [904, 205], [204, 400], [484, 400], [764, 400]];
  const body = config.items.map((item, index) => card({ x: positions[index][0], y: positions[index][1], w: 250, h: 166, index: String(index + 1).padStart(2, "0"), title: item[0], detail: item[1], tone: index })).join("");
  return frame({ ...config, body });
}

const charts = {
  "be-fast-chart.svg": flowChart({
    id: "be-fast", title: "B.E. FAST 中風辨識", desc: "六個中風辨識與立即求救步驟。", eyebrow: "STROKE WARNING SIGNS", heading: "B.E. FAST：任何一項突然異常，就打 119", subheading: "先辨識、記時間、叫救護車；不要等全部症狀出現。", note: "不要自行開車、餵食、喝水或服用阿斯匹靈；請記錄最後正常時間。",
    items: [["Balance 平衡", "突然站不穩、劇烈暈眩"], ["Eyes 眼睛", "突然看不清、複視或缺一塊"], ["Face 臉", "微笑時一邊嘴角垂下"], ["Arms 手臂", "雙手平舉時一邊掉下"], ["Speech 說話", "含糊、用錯字或聽不懂"], ["Time 時間", "立刻打 119 並記錄時間"]]
  }),
  "tia-timeline-chart.svg": flowChart({
    id: "tia-timeline", title: "TIA 處理時間軸", desc: "症狀短暫恢復後仍需急診、找病因與預防。", eyebrow: "TIA IS A WARNING", heading: "症狀恢復，不代表風險結束", subheading: "把短暫異常當成急症，愈早找出病因，愈能及早預防。", note: "不要等待隔天門診，也不要自行開始或加倍阿斯匹靈。",
    items: [["突然發作", "臉、手、說話、視力或平衡異常"], ["症狀恢復", "仍記錄開始、最嚴重與恢復時間"], ["立即急診", "神經檢查與腦部影像"], ["找出病因", "血管、心律、心臟與風險因子"], ["開始預防", "依病因用藥、追蹤與生活調整"]]
  }),
  "stroke-types-chart.svg": splitChart({
    id: "stroke-types", title: "缺血性與出血性中風比較", desc: "比較血管阻塞與血管破裂的原因、影像和治療方向。", eyebrow: "TWO STROKE TYPES", heading: "症狀可能相似，治療方向完全不同", subheading: "家中無法靠症狀分型；先做腦部影像，再由中風團隊決定治療。", note: "疑似中風先打 119；未確認類型前，不自行吃阿斯匹靈或停用原藥。",
    left: { label: "缺血性中風｜血管堵塞", items: ["腦部血流中斷", "CT 先排除出血，必要時 MRI／血管影像", "特定患者可評估溶栓或取栓"] },
    right: { label: "出血性中風｜血管破裂", items: ["血液進入腦組織或周邊", "CT 通常可快速看見出血", "控制擴大、逆轉抗凝、必要時手術評估"] }
  }),
  "prevention-wheel-chart.svg": gridChart({
    id: "prevention-wheel", title: "中風預防七個面向", desc: "從血壓、心律到生活習慣的七項預防行動。", eyebrow: "STROKE PREVENTION", heading: "不是只少吃油：七個風險要一起管理", subheading: "先找最高風險，逐項留下可量測、可回診、可持續的行動。", note: "治療目標依年齡、共病與藥物個別設定；不要自行停藥或追求過低數值。",
    items: [["血壓", "固定量測並帶趨勢回診"], ["心房顫動", "心電圖、風險評估與治療"], ["血糖", "避免長期過高也避免低血糖"], ["血脂", "依整體心血管風險治療"], ["戒菸", "使用戒菸門診與支持"], ["活動飲食", "規律活動、少鹽與原型食物"], ["睡眠", "打鼾喘醒與嗜睡需評估"]]
  }),
  "safe-eating-chart.svg": flowChart({
    id: "safe-eating", title: "中風吞嚥安全流程", desc: "餐前、餐中與餐後的吞嚥照顧流程。", eyebrow: "SAFE EATING AFTER STROKE", heading: "安全進食不是餵得慢，而是每一步都對", subheading: "質地、稠度與姿勢以個別評估為準；共同原則是清醒、坐好、少量、清潔。", note: "嗆咳、濕嗓、呼吸異常或意識變差時停止餵食並求助。",
    items: [["先評估", "未完成吞嚥篩檢前不口餵"], ["餐前", "確認清醒、呼吸與坐姿"], ["餐中", "符合質地、每口少量、慢慢吃"], ["遇警訊", "咳嗽、濕嗓、疲累立即停止"], ["餐後", "檢查殘留、維持坐姿、刷牙"]]
  }),
  "rehab-roadmap-chart.svg": flowChart({
    id: "rehab-roadmap", title: "中風復健路線圖", desc: "從急性住院、跨專業評估、復健到返家與社區參與。", eyebrow: "RECOVERY ROADMAP", heading: "復健不是一條直線，是持續評估與接回生活", subheading: "病況穩定後及早開始，依能力前進、停留或調整。", note: "不要拉扯無力側或勉強高強度活動；新神經症狀立刻打 119。",
    items: [["急性穩定", "先處理中風與併發症"], ["完整評估", "移位、吞嚥、溝通、認知與情緒"], ["功能訓練", "依個別目標逐步練習"], ["返家演練", "人力、環境、輔具與照顧方法"], ["社區生活", "回診、復健、角色與參與"]]
  }),
  "communication-ladder-chart.svg": flowChart({
    id: "communication-ladder", title: "中風後溝通階梯", desc: "從整理環境到短句、等待、替代溝通與確認。", eyebrow: "SUPPORTED COMMUNICATION", heading: "卡住時，不是一直重問，是換一種方法", subheading: "溝通成功比句子完美重要，也要保留當事人的選擇權。", note: "原本穩定卻突然說話或理解變差，應視為新中風警訊並立刻打 119。",
    items: [["整理環境", "關掉電視、面對面、確認眼鏡助聽器"], ["一句一事", "短而自然，不把成人當小孩"], ["留時間", "問完等待，不搶答"], ["換通道", "指圖、書寫、手勢或二選一"], ["重述確認", "說出你理解的意思，請對方確認"]]
  }),
  "home-safety-zones-chart.svg": gridChart({
    id: "home-safety", title: "中風返家安全區域", desc: "整理床邊、浴廁、用餐、出入口與照顧管理。", eyebrow: "HOME SAFETY ZONES", heading: "先顧每天必經的區域，再買更多設備", subheading: "用真實動線檢查高度、空間、照明、輔具與照顧人力。", note: "輔具需配合身高、能力與環境；家屬應在專業人員監督下實際演練。",
    items: [["床邊", "床椅高度、煞車、夜燈與呼叫"], ["浴廁", "止滑、扶手、洗澡椅與轉身空間"], ["用餐", "坐姿、吞嚥指示與口腔清潔"], ["出入口", "門寬、門檻、輪椅與交通"], ["藥物", "只留一份最新版藥單"], ["皮膚排泄", "每日觀察、減壓與乾爽"], ["照顧人力", "移位演練、替班與緊急備援"]]
  }),
  "secondary-prevention-chart.svg": flowChart({
    id: "secondary-prevention", title: "預防再次中風四條防線", desc: "病因、藥物、風險管理與回診警訊的二級預防。", eyebrow: "PREVENT ANOTHER STROKE", heading: "先找病因，再把治療變成不漏接的日常", subheading: "每次回診都確認目前病因、藥物、檢查與生活目標是否需要更新。", note: "任何新神經症狀立刻打 119；不要自行停藥、加倍或加入阿斯匹靈。",
    items: [["確認病因", "血管、心律、小血管或其他原因"], ["用藥正確", "抗血小板或抗凝依病因選擇"], ["管理風險", "血壓、血糖、血脂、戒菸與睡眠"], ["完成追蹤", "檢查、回診、復健與唯一藥單"]]
  }),
  "emotion-energy-chart.svg": splitChart({
    id: "emotion-energy", title: "中風後情緒與能量觀察", desc: "區分可先調整的黃燈與需立即求助的紅燈。", eyebrow: "MOOD & ENERGY CHECK", heading: "情緒與疲勞也是中風照顧的一部分", subheading: "先看持續時間、生活影響與安全，再決定調整節奏或立即求助。", note: "有自傷、他傷想法或計畫時不獨處，移開危險物並立即聯絡 119 或就近急診。",
    left: { label: "黃燈｜安排評估與調整", items: ["低落、失去興趣持續兩週", "疲勞影響復健、用藥或進食", "照顧者長期失眠、疼痛或易怒"] },
    right: { label: "紅燈｜立即求助", items: ["自傷、他傷想法或已準備計畫", "突然混亂、說話或肢體劇變", "攻擊失控、無法維持人身安全"] }
  })
};

await Promise.all(outputs.map((output) => mkdir(output, { recursive: true })));
await Promise.all(Object.entries(charts).flatMap(([file, svg]) => outputs.map((output) => writeFile(join(output, file), svg, "utf8"))));

console.log(`Generated ${Object.keys(charts).length} stroke charts in ${outputs.length} asset roots.`);
