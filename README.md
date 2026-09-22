# Tally Up

A free, private expense tracker that runs entirely in your browser — split bills with any number of people, track credit cards and recurring bills, get a monthly view of your spending, and (optionally) auto-import bank transaction alerts from Gmail. No app store, no account, no subscription, no server.

**Live app:** https://joshua-daly.github.io/FinanceTracker/

---

## What this actually is

Tally Up is a single web page. There's no company, no account system, and no database anywhere except **your own phone's browser storage**. When you open the link and install it, you get your own private copy — nobody else can see your data, including whoever forked or hosts this code.

If you want, you can also connect it to a Google Sheet you own, which auto-scrapes your own Gmail for bank alert emails and feeds them into the app for you to review. That part is entirely optional and entirely under your own Google account — this project never has access to it.

## Features

**Splitting & people**
- Split expenses with any number of people — roommates, partners, family, not just one fixed partner
- Split by percentage or exact amount, with a "Split Evenly" shortcut
- Type an exact amount for one person and the rest of the split auto-fills the remainder evenly
- Who Owes Who shows a per-person balance, not just a single combined number, with a filter to see one person's transactions at a time
- Settle Up records a payment in either direction and correctly zeroes the balance out
- A short first-time setup wizard asks who you split with and your starting balance the first time you open the app

**Logging transactions**
- Manual entries go straight into your Ledger as approved — no extra review step. Only transactions synced from Gmail land in Pending for you to check first
- Tapping **+** opens three ways to add something: repeat your literal last transaction (shown immediately, one tap), pick from your top 5 most frequently logged merchants, or start a blank entry
- Recent-merchant memory: pick a merchant you've used before and its usual category, split, and payment method auto-fill
- Editable categories — the defaults are a starting point, not a fixed list
- Search, filter by category, and filter by date range in the full Ledger

**Money logic**
- A real running balance that automatically adjusts as you approve transactions, separate from "Safe to Spend" (which also subtracts upcoming bills, EMIs, and credit card dues)
- Multiple credit cards, each tracked separately with its own bill-generation and due date
- Everyday purchases can be charged to a specific card (doesn't touch your bank balance until you pay the bill) or straight to bank/cash
- One-tap "Record Bill Payment" on any card, and one-tap "Mark Paid" on any recurring bill — both log the transaction and (for recurring bills) automatically roll the due date forward a calendar month
- An "Upcoming (Next 30 Days)" list on the dashboard combining recurring bills and card dues

**Reports & analytics**
- Monthly cash in/out, category breakdown, top merchants, one-tap email summary
- A 6-month category trend chart
- A lightweight spending-anomaly flag on the dashboard when a category runs notably hotter than its recent average
- A per-person contribution trend table showing shared-expense volume over the last 3 months, not just current balance

**Security & polish**
- PIN-locked, and re-locks the instant you background the app
- CSV export of your full ledger
- Installable ("Add to Home Screen") with its own icon and full-screen feel

## Getting started

1. Open **https://joshua-daly.github.io/FinanceTracker/** in Chrome (Android) or Safari (iPhone)
2. Tap the menu → **"Add to Home Screen"** / **"Install app"**
3. Open it from your home screen and follow the short setup: PIN → who you split with → starting balance (all but the PIN are skippable)
4. Start logging transactions with the **+** button, or set up Gmail auto-sync below

## How it works (for the curious)

This is a static site — one HTML file with everything (styling, logic, charts) built in, hosted for free on GitHub Pages. There's no backend:

- Your data (transactions, budgets, people, categories, cards) is saved with the browser's built-in `localStorage`, on your device only. Nobody — not GitHub, not whoever wrote this code — can see it.
- Multiple people (e.g. you and a roommate) using this app each get **their own independent copy** on their own phone. There's no live sync between devices; if you want to reconcile who-owes-who across two phones, use the CSV export or the monthly email report and compare manually. Balances are also tracked from your own point of view — a debt between two *other* people isn't tracked, since this is a personal ledger, not a full multi-party settlement graph.
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
4. **This is the part that needs your attention:** the template has example patterns for a generic bank alert. Your bank's emails are worded differently, so open a real transaction alert email, note the exact wording, and update the regex patterns to match — the comments in the template walk through exactly how. Use a broad partial sender match (e.g. `hdfcbank`, not a full exact address) — one wrong character in an exact address means the search silently finds nothing, with no error anywhere.
5. Run `setupTrigger` once (Google will ask you to authorize Gmail + Sheets access — this is normal, and it only ever runs under your own account)
6. Run `debugScan` any time you want to check what the script is finding without writing anything to your sheet

### 3. Connect it to the app

1. In Apps Script: **Deploy → New deployment → Web app**
2. Execute as: **Me** · Who has access: **Anyone with the link**
3. Click Deploy, copy the URL ending in `/exec`
4. In the app, go to **Settings → Google Sheet Sync URL**, paste it in, save
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
