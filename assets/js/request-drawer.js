/* "Add to request" drawer. No payment: customers send a request and the team follows up.
   Triggers:  [data-add="cup|box|bag|bagasse"]  opens the product step
              [data-open-request]               opens the review step
   Counter:   any element with [data-request-count] shows the number of items. */
(function () {
  var PRODUCTS = {
    cup:     { name: 'Paper cup 8 oz', sub: 'Single-wall · FSC paper · Ø 80 mm', per: 'carton of 1,000', unit: 'cups', pcs: 1000, price: 148, img: 'assets/img/cup.jpg', tag: 'Best seller',
               opts: [['Size', ['4 oz', '8 oz', '12 oz', '16 oz'], 1], ['Lid', ['No lid', 'White PP lid', 'Fibre lid'], 1]] },
    box:     { name: 'Kraft takeaway box', sub: 'Kraft board · grease-resistant', per: 'carton of 300', unit: 'pcs', pcs: 300, price: 210, img: 'assets/img/box.jpg',
               opts: [['Style', ['With window', 'Plain'], 0]] },
    bag:     { name: 'Kraft paper bag, medium', sub: 'Recycled kraft · twisted handle', per: 'carton of 250', unit: 'pcs', pcs: 250, price: 96, img: 'assets/img/bag.jpg',
               opts: [['Print', ['Plain', 'Custom logo (from 500 pcs)'], 0]] },
    bagasse: { name: 'Bagasse container 750 ml', sub: 'Sugarcane fibre · home compostable', per: 'carton of 500', unit: 'pcs', pcs: 500, price: 260, img: 'assets/img/bagasse.jpg', tag: 'Compostable',
               opts: [['Size', ['500 ml', '750 ml', '1000 ml'], 1]] }
  };
  var QUICK = [1, 5, 10, 20, 50];
  var KEY = 'oslopack-request';
  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { items = []; }

  var ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'
  };
  var fmt = function (n) { return 'QAR ' + n.toLocaleString('en-US'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} counts(); };
  var total = function () { return items.reduce(function (s, i) { return s + PRODUCTS[i.id].price * i.qty; }, 0); };
  var counts = function () {
    var n = items.length;
    document.querySelectorAll('[data-request-count]').forEach(function (el) { el.textContent = n; });
    document.querySelectorAll('[data-add]').forEach(function (b) {
      var it = items.filter(function (i) { return i.id === b.getAttribute('data-add'); })[0];
      if (!b.dataset.label) b.dataset.label = b.innerHTML;
      b.innerHTML = it ? '✓ In request · ' + it.qty : b.dataset.label;
      b.classList.toggle('in', !!it);
    });
  };

  var scrim = document.createElement('div'); scrim.className = 'rq-scrim';
  var box = document.createElement('aside'); box.className = 'rq'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Request list');
  document.body.appendChild(scrim); document.body.appendChild(box);

  var cur = null;       // product step draft {id, qty, sel[]}
  var lastRef = '';

  function open() { scrim.classList.add('on'); box.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function close() { scrim.classList.remove('on'); box.classList.remove('on'); document.body.style.overflow = ''; }
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function header(title, back, count) {
    return '<div class="rq-h"><div class="t">' + (back ? '<button class="rq-ib" data-act="' + back + '" aria-label="Back">' + ICON.back + '</button>' : '') +
      '<h2>' + title + '</h2></div>' + (count ? '<span class="cnt">' + count + '</span>' : '') +
      (!back ? '<button class="rq-ib" data-act="close" aria-label="Close">' + ICON.x + '</button>' : '') + '</div>';
  }

  function viewProduct() {
    var p = PRODUCTS[cur.id], line = p.price * cur.qty;
    var opts = p.opts.map(function (g, gi) {
      return '<div class="rq-lbl">' + g[0] + '</div><div class="rq-opt">' + g[1].map(function (o, oi) {
        return '<button class="rq-o' + (cur.sel[gi] === oi ? ' on' : '') + '" data-opt="' + gi + ':' + oi + '">' + o + '</button>'; }).join('') + '</div>';
    }).join('');
    var after = items.filter(function (i) { return i.id !== cur.id; }).length + 1;
    var afterTotal = items.filter(function (i) { return i.id !== cur.id; }).reduce(function (s, i) { return s + PRODUCTS[i.id].price * i.qty; }, 0) + line;
    box.innerHTML = header('Add to request') +
      '<div class="rq-b"><div class="rq-prow"><div class="im"><img src="' + p.img + '" alt="' + esc(p.name) + '"></div><div><h3>' + p.name + '</h3><div class="m">' + p.sub + '</div><div class="pr">' + fmt(p.price) + ' <span>/ ' + p.per + '</span></div></div></div>' +
      opts + '<div class="rq-lbl">Quantity <span>Cartons of ' + p.pcs.toLocaleString('en-US') + '</span></div>' +
      '<div class="rq-step"><button data-act="dec" aria-label="Fewer">−</button><div class="v">' + cur.qty + '<small>cartons</small></div><button data-act="inc" aria-label="More">+</button></div>' +
      '<div class="rq-qk">' + QUICK.map(function (q) { return '<button class="rq-o' + (cur.qty === q ? ' on' : '') + '" data-q="' + q + '">' + q + (q === 50 ? ' · free delivery' : '') + '</button>'; }).join('') + '</div>' +
      '<div class="rq-est"><span>' + (cur.qty * p.pcs).toLocaleString('en-US') + ' ' + p.unit + ' · indicative price</span><b>' + fmt(line) + '</b></div></div>' +
      '<div class="rq-f"><div class="rq-sum"><span>Your request after adding: <b style="font-size:14px">' + after + ' item' + (after > 1 ? 's' : '') + '</b></span><span>Est. <b>' + fmt(afterTotal) + '</b></span></div>' +
      '<button class="rq-btn" data-act="add">Add to request · ' + cur.qty + ' cartons</button><div class="rq-note">No payment now. Our team confirms price and delivery.</div></div>';
  }

  function viewReview() {
    if (!items.length) {
      box.innerHTML = header('Your request', null) + '<div class="rq-b"><div class="rq-empty"><p><b>Your request is empty.</b></p><p style="margin-top:6px">Add products and send one request for everything.</p></div></div><div class="rq-f"><button class="rq-btn" data-act="close">Browse products</button></div>';
      return;
    }
    var list = items.map(function (i, idx) {
      var p = PRODUCTS[i.id];
      return '<div class="rq-it"><div class="im"><img src="' + p.img + '" alt=""></div><div><h4>' + p.name + '</h4><div class="m">' + (i.qty * p.pcs).toLocaleString('en-US') + ' ' + p.unit + '</div>' +
        '<div class="st"><button data-act="idec" data-i="' + idx + '" aria-label="Fewer">−</button><span>' + i.qty + '</span><button data-act="iinc" data-i="' + idx + '" aria-label="More">+</button></div></div>' +
        '<div class="pr">' + fmt(p.price * i.qty) + '<button data-act="rm" data-i="' + idx + '">Remove</button></div></div>';
    }).join('');
    box.innerHTML = header('Your request', null, items.length + ' item' + (items.length > 1 ? 's' : '')) +
      '<div class="rq-b"><div class="rq-sl"><span>Items</span><a data-act="more">+ Add more products</a></div>' + list +
      '<div class="rq-tot"><span>Estimated total</span><b>' + fmt(total()) + '</b></div>' +
      '<div class="rq-two rq-fld"><div id="f-name"><label for="rq-name">Contact name</label><input id="rq-name" autocomplete="name"><div class="rq-err">Enter your name</div></div>' +
      '<div id="f-phone"><label for="rq-phone">WhatsApp / phone</label><input id="rq-phone" autocomplete="tel" inputmode="tel" placeholder="+974"><div class="rq-err">Enter a phone number</div></div></div>' +
      '<div class="rq-fld"><label for="rq-area">Delivery area</label><select id="rq-area"><option>West Bay, Doha</option><option>The Pearl, Doha</option><option>Lusail</option><option>Al Wakrah</option><option>Al Khor</option><option>Other (tell us in the note)</option></select></div>' +
      '<div class="rq-fld"><label for="rq-note">Note for our team <span>(optional)</span></label><textarea id="rq-note" placeholder="Delivery date, custom printing, anything we should know"></textarea></div></div>' +
      '<div class="rq-f"><button class="rq-btn" data-act="send">Send request</button><div class="rq-note">No payment now. We reply on WhatsApp within 1 working day.</div></div>';
    var s = (function () { try { return JSON.parse(localStorage.getItem(KEY + '-contact') || '{}'); } catch (e) { return {}; } })();
    if (s.name) document.getElementById('rq-name').value = s.name;
    if (s.phone) document.getElementById('rq-phone').value = s.phone;
  }

  function viewSent(n, t) {
    box.innerHTML = header('Request sent', null).replace('<h2>Request sent</h2>', '<h2></h2>') +
      '<div class="rq-b rq-done"><div class="rq-ok">' + ICON.ok + '</div><h2>Request sent</h2><p class="sub">Thanks. Our team will review your items and reply on WhatsApp within 1 working day.</p><span class="rq-ref">' + lastRef + '</span>' +
      '<div class="rq-est" style="margin-top:24px"><span>' + n + ' item' + (n > 1 ? 's' : '') + ' · estimated, to be confirmed</span><b>' + fmt(t) + '</b></div>' +
      '<div class="rq-nx"><div class="h">What happens next</div>' +
      '<div class="rq-s"><div class="n on">✓</div><div><b>Request received</b><span>Saved to your request history.</span></div></div>' +
      '<div class="rq-s"><div class="n">2</div><div><b>Our team confirms price and delivery</b><span>We check stock, delivery date and any custom printing.</span></div></div>' +
      '<div class="rq-s"><div class="n">3</div><div><b>You approve, then pay by bank transfer or LPO</b><span>Nothing is charged until you agree to the final quote.</span></div></div></div></div>' +
      '<div class="rq-f"><div class="rq-fb"><button class="rq-btn alt" data-act="close">Keep browsing</button><a class="rq-btn" href="quotes-history.html">View my requests</a></div></div>';
  }

  box.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act],[data-opt],[data-q]'); if (!t) return;
    var act = t.getAttribute('data-act'), i = +t.getAttribute('data-i');
    if (t.hasAttribute('data-opt')) { var o = t.getAttribute('data-opt').split(':'); cur.sel[+o[0]] = +o[1]; return viewProduct(); }
    if (t.hasAttribute('data-q')) { cur.qty = +t.getAttribute('data-q'); return viewProduct(); }
    switch (act) {
      case 'close': return close();
      case 'dec': cur.qty = Math.max(1, cur.qty - 1); return viewProduct();
      case 'inc': cur.qty = Math.min(999, cur.qty + 1); return viewProduct();
      case 'add':
        var ex = items.filter(function (x) { return x.id === cur.id; })[0];
        if (ex) { ex.qty = cur.qty; ex.sel = cur.sel; } else items.push({ id: cur.id, qty: cur.qty, sel: cur.sel });
        save(); return viewReview();
      case 'more': return close();
      case 'idec': items[i].qty = Math.max(1, items[i].qty - 1); save(); return viewReview();
      case 'iinc': items[i].qty = Math.min(999, items[i].qty + 1); save(); return viewReview();
      case 'rm': items.splice(i, 1); save(); return viewReview();
      case 'send':
        var name = document.getElementById('rq-name'), phone = document.getElementById('rq-phone'), ok = true;
        [['f-name', name], ['f-phone', phone]].forEach(function (p) { var bad = !p[1].value.trim(); document.getElementById(p[0]).classList.toggle('err', bad); if (bad) ok = false; });
        if (!ok) { (name.value.trim() ? phone : name).focus(); return; }
        try { localStorage.setItem(KEY + '-contact', JSON.stringify({ name: name.value, phone: phone.value })); } catch (e) {}
        lastRef = 'REQ-' + (20000 + Math.floor(Math.random() * 9999));
        var n = items.length, t2 = total(); items = []; save(); return viewSent(n, t2);
    }
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); e.stopPropagation(); var id = a.getAttribute('data-add'), ex = items.filter(function (x) { return x.id === id; })[0];
      cur = { id: id, qty: ex ? ex.qty : 5, sel: ex ? ex.sel.slice() : PRODUCTS[id].opts.map(function (g) { return g[2]; }) }; viewProduct(); return open(); }
    var r = e.target.closest('[data-open-request]');
    if (r) { e.preventDefault(); e.stopPropagation(); viewReview(); open(); }
  }, true);

  counts();
})();
