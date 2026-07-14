import { nursingIdentityFieldMarkup, nursingServiceSectionMarkup } from "./nursing-services.js";
export { nursingIdentityFieldMarkup, nursingServiceSectionMarkup };

const fee = (code, name, content, price, remotePrice, note = "") => ({ code, name, content, price, remotePrice, note });

const nursingProfessionalCodes = [
  fee("CA07", "IADLs 復能、ADLs 復能照護", "評估並與個案及家屬討論 IADLs、ADLs 復能項目，擬訂復能計畫、指導措施及記錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  fee("CA08", "個別化服務計畫（ISP）擬定與執行", "針對慢性精神病、自閉症、智能障礙、失智症等，評估生活自理、人際社交、休閒、健康促進與社區適應。", "6,000", "7,200", "四次措施（含評估與 ISP）為一單位。"),
  fee("CB01", "營養照護", "評估、觀察與確認營養照護需求，提供指導措施、轉介必要醫療處置與紀錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  fee("CB02", "進食與吞嚥照護", "評估進食與吞嚥需求，提供指導措施、必要醫療轉介與紀錄。", "9,000", "10,800", "六次措施（含評估）為一單位。"),
  fee("CB03", "困擾行為照護", "評估困擾行為照護需求，提供指導措施、必要醫療轉介與紀錄。", "4,500", "5,400", "三次措施（含評估）為一單位。"),
  fee("CB04", "臥床或長期活動受限照護", "評估臥床或長期活動受限照護需求，提供指導措施、必要醫療轉介與紀錄。", "9,000", "10,800", "六次措施（含評估）為一單位。")
];

const nursingCodeSet = new Set(["CA07", "CA08", "CB01", "CB02", "CB03", "CB04"]);
const nursingHouseholds = {
  general: { label: "一般戶", rate: 0.16 },
  "mid-low": { label: "中低收入戶", rate: 0.05 },
  low: { label: "低收入戶", rate: 0 }
};

function nursingCopay(price, rate) {
  return `${Math.round(Number(price.replaceAll(",", "")) * rate).toLocaleString("zh-TW")} 元`;
}

export const nursingFeeGroups = [
  {
    title: "護理復能與專業服務 CA／CB",
    note: "歲悅使用 CA07、CA08、CB01、CB02、CB03、CB04；實際服務依專業評估、照顧計畫與核定安排。",
    rows: nursingProfessionalCodes.filter((item) => nursingCodeSet.has(item.code))
  }
];

export const nursingFeeGroupsMarkup = nursingFeeGroups.map((group, index) => `
  <details class="fee-code-group" ${index === 0 ? "open" : ""}>
    <summary><span>${group.title}</span><small>${group.note}</small></summary>
    <div class="fee-code-table-wrap">
      <table class="fee-code-table">
        <thead><tr><th scope="col">碼別</th><th scope="col">項目</th><th scope="col">內容／單位</th><th scope="col">一般價格</th><th scope="col">自負額</th><th scope="col">備註</th></tr></thead>
        <tbody>${group.rows.map((row) => `<tr><th scope="row">${row.code}</th><td>${row.name}</td><td>${row.content}</td><td>${row.price} 元</td><td class="fee-copay-cell" data-nursing-price="${row.price}"><strong>${nursingCopay(row.price, nursingHouseholds.general.rate)}</strong><small>一般戶 16%</small></td><td>${row.note || "依照顧計畫與照管中心核定。"}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  </details>
`).join("");

const nursingHouseholdPickerMarkup = `
  <div class="fee-household-picker" data-nursing-household-picker role="radiogroup" aria-labelledby="nursing-fee-household-title">
    <strong class="fee-household-title" id="nursing-fee-household-title">先選擇您的補助身分</strong>
    <div class="fee-household-options">
      <label><input type="radio" name="nursing-fee-household" value="general" checked><span>一般戶<small>自付 16%</small></span></label>
      <label><input type="radio" name="nursing-fee-household" value="mid-low"><span>中低收入戶<small>自付 5%</small></span></label>
      <label><input type="radio" name="nursing-fee-household" value="low"><span>低收入戶<small>自付 0%</small></span></label>
    </div>
    <output data-nursing-copay-status aria-live="polite">目前顯示：一般戶，自付一般價格的 16%</output>
  </div>`;

function bindNursingHouseholdPicker(root) {
  const picker = root.querySelector("[data-nursing-household-picker]");
  if (!picker) return;
  picker.addEventListener("change", (event) => {
    const household = nursingHouseholds[event.target.value];
    if (!household) return;
    root.querySelectorAll("[data-nursing-price]").forEach((cell) => {
      cell.querySelector("strong").textContent = nursingCopay(cell.dataset.nursingPrice, household.rate);
      cell.querySelector("small").textContent = `${household.label} ${Math.round(household.rate * 100)}%`;
    });
    picker.querySelector("output").textContent = `目前顯示：${household.label}，自付一般價格的 ${Math.round(household.rate * 100)}%`;
  });
}

export function hydrateNursingPage(root) {
  const fragment = (markup) => document.createRange().createContextualFragment(markup);
  root.querySelector("[data-ns]")?.replaceWith(fragment(nursingServiceSectionMarkup));
  root.querySelector("[data-ni]")?.replaceWith(fragment(nursingIdentityFieldMarkup));
  const fees = root.querySelector("[data-nursing-fee-groups]");
  if (fees) {
    fees.innerHTML = nursingHouseholdPickerMarkup + nursingFeeGroupsMarkup;
    bindNursingHouseholdPicker(root);
  }
}
