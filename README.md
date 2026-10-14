# Booking Widget

A minimal booking calendar you can add to any website with two lines of HTML. Customers pick a date and leave their name, email, phone and optional details. Each booking is saved to a Google Sheet, emailed to you and the customer, and added to your Google Calendar.

The calendar works by whole dates (days or nights), not time slots. Each date allows a set number of bookings (2 by default).

**Files**

| File | What it is |
|---|---|
| `booking-widget.js` | The calendar and form. Shared by all your sites. |
| `Code.gs` | The back end. Each site/business gets its own copy, in its own Google Sheet. |
| `README.md` | This guide. |

---

## Part A: Host the script once (GitHub Pages)

Do this once. Every site then loads the same file.

1. On GitHub, create a new **public** repository named **booking-widget**.
2. Upload `booking-widget.js` and `README.md` to it. Don't upload `Code.gs` there; it lives in Google.
3. Go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute, the script is live at:
   ```
   https://ionescualexandrum.github.io/booking-widget/booking-widget.js
   ```
   Open that link in your browser. If you see code, it works.

---

## Part B: Set up a back end (once per site)

> **Tip:** if you're signed in to several Google accounts, do this in a **private/incognito window** signed in only to the account that should get the bookings. Otherwise Apps Script opens under the wrong account and says the file is **unavailable**.

1. Go to **script.google.com**, check the account (top-right picture), and click **New project**. You don't need to create a spreadsheet; the script makes one for you.
2. Delete what's in the editor, paste all of `Code.gs`, and **Save** (disk icon). Name the project something like "Bookings – alex.ionie".
3. Edit the **Settings** block at the top:

   | Setting | Meaning |
   |---|---|
   | `OWNER_EMAIL` | Where new bookings are sent |
   | `BUSINESS_NAME` | Sender name on the emails |
   | `SIGNATURE` | Name at the end of the customer email |
   | `FOLLOW_UP` | Extra line in the customer email (leave `''` for none) |
   | `UNIT` | What a booking is called on the site: `'night'`, `'day'`… |
   | `MAX_PER_DAY` | Bookings allowed on the same date |
   | `MIN_DAYS_AHEAD` | `1` = earliest is tomorrow, `0` = today allowed |
   | `MONTHS_AHEAD` | How far ahead people can book |
   | `ADD_TO_CALENDAR` | `true` / `false` |
   | `TIME_ZONE` | For example `'Europe/Bucharest'` |

4. Pick **setup** in the function dropdown and click **Run**. Approve the permissions. "Google hasn't verified this app" is normal for your own script: click **Advanced → Go to … (unsafe) → Allow**.
   When it finishes, the log at the bottom shows **Your bookings sheet:** with a link. That's the sheet where bookings will appear; bookmark it. It's also in your Google Drive as "Bookings - alex.ionie".
5. Click **Deploy → New deployment**, open the gear and choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
6. Copy the **Web app URL** (it ends in `/exec`). That's the site's `data-api`.

---

## Part C: Add it to a page

Put this where the calendar should appear:

```html
<div class="booking-widget" data-api="https://script.google.com/macros/s/XXXX/exec"></div>
```

And this once, before `</body>`:

```html
<script src="https://ionescualexandrum.github.io/booking-widget/booking-widget.js" defer></script>
```

Write your own heading and intro text above the widget in the page's HTML, so they use the site's style.

### Options (optional `data-` attributes)

| Attribute | Default | Example |
|---|---|---|
| `data-api` | (required) | your `/exec` URL |
| `data-notes-placeholder` | `Details (optional)` | `Event, venue, hours (optional)` |
| `data-privacy` | `Your details are only used…` | any sentence |
| `data-week-start` | `mon` | `sun` |
| `data-locale` | `en-GB` | `en-US` changes the date format |

### Colors and look (optional, via `style`)

The widget uses the page's font and text color automatically. You can override these:

```html
<div class="booking-widget" data-api="…"
     style="--bkw-accent:#585858; --bkw-hover:#f2849e;"></div>
```

| Variable | Used for |
|---|---|
| `--bkw-accent` | Selected date and Book button |
| `--bkw-accent-text` | Text on the accent color |
| `--bkw-hover` | Hover and focus color |
| `--bkw-text` | Text color (defaults to the page's) |
| `--bkw-muted` | Small text and past dates |
| `--bkw-border` | Lines under the fields |
| `--bkw-day-bg` | Background of available dates |
| `--bkw-dot` | "1 spot left" dot |
| `--bkw-error` | Error messages |
| `--bkw-radius` | Corner roundness |
| `--bkw-letter-spacing` | Spacing of uppercase labels |

The widget's styles are sealed off from the page, so a site's own CSS can't break it.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Apps Script says the file is **unavailable** / "Sorry, unable to open the file" | You're signed in to more than one Google account. Use an incognito window with only the booking account, or sign out of the others. |
| **Run** does nothing | Make sure **setup** is selected in the dropdown next to Run, and that you saved first. Look for the permission pop-up, since your browser may have blocked it. |
| "Authorization required" keeps coming back | Allow pop-ups for script.google.com, then run **setup** again. |
| Calendar says "Couldn't load availability" | In the deployment, **Who has access** must be **Anyone** (not "Anyone with a Google account"). Use the URL ending in `/exec`, not `/dev`. |
| Changes to the settings don't apply | Deploy a new version: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. |

## Managing bookings

Each site's Google Sheet (the link from step B4) has a **Bookings** tab. The **Status** column controls the calendar:

| Status | Effect |
|---|---|
| `Confirmed` (or empty) | Takes one spot that date |
| `Cancelled` | Frees the spot |
| `Blocked` | Closes the whole date (days off, private jobs) |

To block a date yourself, add a row with only the **Date** (`2026-12-31`) and **Blocked** in Status.

## Changing things later

- **Settings in `Code.gs`:** after editing, go to **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.
- **`booking-widget.js`:** upload the new version to the booking-widget repo. All sites update within a few minutes (browsers may cache the old file for up to 10 minutes).

## Limits

A normal Gmail account can send about 100 emails a day from scripts. Each booking sends 2, so about 50 bookings a day per Google account.
