-- Four general articles (one per category).
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING.
-- Paste into Supabase SQL Editor, or apply via db push / migration runner.

INSERT INTO public.lms_articles (
  slug,
  category,
  title,
  excerpt,
  body_html,
  status,
  published_at,
  display_date,
  read_time_minutes,
  read_time_display
)
VALUES
(
  'how-much-sql-do-you-really-need',
  'SQL',
  'How Much SQL Do You Really Need?',
  'You do not need every advanced trick on day one. A small, solid set of skills already unlocks most beginner and mid-level data work.',
  $html$<p>Many learners stall because they think SQL means mastering every window function, every dialect quirk, and every optimization tip before they are “ready.” That bar is higher than most real jobs require at the start.</p><p>What teams usually need first is simpler: can you filter the right rows, join related tables without breaking the grain, group results into a clear metric, and explain what the query is doing in plain language?</p><h2>A practical core</h2><p>If you get comfortable with these, you already cover a large share of day-to-day work.</p><ul><li>SELECT, WHERE, and ORDER BY with confidence</li><li>JOIN types and when row counts can inflate</li><li>GROUP BY for metrics people actually ask for</li><li>Basic CTEs so longer queries stay readable</li></ul><p>Window functions, nested logic, and warehouse-specific habits matter — later. They are easier to learn once the core feels natural.</p><h2>Depth comes from use, not from a checklist</h2><p>The fastest way to know what to learn next is to answer real questions on messy tables. Each stuck moment points to the next skill. Memorizing a long syllabus without that loop often fades.</p><p>Aim for enough SQL to verify numbers and ship clear answers. Add advanced patterns when a real problem demands them. That is usually more than enough to keep moving in a data career.</p>$html$,
  'published',
  '2026-10-20T17:00:00.000Z'::timestamptz,
  'October 21, 2026',
  2,
  '2 min read'
),
(
  'ask-better-questions-before-you-open-the-data',
  'Analytics',
  'Ask Better Questions Before You Open the Data',
  'A vague request produces a vague dashboard. Clear questions are the cheapest way to make analysis useful.',
  $html$<p>It is tempting to open a spreadsheet or BI tool the moment someone asks for “insights.” That habit wastes time. Without a sharper question, you explore forever, build charts that look busy, and still leave the stakeholder unsure what to do.</p><p>Good analytics starts one step earlier: turn a fuzzy ask into something you can answer, measure, and defend.</p><h2>Turn requests into questions</h2><p>Before you clean a single column, try to pin these down.</p><ul><li>What decision will this answer support?</li><li>What time range and population matter?</li><li>What does success or “bad” look like in numbers?</li><li>Who owns the definition if people disagree?</li></ul><p>If those are unclear, a short clarification message saves more hours than another pivot table.</p><h2>Why this skill compounds</h2><p>Tools help you compute. Questions decide whether the compute was worth doing. Analysts who ask well waste less time, earn more trust, and need fewer follow-up meetings to explain why a chart exists.</p><p>Practice on small asks first. Rewrite “look into sales” as “did weekly paid orders drop after the price change, and in which region?” That sentence alone already shapes the data you need — and the chart you should skip.</p>$html$,
  'published',
  '2026-10-19T17:00:00.000Z'::timestamptz,
  'October 20, 2026',
  1,
  '1 min read'
),
(
  'when-you-do-not-need-machine-learning',
  'Data Science',
  'When You Do Not Need Machine Learning',
  'A model is a tool, not a default. Many useful data problems are solved with clear rules, solid metrics, and simple analysis.',
  $html$<p>Machine learning is useful when patterns are hard to write by hand and the payoff of better prediction is real. It is the wrong first move when the business still lacks a clean definition of the outcome, when a rule would work, or when nobody will act on the score.</p><p>Knowing when not to model is part of data science maturity. It saves weeks of work and keeps trust high.</p><h2>Start simpler on purpose</h2><p>Before you reach for a complex approach, check whether a lighter path already answers the question.</p><ul><li>A clear metric and trend may be enough for the decision.</li><li>A threshold rule can beat a weak model that nobody monitors.</li><li>Better data quality often helps more than a fancier algorithm.</li><li>If the label is noisy, modeling will mostly learn the noise.</li></ul><p>Simple baselines are not a failure. They are how you prove that extra complexity is worth it.</p><h2>Use ML when the problem earns it</h2><p>Reach for models when you have a defined target, enough relevant data, a way to measure mistakes, and a place the prediction will be used. Otherwise you risk a notebook that impresses in a demo and dies in production.</p><p>Good data scientists are not people who always train models. They are people who choose the smallest method that honestly improves the decision.</p>$html$,
  'published',
  '2026-10-18T17:00:00.000Z'::timestamptz,
  'October 19, 2026',
  2,
  '2 min read'
),
(
  'switching-into-data-without-starting-from-zero',
  'Career',
  'Switching Into Data Without Starting From Zero',
  'Your previous job is not wasted time. The fastest switches reuse judgment you already have and add proof in the new craft.',
  $html$<p>Career changers often assume they must erase their past and become a beginner again. That story is usually wrong. Ops, finance, marketing, support, and teaching already train pattern recognition, stakeholder communication, and comfort with incomplete information — all useful in data work.</p><p>What you still need is proof in the new language: tables, analysis, and a clear target role.</p><h2>Bridge what you already know</h2><p>Make the transfer visible instead of hiding it.</p><ul><li>Name decisions you influenced with numbers or reports before.</li><li>Map old tasks to data skills: cleaning, defining metrics, explaining tradeoffs.</li><li>Pick one role title (analyst vs scientist) and align projects to it.</li><li>Add one or two portfolio pieces that show the new craft, not only the old domain.</li></ul><p>Recruiters should see a path, not a random jump.</p><h2>What to build first</h2><p>You do not need a perfect academic background. You need a coherent story and evidence you can finish work: a question, a dataset, a method, a result, and a limitation you can discuss honestly.</p><p>Keep learning focused on that proof. The switch feels slower when you collect courses without shipping. It feels faster when each month ends with something you can walk someone through out loud.</p>$html$,
  'published',
  '2026-10-17T17:00:00.000Z'::timestamptz,
  'October 18, 2026',
  1,
  '1 min read'
)
ON CONFLICT (slug) DO NOTHING;
