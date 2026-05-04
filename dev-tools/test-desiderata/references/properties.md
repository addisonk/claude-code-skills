# The 12 Test Desiderata — Deep Dive

For each property: what it means in practice, the failure mode when missing, and the most common remedy.

## 1. Isolated

A test produces the same result regardless of which other tests have run, in what order. The test owns its inputs and cleans up its outputs.

**Failure mode:** tests pass on dev machines but flap in CI (or vice versa). Order-dependent failures. "Run only this one and it passes."

**Common causes:** shared global state (singletons, module-level variables, cached connections, stubbed time), unflushed databases between tests, parallel tests fighting over a fixture.

**Remedy:** every test sets up its own world from scratch and tears it down. Stub the global; don't rely on its previous value. Where setup is expensive, use *composition* (#2) so the shared piece becomes one provable thing and the per-test pieces stay isolated.

## 2. Composable

You can run 1 test, 10 tests, 1,000,000 tests, or a single test combining 5 dimensions of variability — and each gives you the same answer about what it claims to test. Tests are *combinable*.

**Failure mode:** the only way to test feature A × condition B is to write A×B tests by hand. Combinatorial explosion. Setup duplicated 50 ways.

**Remedy:** factor tests into smaller propositions. Test "this function handles case A" and "this function handles case B" separately, not "this function handles A and B together." Property-based testing is composability turned up.

Composability is closely tied to Isolated — once a test owns its world, you can stack many of them safely.

## 3. Deterministic

Same inputs in, same result out. Forever.

**Failure mode:** flaky tests. The team learns to rerun on red. Trust collapses.

**Common causes:** real time, real network, random IDs, file system races, async ordering, container readiness, port collisions, unstable upstream services.

**Remedy:** inject the source of nondeterminism (clock, random, network) so tests can pin it. If you can't pin it, isolate the test that needs it and don't run it in the main suite.

## 4. Fast

The test (and the suite it belongs to) runs quickly enough that running it is part of the inner loop, not a deferred chore.

**Failure mode:** "the suite takes 40 minutes" → developers stop running it locally → CI becomes the only feedback → red CI is normal → nobody trusts green either.

**Remedy:** push behavior into smaller, faster tests. Reserve slow checks (real DB, real network, full E2E) for a thin top layer that proves the system. Use composition (#2) to keep the slow tests few.

## 5. Writable

The cost to write the test is small compared to the cost (or value) of the code being tested.

**Failure mode:** tests cost more to author than the feature itself. Coverage drops because nobody can afford the overhead. Worst case: tests start to *prevent* people from changing code.

**Common cause:** wrong abstraction layer — testing internals instead of the public surface, with elaborate setup harnesses for each unit.

**Remedy:** test the smallest meaningful contract that still gives you confidence. If the harness is bigger than the production code, the harness is wrong.

## 6. Readable

A reader (probably you, six months later) can see *why* the test exists and *what* it asserts without spelunking through the implementation.

**Failure mode:** test names like `test1`, `test_user`, or `test_should_work`. Tests that exercise N things at once. Tests with hidden setup behind opaque fixtures.

**Remedy:** name the test after the *behavior* being asserted. Arrange / Act / Assert. The shape of the test should communicate the shape of the requirement.

## 7. Behavioral

The test is sensitive to *behavioral* changes in the code under test. If the behavior changes, the test result changes.

**Failure mode:** the test always passes because it's asserting on a stub return value or a tautology. Real changes ship unnoticed.

**Test for it:** mentally mutate the code under test (flip a `>` to `<`, return `null`, swap two arguments) — does any test fail? If not, the test isn't behavioral.

**Remedy:** assert on observable outputs, not on internal call patterns. "Did the function compute the right answer?" beats "did the function call `x()` with these args?"

## 8. Structure-insensitive

The test does NOT fail when only the *structure* of the code changes — a rename, a method extraction, a file split, a reorganization that preserves observable behavior.

**Failure mode:** a refactor turns 80 tests red. The team stops refactoring. Code rots.

**Common causes:** mocks that assert on call sequences, tests that import private functions, snapshot tests over too-large blobs.

**Remedy:** test the public surface only. If you must mock, mock at a *seam* (an interface owned by your code), not deep internals.

## 9. Automated

The test runs without human intervention. No "and then click the button to verify."

**Failure mode:** there's a manual QA pass before each release. People skip it. People miss things. People burn out.

**Remedy:** if a check exists, automate it. If a check can't be automated yet, name what's missing and either build it or accept the risk explicitly — don't pretend.

## 10. Specific

When the test fails, the cause is obvious from the failure message. You don't have to attach a debugger to find out what broke.

**Failure mode:** failures read `expected true, got false` or `Error in 47-line test`. You debug to learn what failed, then debug again to learn why.

**Remedy:** assertion libraries with structured diffs (Vitest, Jest's expect, RSpec). One concern per test. Custom matchers for domain shapes. Failure message *names the broken behavior*.

## 11. Predictive

If all tests pass, the code under test is suitable for production. Green CI ⇒ green prod.

**Failure mode:** green CI, prod fire. Confidence is overstated, the team learns not to trust the suite, the suite stops being maintained.

**Notes:** Predictive is the most expensive property. Pure unit tests are not very predictive (Beck's point). Predictiveness is bought through layers — integration, E2E, contract tests, staging, monitoring.

**Remedy:** when something escapes to prod, find the layer that should have caught it and add the test *there*, not lower.

## 12. Inspiring

Passing tests give the developer confidence to ship. Failing tests give them clear next steps.

**Failure mode:** tests pass and the developer is still nervous. They deploy and "watch the logs." The suite isn't doing its job.

**Diagnostic:** ask the developer "would you ship this if all tests pass?" If the answer is "well, I'd want to check X first," X is what the suite is missing.

**Remedy:** Inspiring is downstream of the other 11 — usually you fix it by improving Predictive and Specific. Sometimes the answer is monitoring (Beck's third attractor) rather than more tests.
