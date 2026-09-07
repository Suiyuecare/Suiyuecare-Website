// Public portfolio data only. Source reports, participant records and original
// photo metadata stay outside the website. Check time is not an event date.
export const migrantTrainingPrograms = [
  {
    id: "taipei-home",
    title: "臺北市到宅訓練",
    period: "115年度（2026）計畫資訊",
    status: "到宅指導",
    summary: "把訓練帶進日常照顧現場，由專業人員協助家庭與外籍家庭看護工理解照顧重點、練習需要的技巧。申請對象、服務安排與承辦資訊，請依臺北市官方計畫說明洽詢。",
    images: [
      {
        src: "/assets/migrant-portfolio/taipei-home-guidance-01.webp",
        width: 1108, height: 1477,
        alt: "到宅訓練現場，專業人員在床邊陪同照顧者練習復能支持技巧。",
        caption: "到宅指導活動紀錄｜取自115年度計畫宣傳資料；原資料未載拍攝日期。",
      },
      {
        src: "/assets/migrant-portfolio/taipei-home-guidance-02.webp",
        width: 1108, height: 1477,
        alt: "到宅訓練現場，專業人員與照顧者陪同坐在扶手椅上的長者進行上肢活動。",
        caption: "115年度宣傳資料中的到宅指導紀錄｜拍攝日期未載；照片不作為個別操作處方。",
      },
    ],
    links: [
      {
        label: "查看臺北市到宅訓練申請資訊",
        url: "https://fd.gov.taipei/cp.aspx?n=8B171EC1975443EB",
        note: "臺北市官方計畫入口；申請資格與服務安排以公告及承辦確認為準。資訊查核：2026.09.08。",
      },
    ],
  },
  {
    id: "kaohsiung-home",
    title: "高雄市到宅訓練",
    period: "115年度（2026）",
    status: "本年度名額已額滿・停止收件",
    summary: "透過到宅訓練，協助外籍家庭看護工與家庭掌握照顧現場需要的技能。115年度報名表目前已公告名額額滿、停止收件；後續服務資訊請以高雄市勞工局及承辦單位公告為準。",
    images: [],
    links: [
      {
        label: "查看高雄市計畫公告",
        url: "https://labor.kcg.gov.tw/News_Content.aspx?n=303E612DC95002EB&s=08453B6AE3E4E9DA&sms=5D5071CD4F7DE237",
        note: "官方計畫及聯絡資訊。報名狀態查核：2026.09.08；此連結不代表仍可報名。",
      },
      {
        label: "查看報名額滿公告",
        url: "https://seniorlife.pse.is/8frr5e",
        note: "原報名入口目前顯示停止收件，請勿重複送件。",
      },
    ],
  },
  {
    id: "taipei-group",
    title: "臺北市集中訓練",
    layout: "wide",
    period: "114年度實績・115年度課程資訊",
    status: "課堂學習與交流",
    summary: "以集中課堂、主題說明與口譯支持，讓外籍家庭看護工一起理解照顧情境與可運用的資源。以下為114年度的真實活動紀錄；115年度課程另提供官方公告與報名資訊入口。",
    images: [
      {
        src: "/assets/migrant-portfolio/taipei-group-2025-08-03.webp",
        width: 1280, height: 964,
        alt: "2025年臺北市集中訓練教室全景，參與者聆聽前方講者說明長照資源。",
        caption: "114年度臺北市集中訓練｜2025.08.03課堂交流與資源宣導。",
      },
      {
        src: "/assets/migrant-portfolio/taipei-group-2025-09-07.webp",
        width: 1600, height: 1200,
        alt: "2025年臺北市集中訓練現場，講者與口譯人員說明長照服務申請資源。",
        caption: "114年度臺北市集中訓練｜2025.09.07長照資源說明與口譯支持。",
      },
    ],
    links: [
      {
        label: "查看115年度課程與報名資訊",
        url: "https://forms.gle/ddV82p33JSUGVDRQ7",
        note: "場次、資格及名額以主辦單位與表單公告為準；表單可開啟不代表仍有名額。資訊查核：2026.09.08。",
      },
      {
        label: "查看臺北市集中訓練官方公告",
        url: "https://bola.gov.taipei/News_Content.aspx?n=098B457D83590D7F&s=312BA1A5197104AF&sms=72544237BBE4C5F6",
        note: "本集中訓練不等同照顧服務員資格訓練，也不得據此申請長照服務人員繼續教育積分。",
      },
    ],
  },
  {
    id: "digital-learning",
    title: "115–116年移工數位學習計畫",
    period: "115–116年（2026–2027）",
    status: "執行中",
    summary: "連結線上社團、華語實體課程、照顧服務員訓練與華語教學影片製作，讓不同語言背景的移工有更多學習入口。已辦活動與籌備中的工作分開呈現，依各項公開資訊持續更新。",
    images: [],
    children: [
      {
        id: "language-communities",
        title: "四國華語學習社團",
        period: "115–116年計畫",
        status: "線上學習社群",
        summary: "提供印尼、菲律賓、越南與泰國移工的初階及進階華語學習社團。可依語言與程度選擇入口；Facebook可能需要登入，加入方式依社團規則與管理員審核。",
        images: [
          {
            src: "/assets/migrant-portfolio/mandarin-community-2026-07-05.webp",
            width: 554, height: 738,
            alt: "華語實體活動現場，工作人員與學員一起查看手機並交流線上社團加入方式。",
            caption: "2026.07.05｜實體活動中的社團加入協助；此為現場照片，非線上課程截圖。",
          },
        ],
        linkGroups: [
          { label: "印尼 Indonesia", links: [
            { label: "初階", url: "https://www.facebook.com/groups/753001936777904/" },
            { label: "進階", url: "https://www.facebook.com/groups/1228888299325149/" },
          ] },
          { label: "菲律賓 Pilipinas", links: [
            { label: "初階", url: "https://www.facebook.com/groups/408527188511867/" },
            { label: "進階", url: "https://www.facebook.com/groups/1442485884587210/" },
          ] },
          { label: "越南 Việt Nam", links: [
            { label: "初階", url: "https://www.facebook.com/groups/284778274633189/" },
            { label: "進階", url: "https://www.facebook.com/groups/1282910183980498/" },
          ] },
          { label: "泰國 ประเทศไทย", links: [
            { label: "初階", url: "https://www.facebook.com/groups/700991492222756/" },
            { label: "進階", url: "https://www.facebook.com/groups/2383454555506248/" },
          ] },
        ],
      },
      {
        id: "in-person-mandarin",
        title: "華語學習實體課程",
        period: "115年度活動紀錄",
        status: "已辦場次與活動資訊",
        summary: "透過面對面的對話、遊戲與同儕互動，把華語學習放進生活情境。以下照片記錄已辦場次；活動資訊頁中的舊場次，不代表目前正在招生。",
        images: [
          {
            src: "/assets/migrant-portfolio/mandarin-class-2026-08-23.webp",
            width: 865, height: 648,
            alt: "2026年8月23日臺北場華語實體課程，學員在教室內參與小遊戲及互動練習。",
            caption: "2026.08.23臺北場｜以小遊戲與交流練習華語的真實課堂紀錄。",
          },
        ],
        links: [
          {
            label: "查看四國實體活動資訊",
            url: "https://linkgoods.com/mlg",
            note: "2026.09.08查核時仍列8月23日已結束場次；新場次與報名開放情形請依最新公告。",
          },
          { label: "洽詢後續華語實體課程", url: "#service-contact" },
        ],
      },
      {
        id: "caregiver-training",
        title: "照顧服務員訓練班",
        period: "115年度活動紀錄",
        status: "學科資訊・術科實作",
        summary: "透過學科學習與術科實作，支持移工理解照顧服務工作所需的知識與技能。照片呈現真實課堂中的模型練習；報名資格、訓練安排及結訓條件，請依本期招生資料確認。",
        images: [
          {
            src: "/assets/migrant-portfolio/caregiver-practice-2026-08.webp",
            width: 1600, height: 900,
            alt: "照顧服務員術科課堂，學員在講師陪同下以教學模型練習急救。",
            caption: "115年8月照顧服務員術科班｜急救模型實作紀錄；非個別操作指引。",
          },
        ],
        links: [
          {
            label: "查看照顧服務訓練學科報名資訊",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSdD2jR16X-dYx1frPQmxa45UTSgP6phNXoijKTS6xiTQl569w/viewform",
            note: "此為學科課程表單，不代表術科名額或資格取得保證。資訊查核：2026.09.08。",
          },
        ],
      },
      {
        id: "mandarin-video-production",
        title: "華語教學影片製作",
        period: "115–116年計畫",
        status: "腳本與師資籌備中",
        summary: "規劃多語支持的華語教學影片，讓學習者能依自己的步調觀看與複習。本期仍在腳本與師資籌備階段，待影片正式公開後再提供作品觀看入口。",
        images: [],
        links: [
          {
            label: "查看本期華語教學講師招募資訊",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSdknUXUAp_a052fmvR-Vkr1xPq3sZ9uqx-fwtphZivdNppUBg/viewform",
            note: "此為影片教學師資招募，非學員課程報名或已完成影片。計畫狀態查核：2026.09.08。",
          },
        ],
      },
    ],
  },
];
