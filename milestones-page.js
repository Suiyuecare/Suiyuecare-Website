const fallbackTimeline = [
  ["2025", "06", "成立臺北市歲悅居家長照機構", "成立", "士林、北投、南港區居家長照服務啟動，建立到宅照顧、督導管理與家庭支持的服務基礎。", "/assets/milestones/homecare-agency-launch.jpg", "已完成"],
  ["2025", "10", "得標高雄市家庭看護工作補充訓練計畫", "得標", "得標高雄市政府勞工局 115 年度「外國人從事家庭看護工作補充訓練計畫」，推動家庭看護照顧技能訓練。", "/assets/milestones/kaohsiung-caregiver-training.jpg", "已完成"],
  ["2025", "12", "設立臺北市歲悅社區長照機構萬華一館", "設立", "萬華一館完成設立，作為社區長照服務的重要起點，提供長輩日間支持與家屬照顧資源。", "/assets/milestones/wanhua-community-care-one.jpg", "已完成"],
  ["2025", "12", "第一版官方網站上線", "上線", "第一版官方網站完成上線，建立品牌資訊、服務介紹與聯絡入口，讓家庭能更快了解歲悅服務。", "/assets/milestones/official-website-v1-launch.jpg", "已完成"],
  ["2026", "02", "得標勞動部移工數位學習計畫", "得標", "得標勞動部勞動力發展署 115-116 年度「移工數位學習計劃」，推動移工照顧技能數位化學習。", "/assets/milestones/migrant-digital-learning.jpg", "已完成"],
  ["2026", "03", "參與 Team Taipei 挺就業青年畢業啟航", "參與", "參與臺北市勞工局 115 年度 Team Taipei 挺就業-青年畢業啟航，與青年人才交流長照職涯與服務現場。", "/assets/milestones/youth-employment-event.jpg", "已完成"],
  ["2026", "04", "歲悅商標註冊完成", "註冊", "歲悅商標於 115 年 4 月 16 日完成註冊，涵蓋養老院、日間托老服務與居家看護服務等類別，讓品牌服務識別更完整。", "/assets/milestones/trademark-registration.jpg", "已完成"],
  ["2026", "04", "得標臺北市雇主安心計畫集中訓練", "得標", "得標臺北市勞動力重建運用處 115 年度「雇主安心計畫-集中訓練」，協助家庭雇主與看護工作者提升照顧品質。", "/assets/milestones/employer-training.jpg", "已完成"],
  ["2026", "05", "歲悅長照系統會計模組上線", "上線", "會計模組正式上線，串接財務、行政與照顧營運資料，強化內部管理與服務紀錄銜接。", "/assets/milestones/accounting-module.jpg", "已完成"],
  ["2026", "06", "設立臺北市歲悅社區長照機構萬華二館", "設立", "萬華二館完成設立，延伸社區長照服務量能，讓臺北市西區家庭有更多在地支持。", "/assets/milestones/wanhua-community-care-two.jpg", "已完成"],
  ["2026", "06", "得標臺北市失智社區服務據點", "得標", "得標士林、大同、信義區失智社區服務據點，提供失智友善活動、家屬諮詢與社區支持。", "/assets/milestones/dementia-community-point.jpg", "已完成"],
  ["2026", "06", "第二版官方網站上線", "上線", "第二版官方網站完成上線，優化服務動線、內容架構與視覺呈現，讓使用者更清楚找到所需資訊。", "/assets/milestones/official-website-v2-launch.jpg", "已完成"],
  ["2026", "07", "併購新北市愛無限居家長照機構與好窩居家職能治療所", "併購", "整合新店、中和、永和居家照顧服務，並納入復能與個案管理專業，擴大新北照顧服務網絡。", "/assets/milestones/newtaipei-integration.jpg", "已完成"],
  ["2026", "08", "歲悅長照系統專案管理模組上線", "上線", "專案管理模組正式上線，協助照顧服務、政府計畫、內部任務與跨部門進度更清楚被追蹤。", "/assets/milestones/project-management-module.jpg", "已完成"],
  ["2026", "08", "歲悅長照系統電子用印模組上線", "上線", "電子用印模組導入行政流程，讓文件申請、核准、用印與紀錄留存更有效率。", "/assets/milestones/e-seal-module.jpg", "已完成"]
].map(([year, month, title, tag, copy, image, status], index) => ({
  id: `fallback-${index + 1}`,
  year,
  month,
  title,
  tag,
  copy,
  image,
  status,
  sortOrder: index * 10
}));

const milestonesHeroImage = "/assets/milestones/milestones-team-care-planning-hero-v2.jpg";

