# Evidence Uploader (S3-compatible)

Every run uploads its artifacts to object storage so the HTML report renders inline anywhere via absolute CDN URLs. The uploader is **repo-agnostic** - it works in any project, not just one with a bundled helper - by reading a config block + env credentials. `scripts/upload-artifact.sh` is the entry point.

## Config (`docs/testing/e2e-config.json` → `upload`)

```jsonc
"upload": {
  "endpoint": "https://<accountid>.r2.cloudflarestorage.com",  // S3-compatible endpoint (R2, AWS S3, etc.)
  "region": "auto",                                            // "auto" for R2; e.g. "us-east-1" for S3
  "bucket": "qa-artifacts",
  "publicBase": "https://cdn.podist.ai/qa-artifacts",          // public URL base the bucket is served from
  "keyPrefix": "html"                                          // default prefix for this project's runs
}
```

The public URL of an uploaded file is `${publicBase}/${key}` where `key` is `${keyPrefix}/<run-or-feature>/<filename>`.

## Credentials (environment only - never committed)

```
E2E_UPLOAD_ACCESS_KEY_ID=...
E2E_UPLOAD_SECRET_ACCESS_KEY=...
```
Load them from the shell, a gitignored `.env`, or your secret manager before running. The uploader reads only env - it never writes or reads creds from config or the repo.

## Usage

```bash
# Upload one file → prints the absolute public URL
bash scripts/upload-artifact.sh docs/testing/<feature>/recording-1a.mp4

# Upload with an explicit key suffix (defaults to <feature>/<basename>)
bash scripts/upload-artifact.sh docs/testing/<feature>/report.html --key html/<feature>/report.html

# Verify hosted assets return 200 + expected content-type
bash scripts/upload-artifact.sh --verify https://cdn.podist.ai/qa-artifacts/html/<feature>/report.html
```

Content types are set on upload by extension: `.html`→`text/html; charset=utf-8`, `.png/.jpg`→`image/*`, `.mp4`→`video/mp4`, `.yaml/.log/.txt`→`text/plain`, `.json`→`application/json`.

## Fail loudly - no silent local fallback

If the `upload` block is missing, or `E2E_UPLOAD_*` env vars are absent, or the underlying `aws` CLI isn't installed, the script **exits non-zero with the exact fix**. Do not produce a local-only report - stop and tell the user what to configure. "Always upload" is a hard requirement; a report pointing at `file://` paths is not shareable and is not acceptable.

## Implementation note

The script shells out to the AWS CLI (`aws s3 cp --endpoint-url`), which speaks to R2, S3, and any S3-compatible store. Install with `brew install awscli` if missing. For a pure-Node alternative, `@aws-sdk/client-s3` works too, but the CLI keeps the skill dependency-light.

## Golden-example media is separate

The bundled golden reports' media lives under a **stable** prefix (`qa-artifacts/examples/`) that is never garbage-collected, uploaded once. Per-run artifacts use the project's normal `keyPrefix`. Do not overwrite the `examples/` prefix during ordinary runs. See [report-blocks.md](report-blocks.md) → "Maintaining the golden examples".
