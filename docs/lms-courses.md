# LMS Courses & Entitlements (Admin)

The admin dashboard manages recorded courses for the learner app (`digica-academy-lms`) on the shared Supabase project.

- **Courses** (`/courses`) — create/edit courses, modules, and lessons; publish or unpublish.
- **Entitlements** (`/entitlements`) — grant, revoke, and reactivate learner access.

Requires:

- `supabase/migrations/20261115120000_lms_admin_and_purchase_fields.sql` (admin RLS via `is_admin()`, `price_idr`, `whatsapp_offer_message`, `is_purchasable`, `granted_by`, `notes`)
- `supabase/migrations/20261115121000_clear_placeholder_lesson_videos.sql` (clears seed `mov_bbb.mp4` placeholders)

## Course CMS

1. **Courses → New course**: fill in title, slug, level, price label, etc. Save as draft or publish.
2. After the first save you land on the edit page. Add **modules** and **lessons** in the Curriculum section and click **Save curriculum** (details and curriculum save separately).
3. Each lesson has: slug (unique within the module), title, excerpt, duration (minutes), cover image URL, video (YouTube), and content (notes).
4. **Publish** when ready. Only published courses are visible in the learner catalog.

Notes:

- Removing a module/lesson in the editor deletes it (and its media) on save.
- A course cannot be deleted while it has entitlements — unpublish it instead (deleting cascades to entitlements).
- Curriculum save is not transactional; if it fails, reload the page and retry.

## Granting access after a WhatsApp payment

Payments are handled manually over WhatsApp (no checkout yet).

1. Confirm the payment in WhatsApp and note the reference.
2. Open **Entitlements → Grant access**.
3. Enter the learner's **email** and click **Look up** — the learner must already have an account. The lookup runs through the admin-only `GET /api/admin/users/lookup?email=` route (service role; `profiles` has no email column).
4. Pick the **course**, add **notes** (e.g. payment reference), and optionally an **end date** (empty = lifetime).
5. Click **Grant access**. This upserts one `active` entitlement per user + course and records `granted_by` (you). Granting again re-activates a revoked/expired entitlement.

To remove access, use **Revoke** on the row. **Reactivate** restores it (an elapsed end date is cleared).

## YouTube Unlisted SOP

Lesson videos are hosted on YouTube as **Unlisted** and only the video id is stored in `lms_lesson_media.video_url`.

1. Upload the video to the Digica YouTube channel with visibility **Unlisted** (never Public if the course is paid).
2. Copy the share link (`https://youtu.be/<id>`) or the watch URL.
3. Paste it into the lesson's **Video** field. It is normalized to the 11-character id on blur and on save (watch, `youtu.be`, embed, shorts, and live links are supported). Non-YouTube URLs are stored as-is.
4. Keep the video Unlisted; Unlisted links can still be shared by anyone who has them, so treat this as a light protection for the MVP.
5. If a video is replaced, paste the new link into the same lesson and save the curriculum.
6. Prefer recordings **without copyrighted music**. If YouTube mutes/blocks a lesson: fix or re-upload Unlisted → update the lesson video field → learners keep the same entitlement.
7. Keep private MP4 backups for Digica only (not as the public player).
