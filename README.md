# Tally Up

A free, private expense tracker that runs entirely in your browser — split bills with any number of people, track credit cards and recurring bills, get a monthly view of your spending, and (optionally) auto-import bank transaction alerts from Gmail. No app store, no account, no subscription, no server.

**Live app:** https://joshua-daly.github.io/FinanceTracker/

---

## Nobody sees this but you

That's the actual point of this app, not a footnote. Most finance and splitting apps — Splitwise, Mint, Walnut, and the rest — need your data on their servers to work at all, and several of them monetize that access (ads, lead-selling, "connect your bank" partnerships). Tally Up structurally can't do that, even if it wanted to: everything lives in your browser's local storage, on your device, and the optional Gmail import runs entirely inside *your own* Google account under a script only you control. There's no login, no company, and no server in between.

## How it compares

Most people use two separate apps for what this does in one — something like Splitwise for splitting bills, and something like Mint or YNAB for personal budgeting and cards.

| | **Tally Up** | Splitwise | Mint / Walnut-style | YNAB |
|---|---|---|---|---|
| Multi-person splitting | Yes, unlimited people | Yes, best-in-class | No | No |
| Full multi-party debt graph (A owes B, unrelated to you) | No — tracked from your own view only | Yes | N/A | N/A |
| Credit cards, recurring bills, budgets | Yes | No | Yes | Partial |
| Bank/email auto-import | Yes, via your own Gmail + Sheet | No | Yes, via linked bank accounts | Yes (paid regions) |
| Where your data lives | **Your device only** | Their servers | Their servers | Their servers |
| Cost | Free, no ads | Free / $3-mo Pro | Free but ad/lead-monetized | ~$99/yr |
| Cross-device sync | **No** | Yes | Yes | Yes |
| Live bank balance | Manual resync | N/A | Real API-linked | Bank-linked |
| Setup effort | You configure the Gmail parser yourself | Zero | Zero (just log in) | Low |

**Genuine strengths:**
- Nobody — not a company, not an advertiser — ever sees your transactions
- No ads, no subscription, no "upgrade to see your own data" wall
- Merges two product categories (bill-splitter + personal tracker) that most people juggle as two separate apps

**Genuine weaknesses:**
- **No cross-device sync is the biggest functional gap.** Two people can't see the same live "who owes who" — this is exactly Splitwise's core value, and right now this app can't match it
- **No live bank balance.** Real fintech apps are plugged into your bank; this is only as accurate as your last manual resync
- **Setup friction.** A non-technical person can't just log in — they'd need to build a Google Apps Script themselves to get auto-import working

## What this actually is

Tally Up is a single web page — one HTML file with everything built in, hosted for free on GitHub Pages. When you open the link and install it, you get your own private copy running entirely in your browser.

If you want, you can also connect it to a Google Sheet you own, which auto-scrapes your own Gmail for bank alert emails and feeds them into the app for you to review. That part is entirely optional.

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

### Installing on Android

1. Open **https://joshua-daly.github.io/FinanceTracker/** in Chrome
2. Tap the **⋮** menu (top right) → **"Add to Home Screen"** or **"Install app"**
3. Confirm — you'll get a real home-screen icon that opens full-screen, no browser bar

### Installing on iPhone

iPhone works a little differently, and it's worth knowing why: **Safari never shows an automatic install prompt**, on this app or any other — that's a permanent iOS limitation, not something this app can change. Installing is always a manual step:

1. Open **https://joshua-daly.github.io/FinanceTracker/** in **Safari** specifically (not Chrome — iOS only allows installing from Safari itself)
2. Tap the **Share** icon (the square with an arrow pointing up), usually along the bottom of the screen
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right — you'll now have a real home-screen icon that opens full-screen, with no Safari address bar

### Either platform, once installed

Open it from your home screen and follow the short setup: PIN → who you split with → starting balance (all but the PIN are skippable). Start logging transactions with the **+** button, or set up Gmail auto-sync below.

## How it works (for the curious)

This is a static site — one HTML file with everything (styling, logic, charts) built in, hosted for free on GitHub Pages. There's no backend:

- Your data (transactions, budgets, people, categories, cards) is saved with the browser's built-in `localStorage`, on your device only. Nobody — not GitHub, not whoever wrote this code — can see it.
- Multiple people (e.g. you and a roommate) using this app each get **their own independent copy** on their own phone. There's no live sync between devices; if you want to reconcile who-owes-who across two phones, use the CSV export or the monthly email report and compare manually. Balances are also tracked from your own point of view — a debt between two *other* people isn't tracked, since this is a personal ledger, not a full multi-party settlement graph.
- The only network requests this app makes on its own are loading its fonts and chart library. If you connect a Google Sheet Sync URL (below), it also fetches from that — nothing else, ever.

## Setting up Gmail auto-sync (optional)

This lets a free script running in your own Google account scan your Gmail for bank transaction alerts, extract the amount/merchant/direction with Google's Gemini API, and feed them into the app's "Pending" tab for you to review and approve. It's entirely optional — the app works fine with manual entry alone.

**Why Gemini instead of hand-written patterns:** every bank writes its alert emails differently, so a purely pattern-matching parser needs custom rules per bank, hand-tuned by reading real emails. Gemini reads the email like a person would, so one generic setup works across almost any bank's wording without you writing anything bank-specific. The one thing it's deliberately *not* asked for is the date/time — that comes straight from Gmail's own message metadata instead, which is always accurate and can't be misread the way a model occasionally can with free-text dates.

