# Prompt Log — Monster Interview

Rule: only record things that actually happened. Leave a field blank until it is true.

---

## Step 0 — Planning (no code)
- **Objective:** Agree on architecture, token budget, guardrails, and a step-by-step build plan before writing code.
- **My prompt (original, verbatim):**

<details>
<summary>Click to expand the full original prompt</summary>

```text
MONSTER INTERVIEW — NEXT CHAPTER WEEK 6 PROJECT

Your role

You are my senior full-stack development partner, technical mentor, and code reviewer.

I am a beginner developer enrolled in the Next Chapter AI Engineering program. I am learning Next.js, React, JavaScript, APIs, back-end development, Git, and responsible AI engineering.

I use Claude Code inside VS Code to assist with development, but I want to understand the code and make important decisions myself.

CRITICAL: We are starting in PLAN MODE ONLY. Do not create files, modify code, install packages, run migrations, or begin implementation until I explicitly approve the plan.

Do not try to build the complete project in one pass.

1. Project overview

Project name: Monster Interview

Tagline: The scariest job interview you'll ever love.

Create a fun, polished, Halloween-themed mock interview web application with real AI-powered interview feedback.

The Halloween experience is the initial theme. The underlying application should be structured so that it could eventually become a real interview preparation tool for students, young professionals, and jobseekers.

User experience

User visits a modern, interactive landing page.

User sees a selection of fictional monster interviewers.

User chooses an interview category.

User begins a three-question interview.

User types an answer to each question.

User progresses through the interview with clear visual feedback.

After completing all three questions, the user clicks "Reveal My Fate."

The app makes a secure AI API call to evaluate the answers.

User receives a visually engaging feedback report.

User can restart the experience.

Characters

Design three interviewer character concepts:

Count Dracula: A theatrical, demanding corporate CEO who values confident communication.

Zombie Boss: A chaotic, distracted interviewer with a playful personality.

Friendly Ghost: An encouraging interviewer who makes nervous applicants comfortable.

For MVP, only Dracula must be functional. Other characters can appear as clearly labeled future options.

Do not implement extra character personalities unless the core application is complete and tested.

Interview categories

Start with a limited selection:

Entry-Level Job

Internship

Leadership / Fellowship

Use a small set of predetermined questions stored in the project, rather than generating questions through the AI API.

Keep three questions per interview.

2. Design requirements

I want the website to feel like a polished, modern interactive game, not a basic chatbot or a generic form.

Visual inspiration: modern game menus, interactive storytelling, polished web apps, and playful Halloween experiences.

Design direction

Dark purple or near-black backgrounds.

Vibrant orange highlights.

Neon purple accents.

High-quality character presentation.

Modern typography.

Responsive cards and buttons.

Smooth but lightweight transitions.

Hover effects and interactive feedback.

Clear progress indicator (Question 1 of 3).

An immersive interview screen.

A dramatic but readable final results screen.

The interface should feel playful, premium, and inviting—not genuinely frightening.

Required screens

Screen 1: Welcome / Landing

Monster Interview branding.

Halloween-inspired visual treatment.

Tagline.

Prominent "Enter the Interview" action.

Character selection.

Screen 2: Interview Setup

Character selected.

Interview category.

Explanation of the three-question challenge.

Start Interview button.

Screen 3: Interview Experience

Character portrait or visual identity.

Interview question.

Textarea for user response.

Question counter / progress bar.

Next Question button.

Clear validation feedback.

Back navigation that preserves previously entered answers.

Screen 4: AI Feedback Results

Playful interview outcome heading.

Overall qualitative assessment.

Two or three strengths.

Two or three improvement suggestions.

One improved example answer grounded in the user's actual response.

Option to restart the interview.

The result should not pretend to be a real hiring decision.

Design implementation

Use React components and standard CSS or CSS Modules.

Avoid adding large UI libraries or unnecessary dependencies.

Build reusable components where practical.

Prioritize accessibility, mobile responsiveness, readable contrast, and clear loading/error states.

If character artwork is not available, propose a simple, maintainable visual solution without making image generation a dependency for completing the MVP.

3. Required technical stack

Use the tools and concepts I have learned in my coursework:

Next.js with App Router.

React functional components and hooks.

JavaScript, not TypeScript.

Node.js.

Next.js API route handlers.

Standard CSS or CSS Modules.

Git and GitHub.

Environment variables for API secrets.

The AI API provider and key supplied by my instructor, if compatible with the project.

Do not introduce a database, authentication, payment system, file uploads, or unnecessary external services.

Do not use Python as the application's implementation language.

Use the simplest architecture that demonstrates a real full-stack AI feature.

4. AI API integration

This project must call an actual AI API from the application's BACK END.

Never call the AI provider directly from browser-side React code.

Store the API key in a Git-ignored environment variable.

Never put the API key in the front end, repository, logs, prompt history, or screenshots.

Do not ask me to paste the API key into chat.

Before writing API integration code, verify which provider, endpoint, model, and SDK are available through my instructor.

MVP API strategy

Use exactly one AI API request per completed interview.

The user answers three predetermined questions.

The back end sends the three question-and-answer pairs to the AI model in a single evaluation request.

The AI returns one structured feedback response.

This is intended to keep the number of calls, token consumption, cost, and failure points manageable.

Do not add a second AI API call for formatting, repairing JSON, or generating decorative text.

System prompt

Create a dedicated server-side system prompt that:

Defines the AI as a supportive, constructive mock interview coach.

Uses a playful Dracula-inspired tone.

Evaluates responses based only on the actual questions and answers.

Does not invent qualifications, experiences, facts, or outcomes.

Gives actionable, concise feedback.

Does not make hiring or employability guarantees.

Uses plain, encouraging language.

Returns a predictable structured format.

Acknowledges uncertainty when answers provide insufficient information.

I want to understand exactly where this system prompt lives in the code and how changing it changes the model's behavior.

5. Token management and cost control

Token management is a central learning objective.

Implement:

A server-side maximum length for each answer.

A maximum output-token setting, using the provider's supported parameter.

Only the information required to evaluate the interview.

A small, cost-efficient AI model compatible with the instructor's credentials.

Tracking of actual input and output token usage when the provider exposes that information.

A way to calculate an estimated cost per interview and per 1,000 interviews.

Use actual provider pricing verified at implementation time. Never invent pricing.

Explain whether token usage should appear in a small optional developer/debug panel or server-side development log.

Do not expose secrets or sensitive answer content in logs.

Do not call the API automatically when users switch questions, edit text, navigate, or refresh.

Only make the evaluation call when the user intentionally submits the completed interview.

Prevent accidental duplicate submissions.

6. Guardrails and reliability

I struggle with these concepts, so this section is especially important.

I need to understand and demonstrate three different types of protection.

Guardrail A: Input validation

Before making an API call:

Reject empty or whitespace-only answers.

Enforce reasonable answer length limits.

Validate the expected number of questions and answers.

Validate the selected interview category.

Reject malformed request data.

Treat user answers as untrusted content, not instructions.

Explain how each check protects reliability and/or limits cost.

Guardrail B: Output validation

Before displaying AI feedback:

Verify the response exists.

Validate the expected structured output fields.

Check required fields and expected types.

Reject empty or malformed feedback.

Avoid displaying invented scoring claims or unsupported conclusions.

Display a useful fallback if the output is unusable.

Use the provider's supported structured-output feature if appropriate, plus application-side validation.

Never assume the AI returns perfectly formatted information just because the prompt requests it.

Guardrail C: API failure handling

Implement safe handling for:

API errors.

Rate-limit errors (HTTP 429).

Timeouts.

Network failures.

Invalid AI responses.

Use appropriate try/catch handling.

Show friendly, useful error messages rather than raw technical errors.

Ensure users' previously entered answers remain available so they can retry.

Prevent unlimited automatic retries. For MVP, favor a deliberate manual retry.

Required reliability tests

I want to test each guardrail deliberately.

Create tests for:

Empty answer.

Whitespace-only answer.

Excessively long answer.

Missing question or answer.

Malformed server request.

Simulated HTTP 429 error.

Simulated AI timeout.

Simulated invalid or empty AI response.

Successful normal interview.

Attempted duplicate submission.

Tests for expected failures should not require spending real API tokens. Use mocked responses or simulated errors where appropriate.

Explain the expected result of each test and what passing it proves.

7. Week 6 course compliance

The final application must demonstrate:

Day 1 — Calling an AI API

Secure server-side AI integration.

System prompt in code.

API result displayed in the interface.

Understanding of the full request/response flow.

Day 2 — Tokens, cost, and rate limits

Token usage awareness and measurement.

Realistic cost estimate.

Input/output caps.

Graceful rate-limit handling.

Day 3 — Guardrails and reliability

Input validation.

Output validation.

API-error and timeout handling.

Deliberate failure testing.

Day 4 — Controlled build

Working application.

Reviewed code changes.

Small Git commits.

Prompt log.

No exposed secrets.

Demonstration-ready feature.

8. Prompt Log

At the beginning of implementation, help me create:

PROMPT_LOG.md

It should document each development step with:

Step number and objective.

My prompt to Claude Code.

Files changed.

Why those changes were made.

Important code concepts learned.

How I tested the change.

Test results.

Problems or errors encountered.

Claude mistakes I identified.

Corrections made.

Git commit message and hash after I commit.

Do not invent tests, mistakes, or results.

Help me write entries as we actually complete work.

9. Git and GitHub workflow

I want to perform Git commits myself.

Do not automatically commit or push code unless I explicitly request that action.

After each completed, verified milestone:

Explain the files that changed.

Walk me through the important code.

Show me how to review the Git diff.

Give me the appropriate Git commands.

Tell me how to verify that no secret files are tracked.

Suggest a short, descriptive commit message.

Let me perform the commit myself.

Do not move to the next development step until I confirm the current step works.

10. Teaching and collaboration style

I learn best through small, sequential steps.

Follow this process:

Explain → Implement one small change → Review → Test → Confirm → Commit → Log → Next step.

Never make large batches of changes across many unrelated files.

Do not silently fix unrelated issues.

Do not add features merely because they seem useful.

When introducing an unfamiliar concept, explain it in plain English with an example from this application.

Whenever possible, explain:

What runs in the browser.

What runs on the server.

Where the AI API is called.

What data is sent.

What data is returned.

What could fail.

How we verify it works.

I want to be able to explain the application myself at demo day.

11. Time and scope

This is a two-day MVP build.

Prioritize completing the core course requirements over additional features.

MVP requirements:

Functional Dracula interview.

Three interview questions.

One AI feedback request.

Modern Halloween interface.

Secure API key.

System prompt.

Token and cost management.

Three categories of guardrails.

Working error handling.

Reliability tests.

GitHub repository.

Prompt Log.

Future features, NOT required for MVP:

Additional playable monsters.

AI-generated interview questions.

Voice conversations.

Animated character lip-sync.

User accounts.

Saved interview history.

Resume analysis.

Real job matching.

Database integration.

12. Your task right now: PLAN ONLY

Before we implement anything:

Inspect the current working directory only after confirming which folder or repository I want to use.

Recommend a simple Next.js/React/JavaScript project architecture.

Identify the minimum pages, components, and API routes required.

Explain the data flow from user input to the AI API and back.

Propose a strict AI request/token budget.

Explain the system prompt and response format.

Identify the guardrails and how to test them.

Propose a two-day build sequence broken into small, individually testable milestones.

Identify the most likely technical risks or scope problems.

Provide an MVP acceptance checklist mapped to all Week 6 requirements.

For each milestone, describe:

What we will build.

Which files will change.

What I will learn.

How we will test it.

What I should check before committing.

Do not implement anything yet.

Present your proposed plan and stop so I can review and approve it before we begin Step 1.
```

