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
  'why-learn-sql-nowadays',
  'SQL',
  'Why Learn SQL Nowadays?',
  'Tools change every year. The skill of asking a clear question of a table still shows up in almost every data job.',
  $html$<p>New products keep promising that you will never need to write a query again. Dashboards get smarter. Assistants draft joins for you. Spreadsheets connect to warehouses with a few clicks. And yet job posts for analysts, scientists, and engineers still put SQL near the top of the list.</p><p>That is not nostalgia. Most of the information a company trusts still lives in tables. If you cannot read those tables yourself, you depend on someone else’s summary — and you cannot tell when the summary drifted from the truth.</p><h2>What SQL actually gives you</h2><p>SQL is less about memorizing every function and more about a few habits that transfer.</p><ul><li>You can check a number instead of trusting a screenshot.</li><li>You can combine data from more than one place without waiting on a new report.</li><li>You can explain how a metric was built, not only what the chart shows.</li><li>You can follow along when an engineer or an assistant proposes a query and spot what looks off.</li></ul><p>Those habits matter whether you type every line by hand or only review what a tool generated.</p><h2>Why it still belongs on a learning path</h2><p>Interfaces will keep getting easier. The hard part stays the same: knowing what one row means, which filter belongs in the question, and when two tables should not be joined casually. SQL is the common language for that thinking across teams and tools.</p><p>You do not need to become a database specialist. You need enough SQL to ask better questions, verify answers, and stop treating every chart as final. That is why learning it still pays off — even in a world full of shortcuts.</p>$html$,
  'published',
  '2026-10-15T17:00:00.000Z'::timestamptz,
  'October 16, 2026',
  4,
  '4 min read'
),
(
  'why-data-analytics-still-matters',
  'Analytics',
  'Why Data Analytics Still Matters',
  'Collecting data is easy. Turning it into a decision people will act on is still the work that moves a team.',
  $html$<p>Companies generate more data than they can use. Sensors, apps, payments, support tickets — the raw material is rarely the bottleneck. The bottleneck is making sense of it in time for someone to choose differently: ship, pause, spend, or stop.</p><p>That is what analytics is for. Not prettier charts for their own sake, and not a graveyard of dashboards nobody opens. Analytics is the practice of framing a question, cleaning enough to trust the answer, and telling a story short enough to change the next meeting.</p><h2>What good analytics looks like</h2><p>Strong analytical work usually shares the same shape, even when the tools differ.</p><ul><li>A clear question before a clear chart.</li><li>A definition of the metric that other people can reuse.</li><li>An honest look at messy data, not a pretend-perfect table.</li><li>One recommendation, not twenty slides of exploration.</li></ul><p>Anyone can open a BI tool. Fewer people can say what changed, why it might have changed, and what to do next.</p><h2>Why the skill stays relevant</h2><p>Automation can draft summaries and fill templates. It cannot own the judgment call when the business question is fuzzy, when two teams mean different things by “active user,” or when the honest answer is “we do not know yet.”</p><p>Analytics still matters because decisions still need that judgment. Learn it if you want to be the person who turns noise into a next step — not only the person who refreshes a report.</p>$html$,
  'published',
  '2026-10-14T17:00:00.000Z'::timestamptz,
  'October 15, 2026',
  4,
  '4 min read'
),
(
  'what-data-science-is-actually-for',
  'Data Science',
  'What Data Science Is Actually For',
  'It is not a pile of algorithms. It is a way to turn uncertain data into a prediction or decision you can defend.',
  $html$<p>Data science gets described as magic, as coding, or as statistics with better branding. None of those definitions help when you are deciding whether to learn it — or how to talk about it in an interview.</p><p>At its core, data science is a loop: start from a real question, use data and models to reduce uncertainty, then check whether the answer holds up outside the notebook. Sometimes that means a forecast. Sometimes it means a classifier. Sometimes it means showing that a fancy model is no better than a simple rule.</p><h2>More than building models</h2><p>The visible part is often the algorithm. The useful part is usually everything around it.</p><ul><li>Framing the problem so a wrong prediction has a clear cost.</li><li>Choosing data that actually contains a signal.</li><li>Validating results in a way that matches how the business will use them.</li><li>Explaining limits so people do not over-trust a score.</li></ul><p>A model nobody can explain, monitor, or act on is a demo. Data science worth hiring for ends in a decision, a product behavior, or a clear “do not ship this.”</p><h2>Why people still learn it</h2><p>Tools will keep wrapping models in friendlier interfaces. The need to think carefully about uncertainty does not go away. If you like combining curiosity, math, and practical constraints — and you want work that sits between product questions and technical answers — data science is still one of the clearest paths.</p><p>Learn it for the judgment, not for the buzzword. The job is making better bets with incomplete information, and being honest about how incomplete it still is.</p>$html$,
  'published',
  '2026-10-13T17:00:00.000Z'::timestamptz,
  'October 14, 2026',
  4,
  '4 min read'
),
(
  'building-a-career-in-data-where-to-start',
  'Career',
  'Building a Career in Data: Where to Start',
  'You do not need every tool on day one. You need a target role, a few durable skills, and proof you can finish something real.',
  $html$<p>Data careers look crowded from the outside: analyst, scientist, engineer, dozens of tool logos, and advice that contradicts itself every month. The useful starting point is simpler. Pick the kind of problem you want to spend your weeks on, then build a small stack of skills that show up in that work again and again.</p><p>Most paths still share a base. You need to be comfortable with tables, with cleaning messy inputs, and with explaining a result to someone who did not write the query. From there, roles diverge — more storytelling and metrics on the analytics side, more modeling and experimentation on the science side, more systems and reliability on the engineering side.</p><h2>A practical starting order</h2><p>You will move faster if you deepen a few things before you collect ten more names.</p><ul><li>Choose a target role title and keep your projects pointed at it.</li><li>Get solid at SQL and one analysis workflow you can repeat.</li><li>Ship one complete project: question, data, method, result, limitation.</li><li>Practice telling that story out loud without reading your notebook.</li></ul><p>Breadth can come later. Early on, depth in a coherent direction beats a resume that lists every library once.</p><h2>How to know you are progressing</h2><p>Progress is not a longer tool list. Progress is when you can take an unfamiliar dataset, ask a sharper question, and defend the answer. Progress is when a mentor or hiring manager stops asking what you watched and starts asking what you decided.</p><p>Start narrower than feels comfortable. Finish something real. Then widen. That sequence is still the most reliable way into a data career — and the one that holds up when the trendy stack changes again.</p>$html$,
  'published',
  '2026-10-12T17:00:00.000Z'::timestamptz,
  'October 13, 2026',
  4,
  '4 min read'
)
ON CONFLICT (slug) DO NOTHING;