export function renderMilestonesPage(milestoneEntries, helpers) {
  const { escapeHTML, heroImageForViewport, contentImageUrl, fallbackImage } = helpers;
  const timeline = Array.isArray(milestoneEntries) ? milestoneEntries : fallbackTimeline;
  const sortedTimeline = [...timeline].sort((a, b) =>
    Number(b.year) - Number(a.year)
    || Number(b.month) - Number(a.month)
    || Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    || String(a.id || "").localeCompare(String(b.id || ""))
  );
  const heroImage = heroImageForViewport(milestonesHeroImage);
  const milestoneStats = [
    [String(sortedTimeline.length), "重要歷程", "從機構成立、政府計畫、官方網站到系統模組逐步展開"],
    ["8", "服務行政區", "臺北士林、北投、南港、萬華，以及新北新店、中和、永和等區域"],
    ["5", "公共計畫與標案", "串接移工培訓、雇主支持、青年就業與失智社區服務"],
    ["3", "系統模組上線", "會計、專案管理與電子用印模組陸續完成"]
  ];
  const indexedTimeline = sortedTimeline.map((item, displayIndex) => ({ ...item, displayIndex }));
  const timelineGroups = [...new Set(indexedTimeline.map((item) => item.year))]
    .map((year) => ({ year, items: indexedTimeline.filter((item) => item.year === year) }));
  const newestYear = timelineGroups[0]?.year;

  return `
    <div class="milestones-page">
      <section class="hero service-detail-hero one-minute-service-hero milestones-full-hero">
        <div
          class="hero-bg"
          style="background-image: linear-gradient(90deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 248, 238, 0.88) 42%, rgba(255, 248, 238, 0.42) 72%, rgba(255, 248, 238, 0.08) 100%), linear-gradient(180deg, rgba(255, 253, 248, 0.18), rgba(255, 239, 218, 0.28)), url('${escapeHTML(heroImage)}');"
          aria-hidden="true"
        ></div>
        <div class="hero-copy service-detail-copy">
          <p class="eyebrow">Milestones</p>
          <h1>大事記</h1>
          <p class="hero-slogan">沿著時間軸，看歲悅如何把照顧系統一步步整理成形。</p>
          <p>從一通照顧諮詢開始，到北北桃服務網絡與教育品管系統，歲悅把每一個家庭的需求，慢慢整理成可以被理解、被追蹤、被信任的照顧歷程。</p>
          <div class="one-minute-service-actions">
            <a class="primary-button" href="#milestone-timeline" data-service-scroll="#milestone-timeline">看時間軸</a>
            <a class="ghost-button" href="#contact">合作洽詢</a>
          </div>
          <div class="milestone-scroll-cue">
            <span></span>
            <strong>往下滑，看歲悅的發展歷程</strong>
          </div>
        </div>
      </section>

      <section class="milestone-stats">
        ${milestoneStats.map(([value, label, copy]) => `<article><strong>${value}</strong><span>${label}</span><p>${copy}</p></article>`).join("")}
      </section>

      <section id="milestone-timeline" class="milestone-journey" aria-label="歲悅長照發展時間軸">
        <div class="milestone-rail" aria-hidden="true">
          <span class="milestone-rail-progress"></span>
        </div>
        <div class="milestone-list">
          ${timelineGroups.length ? timelineGroups.map((group) => `
            <section class="milestone-year-group" aria-label="${escapeHTML(group.year)} 年大事記">
              <div class="milestone-year-heading">
                <span>${escapeHTML(group.year)}</span>
                <p>${escapeHTML(group.year === newestYear
                  ? `最新年度共收錄 ${group.items.length} 件重要歷程，依月份由新到舊呈現。`
                  : `${group.year} 年共收錄 ${group.items.length} 件重要歷程，回看服務、品管與營運基礎如何逐步建立。`)}</p>
              </div>
              ${group.items.map((item) => {
                const globalIndex = item.displayIndex;
                return `
                  <article class="milestone-card ${globalIndex === 0 ? "active" : ""}" data-milestone-card style="--card-index:${globalIndex}">
                    <div class="milestone-year">
                      <span>${escapeHTML(String(item.month).padStart(2, "0"))}月</span>
                      <b>${escapeHTML(item.year)}</b>
                    </div>
                    <figure>
                      <img src="${escapeHTML(contentImageUrl(item.image || fallbackImage))}" alt="${escapeHTML(item.title)}" loading="${globalIndex < 2 ? "eager" : "lazy"}" />
                    </figure>
                    <div class="milestone-copy">
                      <small>${globalIndex === 0 ? "<i>最新</i>" : ""}${escapeHTML(item.tag || "里程碑")}<em>${escapeHTML(item.status || "已完成")}</em></small>
                      <h3>${escapeHTML(item.title)}</h3>
                      <p>${escapeHTML(item.copy || "")}</p>
                    </div>
                  </article>
                `;
              }).join("")}
            </section>
          `).join("") : `
            <div class="health-empty-state milestone-empty-state">
              <h2>大事記整理中</h2>
              <p>目前沒有已發布的大事記，新的歷程會在確認後加入這條時間軸。</p>
            </div>
          `}
        </div>
      </section>

      <section class="milestone-next">
        <p class="eyebrow">Next Chapter</p>
        <h2>下一段歲悅，會繼續把照顧變簡單。</h2>
        <p>我們會持續擴大照顧服務、人才招募、教育品管與合作網絡，讓更多家庭在需要照顧時，有一個清楚、親切、值得信任的入口。</p>
        <div class="hero-actions">
          <a class="primary-button" href="/talent">加入歲悅</a>
          <a class="secondary-button" href="#contact">合作洽詢</a>
        </div>
      </section>
    </div>
  `;
}