</details>

- **Files changed:** none (plan saved outside the repo by Claude Code).
- **Why:** Avoid building everything in one pass; understand each piece first.
- **Decisions made:** OpenAI is the provider (my own key). Model: `gpt-4.1-nano`, chosen because it is cheap and non-reasoning, so output tokens are predictable. May revisit later.
- **Verified from OpenAI docs (pricing page shows no date):** `gpt-4.1-nano` is $0.10 per 1M input tokens and $0.40 per 1M output tokens (Standard tier). Re-check before the cost step.

---

## Step 1 — Project setup
- **Objective:** Create the Next.js app (JavaScript, App Router, no Tailwind/TypeScript), install the `openai` SDK, protect secrets with `.gitignore`, add `.env.example`, start this log.
- **My prompt:** "Continue with the recommendation of gpt-4.1-nano and adjust later if we think its better."
- **Files changed:** `package.json`, `package-lock.json`, `app/*`, `public/*`, `jsconfig.json`, `next.config.mjs`, `README.md`, `AGENTS.md`, `.gitignore` (added `!.env.example` after `.env*`), `.env.example`, `PROMPT_LOG.md`.
- **Why:** `.env*` is ignored so a real key can't be committed; `!.env.example` lets the placeholder template be committed.
- **Concepts learned:**
  - Staging: `git add` moves changes into a waiting area; `git commit` snapshots only what is staged.
  - `.env*` in `.gitignore` hides secret files; `!.env.example` re-includes the placeholder template.
  - Env vars without a `NEXT_PUBLIC_` prefix stay on the server; with it, Next.js ships them to the browser.
  - `git ls-files` lists only tracked/staged files, so it shows nothing before `git add`.
  - `grep` exits with status 1 when nothing matches, which VS Code shows as a red dot (not a real error).
