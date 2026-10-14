/*!
 * Booking Widget v1.0.0
 * A minimal per-day booking calendar for any website.
 * Back end: Google Apps Script (Code.gs) + Google Sheet. See README.md.
 *
 * Usage:
 *   <div class="booking-widget" data-api="https://script.google.com/macros/s/XXXX/exec"></div>
 *   <script src="booking-widget.js" defer></script>
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';

  var CSS = [
    ':host { display: block; font: inherit; color: var(--bkw-text, inherit);',
    '  --a: var(--bkw-accent, #333333); --at: var(--bkw-accent-text, #ffffff);',
    '  --h: var(--bkw-hover, var(--bkw-accent, #333333)); --m: var(--bkw-muted, #9a9a9a);',
    '  --b: var(--bkw-border, #c9c9c9); --d: var(--bkw-day-bg, rgba(127,127,127,0.09));',
    '  --dot: var(--bkw-dot, #e4ab0f); --err: var(--bkw-error, #c0392b);',
    '  --r: var(--bkw-radius, 4px); --ls: var(--bkw-letter-spacing, 0.2em); }',
    '* { box-sizing: border-box; }',
    '[hidden] { display: none !important; }',
    'button, input, textarea { font: inherit; color: inherit; }',
    '.wrap { display: flex; flex-wrap: wrap; gap: 2.5em; align-items: flex-start; }',
    '.cal { flex: 1 1 18em; max-width: 26em; }',
    '.side { flex: 1 1 18em; min-width: 0; }',
    '.head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75em; }',
    '.month { font-weight: 700; text-transform: uppercase; letter-spacing: var(--ls); font-size: 0.85em; }',
    '.nav { width: 2.4em; height: 2.4em; border-radius: 50%; border: 1px solid var(--b); background: none;',
    '  cursor: pointer; font-size: 1em; line-height: 1; padding: 0; transition: border-color .2s, color .2s; }',
    '.nav:hover:not(:disabled) { border-color: var(--h); color: var(--h); }',
    '.nav:disabled { opacity: 0.3; cursor: default; }',
    '.grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }',
    '.wd { text-align: center; font-size: 0.68em; font-weight: 700; letter-spacing: 0.1em;',
    '  text-transform: uppercase; padding: 0.4em 0; color: var(--m); }',
    '.day { position: relative; aspect-ratio: 1 / 1; width: 100%; border: 0; border-radius: var(--r);',
    '  background: var(--d); cursor: pointer; padding: 0; font-size: 0.95em; transition: box-shadow .15s; }',
    '.day:hover:not(:disabled) { box-shadow: inset 0 0 0 2px var(--h); }',
    '.day:focus-visible, .nav:focus-visible, .submit:focus-visible { outline: 2px solid var(--h); outline-offset: 2px; }',
    '.day.empty { background: none; pointer-events: none; }',
    '.day:disabled { background: none; color: var(--m); opacity: 0.55; cursor: default; }',
    '.day.full { text-decoration: line-through; }',
    '.day.one::after { content: ""; position: absolute; left: 50%; bottom: 14%; transform: translateX(-50%);',
    '  width: 5px; height: 5px; border-radius: 50%; background: var(--dot); }',
    '.day.sel { background: var(--a); color: var(--at); }',
    '.day.sel::after { background: var(--at); }',
    '.legend { display: flex; flex-wrap: wrap; gap: 1.25em; margin-top: 1em; font-size: 0.8em; color: var(--m); }',
    '.legend span::before { content: ""; display: inline-block; width: 0.8em; height: 0.8em; border-radius: 2px;',
    '  margin-right: 0.45em; vertical-align: -0.05em; }',
    '.l-free::before { background: var(--d); box-shadow: inset 0 0 0 1px var(--b); }',
    '.l-one::before { background: var(--dot); border-radius: 50% !important; width: 0.55em !important; height: 0.55em !important; }',
    '.l-full::before { box-shadow: inset 0 0 0 1px var(--b); opacity: 0.5; }',
    '.small { font-size: 0.8em; color: var(--m); margin: 0.75em 0 0; }',
    '.chosen { font-size: 1.1em; margin: 0 0 1em; }',
    '.chosen strong { font-weight: 700; }',
    '.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25em 1.5em; }',
    '.full-w { grid-column: 1 / -1; }',
    '@media (max-width: 480px) { .fields { grid-template-columns: 1fr; } }',
    'input, textarea { width: 100%; background: transparent; border: 0; border-bottom: 1px solid var(--b);',
    '  border-radius: 0; padding: 0.6em 0; outline: none; transition: border-color .2s; }',
    'textarea { resize: vertical; min-height: 4.5em; }',
    'input:focus, textarea:focus { border-bottom-color: var(--h); }',
    'input::placeholder, textarea::placeholder { color: var(--m); opacity: 1; }',
    '.submit { margin-top: 1.5em; background: var(--a); color: var(--at); border: 0; border-radius: var(--r);',
    '  padding: 1em 2.2em; font-size: 0.8em; font-weight: 700; letter-spacing: var(--ls); text-transform: uppercase;',
    '  cursor: pointer; transition: opacity .2s, background-color .2s; }',
    '.submit:hover:not(:disabled) { background: var(--h); }',
    '.submit:disabled { opacity: 0.6; cursor: wait; }',
    '.msg { margin: 1em 0 0; min-height: 1.2em; }',
    '.msg.err { color: var(--err); }',
    '.done { padding: 1.5em; background: var(--d); border-radius: var(--r); }',
    '.done h3 { margin: 0 0 0.5em; font-size: 1em; text-transform: uppercase; letter-spacing: var(--ls); }',
    '.done p { margin: 0 0 1em; }',
    '.link { background: none; border: 0; padding: 0; color: inherit; text-decoration: underline; cursor: pointer; font-size: 0.9em; }',
    '.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }'
  ].join('\n');

  var HTML =
    '<div class="wrap">' +
      '<div class="cal">' +
        '<div class="head">' +
          '<button type="button" class="nav prev" aria-label="Previous month">&#8249;</button>' +
          '<span class="month" aria-live="polite"></span>' +
          '<button type="button" class="nav next" aria-label="Next month">&#8250;</button>' +
        '</div>' +
        '<div class="grid"></div>' +
        '<div class="legend"><span class="l-free">Available</span><span class="l-one">1 spot left</span><span class="l-full">Booked</span></div>' +
        '<p class="small status">Loading availability&hellip;</p>' +
      '</div>' +
      '<div class="side">' +
        '<p class="chosen"></p>' +
        '<form class="form" hidden novalidate>' +
          '<div class="fields">' +
            '<input class="full-w" type="text" name="name" placeholder="Name" aria-label="Name" autocomplete="name" maxlength="100">' +
            '<input type="email" name="email" placeholder="Email" aria-label="Email" autocomplete="email" maxlength="150">' +
            '<input type="tel" name="phone" placeholder="Phone" aria-label="Phone" autocomplete="tel" maxlength="40">' +
            '<textarea class="full-w" name="notes" rows="3" aria-label="Notes" maxlength="1000"></textarea>' +
          '</div>' +
          '<div class="hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>' +
          '<p class="small privacy"></p>' +
          '<button type="submit" class="submit">Book</button>' +
          '<p class="msg" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<div class="done" hidden>' +
          '<h3>Thank you!</h3>' +
          '<p class="done-text"></p>' +
          '<button type="button" class="link again">Book another date</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function Widget(host) {
    var ds = host.dataset;
    var api = (ds.api || ds.bookingApi || '').trim();
    var weekStartsSunday = (ds.weekStart || '').toLowerCase() === 'sun';
    var locale = ds.locale || 'en-GB';

    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.innerHTML = '<style>' + CSS + '</style>' + HTML;
    var q = function (s) { return root.querySelector(s); };

    var grid = q('.grid'), monthLbl = q('.month'), prev = q('.prev'), next = q('.next');
    var statusEl = q('.status'), chosen = q('.chosen'), form = q('.form');
    var msg = q('.msg'), submit = q('.submit'), done = q('.done');

    q('textarea').placeholder = ds.notesPlaceholder || 'Details (optional)';
    q('.privacy').textContent = ds.privacy || 'Your details are only used to contact you about this booking.';

    var cfg = { max: 2, minDaysAhead: 1, monthsAhead: 12, unit: 'day' };
    var taken = {}, selected = null, loaded = false;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var view = new Date(today.getFullYear(), today.getMonth(), 1);

    function minDate() { var d = new Date(today); d.setDate(d.getDate() + cfg.minDaysAhead); return d; }
    function maxDate() { var d = new Date(today); d.setMonth(d.getMonth() + cfg.monthsAhead); return d; }
    function pretty(k) {
      var p = k.split('-');
      return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(locale,
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    function prompt() { chosen.textContent = 'Select a ' + cfg.unit + ' in the calendar.'; }
    function setMsg(t, isErr) { msg.textContent = t; msg.classList.toggle('err', !!isErr); }

    function render() {
      var y = view.getFullYear(), m = view.getMonth(), mx = maxDate();
      monthLbl.textContent = MONTHS[m] + ' ' + y;
      prev.disabled = (y === today.getFullYear() && m === today.getMonth());
      next.disabled = (y > mx.getFullYear() || (y === mx.getFullYear() && m >= mx.getMonth()));

      var wd = weekStartsSunday
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      var frag = document.createDocumentFragment();
      wd.forEach(function (w) {
        var h = document.createElement('div'); h.className = 'wd'; h.textContent = w; frag.appendChild(h);
      });

      var offset = weekStartsSunday ? new Date(y, m, 1).getDay() : (new Date(y, m, 1).getDay() + 6) % 7;
      for (var i = 0; i < offset; i++) {
        var e = document.createElement('div'); e.className = 'day empty'; frag.appendChild(e);
      }

      var days = new Date(y, m + 1, 0).getDate(), lo = minDate(), hi = maxDate();
      for (var d = 1; d <= days; d++) {
        var date = new Date(y, m, d), k = key(date), n = taken[k] || 0;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'day'; b.textContent = d; b.dataset.date = k;
        var label = pretty(k);
        if (!loaded || date < lo || date > hi) {
          b.disabled = true;
        } else if (n >= cfg.max) {
          b.disabled = true; b.classList.add('full'); label += ', booked';
        } else if (cfg.max > 1 && n === cfg.max - 1) {
          b.classList.add('one'); label += ', 1 spot left';
        } else {
          label += ', available';
        }
        if (k === selected) { b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); }
        b.setAttribute('aria-label', label);
        frag.appendChild(b);
      }
      grid.innerHTML = '';
      grid.appendChild(frag);
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.day');
      if (!b || b.disabled || !b.dataset.date) return;
      selected = b.dataset.date;
      chosen.textContent = '';
      chosen.appendChild(document.createTextNode(cap(cfg.unit) + ' of '));
      var s = document.createElement('strong'); s.textContent = pretty(selected); chosen.appendChild(s);
      done.hidden = true; form.hidden = false; setMsg('');
      render();
      form.elements.name.focus({ preventScroll: true });
    });
    prev.addEventListener('click', function () { view.setMonth(view.getMonth() - 1); render(); });
    next.addEventListener('click', function () { view.setMonth(view.getMonth() + 1); render(); });

    function load() {
      if (api.indexOf('https://') !== 0) {
        statusEl.textContent = 'Online booking is not connected yet.';
        render(); return;
      }
      fetch(api)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) throw new Error('bad response');
          taken = data.taken || {};
          ['max', 'minDaysAhead', 'monthsAhead', 'unit'].forEach(function (k) {
            if (data[k] != null) cfg[k] = data[k];
          });
          loaded = true; statusEl.textContent = '';
          if (cfg.max <= 1) q('.l-one').hidden = true;
          if (!selected) prompt();
          render();
        })
        .catch(function () {
          statusEl.textContent = 'Couldn’t load availability. Please refresh the page or try again later.';
          render();
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!selected) { setMsg('Please pick a date first.', true); return; }
      var f = form.elements;
      var data = {
        date: selected,
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        notes: f.notes.value.trim(),
        website: f.website.value
      };
      if (!data.name) { setMsg('Please enter your name.', true); f.name.focus(); return; }
      if (!EMAIL_RE.test(data.email)) { setMsg('Please enter a valid email.', true); f.email.focus(); return; }
      if (data.phone.replace(/\D/g, '').length < 6) { setMsg('Please enter a valid phone number.', true); f.phone.focus(); return; }

      submit.disabled = true; submit.textContent = 'Booking…'; setMsg('');
      fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // simple request, no CORS preflight
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.taken) taken = res.taken;
          if (!res.ok) {
            var err = res.error || 'Something went wrong. Please try again.';
            if ((taken[selected] || 0) >= cfg.max) {
              // The date filled up meanwhile: drop it, keep what they typed.
              selected = null; form.hidden = true;
              chosen.textContent = err;
            } else {
              setMsg(err, true);
            }
            render(); return;
          }
          if (!res.taken) taken[selected] = (taken[selected] || 0) + 1;
          q('.done-text').textContent = 'Your booking for ' + pretty(selected) +
            ' is in. A confirmation is on its way to ' + data.email + '.';
          form.reset(); form.hidden = true; done.hidden = false;
          chosen.textContent = ''; selected = null; render();
          host.dispatchEvent(new CustomEvent('booking:success', { detail: { date: data.date }, bubbles: true }));
        })
        .catch(function () { setMsg('Couldn’t send your booking. Please check your connection and try again.', true); })
        .then(function () { submit.disabled = false; submit.textContent = 'Book'; });
    });

    q('.again').addEventListener('click', function () { done.hidden = true; prompt(); });

    prompt(); render(); load();
  }

  function init(scope) {
    var els = (scope || document).querySelectorAll('.booking-widget, [data-booking-api]');
    Array.prototype.forEach.call(els, function (el) {
      if (el.__bookingWidget) return;
      el.__bookingWidget = true;
      Widget(el);
    });
  }

  window.BookingWidget = { init: init, version: VERSION };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
