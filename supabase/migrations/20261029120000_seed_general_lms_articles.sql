-- Four general articles (one per category).
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING.
-- Paste into Supabase SQL Editor, or apply via db push / migration runner.
-- read_time_* is set from body word count at ~200 wpm (ceil), matching app logic.

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
  'common-sql-mistakes-beginners-make',
  'SQL',
  'Common SQL Mistakes Beginners Make',
  'Most early SQL bugs are not exotic. They come from fuzzy filters, careless joins, and metrics built on the wrong grain.',
  $html$<p>Beginners often assume SQL errors will look loud: a red message, a failed run, an empty result. Many of the costly mistakes look fine. The query returns rows. The chart renders. The number is simply wrong, and nobody notices until a stakeholder asks how it was built.</p><p>Learning the common failure patterns early is faster than collecting more syntax. A short list covers most of what trips people up in their first months.</p><h2>Mistakes that show up again and again</h2><ul><li>Filtering after you already joined, so the row count quietly expands first.</li><li>Using INNER JOIN when you still need unmatched rows from one side.</li><li>Grouping by the wrong columns and calling the result a business metric.</li><li>Comparing dates as text, or mixing time zones without saying so.</li><li>Selecting * in shared queries, then wondering why the logic is hard to reuse.</li></ul><p>Each of these is easy to miss in a tutorial that only checks whether the query runs.</p><h2>A better habit than more functions</h2><p>After every join, glance at the row count. After every metric, say out loud what one row means. After every date filter, write the range in plain language. Those three checks catch more bugs than memorizing another window function.</p><p>SQL fluency is not a longer keyword list. It is noticing when a clean-looking answer stopped matching the question.</p>$html$,
  'published',
  '2026-10-28T17:00:00.000Z'::timestamptz,
  'October 29, 2026',
  2,
  '2 min read'
),
(
  'what-makes-a-dashboard-worth-opening',
  'Analytics',
  'What Makes a Dashboard Worth Opening',
  'A dashboard earns attention when it answers a recurring question quickly. Decoration without a decision usually gets ignored.',
  $html$<p>Teams build dashboards because sharing a live view feels productive. Weeks later, many of those pages sit unopened. The problem is rarely the chart library. It is that nobody agreed which question the page exists to answer, or what someone should do when a number moves.</p><p>A dashboard worth opening is closer to a working tool than a gallery. It reduces the time between “I need to know” and “I know enough to act.”</p><h2>Signals of a useful dashboard</h2><ul><li>One primary question is obvious above the fold.</li><li>Metrics use definitions the team already trusts.</li><li>Filters match how people actually cut the business.</li><li>Freshness and ownership are clear, so stale data does not surprise anyone.</li></ul><p>If you need a meeting to explain what each tile means, the page is not ready for self-serve.</p><h2>Build less, answer more</h2><p>Start with the weekly questions leaders already ask. Ship a narrow view that answers those well. Add detail only when the same follow-up appears twice. A short dashboard that gets used beats a wide one that feels complete in a demo and empty in daily work.</p><p>Analytics value shows up in decisions and saved time. If a page does not help either, it is decoration — and decoration rarely stays open.</p>$html$,
  'published',
  '2026-10-27T17:00:00.000Z'::timestamptz,
  'October 28, 2026',
  2,
  '2 min read'
),
(
  'do-you-need-advanced-math-for-data-science',
  'Data Science',
  'Do You Need Advanced Math for Data Science?',
  'You need enough math to reason about uncertainty and model behavior — not a pure-math degree before you can start.',
  $html$<p>Math anxiety stops a lot of people from trying data science. They picture proofs and graduate coursework before they picture a business question, a clean table, and a simple model. That picture is incomplete. Many practical roles reward statistical sense and careful validation more than exotic theory on day one.</p><p>You still cannot skip quantitative thinking. You need to know what an average hides, why correlation is not causation, how train and test splits protect you from false confidence, and what a metric like precision or recall is trading off.</p><h2>What is usually enough to begin</h2><ul><li>Descriptive stats and distributions you can explain in plain language</li><li>Basic probability intuition for uncertain outcomes</li><li>Linear models and trees at a conceptual level</li><li>Enough calculus or linear algebra later, when a method truly needs it</li></ul><p>Advanced topics become useful when you are tuning methods, reading papers, or working on harder research-like problems. They are rarely the gate that should block a first project.</p><h2>Learn math in the loop of real work</h2><p>The sticky way to learn is to meet a concept when a project demands it. Build a baseline model. Ask why it fails on one segment. Learn the idea that explains the failure. That path builds judgment faster than a long syllabus with no dataset attached.</p><p>So yes, math matters. No, you do not need to finish every advanced course before you write your first honest experiment. Start with problems, add theory when the problem gets stuck, and keep both sides honest.</p>$html$,
  'published',
  '2026-10-26T17:00:00.000Z'::timestamptz,
  'October 27, 2026',
  2,
  '2 min read'
),
(
  'what-to-put-in-a-data-portfolio',
  'Career',
  'What to Put in a Data Portfolio',
  'Hiring managers skim. A strong portfolio shows a clear question, a real method, a result, and the limits you would defend out loud.',
  $html$<p>A portfolio is not a museum of every notebook you ever touched. It is evidence that you can finish analysis other people can trust. When someone opens your work for thirty seconds, they should understand the problem, the approach, and why the result matters.</p><p>Quantity rarely helps. Three shallow tutorial clones look weaker than one complete project with a sharp story.</p><h2>What belongs in each project</h2><ul><li>Context: who would care and what decision is nearby</li><li>Data: where it came from and what you cleaned or excluded</li><li>Method: why you chose that path over a simpler one</li><li>Result: the finding in one or two sentences</li><li>Limits: what would make you distrust the answer</li></ul><p>Put that narrative above the code. Code supports the claim; it should not be the only thing on the page.</p><h2>Keep the set coherent</h2><p>Point every piece at the role you want. Analyst portfolios should emphasize questions, metrics, and communication. Science-leaning portfolios should show modeling judgment and validation. Mixed signals make readers guess.</p><p>Update the portfolio when you can tell the story without reading the README. That is usually the same moment it becomes useful in interviews.</p>$html$,
  'published',
  '2026-10-25T17:00:00.000Z'::timestamptz,
  'October 26, 2026',
  1,
  '1 min read'
)
ON CONFLICT (slug) DO NOTHING;