- **How I tested:**
  - Claude ran `git check-ignore -v .env.local .env.example`: `.env.local` matched the ignore rule (`.gitignore` line 34); `.env.example` matched the exception (line 35), so it is not ignored.
  - I ran `git add .` then `git ls-files | grep -i env`.
  - `npm run dev` and opening http://localhost:3000.
- **Test results:** `git ls-files | grep -i env` listed only `.env.example`, so no secret file is tracked. The dev server ran and showed the default Next.js page.
- **Problems / errors:**
  - `create-next-app` refused to run in this folder because its name `monster-Interview` has a capital letter (npm package names must be lowercase). Workaround: scaffolded in a temp folder named `monster-interview` and copied the files in; the folder name was not changed at that time. I later renamed the folder to `monster-interview` myself.
  - A `.git` folder already existed (likely left by the failed first `create-next-app` run). It had no commits, so it was harmless.
  - I first ran `git ls-files | grep -i env` before `git add .`, saw only a red dot and no output. Cause: nothing was staged yet, so there was nothing to list. After `git add .` it worked.
- **Claude mistakes I identified:** (fill in only if I find any)
- **Corrections made:**
- **Git commit message:** Set up Next.js app, openai SDK, and env safety
- **Commit hash:** f499427
---

## Step 2 — Data files and theme
- **Objective:** Store the fixed interview content and character info in the project, and set the dark purple / orange / neon theme colors.
- **My prompt:** "Yes, the run dev showed the next.js page. Lets go with step 2"
- **Files changed:** `lib/questions.js` (new), `lib/characters.js` (new), `app/globals.css` (theme variables, gradient background, font), `PROMPT_LOG.md`.
- **Why:**
  - `lib/questions.js`: 3 categories x 3 fixed questions plus the limits `MAX_ANSWER_CHARS = 800` and `QUESTIONS_PER_INTERVIEW = 3`. The server will look questions up itself, so the browser can't tamper with them and fewer tokens are sent. One shared limit means the form and the server validation agree.
  - `lib/characters.js`: Dracula is `available: true`; Zombie Boss and Friendly Ghost are `available: false` (shown as "coming soon" later).
  - `app/globals.css`: CSS variables (`--orange`, `--neon-purple`, `--surface`, ...) so components never repeat hex codes.
