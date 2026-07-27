const feeCode = (code, name, content, price, remotePrice, note = "") => ({ code, name, content, price, remotePrice, note });

const homeCareBaCodes = [
  feeCode("BA01", "基本身體清潔", "梳頭修面、穿脫衣服、床上擦澡、床上洗頭、排泄物清理；原則一日一組合，必要時早晚各一次。", "260", "310", "同一時段不可併 BA07、BA23。"),
  feeCode("BA02", "基本日常照顧", "翻身、移位、上下床、刷牙洗臉、如廁、更換尿片、用藥協助、整理床單等基本日常生活協助。", "195", "235", "每 30 分鐘一單位，一日限 3 小時。"),
  feeCode("BA03", "測量生命徵象", "因疾病需要監測血壓、體溫、脈搏及呼吸，並記錄異常轉知家屬與個管。", "35", "40", "不含服務前後的一般觀察。"),
  feeCode("BA04", "協助進食或管灌餵食", "準備進食環境、加熱飯菜、餐具準備、協助餵食或灌食、觀察進食量與反應。", "130", "155", "一餐為一組合。"),
  feeCode("BA05", "餐食照顧", "在案家備餐與善後，或準備一日所需管灌飲食與清潔。", "310", "370", "同住個案共同使用時擇一扣額度。"),
  feeCode("BA07", "協助沐浴及洗頭", "協助至浴間、穿脫衣服、全身淋浴、坐浴或盆浴、洗頭、排泄物清理與浴間整理。", "325", "385", "已包含 BA01、BA23，同一時段不可併計。"),
  feeCode("BA08", "足部照護", "評估趾甲與足部皮膚、修剪趾甲、處理長繭、足部按摩保養與必要轉介。", "500", "600", "限糖尿病且符合足部/皮膚/傷口問題者。"),
  feeCode("BA11", "肢體關節活動", "上肢、下肢被動運動，或督促長照給付對象進行主動運動或站立練習。", "195", "235", "完整實施一次為一單位。"),
  feeCode("BA12", "協助上（下）樓梯", "協助上（下）樓梯、協助輪椅搬運上（下）樓梯，含住家內及二樓以上家門口至一樓。", "130", "155", "限移位或上下樓梯問題；不適用電梯、爬梯機、樓梯升降椅。"),
  feeCode("BA13", "陪同外出", "安排外出工具、陪同外出與注意安全；外出目的含購物、社交、宗教、用餐、散步、復健或透析等。", "195", "235", "每 30 分鐘一單位；不含交通工具費。"),
  feeCode("BA14", "陪同就醫", "協助掛號、就診準備、陪同就診、聽取與轉知醫囑。", "685", "825", "自案家出門起算 1.5 小時內；超過可依 BA13 計。"),
  feeCode("BA15", "家務協助", "依獨居或非獨居身分，協助主要生活空間清理、衣物洗滌、晾曬、熨燙與簡單縫補。", "195", "235", "每 30 分鐘一單位；共用區域部分可能需自費 50%。"),
  feeCode("BA16", "代購或代領或代送服務", "代購餐食、食材、生活用品、藥品、郵寄、補助品、衣物床單送洗或必要事項。", "130", "155", "自案家出門 5 公里內；超過費用自負。"),
  feeCode("BA17a", "人工氣道管內分泌物抽吸", "人工氣道管內分泌物清潔、抽吸、移除與氣切造口簡易照顧。", "75", "90", "一日原則限 3 組合。"),
  feeCode("BA17b", "口腔內分泌物抽吸", "口腔內（懸壅垂之前）分泌物清潔、抽吸與移除。", "65", "80", "一日原則限 3 組合。"),
  feeCode("BA17c", "尿管及鼻胃管清潔與固定", "尿管清潔、尿管固定膠布更換、鼻部清潔、確認鼻胃管位置與固定膠布更換。", "50", "60", "每週原則限 7 組合。"),
  feeCode("BA17d1", "血糖機驗血糖", "攜帶式血糖機驗血糖。", "50", "60", "每日原則限 1 組合。"),
  feeCode("BA17d2", "甘油球通便", "依需求提供甘油球通便。", "50", "60", "每週原則限 3 組合，特殊需求需專案核定。"),
  feeCode("BA17e", "依指示置入藥盒", "依照藥袋指示置入藥盒。", "50", "60", "每週原則限 1 組合。"),
  feeCode("BA18", "安全看視", "到案家陪伴、支持、看視注意安全並留意異常狀況。", "200", "240", "每 30 分鐘一單位；限心智障礙者。"),
  feeCode("BA20", "陪伴服務", "到案家陪伴看視、日常生活參與，或讀紙本、電子新聞或書信。", "175", "210", "每 30 分鐘一單位。"),
  feeCode("BA22", "巡視服務", "上午六點至晚上八點至案家探視並進行簡易協助，至少三次。", "130", "160", "不得搭配其他照顧組合。"),
  feeCode("BA23", "協助洗頭", "協助移位或引導至浴間、穿脫衣服、洗頭、局部清潔與環境整理。", "200", "240", "同一時段不可併 BA01、BA07。"),
  feeCode("BA24", "協助排泄", "協助移位或引導至浴間，支持大小便、處理汗痰嘔吐物、尿袋更換、造廔袋清理與失禁處理。", "220", "265", "執行 BA01 或 BA07 過程中同時執行不得併計。")
];

