# Test Attractors — Where the Properties Cluster

Beck identifies three "attractors" in the space of all possible tests — combinations of properties that recur because they make sense together. Modern test practice has added a few more variants in the same space.

## Beck's three attractors

### Programmer (unit) tests

**Gives up:** Predictive, Inspiring.
**Gains:** Writable, Fast, Specific.

A unit test is cheap to write, runs in milliseconds, and points at one line when it fails. It does *not* prove the system works in production — that's not its job. The team gets confidence from the higher layers.

**When to lean on it:** during the inner development loop, refactoring, fixing a known bug, exercising pure functions.

**Common mistake:** trying to make unit tests Predictive by mocking the whole world. The mocks become the bug surface, and you no longer test the code — you test the mocks.

### Acceptance tests

**Gives up:** some Speed, some Specific.
**Gains:** Readable for non-programmers.

An acceptance test is written so a product manager or domain expert can read it and confirm "yes, this is what we want." It's slower than a unit test (it usually drives a larger slice of the system) and a failure can have several causes.

**When to lean on it:** when the requirement is contested or the audience for "is it correct?" is broader than the engineering team.

**Common mistake:** acceptance tests as glorified unit tests written in Cucumber. The audience for a Gherkin file should be a non-programmer; if it's not, drop the layer — you're paying the cost without getting the property.

### Monitoring

**Gives up:** Predictive (it's reactive — by the time it fires, prod has misbehaved). Partly Automated (alerting fills the gap).
**Gains:** Live signal from real users, real data, real load.

Monitoring is a form of test feedback Beck explicitly includes. It catches what staging can't and what unit tests can't model — real concurrency, real data shapes, real user behavior.

**When to lean on it:** when the cost of a failure is paid in customer experience rather than engineering time, and when reproducing the failure in tests is expensive.

**Common mistake:** treating monitoring as a substitute for tests. It's a layer, not a replacement.

## Modern variants

These aren't in Beck's original list but fit into the same property space:

### Integration tests

Real database, real I/O, but not real users. Trade Speed for Predictive — slower than unit, faster than E2E, more predictive than unit, less predictive than E2E.

**Sweet spot:** verifying that two collaborating components actually agree on a contract — schema, JSON shape, error semantics — without paying for the full system.

### End-to-end (E2E)

The whole stack, often through a browser. Maximum Predictive, sacrifices nearly everything else (Fast, Specific, Writable, Deterministic). Use sparingly — one E2E covers a lot, but breaks for many reasons.

**Sweet spot:** a small set of "the system can be used to do X" smoke tests at the top of the pyramid.

### Contract tests

Test the *interface* between two services without running both. Each side asserts against a shared contract. Trades full integration realism for Fast + Isolated.

**Sweet spot:** microservice or service-to-service boundaries where running the other service in tests is too expensive.

### Property-based tests

Composability cranked up. Instead of "test these 5 inputs," generate 1000 inputs that satisfy a property, and shrink failures to minimal cases. Trades a bit of Specific (the failing input is generated, not curated) for huge gains in Behavioral and Structure-insensitive.

**Sweet spot:** pure functions, parsers, serializers, anything with clean input/output contracts.

## How to mix them

A healthy suite usually has:

- A wide base of fast, isolated unit tests (Programmer attractor) for the inner loop
- A medium layer of integration / contract tests for component boundaries
- A thin top of E2E or acceptance for "the system works" smoke
- Production monitoring for what no test can model

The pyramid is a heuristic, not a rule. The right shape is the one that gives you the property combination you actually need for *your* failure modes.

If most of your prod incidents are caused by misbehaving third-party APIs, you need more contract tests, not more unit tests. If most are caused by data shape drift, you need more integration. If most are caused by load behavior, monitoring is your test.

Use the desiderata to name what's missing, then choose the layer.
