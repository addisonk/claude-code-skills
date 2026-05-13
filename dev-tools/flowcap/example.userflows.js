// Example userflows.js — drop this next to flowcap.html in your project.
// See schema.json for the full data shape.
window.USERFLOWS = {
  "project": {
    "name": "ToDesktop",
    "description": "Every package and external service that powers ToDesktop Builder and ToDesktop for Electron. Pick a flow on the right to highlight the path through the system and see what gets passed at each step."
  },
  "defaults": { "autoSelectFirst": true },
  "lanes": [
    { "id": "actors",   "label": "Actors",                    "color": "#ec4899" },
    { "id": "client",   "label": "Client surfaces",           "color": "#3b82f6" },
    { "id": "fns",      "label": "Auth + Firebase functions", "color": "#a855f7" },
    { "id": "data",     "label": "Storage / data",            "color": "#f59e0b" },
    { "id": "build",    "label": "Build pipeline",            "color": "#10b981" },
    { "id": "dist",     "label": "Distribution",              "color": "#06b6d4" },
    { "id": "external", "label": "External services",         "color": "#9ca3af" }
  ],
  "nodes": [
    { "id": "user-electron-repo", "lane": "actors",   "title": "User Electron repo",   "subtitle": "@todesktop/runtime" },
    { "id": "td-cli",             "lane": "client",   "title": "@todesktop/cli",       "subtitle": "todesktop build / release" },
    { "id": "fb-auth",            "lane": "fns",      "title": "Firebase Auth",        "subtitle": "Google / GitHub / pw / OIDC" },
    { "id": "fns-builds",         "lane": "fns",      "title": "functions/builds",     "subtitle": "15 fns · prepare/kickOff/release" },
    { "id": "firestore",          "lane": "data",     "title": "Firestore",            "subtitle": "users · apps · builds · invites" },
    { "id": "azure-pipelines",    "lane": "build",    "title": "Azure Pipelines",      "subtitle": "DevOps API · Mac/Win/Linux" },
    { "id": "cdn-workers",        "lane": "dist",     "title": "monorepo · cdn workers", "subtitle": "Cloudflare workers for downloads" },
    { "id": "apple-notarize",     "lane": "external", "title": "Apple notarization",   "subtitle": "altool · stapler" }
  ],
  "flows": [
    {
      "id": "todesktop-build",
      "title": "todesktop build (Electron CLI)",
      "description": "Developer runs `todesktop build` in their Electron repo.",
      "steps": [
        { "from": "user-electron-repo", "to": "td-cli",          "label": "invoke CLI",       "description": "Developer runs `todesktop build`. Reads todesktop.json, validates against packages/cli/schemas/schema.json." },
        { "from": "td-cli",             "to": "fb-auth",         "label": "getIdToken()",     "description": "packages/cli/src/utilities/firestore.ts — exchanges cached Firebase Auth credentials for an idToken." },
        { "from": "td-cli",             "to": "fns-builds",      "label": "prepareNewBuild()", "description": "HTTP function. Payload: appId, appVersion, projectConfig, shouldCodeSign, versionControlInfo, breakpoints." },
        { "from": "fns-builds",         "to": "firestore",       "label": "create build doc", "description": "Writes a builds/{id} doc with status=queued and the resolved manifest." },
        { "from": "fns-builds",         "to": "azure-pipelines", "label": "kickOff()",        "description": "POSTs to Azure DevOps Pipelines REST API to start a Mac/Win/Linux build matrix." },
        { "from": "azure-pipelines",    "to": "apple-notarize",  "label": "notarize",         "description": "Mac jobs upload signed artifacts to Apple notary service via altool, then staple." }
      ]
    },
    {
      "id": "todesktop-release",
      "title": "todesktop release (publish as latest)",
      "description": "Developer marks a successful build as the new 'latest' for end users.",
      "steps": [
        { "from": "user-electron-repo", "to": "td-cli",      "label": "todesktop release", "description": "CLI prompts to pick a build (or takes the latest successful one)." },
        { "from": "td-cli",             "to": "fns-builds",  "label": "releaseBuild()",    "description": "HTTP function in functions/builds/. Validates ownership, ensures build is releasable." },
        { "from": "fns-builds",         "to": "firestore",   "label": "set meta.latestReleaseBuildId", "description": "Writes the new pointer on the app doc — this is the source of truth the CDN reads." },
        { "from": "firestore",          "to": "cdn-workers", "label": "purge / refresh",   "description": "Workers read meta.latestReleaseBuildId on each download request; cache TTL ensures fast cutover." }
      ]
    }
  ]
}
;