- **Concepts learned:** ES module `export`/`import`; a single source of truth for shared constants; CSS custom properties (`var(--orange)`); data lookups returning `null` for unknown ids (used later by input validation).
- **How I tested:**
  - Claude ran a Node check: 3 categories each with exactly 3 questions, only Dracula playable, unknown ids return `null`.
  - Me: `npm run dev`, open http://localhost:3000 and check the background.
- **Test results:** Node check passed (output above). Browser check: `npm run dev` ran successfully and a Next.js page showed on screen (I did not report a specific check of the purple background).
- **Problems / errors:** Node printed a `MODULE_TYPELESS_PACKAGE_JSON` warning because `package.json` has no `"type": "module"`. Harmless for now; to be handled when tests are added (Step 5).
- **Claude mistakes I identified:**
- **Corrections made:**
- **Git commit message:** Add questions, characters data and theme variables
- **Commit hash:** c0b0c09

---

## Step 3 — Landing + character select
- **Objective:** Build the landing screen with branding, tagline, character cards (Dracula playable, other two "coming soon"), and an "Enter the Interview" button.
- **My prompt:** "We're on the Monster Interview project. Read PROMPT_LOG.md and that plan file, then start Step 3. And help me connect this to the git hub repo"
- **Files changed:** `components/MonsterAvatar.js` + `.module.css`, `components/CharacterCard.js` + `.module.css`, `components/Landing.js` + `.module.css` (all new); `app/page.js` (replaced template with a `screen` state); `app/layout.js` (title/description); `app/page.module.css` (deleted, unused template CSS); `PROMPT_LOG.md`.
- **Why:**
  - `MonsterAvatar`: emoji on a glowing orb, so no image files are needed for the MVP.
  - `CharacterCard`: a real `<button>`; unavailable characters are `disabled` with a "Coming soon" badge; `aria-pressed` marks the selected card.
  - `Landing`: client component because it holds the selected-character state; calls `onEnter(characterId)` when the button is clicked.
  - `app/page.js`: holds `screen` state so later steps can add setup, interview and results screens.
