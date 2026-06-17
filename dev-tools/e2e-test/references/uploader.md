# Evidence Uploader (S3-compatible, R2)

Every run uploads its artifacts to object storage so the HTML report renders inline anywhere via absolute CDN URLs. The uploader is **dependency-free** - `scripts/upload-artifact.mjs` (a thin `upload-artifact.sh` wraps it) signs S3 requests with SigV4 using only Node built-ins. **No `aws` CLI or SDK install needed.** Entry point: `scripts/upload-artifact.sh`.

## Where target + credentials come from

The uploader reads the machine-standard **`R2_*` environment variables**:

| Var | Purpose | Secret? |
|-----|---------|---------|
| `R2_ENDPOINT` | S3 API endpoint, e.g. `https://<acct>.r2.cloudflarestorage.com` | no |
| `R2_BUCKET` | bucket name | no |
| `R2_PUBLIC_URL` | public CDN base the bucket is served from, e.g. `https://cdn.podist.ai` | no |
| `R2_ACCESS_KEY_ID` | access key | **yes** |
| `R2_SECRET_ACCESS_KEY` | secret key | **yes** |

A file uploaded to `s3://$R2_BUCKET/<key>` is served at `$R2_PUBLIC_URL/<key>`.

## Where to store these (recommended)

Put them once in your agent's env so every run picks them up - never in a repo:

- **Claude Code** - in `~/.claude/settings.json` under an `env` block:
  ```json
  {
    "env": {
      "R2_ENDPOINT": "https://<account-id>.r2.cloudflarestorage.com",
      "R2_BUCKET": "<bucket>",
      "R2_PUBLIC_URL": "https://cdn.example.com",
      "R2_ACCESS_KEY_ID": "<access-key-id>",
      "R2_SECRET_ACCESS_KEY": "<secret-access-key>"
    }
  }
  ```
  Claude Code injects these into the environment of every command it runs.
- **Codex** - set the same `R2_*` vars in your Codex environment (e.g. the shell profile Codex inherits, or `~/.codex` env config) so they're present when the skill runs there too.

If the vars are missing, the uploader **fails loudly and names this location** - it never falls back to a local-only report.

## Optional per-project override

`docs/testing/e2e-config.json` may carry an `upload` block to override the env defaults for a specific project (e.g. a different bucket or key prefix). Credentials are **never** read from config - only from `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` env.

```jsonc
"upload": {
  "endpoint": "https://<acct>.r2.cloudflarestorage.com",  // default: $R2_ENDPOINT
  "bucket": "qa-artifacts",                                // default: $R2_BUCKET
  "publicBase": "https://cdn.example.com",                 // default: $R2_PUBLIC_URL
  "keyPrefix": "qa-artifacts"                              // default: "qa-artifacts"
}
```

The public URL of an uploaded file is `${publicBase}/${key}`, where `key` defaults to `${keyPrefix}/<feature-folder>/<filename>`.

## Usage

```bash
# Upload one file -> prints the absolute public URL
bash scripts/upload-artifact.sh docs/testing/<feature>/recording-1a.mp4

# Explicit key
bash scripts/upload-artifact.sh docs/testing/<feature>/report.html --key html/<feature>/report.html

# Verify hosted assets return 200 + content-type
bash scripts/upload-artifact.sh --verify https://cdn.example.com/qa-artifacts/<feature>/report.html
```

Content types are set on upload by extension: `.html`→`text/html`, `.png/.jpg/.webp/.gif`→`image/*`, `.mp4`→`video/mp4`, `.mov`→`video/quicktime`, `.yaml/.log/.txt/.xml`→`text/plain`, `.json`→`application/json`.

## Fail loudly - no silent local fallback

If the target (`R2_ENDPOINT`/`R2_BUCKET`/`R2_PUBLIC_URL`) or credentials are missing, or Node isn't available, the uploader **exits non-zero with the exact fix** (and points at `~/.claude/settings.json`). Do not produce a local-only report - stop and tell the user what to set. "Always upload" is a hard requirement; a report pointing at `file://` paths is not shareable and is not acceptable.

## Golden-example media is separate

The bundled examples' media points at the live `qa-artifacts/examples/...` and demo assets, uploaded once and never garbage-collected. Per-run artifacts use the project's normal key prefix. Do not overwrite the `examples/` prefix during ordinary runs.
