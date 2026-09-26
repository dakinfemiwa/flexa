We need to build and deploy the MVP of an adaptive learning platform quickly.

You are the primary implementation agent. Work through the project in the exact sequence below.

## PROJECT GOAL

Build a student-facing adaptive A-level Maths practice platform demonstrating:

**attempt → diagnose → adapt → retry → measure improvement**

The core product hypothesis is:

> Students need practice that helps them adapt the same underlying mathematical skill to different question styles, contexts and representations.

This MVP will be tested with real students, so prioritise a working product over theoretical completeness.

---

# ARCHITECTURE

Use a modular full-stack architecture:

```text
Next.js / React
      │
      │ HTTPS / REST
      ▼
FastAPI / Python
      │
      ├── Application logic
      ├── Adaptive engine
      ├── Error analysis
      └── Progress/analytics
      │
      ▼
PostgreSQL
```

### Frontend

- Next.js
- React
- TypeScript
- Tailwind where appropriate

### Backend

- Python
- FastAPI
- Pydantic

### Database

- PostgreSQL
- SQLAlchemy + Alembic unless there is a strong reason to use another ORM/migration approach

### Authentication

Use Clerk if it integrates cleanly with the architecture.

### Deployment target

- Frontend: Vercel
- Backend: Render
- Database: managed PostgreSQL

Do NOT introduce microservices.

Do NOT use Kubernetes.

Do NOT add Redis/Kafka/vector databases unless a concrete MVP requirement emerges.

The backend should be a modular monolith.

---

# IMPORTANT DEVELOPMENT RULE

Work in stages.

**Do not implement the entire project in one giant change.**

At the end of each stage:

1. Run relevant tests/checks.
2. Inspect the implementation.
3. Fix problems.
4. Summarise what was completed.
5. State what is ready for the next stage.

Do not proceed to a later architectural stage if an earlier stage is broken.

Avoid unnecessary refactoring.

Do not replace working infrastructure simply because you prefer another approach.

---

# STAGE 0 — REPOSITORY AUDIT

Before writing code:

- inspect the existing repository
- identify existing Next.js/React code
- identify existing authentication/database infrastructure
- identify existing dependencies
- identify existing tests
- identify existing deployment configuration
- determine whether this is an existing project worth extending or whether a clean structure is preferable

Do not delete existing work without a clear reason.

Produce a short architecture recommendation based on what is actually in the repository.

---

# STAGE 1 — ARCHITECTURE + SCAFFOLD

Establish:

```text
/frontend
/backend
```

or an equally clean monorepo structure.

Set up:

### Frontend

- Next.js
- TypeScript
- basic routing
- API client layer
- environment configuration

### Backend

- FastAPI
- application entry point
- configuration
- health endpoint
- API versioning
- database connection
- structured error handling

### Database

- PostgreSQL connection
- SQLAlchemy models
- Alembic migrations

Create a basic:

```text
GET /health
```

endpoint.

Frontend should be able to call the backend.

### Acceptance criteria

I can run frontend and backend locally and see:

```text
Frontend → FastAPI → PostgreSQL
```

working.

---

# STAGE 2 — DATA MODEL

Implement the core schema.

At minimum:

### User

- id
- external/auth id
- role
- created_at

### Learning Objective

- id
- topic
- name
- description

### Question

- id
- learning_objective_id
- difficulty
- representation
- context
- prompt
- expected_answer
- tolerance
- explanation
- metadata

### Attempt

- id
- user_id
- question_id
- submitted_answer
- correctness
- error_type
- created_at

### Student Progress

- user_id
- learning_objective_id
- attempts
- correct_attempts
- recent_accuracy
- estimated_mastery
- current_difficulty

Design this properly rather than storing everything as arbitrary JSON.

Use JSON only where flexible metadata is genuinely useful.

Create migrations.

Seed development data.

---

# STAGE 3 — QUESTION ENGINE

Create the initial A-level Maths question bank.

Start with:

## SUVAT / constant acceleration

Approximately 30–50 questions.

Questions must have meaningful metadata:

- learning objective
- difficulty
- representation
- context
- common error types

Include variation such as:

- direct numerical questions
- word problems
- unfamiliar contexts
- multi-step questions
- reverse problems
- graph/interpretation questions where practical

Do not create 50 superficial variations of the same question.

Separate question content from application logic.

Create validation so malformed questions cannot silently enter the system.

---

# STAGE 4 — MARKING ENGINE

Implement deterministic numerical marking.

Support:

- numeric parsing
- tolerance
- correct
- incorrect
- invalid/unparseable

Create unit tests.

Do not use an LLM for basic numerical marking.

The result should be deterministic and explainable.

---

# STAGE 5 — ERROR CLASSIFICATION

Implement a simple error-classification system.

Start with deterministic categories such as:

```text
CORRECT

ARITHMETIC_ERROR

VARIABLE_IDENTIFICATION_ERROR

FORMULA_SELECTION_ERROR

SIGN_ERROR

UNIT_ERROR

MULTI_STEP_ERROR

UNKNOWN_ERROR
```

Do not pretend the system can diagnose errors that it cannot actually infer.

Where the available answer data is insufficient to determine a specific error, use:

```text
UNKNOWN_ERROR
```