- **Concepts learned:** Server vs Client Components (`"use client"` is needed for `useState` and click handlers); CSS Modules (class names scoped per component); passing data up with callback props (`onEnter`, `onSelect`); `disabled` buttons and `aria-pressed`.
- **How I tested:** `npm run dev` at http://localhost:3000; clicked Dracula and Enter the Interview; narrowed the window to 375px; tried clicking the coming-soon cards. Claude also ran `next build`, which compiled successfully.
- **Test results:** Page opened on localhost. The Dracula card worked and let me into the next (placeholder) page. Cards stacked at 375px. The coming-soon cards were unclickable.
- **GitHub connection:** `git remote -v` shows `origin` = `https://github.com/hcarvente/monster-interview.git`, and `main` tracks `origin/main`. Checked later: local `main` was 2 commits ahead of GitHub (the two log-only commits), so those still needed a push.
- **Problems / errors:** None so far. Keyboard focus ring was not reported as checked.
- **Claude mistakes I identified:**
- **Corrections made:**
- **Git commit message:** Add landing screen and character selection
- **Commit hash:** 7c2335a

---

## Step 4a — Setup screen
- **Objective:** Build the setup screen where the user sees the chosen character, reads the 3-question explanation, and picks an interview category before starting.
- **My prompt:** "Deal with repo, and I changed the folder name to monster-interview" / "yes commit and push, then start Step 4"
- **Files changed:** `components/SetupScreen.js` + `.module.css` (new); `app/page.js` (added `categoryId` state and renders `SetupScreen`; interview screen still a placeholder); `PROMPT_LOG.md`.
- **Why:**
  - `categoryId` lives in `page.js` (lifted state) so the choice survives Back and carries into the interview in Step 4b.
  - Category options are `role="radio"` inside a `radiogroup` with `aria-checked`, so assistive tech reads them as one single-choice group.
  - Start Interview is `disabled` until a category is picked, with a hint under it.
- **Concepts learned:** Lifting state up; controlled selection via props and callbacks; ARIA radio group; disabled buttons as simple validation feedback.
- **How I tested:** `npm run dev` at http://localhost:3000. Claude also ran `next build`, which compiled successfully.
- **Test results:** Per me: all components worked. I went through each of the three categories back and forth, and picking a category and the Start Interview button worked. I did not report checking the keyboard focus ring or the 375px width for this screen.
- **Problems / errors:** None reported.
- **Claude mistakes I identified:**
- **Corrections made:**
- **Git commit message:** Add setup screen with category selection
- **Commit hash:** 1e46094

---

