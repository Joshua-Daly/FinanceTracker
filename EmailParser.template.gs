/**
 * FamilyLedger — Generic Bank Email Parser Template
 * ---------------------------------------------------------------
 * This is a STARTING POINT, not a ready-to-run script. Every bank
 * writes its transaction alert emails differently, so the patterns
 * below are examples you need to replace with your own bank's actual
 * wording. Budget 15-20 minutes to set this up properly the first
 * time -- most of that is just reading a couple of your own emails
 * carefully.
 *
 * WHAT THIS SCRIPT DOES, ONCE SET UP
 * Every 15 minutes it scans your Gmail for messages matching a sender
 * you specify, checks the email body against patterns you define, and
 * if it matches, logs the amount/merchant/date as a new row in your
 * "Pending" Google Sheet tab. It also exposes a small read-only web
 * endpoint so the FamilyLedger app can pull those rows in with its
 * "Sync from Gmail" button.
 *
 * ============================================================
 * STEP 1 -- FIND YOUR BANK'S REAL WORDING
 * ============================================================
 * Open a real transaction alert email from your bank. Note:
 *   (a) The sender address (3-dot menu > "Show original" > "From:")
 *   (b) The EXACT sentence that states the amount, e.g.
 *       "Rs.500.00 was debited from your account..."
 *       "You spent $42.10 at STARBUCKS on 08/28..."
 *   (c) Whether it's a debit (money out) or credit (money in) alert
 *   (d) The exact date format used (DD-MM-YY? MM/DD/YYYY? etc.)
 *
 * You'll likely need a SEPARATE pattern for each distinct email
 * template your bank sends (e.g. one for UPI/card debits, one for
 * incoming credits, one for credit card alerts) -- see the HDFC/RBL
 * example patterns further down for what this looks like in practice
 * with a real bank.
 *
 * ============================================================
 * STEP 2 -- SET UP THE SHEET
 * ============================================================
 * Create a Google Sheet with two tabs:
 *   "Pending"  -> Date | Merchant | Amount | Direction | Note | Status | MessageId | ThreadId
 *   "Balances" -> Timestamp | AvailableBalance   (optional)
 *
 * ============================================================
 * STEP 3 -- EDIT THE CONFIG BELOW AND YOUR REGEX PATTERNS
 * ============================================================
 */

const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE'; // from the sheet's URL, between /d/ and /edit
const PENDING_TAB = 'Pending';
const BALANCE_TAB = 'Balances';

// Use a broad partial match on your bank's domain, not a full exact
// address. If even one character is off in an exact address, Gmail's
// search finds zero matching emails -- and finding zero emails isn't
// treated as an error by Apps Script, so the failure is completely
// silent. A broad match like "yourbank" (matching yourbank.com,
// yourbank.net, alerts.yourbank.co.in, etc.) is safer -- the precise
// filtering happens afterwards via the body-text patterns below.
const BANK_QUERIES = {
  // EXAMPLE -- replace with your own bank's domain
  examplebank: 'from:(examplebank) newer_than:3d'
};

/* ---------------- DEBUGGING ----------------
 * Run this manually any time an email doesn't show up as expected. It
 * won't write anything -- it just prints what it found to View > Logs.
 * If NOTHING prints for a bank you expect emails from, your sender
 * search (BANK_QUERIES) is the first thing to check. If emails print
 * but say "NO PATTERN MATCHED", your body-text regex needs adjusting
 * -- paste the exact email wording somewhere you can compare it
 * character-by-character against your pattern.
 */
function debugScan() {
  Object.keys(BANK_QUERIES).forEach(bank => {
    const threads = GmailApp.search(BANK_QUERIES[bank]);
    Logger.log(`--- ${bank}: ${threads.length} thread(s) found for query "${BANK_QUERIES[bank]}" ---`);
    threads.forEach(thread => {
      thread.getMessages().forEach(message => {
        const body = message.getPlainBody();
        const subject = message.getSubject();
        const from = message.getFrom();
        const parsed = parseExampleBank(body); // swap in your own parse function(s) here
        Logger.log(`From: ${from} | Subject: ${subject} | Parsed: ${parsed ? JSON.stringify(parsed) : 'NO PATTERN MATCHED'}`);
      });
    });
  });
}

