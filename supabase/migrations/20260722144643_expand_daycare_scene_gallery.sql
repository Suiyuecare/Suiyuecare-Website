update public.page_template_fields
set
  json_value = '[
    {"image":"assets/daycare-detail-01-exercise-fast.jpg","title":"團體活動讓身體醒過來","body":"用安全、可跟上的節奏帶領伸展與律動，讓長輩重新感覺自己仍然能動。"},
    {"image":"assets/daycare-detail-02-meal-fast.jpg","title":"共餐不是吃飯而已","body":"餐食照顧會觀察食慾、吞嚥、飲水與情緒，也讓長輩在陪伴中用餐。"},
    {"image":"assets/daycare-detail-03-activity-fast.jpg","title":"手作與認知活動","body":"透過簡單任務、顏色、記憶與互動，讓活動成為長輩有成就感的時刻。"},
    {"image":"assets/daycare-detail-04-checkin-fast.jpg","title":"早晨報到與家屬交接","body":"從進門問候與健康觀察開始，讓家屬知道今天有人接住長輩。"},
    {"image":"assets/daycare-scene-vitals-v1.jpg","title":"生命徵象量測","body":"依照照顧計畫與長輩狀況量測血壓、體溫或血氧，記錄每日變化，異常時及早通知家屬。"},
    {"image":"assets/daycare-scene-oral-exercise-v1.jpg","title":"健口操運動","body":"午餐前帶領嘴唇、舌頭與臉頰活動，維持口腔活動度，為進食與吞嚥做好準備。"},
    {"image":"assets/daycare-scene-shuttle-v1.jpg","title":"交通車接送","body":"依中心路線與可服務範圍安排接送，照顧人員協助上下車與輔具使用，讓每天往返更安心。"},
    {"image":"assets/service-journey-08-nap-time.jpg","title":"午間休息","body":"活動與用餐後安排安穩休息，讓白天作息有節奏、不過度疲累。"}
  ]'::jsonb,
  updated_at = now()
where page_slug = 'day-care'
  and template_key = 'service_page'
  and field_key = 'scene_cards';