## Step 4b — Interview screen
- **Objective:** Build the interview screen: one question at a time, textarea, progress indicator, validation, and Back/Next that keep typed answers.
- **My prompt:** "yes commit and push, then start 4b"
- **Files changed:** `components/InterviewScreen.js` + `.module.css`, `components/ProgressBar.js` + `.module.css` (all new); `app/page.js` (added `answers` and `questionIndex` state and renders `InterviewScreen`; results screen is a placeholder, no API call).
- **Why:**
  - `answers` lives in `page.js` so Back, Next and leaving the screen never lose typed text; `InterviewScreen` is a controlled component.
  - Validation (empty or whitespace-only blocks Next, shown with `role="alert"`) is for UX only; the server will re-validate in Step 5.
  - `maxLength={MAX_ANSWER_CHARS}` reuses the shared 800-character limit.
  - Changing category clears answers because the questions differ (a decision Claude added beyond the plan).
- **Concepts learned:** Controlled components; lifting state up; immutable state updates (`map` to build a new array); `trim()` for whitespace-only checks; ARIA for progress bars and error messages.
- **How I tested:** `npm run dev` at http://localhost:3000. Claude also ran `next build`, which compiled successfully.
- **Test results:** Per me: the 4b test passed. I could type up to 800 characters and go forward and backward with nothing deleted. Keyboard focus and the 375px width also worked. The empty and whitespace-only error message showed, and answers cleared when I changed category.
- **Problems / errors:** None reported.
- **Claude mistakes I identified:**
- **Corrections made:**
- **Git commit message:** Add interview screen with progress bar and answer validation
- **Commit hash:** 3b57ebf

### Step 4 follow-up — Explanatory comments
- **Objective:** Make the code easier for me to reread and learn from.
- **My prompt:** "I need you to make sure you are adding descriptions on all chunks of code that are commented out which I can go back and read and see what everything is doing." / "yes add comments to the CSS too"
- **Files changed:** Comment-only changes to `app/page.js`, `components/*.js` and `.module.css`, and `app/globals.css`. No logic or style values changed.
- **How I tested:** Claude ran `next build` after each round; it compiled successfully.
- **Git commit message:** Add explanatory comments to components and CSS
- **Commit hash:** 78e7ef5

---

## Step 5a — Request validation (Guardrail A)
- **Objective:** Build the server-side input validator and unit-test it before anything calls it.
- **My prompt:** "Contie" (continue), after Step 4 was logged and pushed.
- **Files changed:** `lib/validateRequest.js` (new), `tests/validateRequest.test.js` (new), `package.json` (added `"test"` script).
- **Why:**
  - `validateRequest(body)` is a pure function (no network, no AI), so it can be tested without spending tokens.
  - It treats the body as untrusted: plain object, playable character, known category, exactly 3 answers, each a non-empty string (after trimming) of at most 800 characters.
  - It returns only `characterId`, `categoryId` and trimmed `answers`, so extra client-sent fields are dropped.