The architecture should allow a more sophisticated classifier to replace this later.

---

# STAGE 6 — ADAPTIVE ENGINE

This is the most important component.

Create a separate Python module/package:

```text
backend/
    adaptive/
        selector.py
        error_classifier.py
        progress.py
        models.py
```

The engine should expose a clean interface such as:

```text
next_question(student_state, candidate_questions)
```

The first implementation must be deterministic.

The selection logic should consider:

- learning objective
- recent correctness
- estimated mastery
- current difficulty
- error type
- representation
- recent question history
- representation diversity

### Core behaviour

If the student gets a question wrong:

Prefer a question that:

- targets the same learning objective
- addresses the relevant weakness where possible
- changes the surface representation
- does not unnecessarily increase difficulty

If the student succeeds:

Prefer a question that:

- retains the underlying objective
- introduces greater representation/context variation
- may increase difficulty gradually

Avoid repeatedly serving essentially identical questions.

Create tests for the adaptive engine.

Include deterministic test cases demonstrating expected behaviour.

---

# STAGE 7 — STUDENT EXPERIENCE

Build the actual student flow.

Required screens:

### 1. Dashboard

Show:

- current topics
- recent performance
- progress
- continue practice

### 2. Practice

Show:

- question
- relevant mathematical formatting
- answer input
- submit button

### 3. Feedback

Show:

- correct/incorrect
- explanation
- relevant learning objective
- useful feedback

Then:

```text
Continue → next adaptive question
```

### 4. Progress

Show:

- accuracy
- attempts
- learning objectives
- progression over time
- representation performance where meaningful

Keep the UI clean.

Do not waste development time on gamification.

---

# STAGE 8 — TEACHER / DEMO DASHBOARD

Create a lightweight teacher/demo view.

It should allow me to demonstrate the product to students.

Show:

- number of attempts
- accuracy
- performance by learning objective
- performance by representation
- common error types
- progression over time

This does not need sophisticated teacher administration.

The objective is to make the learning data visible.

---

# STAGE 9 — DATA + PRODUCT INSTRUMENTATION

Ensure every important student interaction produces useful structured data.

We need to eventually answer:

1. What questions are students getting wrong?
2. Which learning objectives cause problems?
3. Which representations cause problems?
4. Does performance improve after changing representation?
5. Does performance remain strong as unfamiliarity increases?
6. Does the adaptive engine produce sensible sequences?

Do not fabricate any metrics.

Build the system so these metrics can later be measured from real student usage.

---

# STAGE 10 — TESTING + SECURITY

Before deployment:

### Backend

- unit tests
- adaptive engine tests
- marking tests
- API tests
- database tests where appropriate

### Frontend

- core component tests
- practice flow tests where practical

### Security

Audit:

- authentication
- authorisation
- user ownership
- database access
- API input validation
- secrets
- CORS
- environment variables

A student must not be able to access another student's private data.

Do not expose database credentials to the frontend.

---

# STAGE 11 — DEPLOYMENT

Deploy:

```text
Next.js → Vercel

FastAPI → Render

PostgreSQL → managed PostgreSQL provider
```

Set production environment variables securely.

Configure:

- frontend API URL
- backend CORS
- database connection
- authentication
- production migrations

Verify:

```text
Browser
  ↓
Vercel
  ↓
FastAPI
  ↓
PostgreSQL
```

works in production.

Test the full student journey against the deployed application.

---

# STAGE 12 — REAL STUDENT TEST

Once deployment works, STOP BUILDING.

Put the MVP in front of real students.

Collect evidence on:

- usability
- question difficulty
- confusing feedback
- whether adaptation feels meaningful
- which question representations cause problems
- whether students understand why they received the next question

Do not immediately add features.

Use actual observations to decide what to change.

---

# FUTURE — DO NOT IMPLEMENT YET

The architecture should leave room for:

### Phase 2

- larger question bank
- better error classification
- richer mathematical representations
- teacher authoring tools

### Phase 3

- statistical learner model
- knowledge tracing
- ML-based question selection

### Phase 4

Potential experimentation with:

- contextual bandits
- reinforcement learning
- personalised difficulty models
- LLM-assisted question generation
- LLM-assisted error diagnosis

But none of these belong in the initial MVP unless they become necessary.

---

# ENGINEERING PRINCIPLES

Throughout the project:

1. Prefer simple working systems.
2. Keep the adaptive engine independent from the UI.
3. Keep business logic out of React components.
4. Keep question data separate from application code.
5. Make adaptive decisions explainable.
6. Make important behaviour testable.
7. Do not invent metrics.
8. Do not build features merely because they sound impressive.
9. Optimise for getting the MVP into students' hands.
10. Preserve a clean architecture so the project can evolve into an AI/ML system later.

---

# FINAL DELIVERABLE

At completion, I should have:

- working local application
- working adaptive engine
- 30–50 curated questions
- authentication
- student practice flow
- progress tracking
- teacher/demo dashboard
- tests
- production deployment
- clean README
- architecture documentation
- instructions for running locally
- deployment instructions
- explanation of the adaptive algorithm

The product must be genuinely usable by a student.

**Build, test, verify and iterate. Do not spend time explaining what could theoretically be built when the next useful action is implementation.**
