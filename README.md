# Tally Up

A free, private expense tracker that runs entirely in your browser — split bills with any number of people, track credit cards and recurring bills, and (optionally) auto-import bank transaction alerts from Gmail. No app store, no account, no subscription, no server.

**Live app:** https://joshua-daly.github.io/FinanceTracker/

---

## What this actually is

Tally Up is a single web page. There's no company, no account system, and no database anywhere except **your own phone's browser storage**. When you open the link and install it, you get your own private copy — nobody else can see your data, including whoever forked or hosts this code.

If you want, you can also connect it to a Google Sheet you own, which auto-scrapes your own Gmail for bank alert emails and feeds them into the app for you to review. That part is entirely optional and entirely under your own Google account — this project never has access to it.

## Features

- **Split expenses with anyone** — add as many people as you want (roommates, partners, family), split by percentage or exact amount, and see a running balance with each person
- **Manual or automatic entry** — log cash/card spending yourself with one tap, or auto-pull bank alerts from Gmail for review before they count
- **Credit card tracking** — track multiple cards separately, with bill-generation and due dates, and see what's coming up
- **Recurring bills & EMIs** — fixed monthly expenses factored into what you can safely spend
- **Editable categories** — the default list is a starting point, not a fixed set
- **Budgets** — set a monthly limit per category and see your pace
- **Monthly reports** — category breakdowns, top merchants, one-tap email summary
- **CSV export** — your full ledger, anytime
- **PIN-locked** — locks itself the instant you leave the app
- **Installable** — "Add to Home Screen" gives it a real app icon and full-screen feel

## Getting started

1. Open **https://joshua-daly.github.io/FinanceTracker/** in Chrome (Android) or Safari (iPhone)
2. Tap the menu → **"Add to Home Screen"** / **"Install app"**
3. Open it from your home screen, set a 4-digit PIN (this stays on your device only)
4. Go to **Settings** → add the people you split expenses with, and set your starting bank balance
5. Start logging transactions with the **+** button, or set up Gmail auto-sync below

## How it works (for the curious)

This is a static site — one HTML file with everything (styling, logic, charts) built in, hosted for free on GitHub Pages. There's no backend:

- Your data (transactions, budgets, people, cards) is saved with the browser's built-in `localStorage`, on your device only. Nobody — not GitHub, not whoever wrote this code — can see it.
- Multiple people (e.g. you and a roommate) using this app each get **their own independent copy** on their own phone. There's no live sync between devices; if you want to reconcile who-owes-who across two phones, use the CSV export or the monthly email report and compare manually.
- The only network requests this app makes on its own are loading its fonts and chart library. If you connect a Google Sheet Sync URL (below), it also fetches from that — nothing else, ever.

## Setting up Gmail auto-sync (optional)

This lets a free script running in your own Google account scan your Gmail for bank transaction alerts and feed them into the app's "Pending" tab for you to review and approve. It's entirely optional — the app works fine with manual entry alone.

### 1. Create your Google Sheet

Make a new Google Sheet with two tabs:

**Tab "Pending"** — header row:
```
Date | Merchant | Amount | Direction | Note | Status | MessageId | ThreadId
```

**Tab "Balances"** (optional, only used if your bank's emails mention your running balance) — header row:
```
Timestamp | AvailableBalance
```

### 2. Set up the script

1. In your Sheet, go to **Extensions → Apps Script**
2. Delete the placeholder code and paste in [`EmailParser.template.gs`](./EmailParser.template.gs) from this repo
3. Replace `SHEET_ID` with your Sheet's ID (the long string in its URL, between `/d/` and `/edit`)
4. **This is the part that needs your attention:** the template has example patterns for a generic bank alert. Your bank's emails are worded differently, so open a real transaction alert email, note the exact wording, and update the regex patterns to match — the comments in the template walk through exactly how.
5. Run `setupTrigger` once (Google will ask you to authorize Gmail + Sheets access — this is normal, and it only ever runs under your own account)
6. Run `debugScan` any time you want to check what the script is finding without writing anything to your sheet

### 3. Connect it to the app

1. In Apps Script: **Deploy → New deployment → Web app**
2. Execute as: **Me** · Who has access: **Anyone with the link**
3. Click Deploy, copy the URL ending in `/exec`
4. In Tally Up, go to **Settings → Google Sheet Sync URL**, paste it in, save
5. Use **"Sync from Gmail"** on the Pending tab whenever you want to pull in new transactions

## Security & privacy notes

- The PIN is a **screen lock, not encryption** — it stops someone picking up your unlocked phone from casually browsing your ledger, not a determined attacker with full access to your device.
- All financial data stays in your browser's local storage. There's no account, no cloud database, nothing to breach remotely.
- If you set up Gmail sync, the script has read access to your Gmail — that's normal for what it does, runs entirely inside your own Google account under Google's own sandboxing, and nobody else (including this project) ever sees it.

## Known limitations

- **No live sync between people's phones.** Each person's app is independent. Reconciling shared balances across devices is a manual step (CSV/email export), not automatic.
- **Balances are tracked from your own perspective only.** If two *other* people split something between themselves, that specific debt isn't tracked — this is a personal ledger, not a full multi-party settlement graph like Splitwise.
- **Email parsing is pattern-matching, not AI.** It looks for specific wording your bank uses. If your bank changes its email template, the patterns will need updating.
- **No background push notifications.** Browsers don't reliably support always-on background syncing for installed web apps; you sync manually with the button, or when you notice a bank alert come in.

## Running your own copy

This entire app is one HTML file plus a manifest and service worker for installability. To run your own independent copy:

1. Fork this repository
2. In your fork's **Settings → Pages**, set Source to "Deploy from a branch," branch `main`, folder `/ (root)`
3. Your own live URL will appear there in about a minute

No build step, no dependencies to install, no server to run.

## Tech stack

Plain HTML/CSS/JavaScript, [Chart.js](https://www.chartjs.org/) for charts, browser `localStorage` for persistence, and optionally Google Apps Script + Google Sheets for the Gmail sync feature.
