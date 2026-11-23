/**
 * ============================================================================
 * JOLLY WEBSITE - MAIN JAVASCRIPT
 * ============================================================================
 * Reads everything from content.js and builds the page:
 *   1. The order builder (turning table, shirt, order slip). An order can
 *      hold several items; the slip groups them by their prints.
 *   2. The price list and measuring figure
 *   3. The line-up of shirts and colours
 *   4. The prints & embroidery samples
 *   5. Why Jolly, contact, footer
 * You should not need to edit this file to change words or prices.
 * ============================================================================
 */

(function () {
  const C = SITE_CONTENT;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
  const pcs = n => Number(n).toLocaleString('en-PH');
  const isSet = v => typeof v === 'string' && v.trim() !== '' && !/\[.*\]/.test(v);
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------------
  // Data helpers
  // ---------------------------------------------------------------------------
  const products = C.products;
  const methods = C.customServices.methods;
  const places = C.customServices.placements;

  function colorsFor(p) {
    if (!p || !p.colors || !p.colors.length) return C.colors;
    return C.colors.filter(c => p.colors.includes(c.name));
  }
  const isWhite = c => c && c.name.toLowerCase() === 'white';
  const unitPrice = (size, color) => (isWhite(color) ? size.white : size.colored);
  const lowest = p => Math.min.apply(null, p.sizes.map(s => s.white));

  // A decoration choice for one side: { key, method, place } or the plain one
  const PLAIN = { key: 'plain' };
  function decoOptions(side) {
    const list = [PLAIN];
    places[side].forEach(pl => methods.forEach(m => {
      list.push({ key: m.id + ':' + pl.id, method: m, place: pl });
    }));
    return list;
  }
  const FRONT_OPTIONS = decoOptions('front');
  const BACK_OPTIONS = decoOptions('back');
  // Short form for the slip and stage; the long form names the file
  const decoText = (d, long) => (!d || d.key === 'plain' ? 'Plain'
    : `${d.method.name}, ${d.place.name.toLowerCase()}${d.art ? (long ? ` (your design: ${d.art.name})` : ' + your design') : ''}`);
  const decoDraw = d => (!d || d.key === 'plain' ? null : { method: d.method.id, place: d.place.id, art: d.art || null });
  const sideKey = d => (d ? d.key + (d.art ? `#${d.art.id}@${d.art.scale.toFixed(2)},${d.art.dx.toFixed(2)},${d.art.dy.toFixed(2)}` : '') : 'plain');
  // Each item keeps its own copy of the artwork position
  const cloneDeco = d => (d && d.art ? Object.assign({}, d, { art: Object.assign({}, d.art) }) : d);
  const designKey = it => sideKey(it.front) + '|' + sideKey(it.back);
  // An option with the customer's artwork carried over (plain drops it)
  const withArt = (d, art) => (!d || d.key === 'plain' || !art ? d : Object.assign({}, d, { art }));
  // "tee" / "tees", "polo" / "polos"
  const shirtNoun = (p, n) => { const w = (p.shortName || p.name).split(' ').pop().toLowerCase(); return n === 1 ? w : w + 's'; };

  // Artwork is drawn from a short blob: link, so redrawing the shirt stays
  // quick; the data copy is kept for the mockup download and for remembering
  // the order.
  function blobUrlFromData(data) {
    try {
      const comma = data.indexOf(',');
      const bin = atob(data.slice(comma + 1));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], { type: data.slice(5, comma).split(';')[0] }));
    } catch (e) { return data; }
  }

  function tierFor(product, total) {
    return (product.bulkDiscounts || []).find(t => total >= t.min && (t.max == null || total <= t.max)) || null;
  }
  // The bulk discount is counted per shirt style, as on each Drive price list
  function discounts(list) {
    return products.map(p => {
      const its = list.filter(it => it.product === p);
      const n = its.reduce((a, it) => a + piecesOf(it), 0);
      const tier = n ? tierFor(p, n) : null;
      return { product: p, pcs: n, tier, amount: tier ? tier.off * n : 0 };
    }).filter(d => d.pcs > 0);
  }
  const tierText = t => `${pcs(t.min)}${t.max == null ? '+' : '–' + pcs(t.max)} pcs`;

  // ---------------------------------------------------------------------------
  // Builder state: the item being built (draft) and the order so far
  // ---------------------------------------------------------------------------
  const blankDraft = keep => ({
    product: null, color: null,
    front: keep ? cloneDeco(keep.front) : null,
    back: keep ? cloneDeco(keep.back) : null,
    sizes: {},
  });
  let draft = blankDraft();
  const order = [];
  let nextId = 1;
  let stepIndex = 0;
  let flipped = false;
  let notice = '';
  let editingId = null;   // the order item being changed, if any

  const draftProduct = () => draft.product || products[0];
  const draftColor = () => draft.color || colorsFor(draftProduct())[0];
  const piecesOf = it => Object.values(it.sizes).reduce((a, b) => a + (b || 0), 0);
  const retailOf = it => it.product.sizes.reduce((sum, s) => sum + (it.sizes[s.size] || 0) * unitPrice(s, it.color), 0);
  const draftItem = () => ({
    id: editingId || 'draft', product: draftProduct(), color: draftColor(),
    front: draft.front || PLAIN, back: draft.back || PLAIN, sizes: draft.sizes,
  });
  // What the totals count: the order, plus the item being built (or the
  // changes to the item being edited) once it has sizes
  function lineItems() {
    const n = piecesOf(draft);
    const list = order.map(it => (it.id === editingId && n ? draftItem() : it));
    if (editingId == null && n) list.push(draftItem());
    return list;
  }
  // Clear a colour the shirt does not come in, and sizes it does not have
  function fitDraftToProduct() {
    const p = draftProduct();
    if (draft.color && !colorsFor(p).includes(draft.color)) draft.color = null;
    Object.keys(draft.sizes).forEach(k => { if (!p.sizes.some(s => s.size === k)) delete draft.sizes[k]; });
  }

  const STEPS = [
    {
      key: 'product',
      label: 'Shirt',
      question: 'Pick a shirt',
      hint: 'Both are 100% cotton. Prices are per piece.',
      items: () => products.map((p, i) => ({
        value: p,
        plate: Shirt.draw({ shape: p.shape, color: (colorsFor(p).includes(draftColor()) ? draftColor() : colorsFor(p)[0]).hex, front: decoDraw(draft.front) }),
        name: p.shortName || p.name,
        price: 'from ' + peso(lowest(p)),
      })),
    },
    {
      key: 'color',
      label: 'Colour',
      question: 'Pick a colour',
      hint: 'Coloured shirts cost a little more than white.',
      items: () => colorsFor(draftProduct()).map(c => ({
        value: c,
        plate: Shirt.draw({ shape: draftProduct().shape, color: c.hex, front: decoDraw(draft.front) }),
        name: c.name,
        price: '',
      })),
    },
    {
      key: 'front',
      label: 'Front',
      question: 'What goes on the front?',
      hint: 'DTF, DTG or embroidery, on the left chest or the full front.',
      items: () => FRONT_OPTIONS.map(d => ({
        value: d,
        plate: Shirt.draw({ shape: draftProduct().shape, color: draftColor().hex, side: 'front', front: decoDraw(withArt(d, draft.front && draft.front.art)) }),
        group: d.key === 'plain' ? 'No print' : d.place.name,
        name: d.key === 'plain' ? 'Plain front' : d.method.name,
        price: '',
      })),
    },
    {
      key: 'back',
      label: 'Back',
      question: 'And on the back?',
      hint: 'Mix it up: the back can use a different method from the front.',
      items: () => BACK_OPTIONS.map(d => ({
        value: d,
        plate: Shirt.draw({ shape: draftProduct().shape, color: draftColor().hex, side: 'back', back: decoDraw(withArt(d, draft.back && draft.back.art)) }),
        group: d.key === 'plain' ? 'No print' : d.place.name,
        name: d.key === 'plain' ? 'Plain back' : d.method.name,
        price: '',
      })),
    },
    {
      key: 'sizes',
      label: 'Sizes',
      question: 'How many of each size?',
      hint: 'Prices are per piece. Bulk discounts start at 6 pieces of the same shirt.',
      sheet: true,
    },
  ];

  function isChosen(key) {
    if (key === 'sizes') return piecesOf(draft) > 0;
    return draft[key] != null;
  }
  function sameValue(key, a, b) {
    if (!a || !b) return false;
    if (key === 'front' || key === 'back') return a.key === b.key;
    return a === b;
  }

  // ---------------------------------------------------------------------------
  // Elements
  // ---------------------------------------------------------------------------
  const el = {
    options: $('#options'),
    sizeSheet: $('#size-sheet'),
    steps: $('#steps'),
    question: $('#step-question'),
    hint: $('#step-hint'),
    back: $('#step-back'),
    next: $('#step-next'),
    drop: $('#shirt-drop'),
    flipper: $('#flipper'),
    faceFront: $('#face-front'),
    faceBack: $('#face-back'),
    showFront: $('#show-front'),
    showBack: $('#show-back'),
    stamp: $('#stamp'),
    stageNote: $('#stage-note'),
    draftBox: $('#slip-draft'),
    items: $('#slip-items'),
    sumPcs: $('#sum-pcs'),
    sumRetail: $('#sum-retail'),
    sumDisc: $('#sum-disc'),
    sumDiscLabel: $('#sum-disc-label'),
    sumPrint: $('#sum-print'),
    sumTotal: $('#sum-total'),
    sumDown: $('#sum-down'),
    sumDownLabel: $('#sum-down-label'),
    fine: $('#slip-fine'),
    send: $('#send-order'),
    clear: $('#clear-order'),
    nudge: $('#slip-nudge'),
    ghost: $('#ghost'),
  };

  // ---------------------------------------------------------------------------
  // Remember the order in this browser, so a refresh does not lose it
  // ---------------------------------------------------------------------------
  const STORE = 'jolly-order-v1';
  let saveTimer = 0;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 400); }
  function saveNow() {
    const arts = {};
    const deco = d => {
      if (!d) return null;
      if (d.key === 'plain') return { key: 'plain' };
      if (d.art) arts[d.art.id] = { name: d.art.name, data: d.art.data, w: d.art.w, h: d.art.h };
      return { key: d.key, art: d.art ? { id: d.art.id, scale: d.art.scale, dx: d.art.dx, dy: d.art.dy } : null };
    };
    const ser = x => ({ id: x.id, product: x.product ? x.product.id : null, color: x.color ? x.color.name : null, front: deco(x.front), back: deco(x.back), sizes: x.sizes });
    const state = { order: order.map(ser), draft: ser(draft), editingId, nextId };
    try {
      localStorage.setItem(STORE, JSON.stringify(Object.assign({ arts }, state)));
    } catch (e) {
      // Too big with the pictures in it: remember the order without them
      try { localStorage.setItem(STORE, JSON.stringify(Object.assign({ arts: {} }, state))); } catch (e2) { /* storage is off */ }
    }
  }
  function restore() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return false; }
    if (!s || !Array.isArray(s.order)) return false;
    const hrefs = {};
    const art = a => {
      const src = a && s.arts && s.arts[a.id];
      if (!src || !src.data) return null;
      if (!hrefs[a.id]) hrefs[a.id] = blobUrlFromData(src.data);
      artId = Math.max(artId, a.id + 1);
      return { id: a.id, name: src.name, data: src.data, href: hrefs[a.id], w: src.w, h: src.h, scale: a.scale, dx: a.dx, dy: a.dy };
    };
    const deco = (d, side) => {
      const opt = d && (side === 'front' ? FRONT_OPTIONS : BACK_OPTIONS).find(o => o.key === d.key);
      if (!opt) return null;
      const a = d.art ? art(d.art) : null;
      return a ? withArt(opt, a) : opt;
    };
    const item = x => {
      const product = products.find(p => p.id === x.product) || null;
      const color = C.colors.find(c => c.name === x.color) || null;
      const sizes = {};
      Object.keys(x.sizes || {}).forEach(k => {
        const q = Math.floor(Number(x.sizes[k]));
        if (q > 0 && (!product || product.sizes.some(z => z.size === k))) sizes[k] = q;
      });
      return { id: x.id, product, color, front: deco(x.front, 'front'), back: deco(x.back, 'back'), sizes };
    };
    // Skip anything the price list no longer has
    s.order.map(item)
      .filter(it => it.product && it.color && colorsFor(it.product).includes(it.color) && piecesOf(it) > 0)
      .forEach(it => { it.front = it.front || PLAIN; it.back = it.back || PLAIN; order.push(it); });
    nextId = Math.max(Number(s.nextId) || 1, ...order.map(o => o.id + 1), 1);
    if (s.draft) { draft = Object.assign(blankDraft(), item(s.draft)); delete draft.id; }
    editingId = order.some(o => o.id === s.editingId) ? s.editingId : null;
    fitDraftToProduct();
    return order.length > 0 || piecesOf(draft) > 0;
  }

  // ---------------------------------------------------------------------------
  // The choices for the current step: every option in view at once
  // ---------------------------------------------------------------------------
  let items = [];

  function isMobile() { return window.matchMedia('(max-width: 900px)').matches; }

  function renderOptions() {
    const step = STEPS[stepIndex];
    el.options.hidden = !!step.sheet;
    el.sizeSheet.hidden = !step.sheet;
    if (step.sheet) { items = []; el.options.innerHTML = ''; renderSizeSheet(); return; }
    items = step.items();
    el.options.className = 'options options-' + step.key;
    el.options.innerHTML = '';
    let group = null;
    items.forEach((it, i) => {
      if (it.group && it.group !== group) {
        group = it.group;
        const h = document.createElement('p');
        h.className = 'opt-group';
        h.textContent = group;
        el.options.appendChild(h);
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('role', 'option');
      b.style.setProperty('--i', i);
      b.setAttribute('aria-selected', sameValue(step.key, draft[step.key], it.value) ? 'true' : 'false');
      b.innerHTML =
        `<span class="opt-pic">${it.plate}</span>` +
        `<span class="opt-text"><span class="opt-name">${esc(it.name)}</span>` +
        `${it.price ? `<span class="opt-sub">${esc(it.price)}</span>` : ''}</span>`;
      b.addEventListener('click', () => onOptClick(it));
      b.addEventListener('pointerdown', e => onOptPointerDown(e, b, it));
      el.options.appendChild(b);
    });
  }

  // ---------------------------------------------------------------------------
  // The size sheet (last step): a quantity for every size
  // ---------------------------------------------------------------------------
  function renderSizeSheet() {
    const p = draftProduct();
    const color = draftColor();
    el.sizeSheet.innerHTML =
      `<div class="ss-head"><span>${esc(p.shortName || p.name)} · ${esc(color.name)}</span><span>${isWhite(color) ? 'White price' : 'Coloured price'}</span></div>` +
      `<ul class="ss-rows">` +
      p.sizes.map(s => {
        const q = draft.sizes[s.size] || 0;
        return `<li class="ss-row${q ? ' has' : ''}" data-size="${esc(s.size)}">` +
          `<span class="ss-size">${esc(s.size)}</span>` +
          `<span class="ss-dim">${s.width}×${s.length} in</span>` +
          `<span class="ss-price">${peso(unitPrice(s, color))}</span>` +
          `<span class="ss-step">` +
          `<button type="button" class="ss-btn" data-d="-1" aria-label="One fewer ${esc(s.size)}">−</button>` +
          `<input type="number" inputmode="numeric" min="0" step="1" value="${q || ''}" placeholder="0" aria-label="How many in size ${esc(s.size)}">` +
          `<button type="button" class="ss-btn" data-d="1" aria-label="One more ${esc(s.size)}">+</button>` +
          `</span></li>`;
      }).join('') +
      `</ul><p class="ss-foot" id="ss-foot"></p>`;

    el.sizeSheet.querySelectorAll('.ss-row').forEach(row => {
      const size = row.dataset.size;
      const input = row.querySelector('input');
      const set = v => {
        const n = Math.max(0, Math.min(999999, Math.floor(Number(v) || 0)));
        if (n) draft.sizes[size] = n; else delete draft.sizes[size];
        input.value = n || '';
        row.classList.toggle('has', n > 0);
        afterSizes();
      };
      input.addEventListener('input', () => set(input.value));
      row.querySelectorAll('.ss-btn').forEach(b => b.addEventListener('click', () => {
        const step = Number(b.dataset.d) * ((draft.sizes[size] || 0) >= 10 && b.dataset.d === '1' ? 5 : 1);
        set((draft.sizes[size] || 0) + step);
      }));
    });
    afterSizes();
  }

  function afterSizes() {
    const n = piecesOf(draft);
    const foot = $('#ss-foot');
    if (foot) foot.textContent = n ? `${pcs(n)} pcs in this item · ${peso(retailOf(Object.assign({}, draft, { product: draftProduct(), color: draftColor() })))} before discount` : 'Type a number or use + and −.';
    renderShirt(false);
    renderSlip();
    renderStepCard();
  }

  // ---------------------------------------------------------------------------
  // The step tabs, the question and Back / Next
  // ---------------------------------------------------------------------------
  function stepValue(key) {
    if (key === 'product') return draft.product ? (draft.product.shortName || draft.product.name) : '';
    if (key === 'color') return draft.color ? draft.color.name : '';
    if (key === 'front' || key === 'back') {
      const d = draft[key];
      return d ? (d.key === 'plain' ? 'Plain' : d.method.name) : '';
    }
    const n = piecesOf(draft);
    return n ? pcs(n) + ' pcs' : '';
  }

  function renderStepCard() {
    const step = STEPS[stepIndex];
    const showNotice = notice && stepIndex === 0;
    el.question.textContent = step.question;
    el.hint.textContent = showNotice ? notice : step.hint;
    el.hint.classList.toggle('notice', !!showNotice);
    el.steps.innerHTML = STEPS.map((s, i) => {
      const v = stepValue(s.key);
      return `<li class="${i === stepIndex ? 'now' : ''}${isChosen(s.key) ? ' done' : ''}">` +
        `<button type="button" data-i="${i}"${i === stepIndex ? ' aria-current="step"' : ''}>` +
        `<span class="st-label">${s.label}</span><span class="st-val">${v ? esc(v) : '—'}</span></button></li>`;
    }).join('');
    el.steps.querySelectorAll('button').forEach(b => b.addEventListener('click', () => goTo(Number(b.dataset.i))));
    el.back.disabled = stepIndex === 0;
    if (step.sheet) {
      el.next.textContent = editingId ? 'Save changes' : 'Add to order';
      el.next.disabled = piecesOf(draft) === 0;
      el.next.classList.add('btn-red');
      el.next.classList.remove('btn-ink');
    } else {
      el.next.textContent = 'Next: ' + STEPS[stepIndex + 1].label;
      el.next.disabled = false;
      el.next.classList.add('btn-ink');
      el.next.classList.remove('btn-red');
    }
  }

  function goTo(i, scroll) {
    if (i < 0 || i >= STEPS.length) return;
    stepIndex = i;
    if (STEPS[i].key === 'back') flipped = true;
    if (STEPS[i].key === 'front' || STEPS[i].key === 'color') flipped = false;
    renderShirt(false);
    renderStepCard();
    renderOptions();
    // On phones the list can be long: bring the new question back into view
    if (scroll && isMobile()) {
      const top = document.querySelector('.picker').getBoundingClientRect().top;
      if (top < 64) document.querySelector('.picker').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  // ---------------------------------------------------------------------------
  // Choosing: tap an option (or, with a mouse, drag it onto the shirt)
  // ---------------------------------------------------------------------------
  let drag = null;
  let suppressClick = false;

  function onOptClick(it) {
    if (suppressClick) { suppressClick = false; return; }
    choose(it.value, stepIndex);
  }

  function onOptPointerDown(e, btn, it) {
    if (e.button !== 0) return;
    if (e.pointerType !== 'mouse') return; // touch and pen: tap only, so the page can scroll
    drag = { btn, it, at: stepIndex, x: e.clientX, y: e.clientY, active: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active && Math.hypot(dx, dy) > 8) {
      drag.active = true;
      const pic = drag.btn.querySelector('.opt-pic');
      const r = pic.getBoundingClientRect();
      el.ghost.innerHTML = pic.innerHTML;
      el.ghost.style.width = r.width + 'px';
      el.ghost.style.height = r.height + 'px';
      el.ghost.classList.add('on');
      drag.btn.classList.add('lifted');
      document.body.classList.add('dragging');
    }
    if (drag.active) {
      el.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) rotate(-4deg)`;
      el.drop.classList.toggle('hot', overDrop(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e) {
    window.removeEventListener('pointermove', onPointerMove);
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.active) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 50);
    document.body.classList.remove('dragging');
    d.btn.classList.remove('lifted');
    el.drop.classList.remove('hot');
    resetGhost();
    if (overDrop(e.clientX, e.clientY)) choose(d.it.value, d.at);
  }

  function overDrop(x, y) {
    const r = el.drop.getBoundingClientRect();
    return x > r.left && x < r.right && y > r.top && y < r.bottom;
  }

  function resetGhost() {
    el.ghost.classList.remove('on');
    el.ghost.style.transform = '';
    el.ghost.innerHTML = '';
  }

  function choose(value, at) {
    if (at != null && at !== stepIndex) return;
    const step = STEPS[stepIndex];
    if ((step.key === 'front' || step.key === 'back') && draft[step.key] && draft[step.key].art) {
      value = withArt(value, draft[step.key].art);
    }
    draft[step.key] = value;
    notice = '';

    if (step.key === 'product') fitDraftToProduct();
    if (step.key === 'back') flipped = true;
    if (step.key === 'front') flipped = false;

    renderShirt(true);
    renderSlip(step.key);
    renderStepCard();
    // A new shirt changes the colours on offer; otherwise just move the tick
    if (step.key === 'product') renderOptions();
    else el.options.querySelectorAll('.opt').forEach((o, i) => o.setAttribute('aria-selected', sameValue(step.key, items[i].value, value) ? 'true' : 'false'));
  }

  // ---------------------------------------------------------------------------
  // Adding, editing and removing items
  // ---------------------------------------------------------------------------
  function addToOrder() {
    if (!piecesOf(draft)) return;
    const editing = order.some(it => it.id === editingId) ? editingId : null;
    const item = {
      id: editing || nextId++,
      product: draftProduct(),
      color: draftColor(),
      front: cloneDeco(draft.front || PLAIN),
      back: cloneDeco(draft.back || PLAIN),
      sizes: Object.assign({}, draft.sizes),
    };
    // An edited item keeps its place on the slip
    const at = order.findIndex(it => it.id === editing);
    if (at > -1) order[at] = item; else order.push(item);
    editingId = null;
    // The next item keeps the same prints, so a second shirt style is quick
    draft = blankDraft(item);
    notice = (editing ? 'Saved your changes.' : 'Added.') +
      ` The next shirt keeps the same prints (front: ${decoText(item.front)}; back: ${decoText(item.back)}). Change them at the Front and Back steps.`;
    flipped = false;
    stepIndex = 0;
    renderShirt(true);
    renderSlip();
    renderStepCard();
    renderOptions();
    pulseSend();
  }

  // The item stays on the order while it is being changed; "Save changes"
  // replaces it and "Cancel" leaves it as it was.
  function editItem(id) {
    const it = order.find(x => x.id === id);
    if (!it) return;
    // Do not lose an item that was being built: it goes on the order first
    if (editingId == null && piecesOf(draft)) addToOrder();
    editingId = id;
    draft = { product: it.product, color: it.color, front: cloneDeco(it.front), back: cloneDeco(it.back), sizes: Object.assign({}, it.sizes) };
    notice = '';
    flipped = false;
    renderShirt(true);
    renderSlip();
    goTo(STEPS.findIndex(s => s.key === 'sizes'));
    document.getElementById('build').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function startFresh() {
    editingId = null;
    draft = blankDraft();
    notice = '';
    flipped = false;
    renderShirt(true);
    renderSlip();
    goTo(0);
  }

  function removeItem(id) {
    const i = order.findIndex(it => it.id === id);
    if (i > -1) order.splice(i, 1);
    if (id === editingId) { startFresh(); return; }
    renderSlip();
  }

  function clearOrder() {
    if (!window.confirm('Clear every item from the order slip?')) return;
    order.length = 0;
    startFresh();
  }

  function pulseSend() {
    el.send.classList.remove('ready');
    void el.send.offsetWidth;
    el.send.classList.add('ready');
  }

  // ---------------------------------------------------------------------------
  // The shirt in the middle
  // ---------------------------------------------------------------------------
  function renderShirt(pop) {
    const p = draftProduct();
    const color = draftColor().hex;
    const opts = { shape: p.shape, color, front: decoDraw(draft.front), back: decoDraw(draft.back) };
    el.faceFront.innerHTML = Shirt.draw(Object.assign({ side: 'front' }, opts));
    el.faceBack.innerHTML = Shirt.draw(Object.assign({ side: 'back' }, opts));

    // Pick the backdrop colour that stands out most from the shirt
    const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
    const backdrops = ['#1436B4', '#F8C81C', '#E4032B'];
    const stageColor = backdrops.find(b => dist(b, color) > 200) || '#F8C81C';
    el.drop.parentElement.style.setProperty('--stage', stageColor);
    el.drop.parentElement.classList.toggle('on-dark', stageColor !== '#F8C81C');

    el.flipper.classList.toggle('flipped', flipped);
    el.showFront.setAttribute('aria-pressed', flipped ? 'false' : 'true');
    el.showBack.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    renderArtBar();

    const bits = [p.shortName || p.name];
    if (draft.color) bits.push(draft.color.name);
    const side = flipped ? draft.back : draft.front;
    if (side) bits.push((flipped ? 'Back: ' : 'Front: ') + decoText(side));
    el.stageNote.textContent = bits.join(' · ');

    const n = piecesOf(draft);
    if (n) {
      const text = '× ' + pcs(n);
      if (el.stamp.textContent !== text || !el.stamp.classList.contains('on')) {
        el.stamp.textContent = text;
        el.stamp.classList.remove('on');
        void el.stamp.offsetWidth;
        el.stamp.classList.add('on');
      }
    } else {
      el.stamp.classList.remove('on');
      el.stamp.textContent = '';
    }

    if (pop && !reduceMotion) {
      el.drop.classList.remove('pop');
      void el.drop.offsetWidth;
      el.drop.classList.add('pop');
    }
  }

  // ---------------------------------------------------------------------------
  // The order slip: the item being built, then the order grouped by design
  // ---------------------------------------------------------------------------
  function sizeLine(it) {
    return it.product.sizes.filter(s => it.sizes[s.size]).map(s => `${s.size} × ${pcs(it.sizes[s.size])}`).join(', ');
  }

  function groups() {
    const map = new Map();
    order.forEach(it => {
      const k = designKey(it);
      if (!map.has(k)) map.set(k, { front: it.front, back: it.back, items: [] });
      map.get(k).items.push(it);
    });
    return Array.from(map.values());
  }
  const designName = i => 'Design ' + String.fromCharCode(65 + (i % 26));

  function renderSlip(justSet) {
    // 1. The item being built. Once it has sizes, anything not picked shows
    //    what it will be (the first shirt, White, plain).
    const n = piecesOf(draft);
    const pick = (chosen, text, fallback) => (chosen ? [text, false] : n ? [fallback + ' (default)', true] : [null, false]);
    const rows = [
      ['product', 'Shirt', ...pick(draft.product, draft.product && (draft.product.shortName || draft.product.name), draftProduct().shortName || draftProduct().name)],
      ['color', 'Colour', ...pick(draft.color, draft.color && draft.color.name, draftColor().name)],
      ['front', 'Front', ...pick(draft.front, draft.front && decoText(draft.front), 'Plain')],
      ['back', 'Back', ...pick(draft.back, draft.back && decoText(draft.back), 'Plain')],
      ['sizes', 'Sizes', n ? sizeLine(Object.assign({}, draft, { product: draftProduct() })) : null, false],
    ];
    el.draftBox.innerHTML =
      (editingId
        ? `<p class="slip-label">Changing an item <button type="button" class="slip-cancel" data-cancel>Cancel</button></p>`
        : `<p class="slip-label">${order.length ? 'Next item' : 'Item 1'} <span>in progress</span></p>`) +
      `<dl class="slip-lines">` +
      rows.map(([k, label, val, dflt]) =>
        `<div class="line${val ? (dflt ? ' default' : ' filled') : ''}${k === justSet ? ' just' : ''}">` +
        `<dt><button type="button" data-step="${k}">${label}</button></dt><dd>${val ? esc(val) : '—'}</dd></div>`
      ).join('') + `</dl>`;
    el.draftBox.querySelectorAll('button[data-step]').forEach(b => {
      b.addEventListener('click', () => goTo(STEPS.findIndex(s => s.key === b.dataset.step)));
    });
    const cancel = el.draftBox.querySelector('[data-cancel]');
    if (cancel) cancel.addEventListener('click', startFresh);

    // 2. The order, one section per design (same front and back prints)
    const gs = groups();
    el.items.innerHTML = gs.map((g, gi) =>
      `<section class="design">` +
      `<h3 class="design-head"><span>${designName(gi)}</span><span class="design-deco">Front: ${esc(decoText(g.front, true))}<br>Back: ${esc(decoText(g.back, true))}</span></h3>` +
      `<ul>` + g.items.map(it =>
        `<li class="oi${it.id === editingId ? ' editing' : ''}">` +
        `<span class="oi-dot" style="--sw:${it.color.hex}" aria-hidden="true"></span>` +
        `<span class="oi-main"><strong>${esc(it.product.shortName || it.product.name)}, ${esc(it.color.name)}</strong>` +
        `<span class="oi-sizes">${esc(sizeLine(it))}</span>` +
        `<span class="oi-acts">${it.id === editingId ? '<em>Being changed above</em>' : `<button type="button" data-edit="${it.id}">Edit</button>`}<button type="button" data-remove="${it.id}">Remove</button></span></span>` +
        `<span class="oi-num"><strong>${pcs(piecesOf(it))}</strong> pcs<br>${peso(retailOf(it))}</span>` +
        `</li>`
      ).join('') + `</ul></section>`
    ).join('');
    el.items.hidden = gs.length === 0;
    el.items.closest('.slip').classList.toggle('has-items', gs.length > 0);
    el.items.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editItem(Number(b.dataset.edit))));
    el.items.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeItem(Number(b.dataset.remove))));

    // 3. The sums: the order plus the item being built
    const all = lineItems();
    const total = all.reduce((a, it) => a + piecesOf(it), 0);
    const retail = all.reduce((a, it) => a + retailOf(it), 0);
    const ds = discounts(all);
    const disc = ds.reduce((a, d) => a + d.amount, 0);
    const hit = ds.filter(d => d.tier);
    const decorated = all.some(it => it.front.key !== 'plain' || it.back.key !== 'plain');
    const firstMin = Math.min.apply(null, products.map(p => (p.bulkDiscounts && p.bulkDiscounts.length ? p.bulkDiscounts[0].min : Infinity)));
    el.sumPcs.textContent = total ? pcs(total) : '—';
    el.sumRetail.textContent = total ? peso(retail) : '—';
    el.sumDiscLabel.textContent = hit.length === 1
      ? `Bulk discount, ${peso(hit[0].tier.off)} off each ${shirtNoun(hit[0].product, 1)}`
      : hit.length ? 'Bulk discounts' : isFinite(firstMin) ? `Bulk discount (from ${firstMin} of a style)` : 'Bulk discount';
    // A nudge when a bigger discount is close
    el.nudge.textContent = ds.map(d => {
      const tiers = (d.product.bulkDiscounts || []).slice().sort((a, b) => a.min - b.min);
      const next = tiers.find(t => t.min > d.pcs);
      if (!next) return '';
      const need = next.min - d.pcs;
      if (need > Math.max(5, next.min * 0.2)) return '';
      return `Add ${pcs(need)} more ${shirtNoun(d.product, need)} to get ${peso(next.off)} off each` +
        (d.tier ? ` (now ${peso(d.tier.off)}).` : '.');
    }).filter(Boolean).join(' ');
    el.sumDiscLabel.title = hit.map(d => `${d.product.shortName}: ${pcs(d.pcs)} pcs, ${peso(d.tier.off)} off each`).join('; ');
    el.sumDisc.textContent = disc ? '−' + peso(disc) : '—';
    el.sumPrint.textContent = !total ? '—' : decorated ? 'Quoted' : 'None';
    el.sumTotal.textContent = peso(retail - disc);
    el.sumDown.parentElement.hidden = !C.downpayment;
    el.sumDownLabel.textContent = `${C.downpayment}% downpayment`;
    el.sumDown.textContent = total && C.downpayment ? peso((retail - disc) * C.downpayment / 100) : '—';

    const dates = Array.from(new Set(order.concat([{ product: draftProduct() }]).map(it => it.product.effectivityDate).filter(Boolean)));
    let fine = dates.length ? `Prices effective ${dates.join(', ')}. ` : '';
    if (C.paymentTerms) fine += C.paymentTerms + ' ';
    if (decorated || (draft.front && draft.front.key !== 'plain') || (draft.back && draft.back.key !== 'plain')) fine += 'Prints and embroidery are quoted per design. ';
    fine += C.priceNote || '';
    el.fine.textContent = fine.trim();

    // Sending also adds the item being built, so nothing is left behind
    el.send.disabled = order.length === 0 && n === 0;
    el.send.textContent = !n ? 'Send this order'
      : editingId ? 'Save and send this order'
      : order.length ? 'Add this item and send' : 'Add and send this order';
    el.clear.hidden = order.length === 0;
    saveSoon();
  }

  function orderSummary() {
    const out = ['Order from the website builder:', ''];
    groups().forEach((g, gi) => {
      out.push(`${designName(gi)} (front: ${decoText(g.front, true)}; back: ${decoText(g.back, true)})`);
      g.items.forEach(it => {
        out.push(`  - ${it.product.name}, ${it.color.name}: ${sizeLine(it)} (${pcs(piecesOf(it))} pcs, ${peso(retailOf(it))})`);
      });
      out.push('');
    });
    const total = order.reduce((a, it) => a + piecesOf(it), 0);
    const retail = order.reduce((a, it) => a + retailOf(it), 0);
    const ds = discounts(order).filter(d => d.tier);
    const disc = ds.reduce((a, d) => a + d.amount, 0);
    out.push(`Total: ${pcs(total)} pcs, ${peso(retail)} before discount`);
    ds.forEach(d => out.push(`Bulk discount, ${d.product.name}: ${peso(d.tier.off)} off each on ${pcs(d.pcs)} pcs (${tierText(d.tier)})`));
    if (disc) out.push(`Estimated total after discount: ${peso(retail - disc)}`);
    const names = [];
    order.forEach(it => [it.front, it.back].forEach(d => { if (d && d.art && !names.includes(d.art.name)) names.push(d.art.name); }));
    out.push(names.length
      ? `Please quote the prints and embroidery. I will email my artwork: ${names.join(', ')}.`
      : 'Please quote the prints and embroidery. I will send the artwork.');
    return out.join('\n');
  }

  // ---------------------------------------------------------------------------
  // The customer's own artwork: upload, move, resize, remove, download
  // The picture stays in the browser; nothing is uploaded anywhere.
  // ---------------------------------------------------------------------------
  const DEFAULT_PLACE = { front: 'dtf:front', back: 'dtf:back' };
  let artId = 1;
  const visibleSide = () => (flipped ? 'back' : 'front');

  function readArtwork(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) { reject(new Error('Please use a PNG, JPG, WEBP or SVG file.')); return; }
      if (file.size > 20 * 1024 * 1024) { reject(new Error('That file is over 20 MB. Please use a smaller one.')); return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // Shrink big pictures so the page stays quick, and keep transparency
        let w = img.naturalWidth || 1000, h = img.naturalHeight || 1000;
        const k = Math.min(1, 1400 / Math.max(w, h));
        w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const data = cv.toDataURL('image/png');
        resolve({ id: artId++, name: file.name, data, href: blobUrlFromData(data), w, h, scale: 0.85, dx: 0, dy: 0 });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That picture could not be opened.')); };
      img.src = url;
    });
  }

  function setArt(side, art) {
    const opts = side === 'front' ? FRONT_OPTIONS : BACK_OPTIONS;
    let d = draft[side];
    if (art && (!d || d.key === 'plain')) d = opts.find(o => o.key === DEFAULT_PLACE[side]) || opts[1];
    if (!d) return;
    draft[side] = art ? withArt(d, art) : (d.key === 'plain' ? d : Object.assign({}, d, { art: null }));
    renderShirt(true);
    renderSlip(side);
    renderStepCard();
    if (STEPS[stepIndex].key === side) renderOptions();
  }

  function renderArtBar() {
    const side = visibleSide();
    const d = draft[side];
    const art = d && d.art;
    $('#art-up-text').textContent = art ? `Replace the ${side} design` : `Upload a ${side} design`;
    $('#art-tools').hidden = !art;
    if (art) $('#art-size').value = Math.round(art.scale * 100);
    $('#art-hint').textContent = art
      ? `Drag it on the shirt to move it. ${d.method.name}, ${d.place.name.toLowerCase()}: change the method or spot at the ${side === 'front' ? 'Front' : 'Back'} step.`
      : 'PNG with a clear background works best. Your file stays on your device.';
  }

  function initArtwork() {
    const input = $('#art-file');
    const status = $('#art-status');
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      status.textContent = 'Loading your design…';
      try {
        const art = await readArtwork(file);
        setArt(visibleSide(), art);
        status.textContent = '';
      } catch (err) {
        status.textContent = err.message;
      }
    });

    $('#art-size').addEventListener('input', e => {
      const d = draft[visibleSide()];
      if (!d || !d.art) return;
      d.art.scale = Number(e.target.value) / 100;
      moveArtElement(visibleSide());
    });
    $('#art-size').addEventListener('change', () => { renderShirt(false); renderOptions(); saveSoon(); });
    $('#art-remove').addEventListener('click', () => setArt(visibleSide(), null));
    $('#mockup-btn').addEventListener('click', downloadMockup);

    // Drag the artwork around inside its print area
    let moving = null;
    el.drop.addEventListener('pointerdown', e => {
      const g = e.target.closest && e.target.closest('.user-art');
      if (!g || g.dataset.side !== visibleSide()) return;
      const d = draft[visibleSide()];
      if (!d || !d.art) return;
      e.preventDefault();
      const svg = g.ownerSVGElement;
      const unit = svg.getBoundingClientRect().width / 400; // screen px per shirt unit
      const z = Shirt.zones[d.place.id];
      moving = { d, x: e.clientX, y: e.clientY, dx: d.art.dx, dy: d.art.dy, unit, z, side: visibleSide() };
      el.drop.setPointerCapture(e.pointerId);
      el.drop.classList.add('moving-art');
    });
    el.drop.addEventListener('pointermove', e => {
      if (!moving) return;
      const a = moving.d.art;
      a.dx = moving.dx + (e.clientX - moving.x) / moving.unit / moving.z.w;
      a.dy = moving.dy + (e.clientY - moving.y) / moving.unit / moving.z.h;
      // keep the stored offset inside the print area
      const b = Shirt.artBox(moving.d.place.id, a);
      a.dx = (b.x + b.w / 2 - (moving.z.x + moving.z.w / 2)) / moving.z.w;
      a.dy = (b.y + b.h / 2 - (moving.z.y + moving.z.h / 2)) / moving.z.h;
      moveArtElement(moving.side);
    });
    const stop = () => {
      if (!moving) return;
      moving = null;
      el.drop.classList.remove('moving-art');
      renderShirt(false);
      saveSoon();
    };
    el.drop.addEventListener('pointerup', stop);
    el.drop.addEventListener('pointercancel', stop);
  }

  // Move the picture without redrawing the whole shirt (smooth dragging)
  function moveArtElement(side) {
    const d = draft[side];
    const face = side === 'front' ? el.faceFront : el.faceBack;
    const img = face.querySelector('.user-art image');
    if (!d || !d.art || !img) return;
    const b = Shirt.artBox(d.place.id, d.art);
    img.setAttribute('x', b.x.toFixed(2)); img.setAttribute('y', b.y.toFixed(2));
    img.setAttribute('width', b.w.toFixed(2)); img.setAttribute('height', b.h.toFixed(2));
  }

  // One picture with the front and the back, to keep or send
  function downloadMockup() {
    const p = draftProduct();
    const color = draftColor();
    // A picture made from an SVG can only use embedded artwork, not blob: links
    const embed = d => {
      const x = decoDraw(d);
      if (x && x.art) x.art = Object.assign({}, x.art, { href: x.art.data || x.art.href });
      return x;
    };
    const opts = { shape: p.shape, color: color.hex, front: embed(draft.front), back: embed(draft.back), outline: true };
    const W = 1800, H = 1100;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#FDF3E7';
    ctx.fillRect(0, 0, W, H);
    const status = $('#art-status');
    const load = svg => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="800" height="840" '));
    });
    Promise.all([load(Shirt.draw(Object.assign({ side: 'front' }, opts))), load(Shirt.draw(Object.assign({ side: 'back' }, opts)))])
      .then(([f, b]) => {
        ctx.drawImage(f, 80, 140, 800, 840);
        ctx.drawImage(b, 920, 140, 800, 840);
        ctx.fillStyle = '#D8022A';
        ctx.font = '900 64px Archivo, sans-serif';
        ctx.fillText('jolly', 80, 100);
        ctx.fillStyle = '#1E1E1E';
        ctx.font = '700 32px Archivo, sans-serif';
        ctx.fillText(`${p.name} · ${color.name}`, 260, 96);
        ctx.font = '600 28px Archivo, sans-serif';
        ctx.fillText('Front: ' + decoText(draft.front || PLAIN), 80, 1040);
        ctx.fillText('Back: ' + decoText(draft.back || PLAIN), 920, 1040);
        cv.toBlob(blob => {
          if (!blob) { status.textContent = 'Your browser could not make the picture.'; return; }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `jolly-mockup-${p.id}-${color.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          status.textContent = 'Mockup saved to your downloads.';
        }, 'image/png');
      })
      .catch(() => { status.textContent = 'Your browser could not make the picture.'; });
  }

  // ---------------------------------------------------------------------------
  // Builder setup
  // ---------------------------------------------------------------------------
  function initBuilder() {
    el.back.addEventListener('click', () => goTo(stepIndex - 1));
    el.next.addEventListener('click', () => {
      if (STEPS[stepIndex].sheet) addToOrder();
      else goTo(stepIndex + 1, true);
    });
    el.showFront.addEventListener('click', () => { flipped = false; renderShirt(false); });
    el.showBack.addEventListener('click', () => { flipped = true; renderShirt(false); });
    initArtwork();
    el.clear.addEventListener('click', clearOrder);
    el.send.addEventListener('click', () => {
      if (piecesOf(draft)) addToOrder();
      if (!order.length) return;
      $('#f-message').value = orderSummary();
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(() => $('#f-name').focus({ preventScroll: true }), reduceMotion ? 0 : 600);
    });

    if (restore()) notice = 'Welcome back. Your order is still on the slip.';
    renderShirt(false);
    renderSlip();
    renderStepCard();
    renderOptions();
  }

  // Lets other sections jump into the builder with choices made
  function presetBuilder(changes, stepKey) {
    Object.assign(draft, changes);
    fitDraftToProduct();
    notice = '';
    renderShirt(true);
    renderSlip();
    goTo(STEPS.findIndex(s => s.key === stepKey));
    document.getElementById('build').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Price list (one tab per shirt)
  // ---------------------------------------------------------------------------
  function initPrices() {
    let prod = products[0];
    const tabs = $('#price-tabs');
    tabs.innerHTML = products.map(p => `<button type="button" role="tab" data-id="${p.id}">${esc(p.shortName || p.name)}</button>`).join('');

    const showMeasure = s => {
      $('#measure-size').textContent = s.size;
      $('#measure-text').textContent = `${s.width} in across the chest, ${s.length} in long. ${peso(s.white)} white, ${peso(s.colored)} coloured.`;
      const max = Math.max.apply(null, prod.sizes.map(x => x.width));
      const min = Math.min.apply(null, prod.sizes.map(x => x.width));
      const fit = 0.78 + 0.22 * (max === min ? 1 : (s.width - min) / (max - min));
      $('#measure-shirt').style.setProperty('--fit', fit.toFixed(3));
    };

    const draw = () => {
      tabs.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', t.dataset.id === prod.id ? 'true' : 'false'));
      $('#price-sub').textContent = `${prod.name}. ${prod.gsm} GSM, ${prod.fabric}. Retail price per piece.`;
      $('#price-groups').innerHTML =
        `<div class="pt-head" aria-hidden="true"><span>Size</span><span>Chest × length</span><span>White</span><span>Coloured</span></div>` +
        prod.sizes.map(s =>
          `<button type="button" class="price-row" data-size="${esc(s.size)}" aria-label="Size ${esc(s.size)}, ${s.width} by ${s.length} inches, ${peso(s.white)} white, ${peso(s.colored)} coloured. Build this shirt.">` +
          `<span class="pr-name">${esc(s.size)}</span><span class="pr-desc">${s.width} × ${s.length} in</span>` +
          `<span class="pr-val">${peso(s.white)}</span><span class="pr-val pr-col">${peso(s.colored)}</span></button>`
        ).join('');
      $('#measure-shirt').innerHTML = Shirt.measured('#F4F2EE', prod.shape);
      showMeasure(prod.sizes.find(s => s.size === 'M') || prod.sizes[0]);
      document.querySelectorAll('.price-row').forEach(btn => {
        const s = prod.sizes.find(x => x.size === btn.dataset.size);
        btn.addEventListener('mouseenter', () => showMeasure(s));
        btn.addEventListener('focus', () => showMeasure(s));
        btn.addEventListener('click', () => {
          showMeasure(s);
          presetBuilder({ product: prod }, 'color');
        });
      });
      $('#bulk').innerHTML =
        `<h3>Bulk discount</h3><ul>` +
        (prod.bulkDiscounts || []).map(t => `<li><span class="bk-off">${peso(t.off)}</span><span class="bk-txt">off each, ${tierText(t)}</span></li>`).join('') +
        `</ul>`;
      $('#terms').innerHTML = [
        ['Payment', C.paymentTerms],
        ['Prices', C.priceNote],
        ['Prices effective', prod.effectivityDate],
        ['Prints & embroidery', 'Custom printing available. Request a quote.'],
      ].filter(t => t[1]).map(t => `<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('');
    };



    tabs.querySelectorAll('[role=tab]').forEach(t => t.addEventListener('click', () => {
      prod = products.find(p => p.id === t.dataset.id); draw();
    }));
    draw();
  }

  // ---------------------------------------------------------------------------
  // Line-up (shirts and colours)
  // ---------------------------------------------------------------------------
  function initLineup() {
    let prod = products[0];
    let color = C.colors.find(c => c.name.toLowerCase().includes('red')) || C.colors[0];
    const tabs = $('#lineup-tabs');
    const draw = () => {
      const list = colorsFor(prod);
      if (!list.includes(color)) color = list[0];
      $('#plate-shirt').innerHTML = Shirt.draw({ shape: prod.shape, color: color.hex });
      $('#plate-shirt').parentElement.classList.toggle('plate-light', Shirt.isLight(color.hex));
      $('#lineup-name').textContent = `${prod.name} · ${prod.line} · ${prod.gsm} GSM`;
      $('#lineup-desc').textContent = `${prod.fabric.charAt(0).toUpperCase() + prod.fabric.slice(1)}. Sizes ${prod.sizes[0].size} to ${prod.sizes[prod.sizes.length - 1].size}, from ${peso(lowest(prod))} a piece.`;
      $('#lineup-features').innerHTML = prod.features.map(f => `<li>${esc(f)}</li>`).join('');
      $('#swatch-name').textContent = color.name;
      $('#lineup-spec').setAttribute('href', prod.photo);
      tabs.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', t.dataset.id === prod.id ? 'true' : 'false'));
      $('#swatches').innerHTML = list.map(c =>
        `<button type="button" role="radio" data-name="${esc(c.name)}" style="--sw:${c.hex}" aria-label="${esc(c.name)}" aria-checked="${c === color ? 'true' : 'false'}"></button>`
      ).join('');
      $('#swatches').querySelectorAll('[role=radio]').forEach(r => {
        r.addEventListener('click', () => { color = C.colors.find(c => c.name === r.dataset.name); draw(); });
        r.addEventListener('mouseenter', () => { $('#swatch-name').textContent = r.dataset.name; });
        r.addEventListener('mouseleave', () => { $('#swatch-name').textContent = color.name; });
      });
    };
    tabs.innerHTML = products.map(p => `<button type="button" role="tab" data-id="${p.id}">${esc(p.shortName || p.name)}</button>`).join('');
    tabs.querySelectorAll('[role=tab]').forEach(t => t.addEventListener('click', () => {
      prod = products.find(p => p.id === t.dataset.id); draw();
    }));
    $('#lineup-build').addEventListener('click', e => {
      e.preventDefault();
      presetBuilder({ product: prod, color: color }, 'front');
    });
    draw();
  }

  // ---------------------------------------------------------------------------
  // Prints & embroidery
  // ---------------------------------------------------------------------------
  function initPrints() {
    $('#prints-desc').textContent = C.customServices.description;
    const list = $('#methods');
    const show = m => {
      $('#fabric').innerHTML = Shirt.fabric(m.id, m.id === 'embroidery' ? '#18204F' : '#F4F2EE');
      list.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === m.id ? 'true' : 'false'));
    };
    list.innerHTML = methods.map(m =>
      `<li><button type="button" data-id="${m.id}" aria-pressed="false"><span class="m-name">${esc(m.name)}</span><span class="m-note">${esc(m.long !== m.name ? m.long + '. ' : '')}${esc(m.note)}</span></button></li>`
    ).join('');
    list.querySelectorAll('button').forEach(b => {
      const m = methods.find(x => x.id === b.dataset.id);
      b.addEventListener('mouseenter', () => show(m));
      b.addEventListener('focus', () => show(m));
      b.addEventListener('click', () => show(m));
    });
    if (methods.length) show(methods[0]);
  }

  // ---------------------------------------------------------------------------
  // Why Jolly, contact, footer
  // ---------------------------------------------------------------------------
  function initRest() {
    // Brand
    $('#hero-tagline').textContent = C.brand.tagline;
    $('#hero-description').textContent = C.brand.description;
    $('#brand-name').textContent = C.brand.name;
    if (isSet(C.brand.logo)) {
      const img = $('#logo-img');
      img.src = C.brand.logo; img.hidden = false;
    }

    // Why
    $('#why-title').textContent = C.about.title;
    $('#why-desc').textContent = C.about.description;
    $('#facts').innerHTML = C.about.highlights.map(h =>
      `<li><span class="fig">${h.figure || ''}</span><span class="fig-title">${h.title}</span><span class="fig-desc">${h.description}</span></li>`
    ).join('');

    // Contact details (placeholders are hidden)
    const k = C.contact;
    const rows = [];
    if (isSet(k.phone)) rows.push(`<li><span>Phone</span><a href="tel:${k.phone.replace(/[^\d+]/g, '')}">${k.phone}</a></li>`);
    if (isSet(k.email)) rows.push(`<li><span>Email</span><a href="mailto:${k.email}">${k.email}</a></li>`);
    if (isSet(k.address)) rows.push(`<li><span>Address</span>${k.address}</li>`);
    if (isSet(k.businessHours)) rows.push(`<li><span>Hours</span>${k.businessHours}</li>`);
    $('#contact-list').innerHTML = rows.join('');

    // Form
    const form = $('#contact-form');
    const status = $('#form-status');
    if (isSet(k.formspreeId)) form.action = 'https://formspree.io/f/' + k.formspreeId;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) { status.textContent = 'Please add your name, email and order.'; form.reportValidity(); return; }
      const data = new FormData(form);
      if (isSet(k.formspreeId)) {
        status.textContent = 'Sending…';
        try {
          const r = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          status.textContent = r.ok ? 'Sent. We will reply with a quote.' : 'That did not go through. Please try again.';
          if (r.ok) form.reset();
        } catch (err) { status.textContent = 'That did not go through. Please check your connection.'; }
      } else if (isSet(k.email)) {
        const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || ''}\n\n${data.get('message')}`;
        window.location.href = `mailto:${k.email}?subject=${encodeURIComponent('Jolly order inquiry')}&body=${encodeURIComponent(body)}`;
        status.textContent = 'Opening your email app…';
      } else {
        status.textContent = 'The inquiry form is not connected yet.';
      }
    });

    // Footer
    $('#year').textContent = new Date().getFullYear();
    $('#copyright').textContent = C.footer.copyrightText;
    if (C.footer.statement) $('#footer-statement').textContent = C.footer.statement;
    const social = $('#footer-social');
    const links = [];
    if (isSet(k.instagram)) links.push(`<a href="${k.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
    if (isSet(k.facebook)) links.push(`<a href="${k.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>`);
    if (isSet(k.email)) links.push(`<a href="mailto:${k.email}">${k.email}</a>`);
    social.innerHTML = links.length
      ? `<p>Follow Jolly</p><div class="social-links">${links.join('')}</div>`
      : `<p>Orders by inquiry</p><a class="t-mail" href="#contact">Send us your order</a>`;

    const clock = $('#clock');
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 30000);
  }

  // ---------------------------------------------------------------------------
  // Entrances as sections scroll in
  // ---------------------------------------------------------------------------
  function initReveal() {
    const targets = document.querySelectorAll('main > section:not(.builder) h2, main > section:not(.builder) p, .price-group, .terms, .measure, .lineup-plate, .tabs, .swatches, .cells, .swatch-big, .methods li, .prints-photo, .why-photo, .facts li, .coupon, .bulk');
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(t => {
      const sibs = Array.from(t.parentElement.children);
      t.style.setProperty('--d', (sibs.indexOf(t) % 6) * 70 + 'ms');
      t.classList.add('rv');
      io.observe(t);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRest();
    initBuilder();
    initPrices();
    initLineup();
    initPrints();
    initReveal();
  });
})();