- **Concepts learned:** Pure functions; why the server re-validates what the browser already checked; one-thing-broken-per-test style; the difference between input validation and prompt injection (validation can't tell an instruction from an answer; that defense comes from the system prompt in Step 6 and output validation in Step 7).
- **How I tested:** `npm test` (Node's built-in test runner, 17 tests).
- **Test results:** Per me: `npm test` passed.
- **Problems / errors:**
  - `node --test tests/` failed on Node 24 (it read `tests/` as a module path). Fixed by using the glob `"tests/**/*.test.js"`.
  - Node prints a harmless `MODULE_TYPELESS_PACKAGE_JSON` warning because `package.json` has no `"type": "module"`. Left as is for now.
- **Claude mistakes I identified:**
- **Corrections made:** (Claude's own first `test` script failed on Node 24; Claude changed it to a glob pattern. See Problems.)
- **Git commit message:** Add request validation (Guardrail A) with unit tests
- **Commit hash:** 4b7e512

---

## Step 5b — Mock API route and submit flow
- **Objective:** Add `/api/evaluate` returning a hard-coded mock (no AI yet), plus the client `fetch`, loading and error screens, and a duplicate-submit lock.
- **My prompt:** "yes start 5b"
- **Files changed:** `app/api/evaluate/route.js` (new), `components/ErrorBanner.js` + `.module.css` (new), `app/page.js` (submit logic, `loading` and `error` screens, placeholder results).
- **Why:**
  - The route reads JSON inside try/catch, runs `validateRequest`, then returns a mock after a 1.5-second fake delay so the loading state and duplicate guard can be seen. The real AI call replaces the mock in Step 6.
  - An in-memory `inFlight` set rejects an identical request while one is running (HTTP 409 `DUPLICATE_REQUEST`).
  - The client locks with a `useRef` (state updates apply too late for a fast double click) and always unlocks in `finally`.
  - Answers are never cleared on failure; retry is a deliberate button click, never automatic.
- **Concepts learned:** Route Handlers (exported `POST` function; the folder path becomes the URL); `request.json()` can throw; `Response.json(body, { status })`; HTTP status codes (400, 405, 409); `fetch` throws `TypeError` when offline; `finally` for cleanup; what runs in the browser vs the server.
- **How I tested:**
  - Claude ran `next build` (compiled; `/api/evaluate` listed) and `curl` requests against the dev server.
  - Me: browser test with DevTools Network set to Offline, then back online and Try again.
- **Test results:**
  - curl: malformed JSON gave 400; whitespace-only answer gave 400; zombie character gave 400; a second identical request while the first was running gave 409 while the first got 200; a normal request gave 200 with mock feedback; GET gave 405.
  - Browser, per me: the offline test worked.
  - Not separately reported by me: the loading screen on a normal submit and "Back to my answers" from the error screen.
- **Problems / errors:**
  - Claude's temporary second dev server failed because Next allows only one `next dev` per project (mine was already on port 3000); Claude ran the curl tests against the existing server instead.
  - When I stopped and restarted the dev server to test retry, the page reloaded and my answers were gone. Cause: a full page reload wipes React state. That is expected, and the plan only covers errors, not reloads. The right test is DevTools Offline, which does not reload.
- **Claude mistakes I identified:** Claude suggested stopping the dev server as the way to force an error, which resets the page and so cannot test retry.
- **Corrections made:** Switched the test to DevTools Offline.
- **Git commit message:** Add mock evaluate API route and submit flow with loading and error states
- **Commit hash:** 5d2d62c

---

## Step 6 — Gemini provider, model, system prompt and first real call
- **Objective:** Pick the AI provider and model for the real API call.
- **My prompt:** "Okay, am I supposed to get the key now?" / "I dont have credit on the billing page. So what do I do ?" / "Can I instead use a gemini api key which can be free?" / "Yes, go with Gemini 2.5 Flash-Lite"
- **Decision:** Switched from OpenAI (`gpt-4.1-nano`, Step 0) to Google Gemini, first planned as Gemini 2.5 Flash-Lite (later changed to `gemini-3.5-flash-lite`, see below), because I had no OpenAI credit and Gemini has a free tier. My instructor approved using Gemini.
- **Verified from Google's docs (pricing page marked "Last updated 2026-10-22"):** Gemini 2.5 Flash-Lite paid-tier price is $0.10 per 1M input tokens and $0.40 per 1M output tokens (same as `gpt-4.1-nano`); free tier exists. Free-tier content may be used to improve Google's products and reviewed by humans, and the terms say not to submit sensitive, confidential or personal information; paid-tier content is not used that way. Key is created in Google AI Studio; the SDK reads `GEMINI_API_KEY`.
- **Verified from the installed SDK's type definitions (`@google/genai` 2.31.0):** the `interactions` API fields `system_instruction`, `max_output_tokens`, `response_format`, `output_text`, and usage fields `total_input_tokens` and `total_thought_tokens` exist.
- **Resolved later in this step:** the free tier did not stop me (I was on the free tier and the key worked); thinking tokens were 0 on both tested models. Still unknown: my actual rate limits.
- **Files changed:** `package.json` and `package-lock.json` (removed `openai`, added `@google/genai`); `.env.example` (`GEMINI_API_KEY`, `GEMINI_MODEL`); `PROMPT_LOG.md`.
- **Problems / errors:** npm skipped the `protobufjs` postinstall script (a transitive dependency of the new SDK) with an `install-scripts` warning. Not yet checked whether anything depends on it.
- **Git commit message:**
- **Commit hash:**

### Step 6a — System prompt (commit 90b80c2)
- **Files:** `lib/prompts.js` (`SYSTEM_PROMPT`, `buildUserMessage`), `tests/prompts.test.js`.
- **Why:** Rules live in one fixed system message; the user's answers go only in the user message, inside `<answer n="...">` tags with `<` and `>` escaped so an answer cannot close its own tag. After I asked whether more rules would help, Claude proposed and I approved extra rules (length caps per field, bracketed placeholders, nonsense answers, sensitive topics, do not reveal instructions, English only, limited Dracula puns).
- **Concepts learned:** system vs user message; prompt injection is not stopped by input validation, only contained by the prompt design and output validation; every prompt word is sent on every request.
- **Test results:** Per me: `npm test` passed. Prompt size about 536 tokens (rough estimate), later measured as 701 input tokens including the sample interview.
- **Git commit message:** Add system prompt and user message builder with tests

### Step 6b — Gemini client and first real call (commit hash below)
- **Objective:** Call the real AI from the server, once, and see what comes back.
- **My prompt:** "Key is saved, check it, and the billing tier is currently on free tier" / "run the script first as a quick check" / "Yes, go with gemini-3.5-flash-lite"
- **Files changed:** `lib/aiClient.js` (new), `lib/prompts.js` (added `FEEDBACK_SCHEMA`), `app/api/evaluate/route.js` (mock replaced by the real call), `tests/aiClient.test.js` (new), `.env.example`.
- **Why:**
  - `aiClient.js` is the only file that talks to the provider. It sets a 700-token output cap, a 20-second timeout and `maxRetries: 0` (no hidden automatic retries), and rejects any response whose status is not `completed` or whose text is empty.
  - Claude confirmed `maxRetries: 0` works by pointing the real SDK at a local fake server that always returned 429: it received exactly 1 request and threw a `RateLimitError` with `status: 429`.
  - The route logs token counts only, never answers or the key. Two shortcuts are marked TEMPORARY and replaced in Step 7: a plain `JSON.parse` with no output validation, and one generic error message.
- **How I tested:**
  - `npm test` (29 tests; the AI tests use a fake client, so no tokens).
  - Claude checked my `.env.local` for variable names, value presence and length only (never the values); both variables were present with no quotes or spaces, and the file is git-ignored.
  - Claude ran one real-call script with made-up answers (no personal details), using the key from `.env.local`.
- **Test results:**
  - `gemini-2.5-flash-lite` failed with HTTP 404: "no longer available to new users". The pricing page still listed it.
  - `gemini-3.5-flash-lite`: worked, 701 input / 285 output / 0 thinking tokens, 2.5 s, 3 strengths, 2 improvements, improved answer 76 words, valid JSON matching the schema.
  - `gemini-3.1-flash-lite`: worked, 701 / 321 / 0, 3.3 s, 2 strengths, 3 improvements, improved answer 106 words, and it added claims the user never made ("passion for front-end development", "managing the state"). One sample each, so only an impression.
  - Chosen: `gemini-3.5-flash-lite` (follows the "use only the user's facts" rule better; paid-tier list price $0.30 in / $2.50 out per 1M tokens, about $0.0009 per typical interview by Claude's arithmetic; I am on the free tier so real spend is $0).
  - Browser test of the full flow with the real AI: not yet done.
- **Problems / errors:**
  - The model id from the docs (`gemini-2.5-flash-lite`) did not work for my new account, while Google's pricing page still listed it. Lesson: docs and the live API can disagree; keep the model id in an env var (`GEMINI_MODEL`).
  - My `.env.local` still has `GEMINI_MODEL=gemini-2.5-flash-lite` until I change it myself to `gemini-3.5-flash-lite` and restart `npm run dev`.
- **Claude mistakes I identified:** Claude put `gemini-2.5-flash-lite` in the code, `.env.example` and the plan as the model, based on the docs, and it did not work for my account. (Logged by Claude from the session; confirm or edit.)
- **Corrections made:** Changed the model to `gemini-3.5-flash-lite` in `.env.example` and the default in `aiClient.js`.
- **Git commit message:**
- **Commit hash:**