/* ---------------- TRIGGER SETUP ---------------- */
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'scanInboxForTransactions') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('scanInboxForTransactions').timeBased().everyMinutes(15).create();
  Logger.log('Trigger installed -- runs every 15 minutes.');
}

function scanInboxForTransactions() {
  const seen = getExistingMessageIds();
  scanBank('examplebank', seen); // add one call per bank you've configured in BANK_QUERIES
}

function getExistingMessageIds() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PENDING_TAB);
  const data = sheet.getDataRange().getValues();
  const ids = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][6]) ids.add(data[i][6]); // column G: MessageId
  }
  return ids;
}

/* ============================================================
 * EXAMPLE BANK -- REPLACE THIS ENTIRE SECTION WITH YOUR OWN BANK'S
 * PATTERNS. This is deliberately generic so it's obvious what to
 * change; it will not match a real email as-is.
 * ============================================================ */
function scanBank(bankKey, seen) {
  const threads = GmailApp.search(BANK_QUERIES[bankKey]);
  threads.forEach(thread => {
    const threadId = thread.getId();
    thread.getMessages().forEach(message => {
      const id = message.getId();
      if (seen.has(id)) return;
      const body = message.getPlainBody();
      const parsed = parseExampleBank(body);
      if (parsed && parsed.amount) {
        logToPending(id, threadId, parsed);
        seen.add(id);
      }
    });
  });
}

// EXAMPLE PATTERN -- a debit alert reading something like:
// "A payment of Rs. 450.00 was made to AMAZON on 15-09-26."
// Replace this regex with whatever YOUR bank's real wording is.
function parseExampleBank(body) {
  const amt = body.match(/payment of Rs\.?\s?([\d,]+\.\d{2})\s+was made/i);
  const merchant = body.match(/made to\s+([A-Z0-9 &.'-]{3,40})\s+on/i);
  const dateM = body.match(/on\s+(\d{2}-\d{2}-\d{2})\b/);
  if (!amt) return null; // this email didn't match this pattern at all
  return {
    amount: parseFloat(amt[1].replace(/,/g, '')),
    merchant: merchant ? merchant[1].trim() : 'Unknown',
    date: dateM ? ddmmyyToIso(dateM[1]) : todayIso(),
    direction: 'debit', // or 'credit' for incoming-money patterns
    note: 'Example Bank transaction'
  };
}

/* ---------------- SHEET HELPERS ---------------- */
function logToPending(id, threadId, parsed) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PENDING_TAB);
  sheet.appendRow([parsed.date, parsed.merchant, parsed.amount, parsed.direction, parsed.note, 'Pending', id, threadId]);
}

// Optional: if your bank's email happens to mention your running
// available balance, you can log it here for future reference.
function logBalanceSnapshot(body) {
  const bal = body.match(/available balance is (?:Rs\.?|INR|\$)\s?([\d,]+\.\d{2})/i);
  if (!bal) return;
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BALANCE_TAB);
  if (!sheet) return;
  sheet.appendRow([new Date(), parseFloat(bal[1].replace(/,/g, ''))]);
}

function ddmmyyToIso(d) { const p = d.split('-'); return `20${p[2]}-${p[1]}-${p[0]}`; }
function ddmmyyyyToIso(d) { const p = d.split('-'); return `${p[2]}-${p[1]}-${p[0]}`; }
function mmddyyyySlashToIso(d) { const p = d.split('/'); return `${p[2]}-${p[0]}-${p[1]}`; }
function todayIso() { return new Date().toISOString().slice(0, 10); }

/* ---------------- WEB APP ENDPOINT (for the app's "Sync from Gmail") ---------------- */
function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(PENDING_TAB);
  const data = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const date = row[0], merchant = row[1], amount = row[2], direction = row[3], note = row[4], status = row[5], messageId = row[6], threadId = row[7];
    if (status === 'Pending') {
      rows.push({
        id: messageId,
        threadId: threadId,
        date: (date instanceof Date) ? date.toISOString().slice(0, 10) : String(date),
        merchant: merchant, amount: amount, direction: direction, note: note
      });
      sheet.getRange(i + 1, 6).setValue('Synced');
    }
  }
  return ContentService.createTextOutput(JSON.stringify(rows)).setMimeType(ContentService.MimeType.JSON);
}
