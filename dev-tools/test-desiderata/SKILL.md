---
name: test-desiderata
description: Evaluate and write tests against Kent Beck's 12 test desiderata — Isolated, Composable, Deterministic, Fast, Writable, Readable, Behavioral, Structure-insensitive, Automated, Specific, Predictive, Inspiring. Use when writing new tests, reviewing existing tests, debating test strategy (unit vs integration vs E2E vs acceptance), diagnosing flaky/slow/uninformative tests, or trading off coverage against confidence.
---

# Test Desiderata

A test is valuable not because it exists or covers a line, but because it exhibits a useful combination of **12 properties**. The core principle, from Kent Beck:

> Not all tests need to exhibit all properties. However, no property should be given up without receiving a property of greater value in return.

## When to use

- Writing a new test — consciously choose which properties matter most for *this* test
- Reviewing a test — check what it gives up, and whether the trade is sound
- Choosing test strategy — unit vs integration vs E2E vs acceptance vs monitoring
- Diagnosing a problem test — name the missing property (flaky? slow? cryptic?)
- Pushing back on the demand for "more coverage" — the question is *which properties*

## The 12 Properties

| # | Property | What it means | Failure when missing |
| --- | --- | --- | --- |
| 1 | **Isolated** | Same result regardless of run order | Tests fail in CI but pass locally; ordering bugs |
| 2 | **Composable** | Test different dimensions separately and combine; 1 → 1M tests behave the same | Combinatorial explosion of duplicated setup |
| 3 | **Deterministic** | Same input, same result | Flaky tests; "rerun and it passes" |
| 4 | **Fast** | Runs quickly | CI takes 40 minutes; nobody runs the suite locally |
| 5 | **Writable** | Cheap to author relative to the code under test | Tests cost more to write than the feature; coverage drops |
| 6 | **Readable** | Reader can see why the test exists and what it asserts | Cryptic test names; reader has to reverse-engineer intent |
| 7 | **Behavioral** | Fails when *behavior* changes | Test always passes; behavior change ships unnoticed |
| 8 | **Structure-insensitive** | Does NOT fail when only *structure* changes | Refactor breaks 80 tests; nobody refactors |
| 9 | **Automated** | Runs without human intervention | "Manual QA pass before release" |
| 10 | **Specific** | When it fails, the cause is obvious | Failure message reads "expected true, got false" |
| 11 | **Predictive** | If all tests pass, code is suitable for production | Green CI, prod fire |
| 12 | **Inspiring** | Passing tests give the developer confidence | "I'll just deploy and watch" attitude |

For one-section deep-dives on each property with concrete code-level signals and remedies, see [`references/properties.md`](references/properties.md).

## How properties interact

**Reinforcing pairs** — gaining one helps the other:

- Automated + Fast → CI velocity, real feedback loop
- Isolated + Composable → safe parallelism, no fixture wars
- Behavioral + Structure-insensitive → refactor freely without test-noise
- Specific + Readable → debugging time collapses

**Trading pairs** — gaining one tends to cost the other:

- Predictive ↔ Fast (more realism, slower)
- Writable ↔ Predictive (cheap mocks lie about prod behavior)
- Readable-for-non-programmers ↔ Writable-by-programmers (acceptance tests cost more to author)
- Specific ↔ Behavioral (testing one assertion vs testing whole flows)

**The magic move:** find properties that *seem* to trade but don't. Beck's example — composability can buy you *both* speed and predictiveness, by stacking many fast unit-level checks with one heavier integration check.

## The three attractors (Beck)

| Style | Gives up | Gains |
| --- | --- | --- |
| **Programmer / unit** | Predictive, Inspiring | Writable, Fast, Specific |
| **Acceptance** | Some Speed, some Specific | Readable for non-programmers |
| **Monitoring** | Predictive (it's reactive), partly Automated (modulo alerting) | Live signal from production |

Modern variants — integration, E2E, contract, property-based — sit between these. See [`references/attractors.md`](references/attractors.md) for how they map and how to mix them.

## How to apply when writing a test

1. **Pick 3–4 properties** this test must have at full strength. It can't have all twelve.
2. **Name what you're giving up** and the trade you're getting in return.
3. **Write the test.**
4. **Re-read once** with the trade in mind: does the failure message satisfy *Specific*? Will it survive an unrelated rename (*Structure-insensitive*)?

## How to apply when reviewing a test

For each test on the diff:

- What property does this test give up that hurts? (Slow? Flaky? Coupled to private state?)
- What property did the author prioritize? Was that the right call here?
- If it gives up *Predictive*, is there another layer (integration, E2E, monitoring) earning it back?

## Diagnosis: smell → property

| Smell | Missing property | First move |
| --- | --- | --- |
| Test fails in CI but passes locally | Isolated | Find the shared mutable state |
| Reruns clear the failure | Deterministic | Find the time / network / random source |
| Suite takes 40 min | Fast | Push behavior into smaller tests; integrate sparingly |
| Tests cost more to write than the code | Writable | Wrong abstraction layer; test the public surface |
| Reader has to read the implementation | Readable | Better names + arrange/act/assert structure |
| Behavior changed but tests still passed | Behavioral | Test asserts on stub returns, not real outputs |
| Refactor turned 80 tests red | Structure-insensitive | Tests coupled to private fields / call counts |
| "I'll just check it manually" | Automated | Test exists but isn't in the suite |
| Failure says "expected true, got false" | Specific | Better matchers; one assertion per concern |
| Green CI, prod fire | Predictive | Add a layer closer to prod (integration / E2E / monitoring) |
| Tests pass, dev still nervous | Inspiring | Wrong tests, not just more tests |

## Audit checklist

When reviewing a test (or a test PR):

- [ ] Failure message names the *behavior* that broke, not just an assertion
- [ ] Test passes/fails the same way on every run (no time, no random, no network leakage)
- [ ] Test wouldn't break if the function were renamed or reorganized
- [ ] Test would catch a real behavior regression — mentally mutate the code; does any test fail?
- [ ] Cost to author is proportional to the value of the code under test
- [ ] If the implementation were rewritten wholesale, the test would still describe the *requirement*

## Sources

- Kent Beck, ["Test Desiderata"](https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3) (2019) — the original 12-property list and the three attractors
- [testdesiderata.com](https://testdesiderata.com) — interactive mindmap with 5-minute videos for each property by Kent Beck and Kelly Sutton