### 1. Get the template Sheet

**Template:** https://docs.google.com/spreadsheets/d/10gD1YTZS3-N_Np9GrsI3CM4GyP-HfCNzDNq2TZPOfck/edit?usp=sharing

Open that link and **File → Make a Copy**. This gives you your own independent Sheet with the parser script already bound to it — no separate file to paste in, no tabs to build by hand. The copy includes two tabs already set up:

**"Pending"** — header row:
```
Date | Time | Merchant | Amount | Direction | Note | Status | MessageId | ThreadId
```

**"Balances"** (optional, only used if your bank's emails mention your running balance) — header row:
```
Timestamp | AvailableBalance
```

### 2. Set up the script (in your copy, not the template)

1. In your copied Sheet, go to **Extensions → Apps Script** — the parser code is already there
2. Get a free API key: **aistudio.google.com → "Get API Key"** (one button, no credit card), and paste it into `GEMINI_API_KEY` at the top of the script
3. Adjust `BANK_QUERIES` to your bank's sender domain — use a broad partial match (e.g. `hdfcbank`, not a full exact address like `alerts@hdfcbank.net`). One wrong character in an exact address means Gmail's search silently finds nothing, with no error anywhere; a broad match can't fail that way.
4. Run `setupTrigger` once (Google will ask you to authorize Gmail + Sheets + external requests — this is normal, and it only ever runs under your own account). This only *schedules* the scan for every 15 minutes going forward — it doesn't run it immediately.
5. To actually populate the sheet right now rather than waiting, run `scanInboxForTransactions` directly from the function dropdown.
6. Run `debugScan` any time you want to preview what it's finding and what Gemini extracted, without writing anything to your sheet.

**A trap worth knowing about:** once deployed (step 3 below), *any* real HTTP request to your Web App's URL runs `doGet`, which marks matching rows "Synced" as a side effect — including a request you didn't mean to make. Two ways this catches people out:
- **Never paste the deployed URL into a messaging app** to send it to yourself or someone else — WhatsApp, Telegram, iMessage and similar apps automatically fetch a URL to build a link preview, which silently triggers a real sync and consumes your Pending queue.
- **Don't test `doGet` by running it directly** in the Apps Script editor — that has the exact same side effect. Use `debugDoGetDryRun` instead; it mirrors the same read logic but never writes anything, so it's always safe to run.

If you ever end up with rows stuck as "Synced" that never actually reached the app, just edit those Status cells back to "Pending" in the Sheet and sync again for real, from inside the app.

**On sync frequency:** Gemini is only ever called once per genuinely new matching email, not once per trigger run — checking every 15 minutes and finding nothing new costs zero API calls, the same as checking hourly. There's no need to slow the trigger down to save on usage; what actually drives usage is how many real bank emails arrive per day, which polling frequency doesn't change.

### 3. Connect it to the app

1. In Apps Script: **Deploy → New deployment → Web app**
2. Execute as: **Me** · Who has access: **Anyone with the link**
3. Click Deploy, copy the URL ending in `/exec`
4. In the app, go to **Settings → Google Sheet Sync URL**, paste it in, save
5. Use **"Sync from Gmail"** on the Pending tab whenever you want to pull in new transactions — this is the only place that should ever call the real URL

If you ever edit the script again later, remember that redeploying an *existing* deployment requires **Manage deployments → edit (pencil icon) → Version: New version → Deploy** — just saving the code in the editor does not update what's already live at your URL.

## Security & privacy notes

- The PIN is a **screen lock, not encryption** — it stops someone picking up your unlocked phone from casually browsing your ledger, not a determined attacker with full access to your device.
- All financial data stays in your browser's local storage. There's no account, no cloud database, nothing to breach remotely.
- If you set up Gmail sync, the script has read access to your Gmail — that's normal for what it does, runs entirely inside your own Google account under Google's own sandboxing, and nobody else (including this project) ever sees it.
- The Gmail parser sends matching email text to Google's Gemini API for extraction, under your own API key. This is a genuine data flow that didn't exist in a purely pattern-matching approach — still entirely under your own Google account, never touching this project or anyone else, but worth knowing rather than glossing over.

## Known limitations

- **No live sync between people's phones.** Each person's app is independent. Reconciling shared balances across devices is a manual step (CSV/email export), not automatic.
- **Balances are tracked from your own perspective only.** If two *other* people split something between themselves, that specific debt isn't tracked — this is a personal ledger, not a full multi-party settlement graph like Splitwise.
- **Gemini's free tier has usage limits that can change.** They're generous enough for personal use, but if you somehow exceed them for a day, syncing simply pauses until the quota resets — nothing breaks, no data is lost, since unprocessed emails are never marked as handled.
- **No background push notifications.** Browsers don't reliably support always-on background syncing for installed web apps; you sync manually with the button, or when you notice a bank alert come in.

## Running your own copy

This entire app is one HTML file plus a manifest and service worker for installability. To run your own independent copy:

1. Fork this repository
2. In your fork's **Settings → Pages**, set Source to "Deploy from a branch," branch `main`, folder `/ (root)`
3. Your own live URL will appear there in about a minute

No build step, no dependencies to install, no server to run.

## Tech stack

Plain HTML/CSS/JavaScript, [Chart.js](https://www.chartjs.org/) for charts, browser `localStorage` for persistence, and optionally Google Apps Script + Google Sheets for the Gmail sync feature.
