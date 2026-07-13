update public.page_template_fields
set
  text_value = case field_key
    when 'flow_title' then '參觀到入托流程'
    when 'flow_body' then '完成參觀後，可先試上一日；確認長輩適應良好，再安排體檢與正式入托。'
  end,
  updated_at = now()
where page_slug = 'day-care'
  and field_key in ('flow_title', 'flow_body');

update public.page_template_fields
set
  json_value = jsonb_build_array(
    jsonb_build_object(
      'step', '01',
      'title', '電話諮詢',
      'body', '了解長輩身體狀態、生活習慣、交通需求與家屬最在意的問題。'
    ),
    jsonb_build_object(
      'step', '02',
      'title', '預約參觀',
      'body', '讓家屬與長輩實際認識環境、活動安排、照顧人員與一日作息。'
    ),
    jsonb_build_object(
      'step', '03',
      'title', '試上一日',
      'body', '參觀後可安排一日體驗，觀察長輩對環境、活動、用餐與作息的適應。'
    ),
    jsonb_build_object(
      'step', '04',
      'title', '安排體檢',
      'body', '確認適應良好後，可至鄰近醫院安排體檢，並提供六個月內的體檢文件。'
    ),
    jsonb_build_object(
      'step', '05',
      'title', '確認體檢項目',
      'body', '抽血（血液、生化、B 肝表面抗原）、尿液、胸部 X 光與皮膚檢查；不包含糞便檢查。'
    ),
    jsonb_build_object(
      'step', '06',
      'title', '正式入托與回報',
      'body', '文件確認後安排正式入托，並持續回報出席、餐食、活動與健康觀察。'
    )
  ),
  updated_at = now()
where page_slug = 'day-care'
  and field_key = 'flow_cards';
