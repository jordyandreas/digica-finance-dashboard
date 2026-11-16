-- Clear seed placeholder MP4s. Admins paste YouTube Unlisted ids/URLs in the dashboard.
update public.lms_lesson_media
set video_url = ''
where video_url like '%mov_bbb.mp4%';
