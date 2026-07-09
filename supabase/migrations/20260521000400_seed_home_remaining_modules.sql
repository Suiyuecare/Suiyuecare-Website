-- Seed remaining homepage CMS modules: Hero, services, locations, and partners.
-- These rows use metadata.image_url so the existing local asset set can render
-- before every image is uploaded into Supabase media.

insert into public.content_modules (
  target_slug, module_key, item_key, title, subtitle, eyebrow, body, link_text, link_url,
  badge_label, date_label, image_id, sort_order, is_featured, is_enabled, status, published_at, metadata
)
values
  (
    'home',
    'hero',
    'main-hero',
    '把長照變成家人看得懂、也放得下心的日常系統。',
    '照顧就像去超商，買牛奶一樣簡單。',
    'Professional Care Network',
    '歲悅長照集團整合居家、日照、社區、復能、培訓與品質管理，讓每一次照顧都能被安排、被追蹤，也被溫柔地完成。',
    '預約諮詢',
    '#contact',
    null,
    null,
    null,
    1,
    true,
    true,
    'published',
    now(),
    '{"image_url":"assets/homepage-batch/01-care-home-greeting-fast.jpg","image_position":"center","secondary_text":"觀看照顧系統","secondary_url":"#care-system","stats":[{"value":"18,600+","label":"累積服務人次"},{"value":"1,280+","label":"服務人數"},{"value":"3","label":"服務區域"},{"value":"97%","label":"家屬滿意度"}]}'::jsonb
  ),
  ('home','service_item','home-care','居家照顧',null,'Services','到宅照顧、生活支持、照顧計畫媒合。',null,'/home-care','01',null,null,10,true,true,'published',now(),'{"image_url":"assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg","image_alt":"居家照顧服務情境"}'::jsonb),
  ('home','service_item','day-care','日間照顧',null,'Services','白天托顧、活動餐食、家庭喘息支持。',null,'/day-care','02',null,null,20,false,true,'published',now(),'{"image_url":"assets/homepage-batch/02-daycare-group-exercise-hires.jpg","image_alt":"日間照顧活動情境"}'::jsonb),
  ('home','service_item','community','社區據點',null,'Services','鄰里共餐、健康促進、預防照顧。',null,'/community','03',null,null,30,false,true,'published',now(),'{"image_url":"assets/homepage-batch/11-elder-art-activity-fast.jpg","image_alt":"社區據點服務情境"}'::jsonb),
  ('home','service_item','nursing','護理復能',null,'Services','護理評估、復能目標、健康追蹤。',null,'/nursing','04',null,null,40,false,true,'published',now(),'{"image_url":"assets/homepage-batch/09-nurse-blood-pressure-hires.jpg","image_alt":"護理復能服務情境"}'::jsonb),
  ('home','service_item','migrant-training','移工培訓',null,'Services','照顧技能、家庭溝通、安全衛教。',null,'/migrant-training','05',null,null,50,false,true,'published',now(),'{"image_url":"assets/homepage-batch/family-consultation-clear.jpg","image_alt":"移工培訓課程情境"}'::jsonb),
  ('home','service_item','quality','教育品管',null,'Services','標準教材、督導稽核、持續改善。',null,'/quality','06',null,null,60,false,true,'published',now(),'{"image_url":"assets/homepage-batch/14-care-notes-fast.jpg","image_alt":"教育品管紀錄情境"}'::jsonb),
  ('home','location','shilin','Suiyuecare Corps. 士林照顧站','臺北市｜居家照顧站','Care Network','服務士林、北投生活圈，提供長照需求初談、居家照顧媒合與家屬諮詢。',null,null,'居家照顧、喘息服務、家屬諮詢','週一至週五 09:00-18:00',null,10,true,true,'published',now(),'{"image_url":"assets/homepage-batch/16-taipei-service-office-fast.jpg","pin_label":"士林區","pin_class":"pin-shilin","phone":"02-6604-5432","address":"臺北市士林區照顧服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','datong','Suiyuecare Corps. 大同諮詢站','臺北市｜家屬諮詢站','Care Network','協助大同、南港與周邊家庭釐清照顧需求，安排到宅照顧與照顧計畫。',null,null,'照顧評估、服務媒合、課程報名','週一至週五 09:00-18:00',null,20,false,true,'published',now(),'{"image_url":"assets/homepage-batch/family-consultation-clear.jpg","pin_label":"大同區","pin_class":"pin-datong","phone":"02-6604-5432","address":"臺北市大同區照顧服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','wanhua-a','Suiyuecare Corps. 萬華居家服務點 A','臺北市｜居家服務點','Care Network','支援萬華北側社區與高齡家庭，提供日常生活協助、陪伴與照顧紀錄回報。',null,null,'生活照顧、陪伴服務、家屬回報','週一至週六 08:30-18:00',null,30,false,true,'published',now(),'{"image_url":"assets/homepage-batch/07-orange-apron-meal-prep-fast.jpg","pin_label":"萬華區","pin_class":"pin-wanhua","tab_group":"wanhua","tab_label":"一館","phone":"02-6604-5432","address":"臺北市萬華區北側服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','wanhua-b','Suiyuecare Corps. 萬華照顧服務點 B','臺北市｜照顧支援點','Care Network','服務萬華南側生活圈，串接居家照顧、喘息安排與健康3.0照顧衛教。',null,null,'喘息服務、健康衛教、照顧諮詢','週一至週五 09:00-17:30',null,31,false,true,'published',now(),'{"image_url":"assets/homepage-batch/14-care-notes-fast.jpg","pin_label":"萬華區","pin_class":"pin-wanhua","tab_group":"wanhua","tab_label":"二館","phone":"02-6604-5432","address":"臺北市萬華區南側服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','xinyi','Suiyuecare Corps. 信義健康促進站','臺北市｜健康促進站','Care Network','提供信義、南港周邊家屬照顧諮詢、預防延緩失能活動與課程報名。',null,null,'健康促進、家屬課程、照顧諮詢','週一至週五 09:00-18:00',null,40,false,true,'published',now(),'{"image_url":"assets/homepage-batch/family-consultation-clear.jpg","pin_label":"信義區","pin_class":"pin-xinyi","phone":"02-6604-5432","address":"臺北市信義區健康促進據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','xindian','Suiyuecare Corps. 新店日照據點','新北市｜日間照顧點','Care Network','以白天托顧、團體活動、共餐與復能安排，支持新店、中和、永和家庭喘息。',null,null,'日間照顧、社區共餐、延緩失能活動','週一至週六 08:30-17:30',null,50,false,true,'published',now(),'{"image_url":"assets/homepage-batch/12-community-health-class-hires.jpg","pin_label":"新店區","pin_class":"pin-xindian","phone":"02-6604-5432","address":"新北市新店區日間照顧服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','xinzhuang','Suiyuecare Corps. 新莊社區據點','新北市｜社區照顧點','Care Network','串接新莊周邊社區照顧、預防延緩失能與家庭支持服務。',null,null,'社區據點、健康促進、家屬支持','週一至週五 09:00-17:30',null,60,false,true,'published',now(),'{"image_url":"assets/homepage-batch/12-community-health-class-hires.jpg","pin_label":"新莊區","pin_class":"pin-xinzhuang","phone":"02-6604-5432","address":"新北市新莊區社區照顧服務據點","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','location','luzhu','Suiyuecare Corps. 蘆竹復能中心','桃園市｜護理復能點','Care Network','支援蘆竹、大園生活圈，由護理與復能團隊協助建立個案目標並追蹤照顧風險。',null,null,'護理評估、復能訓練、照顧風險追蹤','週一至週五 09:00-17:30',null,70,false,true,'published',now(),'{"image_url":"assets/homepage-batch/13-rehab-walking-practice-fast.jpg","pin_label":"蘆竹區","pin_class":"pin-luzhu","phone":"02-6604-5432","address":"桃園市蘆竹區護理復能服務中心","email":"generalaffairs@suiyuecare.com"}'::jsonb),
  ('home','partner','taipei-health','臺北市政府衛生局',null,'Partners',null,null,'https://health.gov.taipei/',null,null,null,10,false,true,'published',now(),'{"image_url":"assets/partners/taipei-health.png"}'::jsonb),
  ('home','partner','taipei-social','臺北市政府社會局',null,'Partners',null,null,'https://dosw.gov.taipei/',null,null,null,20,false,true,'published',now(),'{"image_url":"assets/partners/taipei-health.png"}'::jsonb),
  ('home','partner','mohw','衛生福利部',null,'Partners',null,null,'https://www.mohw.gov.tw/',null,null,null,30,false,true,'published',now(),'{"image_url":"assets/partners/mohw.png"}'::jsonb),
  ('home','partner','ntpc-health','新北市政府衛生局',null,'Partners',null,null,'https://www.health.ntpc.gov.tw/',null,null,null,40,false,true,'published',now(),'{"image_url":"assets/partners/ntpc-health.png"}'::jsonb),
  ('home','partner','ntpc-social','新北市政府社會局',null,'Partners',null,null,'https://www.sw.ntpc.gov.tw/',null,null,null,50,false,true,'published',now(),'{"image_url":"assets/partners/ntpc-social.png"}'::jsonb),
  ('home','partner','taoyuan-social','桃園市政府社會局',null,'Partners',null,null,'https://sab.tycg.gov.tw/',null,null,null,60,false,true,'published',now(),'{"image_url":"assets/partners/taoyuan-social.png"}'::jsonb),
  ('home','partner','tvdi','臺北市職能發展學院',null,'Partners',null,null,'https://www.tvdi.gov.taipei/',null,null,null,70,false,true,'published',now(),'{"image_url":"assets/partners/tvdi.png"}'::jsonb),
  ('home','partner','mol','勞動部',null,'Partners',null,null,'https://www.mol.gov.tw/',null,null,null,80,false,true,'published',now(),'{"image_url":"assets/partners/mol.svg"}'::jsonb),
  ('home','partner','wda','勞動部勞動力發展署',null,'Partners',null,null,'https://www.wda.gov.tw/',null,null,null,90,false,true,'published',now(),'{"image_url":"assets/partners/wda.png"}'::jsonb),
  ('home','partner','taipei-fd','臺北市勞動力重建運用處',null,'Partners',null,null,'https://fd.gov.taipei/',null,null,null,100,false,true,'published',now(),'{"image_url":"assets/partners/taipei-health.png"}'::jsonb),
  ('home','partner','kaohsiung-labor','高雄市勞工局',null,'Partners',null,null,'https://labor.kcg.gov.tw/',null,null,null,110,false,true,'published',now(),'{"image_url":"assets/partners/kaohsiung-labor.png"}'::jsonb),
  ('home','partner','ntunhs','國立臺北護理健康大學',null,'Partners',null,null,'https://www.ntunhs.edu.tw/',null,null,null,120,false,true,'published',now(),'{"image_url":"assets/partners/ntunhs.png"}'::jsonb),
  ('home','partner','tumt','台北海洋科技大學',null,'Partners',null,null,'https://www.tumt.edu.tw/',null,null,null,130,false,true,'published',now(),'{"image_url":"assets/partners/tumt.png"}'::jsonb)
on conflict do nothing;
