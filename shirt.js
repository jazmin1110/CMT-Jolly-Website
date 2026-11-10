/**
 * ============================================================================
 * JOLLY WEBSITE - SHIRT DRAWINGS
 * ============================================================================
 * Draws the shirts (and the print samples on them) as SVG, so any colour
 * from content.js works without needing a photo for every colour.
 * When real product photos exist, they can replace these drawings.
 * You should not need to edit this file.
 * ============================================================================
 */

const Shirt = (function () {
  let uid = 0;

  // ---- colour helpers ------------------------------------------------------
  function luminance(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function isLight(hex) { return luminance(hex) > 0.28; }
  function inkFor(hex) { return isLight(hex) ? '#1E1E1E' : '#F7F5F0'; }
  function threadFor(hex) {
    if (!isLight(hex)) return '#F6C343';
    return luminance(hex) > 0.6 && hex.toUpperCase() !== '#D32F2F' ? '#D32F2F' : '#1E1E1E';
  }

  // ---- the shirt outlines (viewBox 0 0 400 420) ----------------------------
  const BODY =
    'M165 28 C 180 48, 220 48, 235 28 L 272 40 L 372 104 L 338 166 L 300 142 ' +
    'L 302 404 Q 200 414 98 404 L 100 142 L 62 166 L 28 104 L 128 40 Z';

  // Where each print placement sits on the shirt
  const ZONES = {
    chest: { x: 222, y: 92, w: 58, h: 46 },
    front: { x: 128, y: 104, w: 144, h: 136 },
    back:  { x: 122, y: 88,  w: 156, h: 150 },
  };

  // ---- print artwork, drawn inside a box -----------------------------------
  function art(method, box, shirtHex) {
    const { x, y, w, h } = box;
    const ink = inkFor(shirtHex);
    const cx = x + w / 2;
    const id = 'a' + (++uid);

    if (method === 'screen') {
      return (
        `<g class="art">` +
        `<circle cx="${cx}" cy="${y + h * 0.26}" r="${w * 0.17}" fill="#D32F2F"/>` +
        `<text x="${cx}" y="${y + h * 0.72}" text-anchor="middle" font-family="Archivo, sans-serif" ` +
        `font-weight="900" font-stretch="75%" font-size="${w * 0.3}" fill="${ink}" textLength="${w * 0.92}" lengthAdjust="spacingAndGlyphs">YOUR LOGO</text>` +
        `<rect x="${x + w * 0.04}" y="${y + h * 0.8}" width="${w * 0.92}" height="${h * 0.06}" fill="${ink}"/>` +
        `</g>`
      );
    }
    if (method === 'digital') {
      return (
        `<g class="art"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.06}"/></clipPath>` +
        `<g clip-path="url(#${id})">` +
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8EC5E8"/>` +
        `<circle cx="${x + w * 0.7}" cy="${y + h * 0.32}" r="${w * 0.16}" fill="#F6C343"/>` +
        `<path d="M${x} ${y + h * 0.78} L${x + w * 0.32} ${y + h * 0.42} L${x + w * 0.58} ${y + h * 0.72} L${x + w * 0.78} ${y + h * 0.5} L${x + w} ${y + h * 0.74} V${y + h} H${x} Z" fill="#2F5D3A"/>` +
        `<path d="M${x} ${y + h * 0.86} Q${x + w * 0.5} ${y + h * 0.74} ${x + w} ${y + h * 0.88} V${y + h} H${x} Z" fill="#2952A3"/>` +
        `</g></g>`
      );
    }
    if (method === 'embroidery') {
      const t = threadFor(shirtHex);
      const r = Math.min(w, h) * 0.46;
      return (
        `<g class="art" fill="none" stroke="${t}" stroke-linecap="round">` +
        `<circle cx="${cx}" cy="${y + h / 2}" r="${r}" stroke-width="${w * 0.035}" stroke-dasharray="${w * 0.03} ${w * 0.018}"/>` +
        `<circle cx="${cx}" cy="${y + h / 2}" r="${r * 0.82}" stroke-width="${w * 0.012}" stroke-dasharray="${w * 0.02} ${w * 0.014}"/>` +
        `<text x="${cx}" y="${y + h / 2 + w * 0.08}" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" ` +
        `font-stretch="80%" font-size="${w * 0.22}" fill="${t}" stroke="none" textLength="${r * 1.4}" lengthAdjust="spacingAndGlyphs">LOGO</text>` +
        `</g>`
      );
    }
    if (method === 'heat') {
      return (
        `<g class="art" font-family="Archivo, sans-serif" text-anchor="middle">` +
        `<text x="${cx}" y="${y + h * 0.24}" font-weight="800" font-stretch="100%" font-size="${w * 0.15}" fill="${ink}" letter-spacing="${w * 0.02}">JOLLY</text>` +
        `<text x="${cx}" y="${y + h * 0.92}" font-weight="900" font-stretch="70%" font-size="${h * 0.72}" fill="#D32F2F" stroke="${ink}" stroke-width="${w * 0.02}">23</text>` +
        `</g>`
      );
    }
    return '';
  }

  // Sublimation covers the whole shirt in an all-over pattern
  function allOver(clipId) {
    let stripes = '';
    const colors = ['#D32F2F', '#F6C343', '#2952A3', '#F7F5F0'];
    for (let i = -10; i < 20; i++) {
      stripes += `<rect x="${i * 34}" y="-200" width="17" height="900" fill="${colors[(i + 20) % 4]}" transform="rotate(32 200 210)"/>`;
    }
    return `<g clip-path="url(#${clipId})" opacity="0.9">${stripes}</g>`;
  }

  // ---- the shirt itself ----------------------------------------------------
  /**
   * opts: {
   *   shape: "tee" | "vneck" | "polo",
   *   color: "#hex",
   *   side: "front" | "back",
   *   method: "" | "screen" | "digital" | "embroidery" | "heat" | "sublimation",
   *   placement: "" | "chest" | "front" | "back" | "both",
   *   size: "M"          (shown on the neck tag)
   *   highlight: "chest" (draws a placement zone instead of artwork)
   * }
   */
  function draw(opts) {
    const o = Object.assign({ shape: 'tee', color: '#F7F5F0', side: 'front', method: '', placement: '', size: '' }, opts);
    const id = 's' + (++uid);
    const c = o.color;
    const dark = isLight(c) ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.35)';
    const soft = isLight(c) ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.18)';
    const stitch = isLight(c) ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)';
    const front = o.side === 'front';

    let s = `<svg viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.side} of the shirt">`;
    s += `<defs><clipPath id="${id}"><path d="${BODY}"/></clipPath></defs>`;

    // body
    s += `<path d="${BODY}" fill="${c}"/>`;

    // all-over sublimation sits under the seams
    if (o.method === 'sublimation') s += allOver(id);

    // folds and shading
    s += `<g clip-path="url(#${id})">` +
      `<path d="M100 142 Q 120 260 108 404 L 98 404 Z" fill="${soft}"/>` +
      `<path d="M300 142 Q 282 260 292 404 L 302 404 Z" fill="${soft}"/>` +
      `<path d="M150 300 Q 200 286 252 304 Q 200 296 150 300 Z" fill="${soft}"/>` +
      `</g>`;

    // armhole seams and hem stitching
    s += `<g fill="none" stroke="${dark}" stroke-width="2">` +
      `<path d="M128 40 Q 112 96 100 142"/><path d="M272 40 Q 288 96 300 142"/></g>`;
    s += `<g fill="none" stroke="${stitch}" stroke-width="1.6" stroke-dasharray="5 4">` +
      `<path d="M38 112 L 68 158"/><path d="M362 112 L 332 158"/>` +
      `<path d="M101 392 Q 200 402 299 392"/></g>`;

    // neckline
    if (o.shape === 'vneck' && front) {
      s += `<path d="M165 28 L 200 84 L 235 28 Z" fill="${dark}"/>`;
      s += `<path d="M165 28 L 200 84 L 235 28" fill="none" stroke="${c}" stroke-width="9"/>`;
      s += `<path d="M165 28 L 200 84 L 235 28" fill="none" stroke="${dark}" stroke-width="1.5"/>`;
    } else if (o.shape === 'polo' && front) {
      s += `<path d="M165 28 C 185 18 215 18 235 28 L 200 46 Z" fill="${dark}"/>`;
      s += `<rect x="190" y="40" width="20" height="74" fill="${c}" stroke="${dark}" stroke-width="1.5"/>`;
      s += `<circle cx="200" cy="62" r="3" fill="${dark}"/><circle cx="200" cy="90" r="3" fill="${dark}"/>`;
      s += `<path d="M165 28 L 200 46 L 178 76 L 150 40 Z" fill="${c}" stroke="${dark}" stroke-width="1.5"/>`;
      s += `<path d="M235 28 L 200 46 L 222 76 L 250 40 Z" fill="${c}" stroke="${dark}" stroke-width="1.5"/>`;
    } else if (front) {
      s += `<path d="M165 28 C 185 16 215 16 235 28 C 220 48 180 48 165 28 Z" fill="${dark}"/>`;
      s += `<path d="M165 28 C 180 48, 220 48, 235 28" fill="none" stroke="${c}" stroke-width="10"/>`;
      s += `<path d="M165 28 C 180 48, 220 48, 235 28" fill="none" stroke="${dark}" stroke-width="1.5"/>`;
      s += `<path d="M160 26 C 178 54, 222 54, 240 26" fill="none" stroke="${dark}" stroke-width="1.2"/>`;
      // silk size tag inside the back of the neck
      if (o.size) {
        s += `<rect x="189" y="20" width="22" height="12" fill="#F7F5F0" stroke="rgba(0,0,0,.25)" stroke-width="0.8"/>` +
          `<text x="200" y="29.5" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="8.5" fill="#1E1E1E">${o.size}</text>`;
      }
    } else {
      s += `<path d="M165 28 C 180 38, 220 38, 235 28" fill="none" stroke="${dark}" stroke-width="2"/>`;
      s += `<path d="M162 27 C 180 42, 220 42, 238 27" fill="none" stroke="${stitch}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
    }

    // woven Jolly tag on the wearer's left sleeve
    const tagX = front ? 334 : 66;
    const tagRot = front ? 32 : -32;
    s += `<g transform="translate(${tagX} 140) rotate(${tagRot})"><rect x="-14" y="-6" width="28" height="12" fill="#D32F2F"/>` +
      `<text x="0" y="3.4" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="8" fill="#F7F5F0">jolly</text></g>`;

    // placement zone highlight (used on the small choice plates)
    if (o.highlight) {
      const zones = o.highlight === 'both' ? ['front'] : [o.highlight];
      zones.forEach(z => {
        const b = ZONES[z];
        s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#D32F2F" opacity="0.85"/>`;
      });
      if (o.highlight === 'both') {
        s += `<text x="200" y="300" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="900" font-size="44" fill="#D32F2F">+ back</text>`;
      }
    }

    // the print or embroidery
    if (o.method && o.method !== 'sublimation' && o.placement) {
      let zone = null;
      if (front && o.placement === 'chest') zone = ZONES.chest;
      if (front && (o.placement === 'front' || o.placement === 'both')) zone = ZONES.front;
      if (!front && (o.placement === 'back' || o.placement === 'both')) zone = ZONES.back;
      if (zone) s += art(o.method, zone, c);
    }

    s += `</svg>`;
    return s;
  }

  /** A square of fabric with a print sample on it (prints section). */
  function fabric(method, color) {
    const id = 'f' + (++uid);
    let s = `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fabric sample">`;
    s += `<defs><pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse">` +
      `<path d="M0 3h6M3 0v6" stroke="rgba(0,0,0,0.05)" stroke-width="1"/></pattern>` +
      `<clipPath id="${id}c"><rect width="300" height="300"/></clipPath></defs>`;
    s += `<rect width="300" height="300" fill="${color}"/>`;
    if (method === 'sublimation') {
      let stripes = '';
      const colors = ['#D32F2F', '#F6C343', '#2952A3', '#F7F5F0'];
      for (let i = -8; i < 16; i++) stripes += `<rect x="${i * 30}" y="-150" width="15" height="600" fill="${colors[(i + 16) % 4]}" transform="rotate(32 150 150)"/>`;
      s += `<g clip-path="url(#${id}c)">${stripes}</g>`;
    } else if (method) {
      s += art(method, { x: 60, y: 60, w: 180, h: 180 }, color);
    }
    s += `<rect width="300" height="300" fill="url(#${id})"/>`;
    s += `</svg>`;
    return s;
  }

  /** Shirt with measuring arrows (price list section). */
  function measured(color) {
    const ink = '#1E1E1E';
    let s = draw({ shape: 'tee', color: color, side: 'front' }).replace('</svg>', '');
    s = s.replace('viewBox="0 0 400 420"', 'viewBox="0 0 440 440"');
    s += `<g stroke="${ink}" stroke-width="3" fill="${ink}">` +
      `<line x1="104" y1="190" x2="296" y2="190"/>` +
      `<path d="M104 190 l12 -7 v14 z M296 190 l-12 -7 v14 z" stroke="none"/>` +
      `<line x1="414" y1="40" x2="414" y2="404"/>` +
      `<path d="M414 40 l-7 12 h14 z M414 404 l-7 -12 h14 z" stroke="none"/>` +
      `<line x1="272" y1="40" x2="406" y2="40" stroke-dasharray="4 4" stroke-width="1.5"/>` +
      `<line x1="302" y1="404" x2="406" y2="404" stroke-dasharray="4 4" stroke-width="1.5"/>` +
      `</g></svg>`;
    return s;
  }

  return { draw, fabric, measured, isLight, inkFor };
})();
