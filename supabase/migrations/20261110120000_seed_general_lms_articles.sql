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
  'how-to-practice-sql-with-real-questions',
  'SQL',
  'How to Practice SQL With Real Questions',
  'Syntax drills help a little. Progress gets faster when every practice query starts from a question someone would actually ask.',
  $html$<p>Many people practice SQL by copying isolated exercises: write a join, write a group by, move to the next prompt. That builds recognition, but it does not build the habit teams hire for — turning a messy business question into a trustworthy result set.</p><p>A better loop starts from the question, not from the keyword you want to rehearse.</p><h2>Practice like the work shows up</h2><ul><li>Pick a dataset and invent questions a manager would ask: growth, retention, top products, late orders.</li><li>Write the grain in one sentence before you write the SELECT.</li><li>Solve it once the simple way, then refactor for clarity with CTEs.</li><li>Check row counts after joins and sanity-check one known total.</li></ul><p>If the answer looks weird, treat that as the lesson. Debugging is where SQL judgment forms.</p><h2>Keep a short log</h2><p>For each practice question, note what confused you and what you would try first next time. Over a few weeks you will see patterns: date filters, fan-out joins, or metrics that need windows. That log is more useful than finishing another random drill set without reflection.</p><p>SQL improves when practice feels like answering someone, not only completing a worksheet.</p>$html$,
  'published',
  '2026-11-09T17:00:00.000Z'::timestamptz,
  'November 10, 2026',
  1,
  '1 min read'
),
(
  'from-raw-data-to-a-clear-recommendation',
  'Analytics',
  'From Raw Data to a Clear Recommendation',
  'Exploration is only half the job. The useful finish line is a short recommendation someone can accept, challenge, or schedule.',
  $html$<p>It is easy to spend hours cleaning columns, cutting segments, and building charts — then end the week with “interesting findings” and no next step. Stakeholders do not need every path you explored. They need a recommendation they can react to.</p><p>Analytics becomes valuable when the last slide, message, or paragraph states what to do, what to watch, or what to stop doing.</p><h2>A simple finish line</h2><ul><li>Restate the question in business language.</li><li>Share the one or two numbers that matter most.</li><li>Offer a recommendation with a clear owner and timing.</li><li>Name the uncertainty so people know what could change the call.</li></ul><p>If you cannot recommend yet, say what data or decision is still missing. That is still clearer than a pile of charts with no ask.</p><h2>Why recommendations build trust</h2><p>People remember analysts who help them choose. Exploration proves curiosity. A recommendation proves judgment. Even a cautious recommendation — “do not scale this channel until refund rates settle” — is more useful than a beautiful page that leaves the room guessing.</p><p>Make the last sentence do the work. If it does not change what someone does this week, the analysis is not finished.</p>$html$,
  'published',
  '2026-11-08T17:00:00.000Z'::timestamptz,
  'November 9, 2026',
  1,
  '1 min read'
),
(
  'how-to-explain-a-model-to-non-technical-stakeholders',
  'Data Science',
  'How to Explain a Model to Non-Technical Stakeholders',
  'If people cannot tell what the model is for, what it might get wrong, and what to do with the score, it will not get used.',
  $html$<p>Technical detail impresses other practitioners. Stakeholders usually need a shorter story: what problem the model addresses, how good is “good enough,” and what happens when it is wrong. If that story is missing, the project stalls even when the notebook looks strong.</p><p>Explanation is part of the deliverable, not an optional presentation layer.</p><h2>Lead with use, not architecture</h2><ul><li>Start from the decision the score should influence.</li><li>Describe inputs in business terms, not feature lists.</li><li>Show one example of a correct call and one likely failure mode.</li><li>Say how often the model should be checked or refreshed.</li></ul><p>Skip algorithm names until someone asks. Most rooms care more about risk and action than about the method label.</p><h2>Translate tradeoffs into consequences</h2><p>Instead of only quoting a metric, explain the cost of mistakes: too many false alarms versus missed cases. Give people a way to choose the threshold with you. When stakeholders help set that tradeoff, adoption gets easier because the model feels like a shared tool, not a black box dropped on their process.</p><p>A model that cannot be explained in one honest page is usually not ready for production conversations.</p>$html$,
  'published',
  '2026-11-07T17:00:00.000Z'::timestamptz,
  'November 8, 2026',
  1,
  '1 min read'
),
(
  'how-to-prepare-for-a-data-interview',
  'Career',
  'How to Prepare for a Data Interview',
  'Strong preparation is less about memorizing trivia and more about telling clear stories, solving practical problems, and showing judgment.',
  $html$<p>Data interviews vary by company, but the same three pressures show up often: Can you work with data under time limits? Can you explain your thinking? Can you connect the work to a business outcome? Preparation that only drills flashcards usually misses at least one of those.</p><p>Build a small plan that covers story, skills, and practice under realistic conditions.</p><h2>What to prepare first</h2><ul><li>Two project stories with context, method, result, and limitation</li><li>Core SQL and analysis drills you can do without notes</li><li>One example of a wrong answer you caught and fixed</li><li>Questions for them about data quality, stakeholders, and success metrics</li></ul><p>If the role leans science, add a modeling story with validation and failure modes. If it leans analytics, emphasize metrics definitions and communication.</p><h2>Practice out loud</h2><p>Silent review creates false confidence. Say your answers aloud, timed. Explain a chart as if a busy manager interrupted you. Walk through a query while naming grain and filters. The interview is a conversation; rehearsal should sound like one.</p><p>You do not need perfect recall of every function. You need calm structure when the problem is messy — and that is a skill you can practice on purpose.</p>$html$,
  'published',
  '2026-11-06T17:00:00.000Z'::timestamptz,
  'November 7, 2026',
  1,
  '1 min read'
)
ON CONFLICT (slug) DO NOTHING;
