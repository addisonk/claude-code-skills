// Example userflows.js — drop this next to userflows.html in your project.
// This is a fictional journaling app called "Quill". Read it for shape AND voice:
// every step is something a real user does, sees, taps, or receives — not a
// backend trace. Code pointers (if any) are footnotes after an em dash.
//
// Flow titles use the standard taxonomy from references/userflow-types.md
// (Onboarding, Logging & Tracking, Editing & Updating, …). Custom names are
// allowed when nothing fits — "Changing Reminder" here — but stay in the
// same imperative-gerund voice.
window.USERFLOWS = {
  "project": {
    "name": "Quill",
    "description": "A daily journaling app. Pick a journey on the right to walk through how a real user moves through Quill."
  },
  "defaults": { "autoSelectFirst": true },
  "lanes": [
    { "id": "marketing",  "label": "Marketing",    "color": "#94a3b8" },
    { "id": "auth",       "label": "Sign-up",     "color": "#a78bfa" },
    { "id": "onboarding", "label": "Onboarding",  "color": "#34d399" },
    { "id": "app",        "label": "Daily app",   "color": "#fbbf24" },
    { "id": "settings",   "label": "Settings",    "color": "#f87171" },
    { "id": "messaging",  "label": "Push / Email","color": "#60a5fa" }
  ],
  "nodes": [
    { "id": "landing",       "lane": "marketing",  "title": "Landing page",         "subtitle": "quill.app/" },
    { "id": "pricing",       "lane": "marketing",  "title": "Pricing page",         "subtitle": "free + paid plans" },
    { "id": "signup",        "lane": "auth",       "title": "Sign-up screen",       "subtitle": "email + password" },
    { "id": "verify",        "lane": "auth",       "title": "Verify email",         "subtitle": "6-digit code" },
    { "id": "welcome",       "lane": "onboarding", "title": "Welcome screen",       "subtitle": "first name + intro" },
    { "id": "pick-reminder", "lane": "onboarding", "title": "Reminder picker",      "subtitle": "default 8pm" },
    { "id": "today",         "lane": "app",        "title": "Today tab",            "subtitle": "main home" },
    { "id": "editor",        "lane": "app",        "title": "Entry editor",         "subtitle": "write today's entry" },
    { "id": "history",       "lane": "app",        "title": "History tab",          "subtitle": "browse past entries" },
    { "id": "account",       "lane": "settings",   "title": "Account screen",       "subtitle": "profile + plan" },
    { "id": "reminder-pref", "lane": "settings",   "title": "Reminder preferences", "subtitle": "change time / days" },
    { "id": "push-reminder", "lane": "messaging",  "title": "Daily reminder push",  "subtitle": "fires at user's set time" },
    { "id": "welcome-email", "lane": "messaging",  "title": "Welcome email",        "subtitle": "sent right after signup" }
  ],
  "flows": [
    {
      "id": "onboarding",
      "title": "Onboarding",
      "description": "A new visitor creates an account and lands on the Today tab ready to write their first entry.",
      "steps": [
        { "from": "landing",       "to": "signup",        "label": "Tap 'Get started'",
          "description": "User clicks the primary CTA on the marketing landing page." },
        { "from": "signup",        "to": "verify",        "label": "Submit email + password",
          "description": "User submits credentials; a 6-digit verification code is emailed to them." },
        { "from": "verify",        "to": "welcome",       "label": "Enter 6-digit code",
          "description": "User types the code from email and is dropped into the onboarding flow." },
        { "from": "welcome",       "to": "pick-reminder", "label": "Type first name, tap 'Next'",
          "description": "User enters their first name (used in the daily greeting) and continues." },
        { "from": "pick-reminder", "to": "today",         "label": "Confirm reminder time",
          "description": "User accepts the default 8pm reminder (or picks another) and lands on the Today tab." },
        { "from": "welcome",       "to": "welcome-email", "label": "(automatic) Welcome email sent",
          "description": "While the user is onboarding, a welcome email is delivered to their inbox so it's there when they next check mail." }
      ]
    },
    {
      "id": "logging-tracking",
      "title": "Logging & Tracking",
      "description": "Returning user receives their daily reminder, opens the app, and writes today's entry.",
      "steps": [
        { "from": "push-reminder", "to": "today",  "label": "Tap notification",
          "description": "The daily reminder fires at the user's chosen time; tapping it opens Quill on the Today tab." },
        { "from": "today",         "to": "editor", "label": "Tap 'Write today'",
          "description": "User taps the primary action card on Today, which opens an empty editor for today's date." },
        { "from": "editor",        "to": "today",  "label": "Tap 'Save'",
          "description": "User writes their entry, taps Save, and returns to Today with the entry marked complete." }
      ]
    },
    {
      "id": "editing-updating",
      "title": "Editing & Updating",
      "description": "User browses their archive and revisits an old entry.",
      "steps": [
        { "from": "today",   "to": "history", "label": "Tap 'History' tab",
          "description": "User switches from Today to the History tab in the bottom nav." },
        { "from": "history", "to": "editor",  "label": "Tap an entry",
          "description": "User taps a past entry from the chronological list; the editor opens in read mode with an Edit affordance." }
      ]
    },
    {
      "id": "changing-reminder",
      "title": "Changing Reminder",
      "description": "User adjusts when their daily reminder fires.",
      "steps": [
        { "from": "today",         "to": "account",       "label": "Tap profile avatar",
          "description": "User opens the account screen from the top-right of the Today tab." },
        { "from": "account",       "to": "reminder-pref", "label": "Tap 'Reminders'",
          "description": "User opens the reminder preferences screen." },
        { "from": "reminder-pref", "to": "today",         "label": "Pick new time, tap 'Save'",
          "description": "User selects a new time on the picker, taps Save, and is returned to Today. The next reminder will fire at the new time." }
      ]
    }
  ]
};
