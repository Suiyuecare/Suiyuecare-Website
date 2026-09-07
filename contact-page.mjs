const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

export const CONTACT_NEED_GROUPS = [
  ["照顧服務", ["長照服務諮詢", "居家照顧諮詢", "日間照顧諮詢", "社區據點諮詢", "護理復能諮詢"]],
  ["課程與招募", ["課程報名", "移工培訓諮詢", "教育品管諮詢", "人才招募"]],
  ["合作洽談", ["土地合作", "網站行銷合作", "軟體系統諮詢", "系統後台諮詢", "投資洽談", "合作洽談"]]
];

export function renderContactNeedOptions(selectedNeed = "長照服務諮詢") {
  const selected = selectedNeed || "長照服務諮詢";
  const knownNeeds = new Set(CONTACT_NEED_GROUPS.flatMap(([, options]) => options));
  const extraGroup = knownNeeds.has(selected) ? [] : [["其他", [selected]]];
  return [...CONTACT_NEED_GROUPS, ...extraGroup].map(([label, options]) => `
    <optgroup label="${escapeHtml(label)}">
      ${options.map((option) => `<option${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </optgroup>
  `).join("");
}

export function contactSubmissionErrorMessage(error) {
  const message = String(error?.message || "").trim();
  if (!message || /failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return "目前無法連線，填寫內容已保留。請稍後再試，或撥打 02-6604-5432 與我們聯繫。";
  }
  return message;
}

export function renderContactPage() {
  return `
    <div class="contact-page" data-public-contact-page>
      <section class="contact-page-layout" aria-labelledby="contact-page-title">
        <div class="contact-page-intro">
          <p class="eyebrow">Contact Us</p>
          <h1 id="contact-page-title">先說說你的需求，<br />一起確認下一步。</h1>
          <p>不必先弄清楚所有服務名稱。留下聯絡方式和目前需要的協助，歲悅會依需求安排合適窗口。</p>
          <a class="contact-phone-link" href="tel:0266045432"><span>直接電話諮詢</span><strong>02-6604-5432</strong></a>
          <p class="contact-email-link">也可以來信 <a href="mailto:generalaffairs@suiyuecare.com">generalaffairs@suiyuecare.com</a></p>
        </div>
        <form class="contact-form contact-page-form" id="contact-page-form" action="/api/send-email" method="POST" data-form-type="contact" aria-labelledby="contact-form-title" aria-describedby="contact-form-help">
          <div class="contact-form-intro"><h2 id="contact-form-title">留下聯絡方式</h2><p id="contact-form-help">姓名、電話與需求為必填；其他資訊可以之後再補充。</p></div>
          <input type="hidden" name="form_type" value="contact" />
          <input type="hidden" name="_subject" value="歲悅長照官網聯絡表單" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label>姓名（必填）<input type="text" name="姓名" placeholder="怎麼稱呼你" autocomplete="name" required /></label>
          <label>電話（必填）<input type="tel" name="電話" placeholder="可聯絡的電話" autocomplete="tel" inputmode="tel" required /></label>
          <label>需求（必填）<select name="需求" required>${renderContactNeedOptions()}</select></label>
          <label>Email（選填）<input type="email" name="Email" placeholder="填寫後可收到確認信" autocomplete="email" inputmode="email" /></label>
          <label class="form-notes">補充說明（選填）<textarea name="說明" rows="4" placeholder="可補充目前情況、所在地區或方便聯絡時間" aria-describedby="contact-sensitive-note"></textarea></label>
          <p class="form-expectation" id="contact-sensitive-note">請勿填寫身分證字號、完整病歷或其他敏感資料。</p>
          <p class="contact-form-status" role="status" aria-live="polite" hidden></p>
          <button type="submit">送出諮詢</button>
        </form>
      </section>
    </div>
  `;
}
