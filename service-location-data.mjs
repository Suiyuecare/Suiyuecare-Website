// Shared public location details used by service views and location landing pages.
// Addresses and service areas follow the existing published website content.

export const homeCareLocations = {
  taipei: {
    city: "臺北市",
    image: "assets/homecare-scene-assessment-fast.jpg",
    alt: "居家照顧服務員在長輩家中與家屬進行照顧需求評估",
    type: "臺北市｜居家長照特約機構",
    name: "臺北市歲悅居家長照機構",
    desc: "由同一個居家長照團隊承接士林、北投與南港區的到宅需求，協助家庭安排照顧服務與後續追蹤。",
    services: "身體照顧、生活支持、陪同外出、喘息服務",
    districts: ["士林區", "北投區", "南港區"],
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    dispatch: "依個案地址、希望時段、照顧強度與人力媒合確認",
    contactMessage: "我住在臺北市士林、北投或南港區，想了解居家照顧服務，請協助確認可服務時段與申請方式。"
  },
  newtaipei: {
    city: "新北市",
    image: "assets/location-xindian-integrated-care-v2.jpg",
    alt: "居家照顧團隊在新北市家庭中協助長輩步行並與家屬討論照顧安排",
    type: "新北市｜居家長照特約機構",
    name: "歲悅新店居家長照機構",
    desc: "由新店團隊承接新店、中和與永和區的到宅需求，並可依長輩狀況協助銜接復能與家庭照顧資源。",
    services: "身體照顧、生活支持、陪同就醫、家屬支持",
    districts: ["新店區", "中和區", "永和區"],
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    dispatch: "依個案地址、希望時段、照顧強度與人力媒合確認",
    contactMessage: "我住在新北市新店、中和或永和區，想了解居家照顧服務，請協助確認可服務時段與申請方式。"
  }
};

export const dayCareLocations = {
  "wanhua-one": {
    image: "assets/location-wanhua-one-daycare-v2.jpg",
    alt: "歲悅萬華社區長照機構一館照片",
    mapLabel: "萬華一館",
    mapQuery: "臺北市萬華區康定路43號",
    type: "臺北市｜日間照顧中心",
    name: "歲悅萬華社區長照機構",
    desc: "萬華一館提供日間照顧服務，支持長輩白天生活照顧、活動參與與家庭照顧安排。",
    services: "日間照顧、生活支持、家屬諮詢",
    hours: "週一至週六 08:30-18:00",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "108 臺北市萬華區康定路43號2樓"
  },
  "wanhua-two": {
    image: "assets/location-wanhua-two-daycare-v2.jpg",
    alt: "歲悅萬華二館籌設中場址示意",
    mapLabel: "萬華二館",
    mapQuery: "臺北市萬華區成都路159號",
    type: "臺北市｜日間照顧中心（籌設中）",
    name: "歲悅萬華二館社區長照機構（籌設中）",
    desc: "萬華二館目前籌設中，正式開辦日期、服務內容與服務時段將於核定後公告。",
    services: "正式服務內容核定後公告",
    hours: "籌設中",
    phone: "02-6604-5432",
    phoneHref: "tel:0266045432",
    address: "108 臺北市萬華區西門里成都路159號2樓（雅香石頭火鍋二樓）"
  }
};

export const communityLocations = {
  shilin: {
    label: "士林據點",
    shortAddress: "社子街 63 巷",
    name: "歲悅士林失智症據點",
    address: "臺北市士林區社子街63巷21弄2號1樓",
    image: "assets/community-orientation-v3.jpg",
    alt: "士林失智症據點定向感課程情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解士林失智症據點的服務資格、課程時段與報名方式。"
  },
  datong: {
    label: "大同據點",
    shortAddress: "承德路三段",
    name: "歲悅大同失智症據點",
    address: "臺北市大同區承德路三段24巷38弄17號1樓",
    image: "assets/community-course-v3.jpg",
    alt: "大同失智症據點認知課程情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解大同失智症據點的服務資格、課程時段與報名方式。"
  },
  xinyi: {
    label: "信義據點",
    shortAddress: "基隆路一段",
    name: "歲悅信義失智症據點",
    address: "臺北市信義區基隆路一段364巷6號1樓",
    image: "assets/community-meal-v3.jpg",
    alt: "信義失智症據點社區共餐情境示意",
    description: "提供生命徵象量測、定向感訓練、認知與健康促進課程及共餐。",
    contactMessage: "我想了解信義失智症據點的服務資格、課程時段與報名方式。"
  }
};
