# AGENTS.md — Freestyle Football Training Tracker

This file is the requirements source for coding agents. The product is a training diary for freestyle football. The Next.js app in this repo implements the `decided` rows. Local MariaDB is defined in `docker-compose.yml`.

Only rows with status `decided` are binding. Rows with status `draft` are unsorted proposals, not build tasks. Do not invent product decisions for anything `open` or `draft`.

Talk to the user in German. This document, identifiers, and code stay in English.

## Legend

| Status | Meaning |
| --- | --- |
| `open` | Not discussed yet |
| `draft` | Proposal, not confirmed |
| `decided` | Binding |
| `rejected` | Explicitly out |

| Priority | Meaning |
| --- | --- |
| `must` | Required for the first usable version |
| `should` | Important, does not block the first version |
| `could` | Later, after the core works |
| `wont` | Not planned |

| Column | Meaning |
| --- | --- |
| ID | Stable id. Refer to the id when discussing a row. Do not recycle ids. |

## Project

| Field | Value | Status |
| --- | --- | --- |
| Product | Training diary for freestyle football, not a training-management tool | `decided` |
| Phase | App implemented from the decided rows | `decided` |
| Access | Signed-in FSMeet profile required | `decided` |
| Client | Mobile-first installable PWA, with offline session capture | `decided` |
| Framework | Next.js | `decided` |
| Production frontend | `training.fsmeet.com` | `decided` |
| Document language | English | `decided` |
| UI copy language | not chosen | `open` |
| Session storage | IndexedDB on the device, then the app's MariaDB. Not the FSMeet API. | `decided` |

## Appearance

The interface is a dark, matte fitness-style diary: modern, minimal, athletic, premium, fast, and functional. Decoration does not compete with the training numbers.

| ID | Requirement | Value | Priority | Status |
| --- | --- | --- | --- | --- |
| UI-01 | Mobile-first layout | Phone layout is the primary design. Support widths from `320px` upward | `must` | `decided` |
| UI-02 | Installable PWA | Can be installed on a phone. Install alone does not make the app work offline | `must` | `decided` |
| UI-03 | Theme | Dark mode is the default | `must` | `decided` |
| UI-04 | Background | Main background `#0D0F12` | `must` | `decided` |
| UI-05 | Cards | Card background `#1A1D22`, rounded | `must` | `decided` |
| UI-06 | Accent | Lime `#C7FF4D`, used sparingly | `must` | `decided` |
| UI-07 | Type | Inter or Geist as the only primary face | `must` | `decided` |
| UI-08 | Numbers | Large bold numerals for statistics | `must` | `decided` |
| UI-09 | Charts | Radar chart of the user's categories (CAT-06), and lime line charts of session counts (W-07), minutes (W-08), and feeling (W-09) | `must` | `decided` |
| UI-10 | Controls | Large touch targets, slightly rounded | `must` | `decided` |
| UI-11 | Motion | Subtle, fast transitions. No excessive animation | `must` | `decided` |
| UI-12 | Surface style | Matte, inspired by modern fitness apps | `must` | `decided` |
| UI-13 | Glassmorphism | Do not use | `wont` | `rejected` |
| UI-14 | Gradients | Do not use heavy gradients | `wont` | `rejected` |
| UI-15 | Clutter | Functional rather than decorative. No visual clutter | `must` | `decided` |
| UI-16 | Contrast | Sufficient contrast and clear interaction states | `must` | `decided` |

| Token | Purpose | Value | Status |
| --- | --- | --- | --- |
| `--bg` | Main background | `#0D0F12` | `decided` |
| `--card` | Card background | `#1A1D22` | `decided` |
| `--elevated` | Elevated surface | `#252930` | `decided` |
| `--accent` | Primary accent | `#C7FF4D` | `decided` |
| `--text` | Primary text | `#FFFFFF` | `decided` |
| `--muted` | Secondary text | `#A1A1AA` | `decided` |
| `--line` | Borders | `#30343B` | `decided` |
| Font stack | Primary face | Inter or Geist. One of the two, not a mix | `decided` |

Lime is for primary buttons, selected categories, the active navigation item, important statistics, and progress indicators. Do not fill large background surfaces with the accent.