const dayCareBbCodes = [
  feeCode("BB01", "日間照顧（全日）--第一型", "生活照顧、健康促進、文康休閒活動、家屬指導諮詢與備餐；適用長照第 2 級。", "675", "810"),
  feeCode("BB02", "日間照顧（半日）--第一型", "半日生活照顧、健康促進、文康活動、家屬諮詢與備餐；適用長照第 2 級。", "340", "405", "同日不得申請二次。"),
  feeCode("BB03", "日間照顧（全日）--第二型", "全日日照服務；適用長照第 3 級。", "840", "1,005"),
  feeCode("BB04", "日間照顧（半日）--第二型", "半日日照服務；適用長照第 3 級。", "420", "505", "同日不得申請二次。"),
  feeCode("BB05", "日間照顧（全日）--第三型", "全日日照服務；適用長照第 4 級。", "920", "1,105"),
  feeCode("BB06", "日間照顧（半日）--第三型", "半日日照服務；適用長照第 4 級。", "460", "555", "同日不得申請二次。"),
  feeCode("BB07", "日間照顧（全日）--第四型", "全日日照服務；適用長照第 5 級。", "1,045", "1,255"),
  feeCode("BB08", "日間照顧（半日）--第四型", "半日日照服務；適用長照第 5 級。", "525", "630", "同日不得申請二次。"),
  feeCode("BB09", "日間照顧（全日）--第五型", "全日日照服務；適用長照第 6 級。", "1,130", "1,355"),
  feeCode("BB10", "日間照顧（半日）--第五型", "半日日照服務；適用長照第 6 級。", "565", "680", "同日不得申請二次。"),
  feeCode("BB11", "日間照顧（全日）--第六型", "全日日照服務；適用長照第 7 級。", "1,210", "1,450"),
  feeCode("BB12", "日間照顧（半日）--第六型", "半日日照服務；適用長照第 7 級。", "605", "725", "同日不得申請二次。"),
  feeCode("BB13", "日間照顧（全日）--第七型", "全日日照服務；適用長照第 8 級。", "1,285", "1,540"),
  feeCode("BB14", "日間照顧（半日）--第七型", "半日日照服務；適用長照第 8 級。", "645", "770", "同日不得申請二次。")
];

const dayCareBdCodes = [
  feeCode("BD01", "社區式協助沐浴", "於日間照顧中心（含小規模多機能）或托顧家庭浴間，協助或引導沐浴、洗頭、刷牙洗臉與浴間清理。", "200", "240"),
  feeCode("BD02", "社區式晚餐", "準備晚餐、協助進食或餵食，以及飯後口腔清潔。", "150", "180"),
  feeCode("BD03", "社區式服務交通接送", "接送居家至日照中心、小規模多機能、托顧家庭、巷弄長照站、文化健康站、失智據點等。", "115", "140", "以一趟為單位；10 公里內適用。")
];

