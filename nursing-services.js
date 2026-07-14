const nursingServiceCards = [
  ["吞嚥訓練", "從坐姿、食物質地到吞嚥動作逐步評估與練習，降低進食嗆咳風險。", "swallowing-training.jpg"],
  ["營養照護", "依食量、體重與健康狀況調整飲食內容，讓每一餐更符合長輩需要。", "nutrition-care.jpg"],
  ["復能訓練", "把起身、移位與行走拆成可完成的小目標，陪長輩找回日常生活能力。", "rehabilitation-training.jpg"],
  ["困擾行為照護", "理解行為背後的原因，以環境調整與溝通方法降低不安，建立安心的照護節奏。", "behavior-care.jpg"],
  ["護理指導", "由護理人員示範日常觀察與照護技巧，讓家屬在家也能照顧得更有把握。", "nursing-guidance.jpg"]
];

export const nursingIdentityFieldMarkup = `<label>身分類別<select name="身分類別" required><option value="" selected disabled>請選擇身分類別</option><option value="一般戶">一般戶（自付 16%）</option><option value="中低收入戶">中低收入戶（自付 5%）</option><option value="低收入戶">低收入戶（自付 0%）</option><option value="尚不確定">尚不確定，請協助確認</option></select></label>`;

export const nursingServiceSectionMarkup = `
  <section class="nursing-service-section service-detail-section service-motion" aria-labelledby="nursing-service-title">
    <div class="service-section-head nursing-service-head">
      <div>
        <p class="eyebrow">Professional Care</p>
        <h2 id="nursing-service-title">護理復能服務項目</h2>
      </div>
      <span>由專業人員依長輩狀況評估，從日常能力、飲食吞嚥到家庭照護，安排合適的服務目標。</span>
      <div class="nursing-service-controls" aria-label="護理復能服務項目滑動控制">
        <button class="carousel-button" type="button" data-scroll-carousel="#nursing-service-slider" data-scroll-direction="-1" aria-label="查看上一個護理復能服務項目">上一個</button>
        <button class="carousel-button" type="button" data-scroll-carousel="#nursing-service-slider" data-scroll-direction="1" aria-label="查看下一個護理復能服務項目">下一個</button>
      </div>
    </div>
    <div class="nursing-service-slider" id="nursing-service-slider" aria-label="護理復能服務項目滑動列表" tabindex="0">
      ${nursingServiceCards.map(([title, text, image], index) => `
        <article>
          <figure>
            <img src="assets/nursing-services/${image}" alt="${title}服務情境" width="1440" height="1080" loading="lazy" decoding="async" />
            <span>${String(index + 1).padStart(2, "0")}</span>
          </figure>
          <div><h3>${title}</h3><p>${text}</p></div>
        </article>
      `).join("")}
    </div>
    <p class="nursing-service-swipe-note">可左右滑動查看更多服務項目</p>
  </section>
`;
