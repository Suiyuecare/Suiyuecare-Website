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

export const nursingFeeGroups = [
  {
    title: "護理復能與專業服務 CA／CB",
    note: "歲悅使用 CA07、CA08、CB01、CB02、CB03、CB04；實際服務依專業評估、照顧計畫與核定安排。",
    rows: nursingProfessionalCodes.filter((item) => nursingCodeSet.has(item.code))
  }
];