const professionalCareCodes = [
  feeCode("CA07", "IADLs 復能、ADLs 復能照護", "評估並與個案及家屬討論 IADLs、ADLs 復能項目，擬訂復能計畫、指導措施及記錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  feeCode("CA08", "個別化服務計畫（ISP）擬定與執行", "針對慢性精神病、自閉症、智能障礙、失智症等，評估生活自理、人際社交、休閒、健康促進與社區適應。", "6,000", "7,200", "四次措施（含評估與 ISP）為一單位。"),
  feeCode("CB01", "營養照護", "評估、觀察與確認營養照護需求，提供指導措施、轉介必要醫療處置與紀錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  feeCode("CB02", "進食與吞嚥照護", "評估進食與吞嚥需求，提供指導措施、必要醫療轉介與紀錄。", "9,000", "10,800", "六次措施（含評估）為一單位。"),
  feeCode("CB03", "困擾行為照護", "評估困擾行為照護需求，提供指導措施、必要醫療轉介與紀錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  feeCode("CB04", "臥床或長期活動受限照護", "評估臥床或長期活動受限照護需求，提供指導措施、必要醫療轉介與紀錄。", "9,000", "10,800", "六次措施（含評估）為一單位。")
];

const nursingProfessionalCodeSet = new Set(["CA07", "CA08", "CB01", "CB02", "CB03", "CB04"]);

const respiteCodes = [
  feeCode("GA03", "日間照顧中心喘息服務--全日", "至日間照顧中心接受照顧、停留，含護理照護、協助沐浴、進食、服藥、活動安排與交通接送。", "1,250", "1,500"),
  feeCode("GA04", "日間照顧中心喘息服務--半日", "半日至日間照顧中心接受照顧、停留，含護理照護、協助沐浴、進食、服藥、活動安排與交通接送。", "625", "750"),
  feeCode("GA05", "機構住宿式喘息服務", "至住宿式長照機構接受 24 小時短暫照顧，含護理照護、沐浴、進食、服藥、活動安排與交通接送。", "2,310", "2,775"),
  feeCode("GA06", "小規模多機能服務--夜間喘息", "夜間至小規模多機能中心，接受生活照顧、沐浴、進食、服藥、活動安排、住宿與接送。", "2,000", "2,400"),
  feeCode("GA07", "巷弄長照站喘息服務", "至巷弄長照站接受照顧、停留，包含進食、服藥、活動安排及相關服務。", "170", "205", "以小時為單位。"),
  feeCode("GA09", "居家喘息服務", "照顧服務員到宅提供身體照顧，含如廁、沐浴、換衣、口腔清潔、進食、服藥、翻身、拍背、關節活動、上下床與陪同運動。", "770", "925", "每 2 小時一單位，單日居家喘息以 10 小時為上限。")
];

const shortCareCodes = [
  feeCode("SC03", "日間照顧中心短照服務（全日）", "至日間照顧中心接受照顧、停留，含護理照護、協助沐浴、進食、服藥、活動安排與交通接送。", "1,250", "1,500", "一般區補助金額依身分別為 1,250／1,188／1,050。"),
  feeCode("SC04", "日間照顧中心短照服務（半日）", "半日至日間照顧中心接受照顧、停留，含護理照護、協助沐浴、進食、服藥、活動安排與交通接送。", "625", "750", "一般區補助金額依身分別為 625／594／525。"),
  feeCode("SC05", "機構住宿式短照服務", "至住宿式長照機構接受 24 小時短暫照顧，含護理照護、沐浴、進食、服藥、活動安排與交通接送。", "2,310", "2,775", "一般區補助金額依身分別為 2,310／2,195／1,941。"),
  feeCode("SC06", "小規模多機能服務（夜間短照）", "夜間至小規模多機能中心，接受生活照顧、沐浴、進食、服藥、活動安排、住宿與接送。", "2,000", "2,400", "一般區補助金額依身分別為 2,000／1,900／1,680。"),
  feeCode("SC07", "巷弄長照站短照服務", "至巷弄長照站接受照顧、停留，包含進食、服藥、活動安排及相關服務。", "170", "205", "以 1 小時為單位；一般區補助金額依身分別為 170／162／143。"),
  feeCode("SC09", "居家短照服務", "受訓照顧服務員到宅提供如廁、沐浴、換衣、口腔清潔、進食、服藥、翻身、拍背、關節活動、上下床、陪同運動與輔具使用協助。", "770", "925", "每 2 小時一單位，單日居家短照以 10 小時為上限；一般區補助金額依身分別為 770／732／647。")
];

export function serviceFeeGroups(slug) {
  if (slug === "home-care") {
    return [
      { title: "居家照顧 BA 碼", note: "列出歲悅居家照顧常用 BA 服務碼；未提供之項目不列入本表。", rows: homeCareBaCodes },
      { title: "居家喘息與短照 GA09/SC09", note: "GA09 為居家喘息服務，SC09 為聘有外籍家庭看護工家庭的居家短照服務；皆以 2 小時為一單位。", rows: respiteCodes.filter((item) => item.code === "GA09").concat(shortCareCodes.filter((item) => item.code === "SC09")) }
    ];
  }
  if (slug === "day-care") {
    return [
      { title: "日間照顧 BB 碼", note: "BB01-BB14 依 CMS 第 2-8 級分全日、半日計價。", rows: dayCareBbCodes },
      { title: "日照附加 BD 碼", note: "BD01-BD03 為社區式服務常見附加項目，實際使用仍需核定與中心安排。", rows: dayCareBdCodes },
      { title: "喘息與短照 GA/SC", note: "日照中心常用 GA03/GA04、SC03/SC04。", rows: respiteCodes.filter((item) => ["GA03", "GA04"].includes(item.code)).concat(shortCareCodes.filter((item) => ["SC03", "SC04"].includes(item.code))) }
    ];
  }
  if (slug === "nursing") {
    return [
      { title: "護理復能與專業服務 CA/CB", note: "CA/CB 屬照顧及專業服務額度，需依專業評估、照顧計畫與服務完成指標安排。", rows: professionalCareCodes.filter((item) => nursingProfessionalCodeSet.has(item.code)) }
    ];
  }
  return [];
}
const feeHouseholds = [
  { value: "general", label: "我是一般戶", rate: 0.16, rateLabel: "16%" },
  { value: "mid-low", label: "我是中低收入戶", rate: 0.05, rateLabel: "5%" },
  { value: "low", label: "我是低收入戶", rate: 0, rateLabel: "0%" }
];

const escapeFeeHTML = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const cmsAllowanceLevels = [
  { level: 1, care: "不納入給付", respite: "不適用", shortCare: "不適用" },
  { level: 2, care: "10,020", respite: "32,340", shortCare: "87,780" },
  { level: 3, care: "15,460", respite: "32,340", shortCare: "87,780" },
  { level: 4, care: "18,580", respite: "32,340", shortCare: "87,780" },
  { level: 5, care: "24,100", respite: "32,340", shortCare: "87,780" },
  { level: 6, care: "28,070", respite: "32,340", shortCare: "87,780" },
  { level: 7, care: "32,090", respite: "48,510", shortCare: "71,610" },
  { level: 8, care: "36,180", respite: "48,510", shortCare: "71,610" }
];

function renderCmsAllowanceTable(slug) {
  const includeRespite = slug === "home-care" || slug === "day-care";
  const includeShortCare = slug === "home-care" || slug === "day-care";
  return `
    <div class="fee-allowance-table-wrap" role="region" aria-label="CMS 等級給付額度表" tabindex="0">
      <table class="fee-allowance-table">
        <thead>
          <tr>
            <th scope="col">CMS 等級</th>
            <th scope="col">照顧及專業服務（月）</th>
            ${includeRespite ? `<th scope="col">喘息服務 G 碼（年）</th>` : ""}
            ${includeShortCare ? `<th scope="col">短照服務 SC 碼（年）</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${cmsAllowanceLevels.map((item) => `
            <tr>
              <th scope="row">第 ${item.level} 級</th>
              <td>${escapeFeeHTML(item.care)}${item.level === 1 ? "" : " 元"}</td>
              ${includeRespite ? `<td>${escapeFeeHTML(item.respite)}${item.level === 1 ? "" : " 元"}</td>` : ""}
              ${includeShortCare ? `<td>${escapeFeeHTML(item.shortCare)}${item.level === 1 ? "" : " 元"}</td>` : ""}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderFeeAllowanceCard(slug) {
  return `
    <article class="fee-allowance-card">
      <div>
        <p class="eyebrow">CMS Wallet</p>
        <h3>CMS 第 1-8 級可用額度</h3>
        <p>第 1 級不納入長照給付；第 2-8 級依核定額度補助。超過核定額度、非核定項目或家庭額外加購服務，皆採自費。</p>
      </div>
      ${renderCmsAllowanceTable(slug)}
    </article>
  `;
}

function numericFee(price = "") {
  const normalized = String(price).replaceAll(",", "").trim();
  return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : null;
}

export function calculateFeeCopay(price, rate = 0.16) {
  const amount = numericFee(price);
  return amount === null ? "依核定" : `${Math.floor(amount * rate).toLocaleString("zh-TW")} 元`;
}

function copayCellMarkup(price, household = feeHouseholds[0]) {
  const amount = calculateFeeCopay(price, household.rate);
  const formula = numericFee(price) === null
    ? "實際金額需依核定"
    : `${price} × ${household.rateLabel}`;
  return `<td class="fee-copay-cell" data-fee-base-price="${escapeFeeHTML(price)}"><strong data-fee-copay-amount>${escapeFeeHTML(amount)}</strong><small data-fee-copay-formula>${escapeFeeHTML(formula)}</small></td>`;
}

function feeCodeTableMarkup(rows = [], withCopay = false) {
  const household = feeHouseholds[0];
  return `
    <div class="fee-code-table-wrap" role="region" aria-label="長照服務碼表" tabindex="0">
      <table class="fee-code-table">
        <thead><tr><th scope="col">碼別</th><th scope="col">項目</th><th scope="col">內容／單位</th><th scope="col">一般價格</th><th scope="col">${withCopay ? "自付額" : "原民區或離島"}</th><th scope="col">備註</th></tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <th scope="row">${escapeFeeHTML(row.code)}</th>
            <td>${escapeFeeHTML(row.name)}</td>
            <td>${escapeFeeHTML(row.content)}</td>
            <td>${escapeFeeHTML(row.price)}${/^[0-9,]+$/.test(row.price) ? " 元" : ""}</td>
            ${withCopay ? copayCellMarkup(row.price, household) : `<td>${escapeFeeHTML(row.remotePrice)}${/^[0-9,]+$/.test(row.remotePrice) ? " 元" : ""}</td>`}
            <td>${escapeFeeHTML(row.note || "依照顧計畫與照管中心核定。")}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function householdPickerMarkup() {
  return `
    <div class="fee-household-picker" data-fee-household-picker role="radiogroup" aria-labelledby="fee-household-title">
      <strong class="fee-household-title" id="fee-household-title">先選擇您的補助身分</strong>
      <div class="fee-household-options">
        ${feeHouseholds.map((item, index) => `<label><input type="radio" name="fee-household" value="${item.value}"${index === 0 ? " checked" : ""}><span>${item.label}<small>自付 ${item.rateLabel}</small></span></label>`).join("")}
      </div>
      <output data-fee-copay-status aria-live="polite">目前顯示：一般戶，自付一般價格的 16%</output>
    </div>`;
}

export function renderFeeCodeGroups(groups = [], withCopay = false, includePicker = true) {
  return `${withCopay && includePicker ? householdPickerMarkup() : ""}${groups.map((group, index) => `
    <details class="fee-code-group" ${index === 0 ? "open" : ""}>
      <summary><span>${escapeFeeHTML(group.title)}</span><small>${escapeFeeHTML(group.note || "")}</small></summary>
      ${feeCodeTableMarkup(group.rows, withCopay)}
    </details>`).join("")}`;
}

export function bindFeeCopayPicker(root) {
  const picker = root?.querySelector?.("[data-fee-household-picker]");
  if (!picker || picker.dataset.bound === "true") return;
  picker.dataset.bound = "true";
  const status = picker.querySelector("[data-fee-copay-status]");
  picker.addEventListener("change", (event) => {
    const input = event.target.closest('input[name="fee-household"]');
    if (!input) return;
    const household = feeHouseholds.find((item) => item.value === input.value) || feeHouseholds[0];
    root.querySelectorAll("[data-fee-base-price]").forEach((cell) => {
      const price = cell.dataset.feeBasePrice || "";
      cell.querySelector("[data-fee-copay-amount]").textContent = calculateFeeCopay(price, household.rate);
      cell.querySelector("[data-fee-copay-formula]").textContent = numericFee(price) === null ? "實際金額需依核定" : `${price} × ${household.rateLabel}`;
    });
    if (status) status.textContent = `目前顯示：${household.label.replace("我是", "")}，自付一般價格的 ${household.rateLabel}`;
  });
}
