/**
 * ============================================================================
 * JOLLY WEBSITE - MAIN JAVASCRIPT
 * ============================================================================
 * Reads everything from content.js and builds the page:
 *   1. The order builder (turning table, shirt, order slip)
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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------------
  // Data, tidied up for the builder
  // ---------------------------------------------------------------------------
  const products = C.products.map(p => Object.assign({}, p, {
    orderable: p.isActive && p.sizes && p.sizes.length > 0,
  }));
  const firstOrderable = products.find(p => p.orderable) || products[0];

  // Turn the service names into drawing styles
  function methodId(name) {
    const n = name.toLowerCase();
    if (n.includes('embroid')) return 'embroidery';
    if (n.includes('digital')) return 'digital';
    if (n.includes('heat')) return 'heat';
    if (n.includes('sublim')) return 'sublimation';
    return 'screen';
  }
  const methods = [{ id: 'none', name: 'Plain', note: 'No print, just the shirt' }].concat(
    C.customServices.services.map(s => ({ id: methodId(s.name), name: s.name, note: s.note || '' }))
  );

  // ---------------------------------------------------------------------------
  // Builder state
  // ---------------------------------------------------------------------------
  const state = {
    product: null,   // product object
    color: null,     // colour object
    size: null,      // size object
    method: null,    // method object
    placement: null, // placement object
    qty: null,       // number
  };
  let stepIndex = 0;
  let flipped = false;

  const STEPS = [
    {
      key: 'product',
      label: 'Shirt',
      question: 'Pick your shirt',
      hint: 'Drag it onto the shirt in the middle, or tap it.',
      items: () => products.map(p => ({
        value: p,
        disabled: !p.orderable,
        plate: Shirt.draw({ shape: p.shape, color: ['#D32F2F', '#1F2A4A', '#F6C343'][products.indexOf(p) % 3] }),
        name: p.shortName || p.name,
        price: p.orderable ? 'from ' + peso(Math.min.apply(null, p.sizes.map(s => s.price))) : 'Soon',
      })),
    },
    {
      key: 'color',
      label: 'Colour',
      question: 'Pick a colour',
      hint: 'Turn the table for more colours.',
      items: () => C.colors.map(c => ({
        value: c,
        plate: Shirt.draw({ shape: (state.product || firstOrderable).shape, color: c.hex }),
        name: c.name,
        price: '',
      })),
    },
    {
      key: 'size',
      label: 'Size',
      question: 'Pick a size',
      hint: 'Kids 4 to adult 2XL. Prices are per piece.',
      items: () => (state.product || firstOrderable).sizes.map(s => ({
        value: s,
        plate: `<span class="plate-size">${s.size}</span><span class="plate-dim">${s.width}×${s.length}″</span>`,
        name: /^\d+$/.test(s.size) ? 'Kids ' + s.size : 'Size ' + s.size,
        price: peso(s.price),
      })),
    },
    {
      key: 'method',
      label: 'Print',
      question: 'Plain or printed?',
      hint: 'Prints and embroidery are quoted per design.',
      items: () => methods.map(m => ({
        value: m,
        plate: Shirt.fabric(m.id === 'none' ? '' : m.id, (state.color || C.colors[0]).hex),
        name: m.name,
        price: m.id === 'none' ? 'Included' : 'Quote',
      })),
    },
    {
      key: 'placement',
      label: 'Placement',
      question: 'Where does it go?',
      hint: 'Pick where the print or stitching sits.',
      skip: () => !state.method || state.method.id === 'none' || state.method.id === 'sublimation',
      items: () => C.customServices.placements.map(p => ({
        value: p,
        plate: Shirt.draw({
          shape: (state.product || firstOrderable).shape,
          color: '#A7A9AC',
          side: p.id === 'back' ? 'back' : 'front',
          highlight: p.id,
        }),
        name: p.name,
        price: '',
      })),
    },
    {
      key: 'qty',
      label: 'Quantity',
      question: 'How many pieces?',
      hint: () => 'The minimum order is ' + pcs((state.product || firstOrderable).minimumOrder) + ' pieces.',
      items: () => C.quantities.map(q => ({
        value: q,
        plate: `<span class="plate-qty">${q >= 1000000 ? (q / 1000000) + 'M' : (q / 1000) + 'K'}</span><span class="plate-dim">pieces</span>`,
        name: pcs(q) + ' pcs',
        price: state.size ? peso(q * state.size.price) : '',
      })),
    },
  ];

  // ---------------------------------------------------------------------------
  // Elements
  // ---------------------------------------------------------------------------
  const el = {
    disc: $('#disc'),
    discWrap: $('#disc-wrap'),
    dots: $('#dots'),
    question: $('#step-question'),
    hint: $('#step-hint'),
    back: $('#step-back'),
    next: $('#step-next'),
    drop: $('#shirt-drop'),
    flipper: $('#flipper'),
    faceFront: $('#face-front'),
    faceBack: $('#face-back'),
    flipBtn: $('#flip-btn'),
    stamp: $('#stamp'),
    stageNote: $('#stage-note'),
    lines: $('#slip-lines'),
    sumEach: $('#sum-each'),
    sumPrint: $('#sum-print'),
    sumTotal: $('#sum-total'),
    sumDown: $('#sum-down'),
    fine: $('#slip-fine'),
    barcode: $('#barcode'),
    send: $('#send-order'),
    ghost: $('#ghost'),
  };

  // ---------------------------------------------------------------------------
  // The turning table
  // ---------------------------------------------------------------------------
  const SPACING = 24;   // degrees between plates
  const LO = -60;       // the top of the visible arc (degrees)
  const HI = 6;         // the bottom of the visible arc, just above the step card
  let rot = 0;
  let items = [];

  function isMobile() { return window.matchMedia('(max-width: 900px)').matches; }

  // Plate i sits at angle (i × SPACING + rot). Keep the turn between
  // "first plate at the top of the arc" and "last plate at the bottom".
  function rotLimits() {
    const span = (items.length - 1) * SPACING;
    if (span <= HI - LO) { const r = (LO + HI) / 2 - span / 2; return { min: r, max: r }; } // all fit
    return { min: HI - span, max: LO };
  }
  function clampRot(r) {
    const l = rotLimits();
    return Math.max(l.min, Math.min(l.max, r));
  }

  function setRot(r) {
    rot = clampRot(r);
    el.disc.style.setProperty('--rot', rot + 'deg');
    el.disc.querySelectorAll('.dish').forEach((d, i) => {
      const a = i * SPACING + rot;
      const off = a < LO - 2 || a > HI + 2;
      d.classList.toggle('off', off && !isMobile());
      d.tabIndex = off && !isMobile() ? -1 : 0;
    });
    const l = rotLimits();
    $('#spin-up').disabled = rot >= l.max - 0.5;
    $('#spin-down').disabled = rot <= l.min + 0.5;
  }

  function currentValue(key) { return state[key]; }

  function renderDisc(animate) {
    const step = STEPS[stepIndex];
    items = step.items();
    const build = () => {
      el.disc.innerHTML = '';
      items.forEach((it, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dish';
        b.setAttribute('role', 'option');
        b.style.setProperty('--a', i * SPACING + 'deg');
        b.style.setProperty('--i', i);
        const selected = currentValue(step.key) === it.value;
        b.setAttribute('aria-selected', selected ? 'true' : 'false');
        if (it.disabled) { b.disabled = true; b.classList.add('soon'); }
        b.innerHTML =
          `<span class="dish-in"><span class="plate">${it.plate}</span>` +
          `<span class="tag"><span class="tag-name">${it.name}</span>${it.price ? `<span class="tag-price">${it.price}</span>` : ''}</span></span>`;
        b.addEventListener('click', e => onDishClick(e, b, it));
        b.addEventListener('pointerdown', e => onDishPointerDown(e, b, it));
        el.disc.appendChild(b);
      });
      // Start with the selected plate (or the first) in view
      const sel = items.findIndex(it => currentValue(step.key) === it.value);
      setRot(sel > -1 ? (LO + HI) / 2 - sel * SPACING : LO);
    };

    if (animate && !reduceMotion) {
      el.discWrap.classList.add('turning');
      setTimeout(() => {
        build();
        el.discWrap.classList.remove('turning');
        el.discWrap.classList.add('arriving');
        void el.discWrap.offsetWidth;
        el.discWrap.classList.remove('arriving');
      }, 260);
    } else {
      build();
    }
  }

  function renderStepCard() {
    const step = STEPS[stepIndex];
    el.question.textContent = step.question;
    el.hint.textContent = typeof step.hint === 'function' ? step.hint() : step.hint;
    el.dots.innerHTML = '';
    STEPS.forEach((s, i) => {
      const li = document.createElement('li');
      const skipped = s.skip && s.skip();
      li.className = (i === stepIndex ? 'now ' : '') + (state[s.key] != null ? 'done ' : '') + (skipped ? 'skipped' : '');
      li.innerHTML = `<button type="button" aria-label="${s.label}${state[s.key] != null ? ', chosen' : ''}"${i === stepIndex ? ' aria-current="step"' : ''}></button>`;
      li.firstChild.addEventListener('click', () => goTo(i));
      el.dots.appendChild(li);
    });
    el.back.disabled = prevIndex(stepIndex) === -1;
    const last = nextIndex(stepIndex) === -1;
    el.next.textContent = last ? 'Review slip' : 'Next';
  }

  function nextIndex(i) {
    for (let j = i + 1; j < STEPS.length; j++) if (!(STEPS[j].skip && STEPS[j].skip())) return j;
    return -1;
  }
  function prevIndex(i) {
    for (let j = i - 1; j >= 0; j--) if (!(STEPS[j].skip && STEPS[j].skip())) return j;
    return -1;
  }

  function goTo(i) {
    if (i < 0 || i >= STEPS.length) return;
    if (STEPS[i].skip && STEPS[i].skip()) i = nextIndex(i) === -1 ? prevIndex(i) : nextIndex(i);
    const changed = i !== stepIndex;
    stepIndex = i;
    renderStepCard();
    renderDisc(changed);
  }

  // ---------------------------------------------------------------------------
  // Choosing: tap or drag a plate onto the shirt
  // ---------------------------------------------------------------------------
  let drag = null;
  let suppressClick = false;

  function onDishClick(e, btn, it) {
    if (suppressClick) { suppressClick = false; return; }
    if (it.disabled) return;
    flyFrom(btn.querySelector('.plate'), () => choose(it.value));
  }

  function onDishPointerDown(e, btn, it) {
    if (it.disabled || e.button !== 0) return;
    if (e.pointerType === 'touch') return; // phones: tap only, so the strip can scroll
    drag = { btn, it, x: e.clientX, y: e.clientY, active: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active && Math.hypot(dx, dy) > 6) {
      drag.active = true;
      const plate = drag.btn.querySelector('.plate');
      const r = plate.getBoundingClientRect();
      el.ghost.innerHTML = plate.innerHTML;
      el.ghost.style.width = r.width + 'px';
      el.ghost.style.height = r.height + 'px';
      el.ghost.classList.add('on', 'held');
      drag.btn.classList.add('lifted');
      document.body.classList.add('dragging');
    }
    if (drag.active) {
      el.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) rotate(-6deg)`;
      el.drop.classList.toggle('hot', overDrop(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e) {
    window.removeEventListener('pointermove', onPointerMove);
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.active) return; // a plain click: the click handler does the work
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 50);
    document.body.classList.remove('dragging');
    d.btn.classList.remove('lifted');
    el.ghost.classList.remove('held');
    if (overDrop(e.clientX, e.clientY)) {
      el.drop.classList.remove('hot');
      landGhost(() => choose(d.it.value));
    } else {
      // Put it back on the table
      const r = d.btn.querySelector('.plate').getBoundingClientRect();
      el.ghost.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1), opacity .3s';
      el.ghost.style.transform = `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px) translate(-50%, -50%)`;
      setTimeout(resetGhost, 300);
    }
  }

  function overDrop(x, y) {
    const r = el.drop.getBoundingClientRect();
    return x > r.left && x < r.right && y > r.top && y < r.bottom;
  }

  function resetGhost() {
    el.ghost.classList.remove('on', 'held');
    el.ghost.style.transition = '';
    el.ghost.style.transform = '';
    el.ghost.style.opacity = '';
    el.ghost.innerHTML = '';
  }

  function dropCenter() {
    const r = el.drop.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
  }

  function landGhost(done) {
    if (reduceMotion) { resetGhost(); done(); return; }
    const c = dropCenter();
    el.ghost.style.transition = 'transform .38s cubic-bezier(.5,0,.3,1), opacity .38s';
    el.ghost.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%) scale(.35)`;
    el.ghost.style.opacity = '0';
    setTimeout(() => { resetGhost(); done(); }, 380);
  }

  function flyFrom(plate, done) {
    if (reduceMotion || !plate || isMobile() || document.hidden) { done(); return; }
    const r = plate.getBoundingClientRect();
    el.ghost.innerHTML = plate.innerHTML;
    el.ghost.style.width = r.width + 'px';
    el.ghost.style.height = r.height + 'px';
    el.ghost.style.transition = 'none';
    el.ghost.style.transform = `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px) translate(-50%, -50%)`;
    el.ghost.classList.add('on');
    void el.ghost.offsetWidth; // let the browser place the ghost before it flies
    landGhost(done);
  }

  function choose(value) {
    const step = STEPS[stepIndex];
    state[step.key] = value;

    // Changing the shirt can make a chosen size disappear
    if (step.key === 'product' && state.size && !value.sizes.includes(state.size)) state.size = null;
    // Plain or all-over prints do not need a placement
    if (step.key === 'method' && (value.id === 'none' || value.id === 'sublimation')) state.placement = null;
    if (step.key === 'method' && value.id !== 'none' && value.id !== 'sublimation' && !state.placement) {
      state.placement = C.customServices.placements[0];
    }
    if (step.key === 'placement') flipped = value.id === 'back';

    renderShirt(true);
    renderSlip(step.key);
    el.disc.querySelectorAll('.dish').forEach((d, i) => d.setAttribute('aria-selected', items[i].value === value ? 'true' : 'false'));

    const n = nextIndex(stepIndex);
    renderStepCard();
    if (n !== -1) {
      setTimeout(() => goTo(n), reduceMotion ? 0 : 420);
    } else {
      el.send.classList.remove('ready');
      void el.send.offsetWidth;
      el.send.classList.add('ready');
    }
  }

  // ---------------------------------------------------------------------------
  // The shirt in the middle
  // ---------------------------------------------------------------------------
  function renderShirt(pop) {
    const p = state.product || firstOrderable;
    const color = (state.color || C.colors[0]).hex;
    const opts = {
      shape: p.shape,
      color,
      method: state.method ? (state.method.id === 'none' ? '' : state.method.id) : '',
      placement: state.placement ? state.placement.id : (state.method && state.method.id === 'sublimation' ? 'front' : ''),
      size: state.size ? state.size.size : '',
    };
    el.faceFront.innerHTML = Shirt.draw(Object.assign({ side: 'front' }, opts));
    el.faceBack.innerHTML = Shirt.draw(Object.assign({ side: 'back' }, opts));

    // Pick the backdrop colour that stands out most from the shirt
    const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
    const backdrops = ['#2952A3', '#F6C343', '#D32F2F'];
    const stageColor = backdrops.find(b => dist(b, color) > 200) || '#F6C343';
    el.drop.parentElement.style.setProperty('--stage', stageColor);
    el.drop.parentElement.classList.toggle('on-dark', stageColor !== '#F6C343');

    // Bigger sizes draw a bigger shirt
    const w = state.size ? state.size.width : 40;
    const fit = 0.74 + 0.26 * Math.min(1, Math.max(0, (w - 24) / 24));
    el.drop.style.setProperty('--fit', fit.toFixed(3));

    el.flipper.classList.toggle('flipped', flipped);
    el.flipBtn.textContent = flipped ? 'See the front' : 'See the back';
    el.flipBtn.setAttribute('aria-pressed', flipped ? 'true' : 'false');

    const bits = [p.shortName || p.name];
    if (state.color) bits.push(state.color.name);
    if (state.size) bits.push(/^\d+$/.test(state.size.size) ? 'Kids ' + state.size.size : 'Size ' + state.size.size);
    el.stageNote.textContent = bits.join(' · ');

    if (state.qty) {
      el.stamp.textContent = '× ' + pcs(state.qty);
      el.stamp.classList.add('on');
    } else {
      el.stamp.classList.remove('on');
    }

    if (pop && !reduceMotion) {
      el.drop.classList.remove('pop');
      void el.drop.offsetWidth;
      el.drop.classList.add('pop');
    }
  }

  // ---------------------------------------------------------------------------
  // The order slip
  // ---------------------------------------------------------------------------
  function renderSlip(justSet) {
    const p = state.product;
    const rows = [
      ['product', 'Shirt', p ? (p.shortName || p.name) : null],
      ['color', 'Colour', state.color ? state.color.name : null],
      ['size', 'Size', state.size ? `${state.size.size} · ${state.size.width}×${state.size.length} in` : null],
      ['method', 'Print', state.method ? state.method.name : null],
      ['placement', 'Placement',
        state.method && state.method.id === 'none' ? 'None'
          : state.method && state.method.id === 'sublimation' ? 'All over'
          : state.placement ? state.placement.name : null],
      ['qty', 'Quantity', state.qty ? pcs(state.qty) + ' pcs' : null],
    ];
    el.lines.innerHTML = rows.map(([k, label, val]) =>
      `<div class="line${val ? ' filled' : ''}${k === justSet ? ' just' : ''}">` +
      `<dt><button type="button" data-step="${k}">${label}</button></dt><dd>${val || '—'}</dd></div>`
    ).join('');
    el.lines.querySelectorAll('button[data-step]').forEach(b => {
      b.addEventListener('click', () => goTo(STEPS.findIndex(s => s.key === b.dataset.step)));
    });

    const each = state.size ? state.size.price : null;
    el.sumEach.textContent = each ? peso(each) : '—';
    el.sumPrint.textContent = !state.method ? '—' : state.method.id === 'none' ? 'None' : 'Quoted';
    const total = each && state.qty ? each * state.qty : 0;
    el.sumTotal.textContent = peso(total);
    el.sumDown.textContent = total ? peso(total * 0.3) : '—';

    const prod = p || firstOrderable;
    let fine = prod.effectivityDate ? `Shirt prices as of ${prod.effectivityDate}. ` : '';
    fine += prod.paymentTerms || '';
    if (state.method && state.method.id !== 'none') fine += ' Print and embroidery are quoted separately.';
    el.fine.textContent = fine;

    drawBarcode([rows.map(r => r[2]).join('|')].join(''));
  }

  function drawBarcode(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    let x = 0, bars = '';
    while (x < 200) {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const w = 1 + (Math.abs(h) % 4);
      const gap = 1 + (Math.abs(h >> 4) % 3);
      if (x + w > 200) break;
      bars += `<rect x="${x}" y="0" width="${w}" height="40"/>`;
      x += w + gap;
    }
    el.barcode.innerHTML = bars;
  }

  function orderSummary() {
    const lines = [];
    const p = state.product || firstOrderable;
    lines.push('Order from the website builder:');
    lines.push('Shirt: ' + p.name);
    if (state.color) lines.push('Colour: ' + state.color.name);
    if (state.size) lines.push(`Size: ${state.size.size} (${state.size.width} x ${state.size.length} in) at ${peso(state.size.price)} per piece`);
    if (state.method) lines.push('Print: ' + state.method.name);
    if (state.placement && state.method && state.method.id !== 'none') lines.push('Placement: ' + state.placement.name);
    if (state.qty) lines.push('Quantity: ' + pcs(state.qty) + ' pcs');
    if (state.size && state.qty) lines.push('Estimated shirt total: ' + peso(state.size.price * state.qty));
    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Builder setup
  // ---------------------------------------------------------------------------
  function initBuilder() {
    el.back.addEventListener('click', () => goTo(prevIndex(stepIndex)));
    el.next.addEventListener('click', () => {
      const n = nextIndex(stepIndex);
      if (n === -1) { el.send.focus(); el.send.classList.add('ready'); }
      else goTo(n);
    });
    $('#spin-up').addEventListener('click', () => setRot(rot + SPACING));
    $('#spin-down').addEventListener('click', () => setRot(rot - SPACING));
    el.discWrap.addEventListener('wheel', e => {
      if (isMobile()) return;
      const l = rotLimits();
      if (l.min === l.max) return;
      e.preventDefault();
      setRot(rot - Math.sign(e.deltaY) * SPACING * 0.5);
    }, { passive: false });

    el.flipBtn.addEventListener('click', () => { flipped = !flipped; renderShirt(false); });
    el.send.addEventListener('click', () => {
      const msg = $('#f-message');
      msg.value = orderSummary();
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(() => $('#f-name').focus({ preventScroll: true }), reduceMotion ? 0 : 600);
    });
    window.addEventListener('resize', () => setRot(rot));

    renderShirt(false);
    renderSlip();
    renderStepCard();
    renderDisc(false);
  }

  // Lets other sections jump into the builder with choices made
  function presetBuilder(changes, step) {
    Object.assign(state, changes);
    renderShirt(true);
    renderSlip();
    goTo(STEPS.findIndex(s => s.key === step));
    document.getElementById('build').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Price list
  // ---------------------------------------------------------------------------
  function initPrices() {
    const p = firstOrderable;
    $('#price-sub').textContent = `${p.name}. Price per piece.`;
    const kids = p.sizes.filter(s => /^\d+$/.test(s.size));
    const adults = p.sizes.filter(s => !/^\d+$/.test(s.size));
    const groups = [];
    if (kids.length) groups.push(['Kids', kids]);
    if (adults.length) groups.push(['Adults', adults]);

    $('#price-groups').innerHTML = groups.map(([name, list]) =>
      `<div class="price-group"><h3>${name}</h3><ul>` +
      list.map(s =>
        `<li><button type="button" class="price-row" data-size="${s.size}">` +
        `<span class="pr-name">${name === 'Kids' ? 'Size ' : ''}${s.size}</span><span class="pr-lead" aria-hidden="true"></span>` +
        `<span class="pr-val">${peso(s.price)}</span>` +
        `<span class="pr-desc">${s.width} in wide, ${s.length} in long</span></button></li>`
      ).join('') + `</ul></div>`
    ).join('');

    const terms = [
      ['Minimum order', pcs(p.minimumOrder) + ' pieces'],
      ['Payment', p.paymentTerms],
      ['Prices effective', p.effectivityDate],
    ].filter(t => t[1]);
    $('#terms').innerHTML = terms.map(t => `<div><dt>${t[0]}</dt><dd>${t[1]}</dd></div>`).join('');

    const showMeasure = s => {
      $('#measure-size').textContent = s.size;
      $('#measure-text').textContent = `${s.width} in across the chest, ${s.length} in long. ${peso(s.price)} a piece.`;
      const fit = 0.7 + 0.3 * Math.min(1, Math.max(0, (s.width - 24) / 24));
      $('#measure-shirt').style.setProperty('--fit', fit.toFixed(3));
    };
    $('#measure-shirt').innerHTML = Shirt.measured('#F7F5F0');
    showMeasure(p.sizes.find(s => s.size === 'M') || p.sizes[0]);

    document.querySelectorAll('.price-row').forEach(btn => {
      const s = p.sizes.find(x => x.size === btn.dataset.size);
      btn.addEventListener('mouseenter', () => showMeasure(s));
      btn.addEventListener('focus', () => showMeasure(s));
      btn.addEventListener('click', () => {
        showMeasure(s);
        presetBuilder({ product: p, size: s }, 'method');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Line-up (shirts and colours)
  // ---------------------------------------------------------------------------
  function initLineup() {
    let prod = firstOrderable;
    let color = C.colors.find(c => c.name.toLowerCase().includes('red')) || C.colors[0];
    const tabs = $('#lineup-tabs');
    const draw = () => {
      $('#plate-shirt').innerHTML = Shirt.draw({ shape: prod.shape, color: color.hex });
      $('#plate-shirt').parentElement.style.setProperty('--plate', color.hex);
      $('#plate-shirt').parentElement.classList.toggle('plate-light', Shirt.isLight(color.hex));
      $('#lineup-name').textContent = prod.name;
      $('#lineup-desc').textContent = prod.orderable
        ? prod.description + ' Sizes ' + prod.sizes[0].size + ' to ' + prod.sizes[prod.sizes.length - 1].size +
          ', from ' + peso(Math.min.apply(null, prod.sizes.map(s => s.price))) + ' a piece.'
        : 'Coming soon. Ask us about it when you send your inquiry.';
      $('#swatch-name').textContent = color.name;
      $('#lineup-build').textContent = prod.orderable ? 'Build this shirt' : 'Ask about it';
      $('#lineup-build').setAttribute('href', prod.orderable ? '#build' : '#contact');
      tabs.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', t.dataset.id === prod.id ? 'true' : 'false'));
      $('#swatches').querySelectorAll('[role=radio]').forEach(r => r.setAttribute('aria-checked', r.dataset.name === color.name ? 'true' : 'false'));
    };
    tabs.innerHTML = products.map(p =>
      `<button type="button" role="tab" data-id="${p.id}">${p.shortName || p.name}${p.orderable ? '' : ' <span class="soon-mark">soon</span>'}</button>`
    ).join('');
    tabs.querySelectorAll('[role=tab]').forEach(t => t.addEventListener('click', () => {
      prod = products.find(p => p.id === t.dataset.id); draw();
    }));
    $('#swatches').innerHTML = C.colors.map(c =>
      `<button type="button" role="radio" data-name="${c.name}" style="--sw:${c.hex}" aria-label="${c.name}"></button>`
    ).join('');
    $('#swatches').querySelectorAll('[role=radio]').forEach(r => {
      r.addEventListener('click', () => { color = C.colors.find(c => c.name === r.dataset.name); draw(); });
      r.addEventListener('mouseenter', () => { $('#swatch-name').textContent = r.dataset.name; });
      r.addEventListener('mouseleave', () => { $('#swatch-name').textContent = color.name; });
    });
    $('#lineup-build').addEventListener('click', e => {
      if (!prod.orderable) return;
      e.preventDefault();
      presetBuilder({ product: prod, color: color }, 'size');
    });
    draw();
  }

  // ---------------------------------------------------------------------------
  // Prints & embroidery
  // ---------------------------------------------------------------------------
  function initPrints() {
    $('#prints-desc').textContent = C.customServices.description;
    const list = $('#methods');
    const fabricColor = '#F7F5F0';
    const show = m => {
      $('#fabric').innerHTML = Shirt.fabric(m.id, m.id === 'embroidery' ? '#1F2A4A' : fabricColor);
      list.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === m.id ? 'true' : 'false'));
    };
    const real = methods.filter(m => m.id !== 'none');
    list.innerHTML = real.map(m =>
      `<li><button type="button" data-id="${m.id}" aria-pressed="false"><span class="m-name">${m.name}</span><span class="m-note">${m.note}</span></button></li>`
    ).join('');
    list.querySelectorAll('button').forEach(b => {
      const m = real.find(x => x.id === b.dataset.id);
      b.addEventListener('mouseenter', () => show(m));
      b.addEventListener('focus', () => show(m));
      b.addEventListener('click', () => show(m));
    });
    if (real.length) show(real[0]);
  }

  // ---------------------------------------------------------------------------
  // Why Jolly, contact, footer
  // ---------------------------------------------------------------------------
  function initRest() {
    // Brand
    $('#hero-tagline').textContent = C.brand.tagline;
    $('#hero-description').textContent = C.brand.description;
    if (isSet(C.brand.logo)) {
      const img = $('#logo-img');
      img.src = C.brand.logo; img.alt = C.brand.name; img.hidden = false;
      $('#brand-name').hidden = true;
    } else {
      $('#brand-name').textContent = C.brand.name;
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
    const targets = document.querySelectorAll('main > section:not(.builder) h2, main > section:not(.builder) p, .price-group, .terms, .measure, .lineup-plate, .tabs, .swatches, .cells, .swatch-big, .methods li, .prints-photo, .why-photo, .facts li, .coupon');
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