| ID | Type role | Treatment | Priority | Status |
| --- | --- | --- | --- | --- |
| TYPE-01 | Statistics | Large, bold | `must` | `decided` |
| TYPE-02 | Section headings | Clear | `must` | `decided` |
| TYPE-03 | Labels | Medium weight | `must` | `decided` |
| TYPE-04 | Supporting text | Small, muted (`--muted`) | `must` | `decided` |

| ID | Component rule | Priority | Status |
| --- | --- | --- | --- |
| CMP-01 | Rounded cards | `must` | `decided` |
| CMP-02 | Large touch targets | `must` | `decided` |
| CMP-03 | Simple outlined icons | `must` | `decided` |
| CMP-04 | Minimal borders (`--line`) | `must` | `decided` |
| CMP-05 | Comfortable spacing | `must` | `decided` |
| CMP-06 | Subtle transitions | `must` | `decided` |
| CMP-07 | One consistent component style across Home, History, Statistics, Log Training, Edit Training, and Profile / Settings | `must` | `decided` |

## Auth

Login uses the FSMeet OAuth API. Swagger tag: [OAuth on staging](https://api.dev.fsmeet.dffb.org/api/#/OAuth). The same tag exists on the other environments at `{api base}#/OAuth`.

The published flow is OAuth 2.0 Authorization Code + PKCE. `GET /v1/oauth/authorize` is a browser login and consent page. Passwords never leave FSMeet, so this app must not collect the FSMeet password.

| ID | Requirement | Priority | Status | Note |
| --- | --- | --- | --- | --- |
| A-01 | The app is unusable until the user is signed in with an FSMeet profile | `must` | `decided` | |
| A-02 | Sign-in uses FSMeet OAuth, not a local account | `must` | `decided` | |
| A-03 | Use Authorization Code + PKCE | `must` | `decided` | As documented on the OAuth tag |
| A-04 | Send the user to FSMeet for the password step | `must` | `decided` | Passwords stay on FSMeet |
| A-05 | Read the signed-in profile from userinfo | `must` | `decided` | Bearer access token |
| A-06 | OAuth client id is `training` | `must` | `decided` | Display name `FS Training Tracker` |
| A-07 | Scopes are `openid`, `profile`, and `email` | `must` | `decided` | |
| A-08 | Callback path is `/api/auth/fsmeet/callback` | `must` | `decided` | Full redirect URIs below |

| Method | Path | Role | Status |
| --- | --- | --- | --- |
| `GET` | `/v1/oauth/authorize` | Browser entry. HTML login and consent. | `decided` |
| `POST` | `/v1/oauth/authorize` | Submit FSMeet credentials and issue an authorization code. Called by FSMeet's form, not by this app. | `decided` |
| `POST` | `/v1/oauth/token` | Exchange the code and PKCE verifier for an access token. Optional `id_token`. | `decided` |
| `GET` | `/v1/oauth/userinfo` | Profile claims. `401` when the bearer token is missing or invalid. | `decided` |

`FSMEET_API_URL` already includes `/v1`. OAuth paths are `${FSMEET_API_URL}/oauth/authorize`, `/oauth/token`, and `/oauth/userinfo`. Example: `https://api.dev.fsmeet.dffb.org/v1/oauth/authorize`. The Swagger UI stays under `/api`.

Registered OAuth client:

| Field | Value | Status |
| --- | --- | --- |
| `client_id` | `training` | `decided` |
| Display name | `FS Training Tracker` | `decided` |
| Scopes | `openid` `profile` `email` | `decided` |
| Local redirect URI | `http://localhost:3005/api/auth/fsmeet/callback` | `decided` |
| Staging redirect URI | `https://dev.training.fsmeet.dffb.org/api/auth/fsmeet/callback` | `decided` |
| Production redirect URI | not in the registered client yet | `open` |
| Client secret | Environment only. Never in this file. | `decided` |

| Environment | `FSMEET_API_URL` | OAuth docs | Status |
| --- | --- | --- | --- |
| Local dev | `http://localhost:3000/v1` | `http://localhost:3000/api#/OAuth` | `decided` |
| Staging | `https://api.dev.fsmeet.dffb.org/v1` | `https://api.dev.fsmeet.dffb.org/api/#/OAuth` | `decided` |
| Production | `https://api.fsmeet.dffb.org/v1` | `https://api.fsmeet.dffb.org/api/#/OAuth` | `decided` |

## Categories

These five categories are the default training taxonomy for the dashboard and for session entry.

| ID | Category | Status |
| --- | --- | --- |
| CAT-01 | lowers | `decided` |
| CAT-02 | uppers | `decided` |
| CAT-03 | sitdown | `decided` |
| CAT-04 | transitions | `decided` |
| CAT-05 | acrobatics | `decided` |
| CAT-06 | The user can customize the category list in account settings | `decided` |

Display order of the defaults is lowers, uppers, sitdown, acrobatics, transitions. The user can rename a category, remove one while at least three remain, and add one while at most five exist. A rename keeps the same category on past sessions and only changes the visible name. Removing a category first warns that logged training for it can be lost, then hides it from logging and from the radar. A past session keeps that category, and History shows the stored id once the name is gone. The list is stored on the user in MariaDB. New categories are added at the end.

## Product shape

The app feels like a training diary. A freestyler opens the phone after training and saves a session within 10 seconds. Do not add plans, programs, drill builders, or other management workflows.

| ID | Goal | Question the app answers | Priority | Status |
| --- | --- | --- | --- | --- |
| OBJ-01 | Track | How much did I train? | `must` | `decided` |
| OBJ-02 | Analyze | Which freestyle categories do I train most often? | `must` | `decided` |
| OBJ-03 | Motivate | Do I train regularly, and am I developing? | `must` | `decided` |

Primary navigation has three sections. Other screens exist, and they are not primary tabs.

| ID | Screen | Role | Place | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| NAV-01 | Home | Overview | Primary | `must` | `decided` |
| NAV-02 | History | Sessions | Primary | `must` | `decided` |
| NAV-03 | Statistics | Progress | Primary | `must` | `decided` |
| NAV-04 | Log Training | Capture a session. Reachable from every primary section | Additional | `must` | `decided` |
| NAV-05 | Edit Training | Change a saved session. Same fields as capture: date, one duration, categories, optional feeling, optional note | Additional | `must` | `decided` |
| NAV-06 | Profile / Settings | Account and app settings | Additional | `must` | `decided` |

`NAV-04` is satisfied by a control on Home or by a floating plus button. Either form is acceptable. The visible label is `Log Training`. Statistics and Profile / Settings do not show the floating plus button. Profile / Settings includes the feeling entry preference (S-09), the duration unit (W-10), the category list (CAT-06), the home review length (H-03), and resetting all training sessions (S-10). Anything else on that screen is still `open` (Q-13). A saved session can be deleted from Edit Training (S-07).

## Functional requirements

Logging is after the session for many athletes. Entry must stay short enough to do once training is over.

| ID | Requirement | Priority | Status | Note |
| --- | --- | --- | --- | --- |
| H-01 | Home shows how active the user has been, without an extra tap | `must` | `decided` | Home is NAV-01. Serves OBJ-01. The window is the recent days from H-03 |
| H-02 | The next action on Home is logging a session | `must` | `decided` | Via NAV-04 |
| H-03 | Home reviews a rolling number of recent days | `must` | `decided` | Ends today and includes the days before it. Default is 7. Account settings choose any integer from 7 to 30. Stored on the user in MariaDB. The headline, the comparison, and the category chart use this window. The comparison is the previous window of the same length. Statistics keeps the calendar week |
| S-01 | Capture a session with as little input as possible | `must` | `decided` | After training, including with no network (OFF-02) |
| S-02 | Session has one duration | `must` | `decided` | Not split per category |
| S-03 | Session has one or more categories, multi-select | `must` | `decided` | Chosen from the user's list (CAT-06). Defaults are CAT-01 … CAT-05. The same duration applies to every selected category |
| S-04 | Session note is optional | `must` | `decided` | Skipping it must not add a step |
| S-05 | Session has a date so it can be logged after the fact and shown in History | `must` | `decided` | Defaults to today |
| S-06 | A signed-in user can save a session within 10 seconds of opening the app | `must` | `decided` | Date, duration, categories. Note and feeling stay optional |
| S-07 | A saved session can be deleted | `must` | `decided` | From Edit Training. Leaves the phone immediately, including offline. MariaDB drops it on the next sync |
| S-08 | A session can record how the training felt | `must` | `decided` | Optional. Five levels, shown as emojis: red, orange, yellow, green, dark green. They are scores on the 1–10 scale: red 1, orange 3, yellow 5, green 8, dark green 10. Skipping it stores null. History shows the emoji for these five scores |
| S-09 | Feeling can also be a score from 1 to 10 | `must` | `decided` | 1 is the worst, 10 is the best. Optional, same as S-08. Any integer in that range. The emoji levels are 1, 3, 5, 8 and 10. Account settings choose the control. The choice is stored on the user in MariaDB. Default is the five emojis. A session without a feeling stays null. History shows the numeral for 2, 4, 6, 7 and 9 |
| S-10 | Profile / Settings can delete all training sessions for the signed-in user | `must` | `decided` | The control asks once more before deleting. Sessions leave the phone immediately, including offline. MariaDB drops every session for that user on the next sync. Categories, feeling entry, and the duration unit stay |
| D-01 | Home shows training time | `must` | `decided` | Large numerals (UI-08). Not a separate main area |
| D-02 | Home shows the user's categories | `must` | `decided` | Default is the five categories. A session counts toward each selected category. Headline training time counts each session once |
| C-01 | History shows past training sessions | `must` | `decided` | NAV-02. Includes the calendar of past sessions |
| W-01 | Statistics shows the week | `must` | `decided` | NAV-03. Charts (UI-09). Same counting rule as D-02. Includes the session count (W-03) |
| W-02 | Statistics shows the month | `must` | `decided` | NAV-03. Charts (UI-09). Same counting rule as D-02. Includes the session count (W-03) |
| W-03 | Statistics shows how many sessions are in the period | `must` | `decided` | Week, month, year, and the custom range |
| W-04 | The user can choose a custom date range | `must` | `decided` | Start and end date. Same minutes, session count, and category chart |
| W-05 | Statistics shows one period at a time | `must` | `decided` | The user switches between week, month, year, and custom so the screen stays short |
| W-06 | Statistics shows the year | `must` | `decided` | NAV-03. Calendar year. Charts (UI-09). Same counting rule as D-02. Includes the session count (W-03) |
| W-07 | Statistics shows how many sessions happened over time | `must` | `decided` | Lime line chart. 1 week and 1 month are per day, 1 year is per month. The series ends on the current day: future days of the week and month are left out, and the year stops at the current month. Days that have already passed stay, including days with no session. The year axis labels every other month, starting with January. Each session counts once |
| W-08 | Statistics shows total training minutes over time | `must` | `decided` | Lime line chart. Same spans as W-07, including the end on the current day. The user switches between the session chart (W-07), this chart, and the feeling chart (W-09), so only one line chart is visible. A session's duration is counted once |
| W-09 | Statistics shows how training felt | `must` | `decided` | The selected period shows the average feeling. Only sessions with a feeling count; a session without one stays out of the average. The lime line chart uses the same spans as W-07. Each point is the average feeling in that day or month, on a fixed scale from 1 to 10. Days or months with no session, and days or months whose sessions have no feeling, are left out. The remaining points form one continuous line |
| W-10 | Duration can be shown in hours or minutes | `must` | `decided` | Account settings choose the unit. Stored on the user in MariaDB. Default is hours. Applies wherever training time is shown: Home, History, and Statistics, including the category chart and the duration line chart (W-08). The Home and Statistics headlines spell the unit out as hours or minutes. Logging and editing still enter minutes |

## Session fields

| Field | Required | Example | Status |
| --- | --- | --- | --- |
| Date | yes | 2026-11-01, default today | `decided` |
| Duration | yes | 45 min, once for the whole session | `decided` |
| Categories | yes, one or more | lowers, transitions | `decided` |
| Feeling | no | 8, or null. A score from 1 to 10. Emoji levels are 1, 3, 5, 8 and 10 | `decided` |
| Note | no | ATW on the left still messy | `decided` |

## Offline

Installing the PWA does not make it offline-capable. Session capture has to keep working in halls with poor reception.

| ID | Requirement | Priority | Status | Note |
| --- | --- | --- | --- | --- |
| OFF-01 | Treat offline support as its own requirement, separate from UI-02 | `must` | `decided` | A PWA is not offline just because it is installable |
| OFF-02 | Write sessions to IndexedDB on the device | `must` | `decided` | Capture works without a network |
| OFF-03 | Sync IndexedDB sessions to MariaDB once internet is back | `must` | `decided` | Halls with bad reception are the main case |

## Persistence

On the device, sessions are stored in IndexedDB (OFF-02). The server store is this app's MariaDB, described by the `mysql` service in `docker-compose.yml`. Sync runs when the network is back (OFF-03). The FSMeet API is used for login only.

| Field | Value | Status |
| --- | --- | --- |
| Engine | MariaDB `12.1.2` | `decided` |
| Compose service | `mysql` | `decided` |
| Container name | `training-db` | `decided` |
| Database | `training` | `decided` |
| User | `training` | `decided` |
| Host port | `3309` | `decided` |
| Container port | `3306` | `decided` |
| Volume | `training_mariadb_data` | `decided` |
| Credentials | `docker-compose.yml` only | `decided` |

From the host, the database is `127.0.0.1:3309`. From another compose service, it is `mysql:3306`.

## Technical

| Field | Value | Status |
| --- | --- | --- |
| Framework | Next.js | `decided` |
| Client shape | Installable PWA | `decided` |
| Production frontend origin | `https://training.fsmeet.com` | `decided` |
| Local frontend origin | `http://localhost:3005` | `decided` |
| Staging frontend origin | `https://dev.training.fsmeet.dffb.org` | `decided` |
| Auth | FSMeet OAuth, client `training` | `decided` |
| Session database | IndexedDB on device, MariaDB `training` on the server | `decided` |
| Styling approach | not chosen | `open` |

## Open questions

| ID | Question | Blocks | Status |
| --- | --- | --- | --- |
| Q-01 | Server store is the app's MariaDB (`training`), not the FSMeet API. Device store is IndexedDB. | Persistence | `decided` |
| Q-02 | One duration per session. Several categories can be selected. Duration is not split. | D-02, W-01, W-02 | `decided` |
| Q-03 | The next action is logging a session, through the Log Training control. | H-02, NAV-04 | `decided` |
| Q-04 | Home is the overview. There is no second primary screen called Dashboard. | H-01, D-01, NAV-01 | `decided` |
| Q-05 | UI copy language: German, English, or both? | All visible text | `open` |
| Q-06 | Client `training`, scopes `openid profile email`, callbacks on localhost:3005 and dev.training.fsmeet.dffb.org. | A-03 | `decided` |
| Q-07 | Where does the app keep the access token? | A-05 | `open` |
| Q-08 | A saved session can be deleted from Edit Training. | NAV-05, S-07 | `decided` |
| Q-13 | What belongs on Profile / Settings? | NAV-06 | `open` |
| Q-09 | Which face is primary, Inter or Geist? | UI-07 | `open` |
| Q-10 | Local origin `http://localhost:3005`. Staging origin `https://dev.training.fsmeet.dffb.org`. | Environments | `decided` |
| Q-11 | Production OAuth redirect URI is not in the registered client yet. | A-08 | `open` |
| Q-12 | While offline, are dashboard, calendar, and week/month stats filled from IndexedDB, or is only new session capture available? | OFF-02, D-01, C-01 | `open` |

## Agent rules

| Rule | Meaning |
| --- | --- |
| Source | Requirements live in this file. When code and a `decided` row disagree, the row wins. |
| Do not guess | Do not implement `open` or `draft` rows, and do not fill the gap with a product decision. |
| Ids | New rows take the next free id in that prefix (`UI-`, `TYPE-`, `CMP-`, `A-`, `CAT-`, `OBJ-`, `NAV-`, `H-`, `S-`, `D-`, `C-`, `W-`, `OFF-`, `Q-`). Never reuse an id. |
| Status | When the user confirms a row, set it to `decided`. When they drop one, set it to `rejected` and leave it in the table. |
| Phase | New product behavior still needs a `decided` row before it is built. |
| Language | Talk to the user in German. Keep this file and code in English. UI copy follows Q-05 once it is `decided`. |
| Scope | Do not build `wont` or `rejected` rows. Keep the product a diary: no trick-level logging, combos, rep counts, plans, or management tools until a `decided` row asks for them. |
| Secrets | Do not put client secrets, tokens, or passwords in this file. |
