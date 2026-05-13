# Standard userflow names

A reference taxonomy of common user-journey names, organized by category. Use these when naming flows so captures stay consistent across projects and don't drift into custom one-off names where a standard fits.

## How to use this list

- **Match first, customize only if nothing fits.** Before inventing a flow title like "Sign up and finish onboarding then receive the first push notification", check this list. If the journey is recognizably one of these, use the standard name (e.g. "Onboarding" or "Creating Account").
- **A flow may correspond to multiple categories.** A signup-then-onboarding flow could pick either "Creating Account" or "Onboarding" — go with whichever describes the *user's primary goal* in that flow, not the longest list of actions.
- **Product-specific specificity is fine in the description, not the name.** Keep the flow `title` close to the standard taxonomy; put the product-specific detail in the flow `description` and step descriptions.
- **Custom names are allowed when nothing on this list fits** — but treat that as the exception, not the default. If you find yourself naming a flow with three "and"s in it, you probably need to split it or pick a standard name.
- **`flow.id`** stays kebab-case (`creating-account`, `editing-profile`, `purchasing-ordering`). The taxonomy below is the human-readable form for `flow.title`.

## New User Experience

- Browsing Tutorial
- Creating Account
- Onboarding

## Account Management

- Editing Profile
- Deleting & Deactivating Account
- Logging In
- Logging Out
- Resetting Password

## Commerce & Finance

- Adding to Cart & Bag
- Booking & Reserving
- Canceling Order & Refunding
- Canceling Subscription
- Listing
- Purchasing & Ordering
- Redeeming
- Subscribing & Upgrading
- Transferring Money & Donating

## Social

- Banning & Blocking
- Calling
- Chatting & Sending Messages
- Commenting & Replying
- Following & Subscribing
- Gifting
- Giving Feedback
- Inviting Teammates & Friends
- Joining & Accepting
- Leaving
- Liking & Upvoting
- Muting
- Referring Friends
- Registering
- Reporting
- Requesting
- Reviewing & Rating
- Scheduling
- Sharing

## Content

- Adding & Creating
- Archiving
- Copying & Duplicating
- Deleting & Removing
- Drawing
- Editing & Updating
- Favoriting & Pinning
- Filtering & Sorting
- Importing & Exporting
- Listening to Audio
- Logging & Tracking
- Marking
- Moving
- Publishing
- Recording Audio & Video
- Reordering
- Saving to Collection
- Searching & Finding
- Selecting & Choosing
- Starting & Completing
- Taking Photos
- Uploading & Downloading
- Watching Video

## Misc

- Changing Language
- Connecting & Linking
- Enabling & Disabling
- Setting Up
- Showing & Hiding
- Switching to Dark Mode
- Switching View
- Turning On/Off
- Verifying

## Picking the right name — quick examples

| What the user does | Bad name | Good name |
|---|---|---|
| Signs up + verifies email + picks topics + lands on the home tab | "Sign up and finish onboarding then start using the app" | "Onboarding" (or "Creating Account" if the focus is purely auth) |
| Updates their display name and avatar from settings | "Change profile info in settings screen" | "Editing Profile" |
| Buys a subscription upgrade from a paywall | "Upgrade to paid plan via the in-app paywall" | "Subscribing & Upgrading" |
| Replies to a comment thread | "Comment back on someone's reply" | "Commenting & Replying" |
| Picks a different language in settings | "Toggle the language preference" | "Changing Language" |
| Connects a Google Calendar to the app | "Link Google account for calendar sync" | "Connecting & Linking" |

If the journey legitimately doesn't appear here (e.g., "First-time NFC pairing of a hardware device"), a custom name is fine — but write it in the same imperative-gerund voice as the list above: `Pairing Hardware`, not `First-time NFC pairing flow on iOS`.
