-- Seed recorded LMS courses from the previous hardcoded catalog.
-- Placeholder video_url only (do not upload video files to Supabase Storage).
--
-- Grant yourself access (replace USER_UUID):
--   insert into public.lms_entitlements (user_id, course_id, status)
--   values ('USER_UUID', '11111111-1111-4111-8111-111111111001', 'active')
--   on conflict (user_id, course_id) do update set status = 'active';

insert into public.lms_courses (
  id, slug, title, description, status,
  price_label, compare_at_price_label, level, sessions,
  rating, review_count, student_count,
  instructor_name, instructor_credentials, outcomes
) values (
  '11111111-1111-4111-8111-111111111001',
  'data-analyst-python',
  'Data Analyst with Python',
  'Build practical data analysis skills with Python: clean data, explore patterns, and communicate insights with confidence.',
  'published',
  '$499',
  '$799',
  'beginner',
  6,
  4.9,
  28,
  186,
  'Stephanie',
  'Lead Data Scientist @JULO | Ex. GOJEK, UNILEVER.',
  '["Load, clean, and explore datasets with Python and pandas.","Summarize findings with clear visuals and narrative.","Build a repeatable workflow you can reuse on new data."]'::jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  price_label = excluded.price_label,
  compare_at_price_label = excluded.compare_at_price_label,
  level = excluded.level,
  sessions = excluded.sessions,
  rating = excluded.rating,
  review_count = excluded.review_count,
  student_count = excluded.student_count,
  instructor_name = excluded.instructor_name,
  instructor_credentials = excluded.instructor_credentials,
  outcomes = excluded.outcomes,
  updated_at = now();

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111001', 'Python fundamentals', 0
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333001',
  '22222222-2222-4222-8222-222222222001',
  'python-introduction',
  'Python Introduction',
  'Get comfortable with Python as a tool for analytics: how to run code, use notebooks or scripts, and read errors with confidence. You will c…',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333001',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Get comfortable with Python as a tool for analytics: how to run code, use notebooks or scripts, and read errors with confidence.

**You will cover:**
- Why Python is widely used in data teams
- Environments, packages, and reproducible setups
- Writing small programs that load files and print summaries

Focus on clarity and repetition—speed comes later.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333002',
  '22222222-2222-4222-8222-222222222001',
  'python-data-types',
  'Python Data Types',
  'Data analysis in Python leans on a small set of core types. Understanding them prevents subtle bugs later. Core ideas: - Numbers, strings,…',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333002',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Data analysis in Python leans on a small set of core types. Understanding them prevents subtle bugs later.

**Core ideas:**
- Numbers, strings, booleans, and type conversion
- Lists, tuples, and dictionaries for structured data
- Iteration, comprehensions, and functions for reuse

These building blocks map directly to how pandas represents tables and columns.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111001', 'Data analysis with pandas', 1
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333003',
  '22222222-2222-4222-8222-222222222002',
  'data-analysis-python-pandas-dataframe',
  'Pandas & DataFrame',
  'Pandas gives you DataFrames—tabular data with named columns and rich operations for exploration. Skills in this lesson: - Loading CSV and i…',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333003',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Pandas gives you **DataFrames**—tabular data with named columns and rich operations for exploration.

**Skills in this lesson:**
- Loading CSV and inspecting shape, dtypes, and head()
- Selecting columns, filtering rows, and sorting
- Basic aggregates: counts, sums, and grouped summaries

Goal: answer simple business questions directly from the table.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333004',
  '22222222-2222-4222-8222-222222222002',
  'data-analysis-python-cleansing-analysis',
  'Data Cleansing & Analysis',
  'Real datasets are messy. Cleansing turns ambiguous inputs into trustworthy metrics. Typical tasks: - Handling missing values and duplicates…',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333004',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Real datasets are messy. Cleansing turns ambiguous inputs into trustworthy metrics.

**Typical tasks:**
- Handling missing values and duplicates
- Parsing dates and normalizing categories
- Feature-ready tables for aggregation and joins

Document assumptions as you clean—your future self (and teammates) will thank you.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222003', '11111111-1111-4111-8111-111111111001', 'Visualization & capstone', 2
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333005',
  '22222222-2222-4222-8222-222222222003',
  'data-visualization-python',
  'Data Visualization with Python',
  'Visualization helps you spot patterns fast and communicate results without drowning stakeholders in tables. Practice: - Choosing chart type…',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333005',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Visualization helps you spot patterns fast and communicate results without drowning stakeholders in tables.

**Practice:**
- Choosing chart types for comparisons, trends, and distributions
- Labeling axes, titles, and units for clarity
- Iterating from exploratory plots to presentation-ready figures

Keep the story simple: one main message per visual.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333006',
  '22222222-2222-4222-8222-222222222003',
  'final-project',
  'Final Project',
  'Bring the course together: load a dataset, clean it, analyze it, and present insights with visuals. Deliverable outline: - Problem statemen…',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333006',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Bring the course together: load a dataset, clean it, analyze it, and present insights with visuals.

**Deliverable outline:**
- Problem statement and success metrics
- Data dictionary and cleansing notes
- Key findings backed by charts
- Limitations and next steps

Treat this as a portfolio piece you can talk through in an interview.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_courses (
  id, slug, title, description, status,
  price_label, compare_at_price_label, level, sessions,
  rating, review_count, student_count,
  instructor_name, instructor_credentials, outcomes
) values (
  '11111111-1111-4111-8111-111111111002',
  'data-analyst-sql-bigquery',
  'Data Analyst with SQL (Bigquery)',
  'Learn SQL fundamentals for analytics and query large datasets with Google BigQuery.',
  'published',
  '$499',
  '$699',
  'beginner',
  6,
  4.8,
  17,
  94,
  'Stephanie',
  'Lead Data Scientist @JULO | Ex. GOJEK, UNILEVER.',
  '["Write readable SQL for filtering, joins, and aggregations.","Design queries suited for large warehouses like BigQuery.","Translate business questions into verifiable metrics."]'::jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  price_label = excluded.price_label,
  compare_at_price_label = excluded.compare_at_price_label,
  level = excluded.level,
  sessions = excluded.sessions,
  rating = excluded.rating,
  review_count = excluded.review_count,
  student_count = excluded.student_count,
  instructor_name = excluded.instructor_name,
  instructor_credentials = excluded.instructor_credentials,
  outcomes = excluded.outcomes,
  updated_at = now();

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222011', '11111111-1111-4111-8111-111111111002', 'Foundations & core querying', 0
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333011',
  '22222222-2222-4222-8222-222222222011',
  'introduction-database-bigquery',
  'Introduction to Database & Bigquery',
  'Get started with core database concepts and how BigQuery works as a cloud data warehouse.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333011',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Get started with core database concepts and how BigQuery works as a cloud data warehouse.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333012',
  '22222222-2222-4222-8222-222222222011',
  'basic-querying-sql',
  'Basic Querying in SQL',
  'Learn SELECT, WHERE, ORDER BY, and LIMIT to retrieve and filter data accurately.',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333012',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Learn SELECT, WHERE, ORDER BY, and LIMIT to retrieve and filter data accurately.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222012', '11111111-1111-4111-8111-111111111002', 'Analytics SQL', 1
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333013',
  '22222222-2222-4222-8222-222222222012',
  'intermediate-sql-aggregation',
  'Intermediate SQL (Aggregation)',
  'Use GROUP BY with aggregate functions to summarize metrics and answer business questions.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333013',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Use GROUP BY with aggregate functions to summarize metrics and answer business questions.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333014',
  '22222222-2222-4222-8222-222222222012',
  'subquery-and-cte',
  'Subquery & CTE',
  'Break complex SQL into manageable parts with subqueries and common table expressions (CTE).',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333014',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Break complex SQL into manageable parts with subqueries and common table expressions (CTE).$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333015',
  '22222222-2222-4222-8222-222222222012',
  'window-functions',
  'Window Functions',
  'Apply analytic functions for ranking, running totals, and partition-based calculations.',
  60,
  '/images/placeholder/placeholder.webp',
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333015',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Apply analytic functions for ranking, running totals, and partition-based calculations.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222013', '11111111-1111-4111-8111-111111111002', 'Capstone project', 2
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333016',
  '22222222-2222-4222-8222-222222222013',
  'sql-final-project',
  'Final Project.',
  'Build an end-to-end SQL analysis project in BigQuery from raw data to actionable insight.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333016',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Build an end-to-end SQL analysis project in BigQuery from raw data to actionable insight.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_courses (
  id, slug, title, description, status,
  price_label, compare_at_price_label, level, sessions,
  rating, review_count, student_count,
  instructor_name, instructor_credentials, outcomes
) values (
  '11111111-1111-4111-8111-111111111003',
  'data-science-end-to-end',
  'Data Science End to End',
  'Go end-to-end from data sourcing to modeling and interpretation, with hands-on practice and project work.',
  'published',
  '$1,999',
  '$2,499',
  'beginner',
  17,
  4.9,
  41,
  223,
  'Stephanie',
  'Lead Data Scientist @JULO | Ex. GOJEK, UNILEVER.',
  '["Frame an end-to-end data science problem from business context.","Prepare data, train baselines, and evaluate models responsibly.","Communicate trade-offs and next steps to stakeholders."]'::jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  price_label = excluded.price_label,
  compare_at_price_label = excluded.compare_at_price_label,
  level = excluded.level,
  sessions = excluded.sessions,
  rating = excluded.rating,
  review_count = excluded.review_count,
  student_count = excluded.student_count,
  instructor_name = excluded.instructor_name,
  instructor_credentials = excluded.instructor_credentials,
  outcomes = excluded.outcomes,
  updated_at = now();

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222021', '11111111-1111-4111-8111-111111111003', 'Foundations & Python stack', 0
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333021',
  '22222222-2222-4222-8222-222222222021',
  'introduction-to-data-science',
  'Introduction to Data Science',
  'Build a solid foundation of the data science workflow, from problem framing to model delivery.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333021',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Build a solid foundation of the data science workflow, from problem framing to model delivery.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333022',
  '22222222-2222-4222-8222-222222222021',
  'mastering-sql',
  'Mastering SQL',
  'Strengthen SQL skills for analytics, joins, aggregations, and warehouse-scale querying.',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333022',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Strengthen SQL skills for analytics, joins, aggregations, and warehouse-scale querying.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333023',
  '22222222-2222-4222-8222-222222222021',
  'python-introduction',
  'Python Introduction',
  'Set up Python fundamentals for data work, including syntax, variables, and basic control flow.',
  60,
  '/images/placeholder/placeholder.webp',
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333023',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Set up Python fundamentals for data work, including syntax, variables, and basic control flow.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333024',
  '22222222-2222-4222-8222-222222222021',
  'python-data-types',
  'Python Data Types',
  'Understand lists, dictionaries, tuples, and sets to structure data effectively.',
  60,
  '/images/placeholder/placeholder.webp',
  3
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333024',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Understand lists, dictionaries, tuples, and sets to structure data effectively.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333025',
  '22222222-2222-4222-8222-222222222021',
  'pandas-data-processing',
  'Pandas Data Processing',
  'Process tabular datasets with pandas using filtering, transformation, and joining workflows.',
  60,
  '/images/placeholder/placeholder.webp',
  4
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333025',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Process tabular datasets with pandas using filtering, transformation, and joining workflows.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222022', '11111111-1111-4111-8111-111111111003', 'Data understanding & exploration', 1
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333026',
  '22222222-2222-4222-8222-222222222022',
  'statistics',
  'Statistics',
  'Cover key statistical concepts for analysis, inference, and model interpretation.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333026',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Cover key statistical concepts for analysis, inference, and model interpretation.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333027',
  '22222222-2222-4222-8222-222222222022',
  'data-cleansing-and-preprocessing',
  'Data Cleansing & Preprocessing',
  'Clean missing, duplicate, and inconsistent data to prepare reliable model-ready inputs.',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333027',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Clean missing, duplicate, and inconsistent data to prepare reliable model-ready inputs.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333028',
  '22222222-2222-4222-8222-222222222022',
  'data-visualization',
  'Data Visualization',
  'Visualize trends, distributions, and comparisons to communicate insights clearly.',
  60,
  '/images/placeholder/placeholder.webp',
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333028',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Visualize trends, distributions, and comparisons to communicate insights clearly.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333029',
  '22222222-2222-4222-8222-222222222022',
  'eda',
  'EDA',
  'Perform exploratory data analysis to discover patterns, anomalies, and hypotheses.',
  60,
  '/images/placeholder/placeholder.webp',
  3
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333029',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Perform exploratory data analysis to discover patterns, anomalies, and hypotheses.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222023', '11111111-1111-4111-8111-111111111003', 'Machine learning', 2
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333030',
  '22222222-2222-4222-8222-222222222023',
  'introduction-to-machine-learning',
  'Introduction to Machine Learning',
  'Learn core machine learning concepts, training flow, and evaluation fundamentals.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333030',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Learn core machine learning concepts, training flow, and evaluation fundamentals.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333031',
  '22222222-2222-4222-8222-222222222023',
  'supervised-learning-regression',
  'Supervised Learning - Regression',
  'Build and evaluate regression models to predict continuous outcomes.',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333031',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Build and evaluate regression models to predict continuous outcomes.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333032',
  '22222222-2222-4222-8222-222222222023',
  'supervised-learning-classification',
  'Supervised Learning - Classification',
  'Train classification models and assess performance with suitable metrics.',
  60,
  '/images/placeholder/placeholder.webp',
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333032',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Train classification models and assess performance with suitable metrics.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333033',
  '22222222-2222-4222-8222-222222222023',
  'unsupervised-learning',
  'Unsupervised Learning',
  'Apply clustering and dimensionality reduction for unlabeled data exploration.',
  60,
  '/images/placeholder/placeholder.webp',
  3
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333033',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Apply clustering and dimensionality reduction for unlabeled data exploration.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333034',
  '22222222-2222-4222-8222-222222222023',
  'introduction-to-deep-learning',
  'Introduction to Deep Learning',
  'Understand neural network basics and when deep learning is the right approach.',
  60,
  '/images/placeholder/placeholder.webp',
  4
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333034',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Understand neural network basics and when deep learning is the right approach.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_modules (id, course_id, title, sort_order) values (
  '22222222-2222-4222-8222-222222222024', '11111111-1111-4111-8111-111111111003', 'Business impact & capstone', 3
)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333035',
  '22222222-2222-4222-8222-222222222024',
  'business-implementation',
  'Business Implementation',
  'Translate model outputs into business actions, KPIs, and stakeholder decisions.',
  60,
  '/images/placeholder/placeholder.webp',
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333035',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Translate model outputs into business actions, KPIs, and stakeholder decisions.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333036',
  '22222222-2222-4222-8222-222222222024',
  'recap-end-to-end-data-science',
  'Recap End-to-end Data Science',
  'Review the full lifecycle from problem framing through deployment-oriented thinking.',
  60,
  '/images/placeholder/placeholder.webp',
  1
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333036',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Review the full lifecycle from problem framing through deployment-oriented thinking.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;

insert into public.lms_lessons (
  id, module_id, slug, title, excerpt, duration_minutes, cover_image_url, sort_order
) values (
  '33333333-3333-4333-8333-333333333037',
  '22222222-2222-4222-8222-222222222024',
  'data-science-final-project',
  'Final Project',
  'Deliver an end-to-end data science project that demonstrates technical and business impact.',
  60,
  '/images/placeholder/placeholder.webp',
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  duration_minutes = excluded.duration_minutes,
  cover_image_url = excluded.cover_image_url,
  sort_order = excluded.sort_order;

insert into public.lms_lesson_media (lesson_id, video_url, content) values (
  '33333333-3333-4333-8333-333333333037',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  $lms$Deliver an end-to-end data science project that demonstrates technical and business impact.$lms$
)
on conflict (lesson_id) do update set
  video_url = excluded.video_url,
  content = excluded.content;
