/**
 * ============================================================================
 * JOLLY WEBSITE - EDITABLE CONTENT FILE
 * ============================================================================
 *
 * This file holds ALL the words, prices and choices shown on the website.
 * Edit anything below without touching the other files.
 *
 * RULES:
 * 1. Keep the quotes (" ") around text.
 * 2. Keep the commas (,) at the end of lines.
 * 3. Prices are numbers only, no peso sign: 100, not ₱100.
 * 4. Save, then refresh the browser to see the change.
 *
 * Anything still written like "[THIS]" is a placeholder. The site hides
 * placeholders automatically, so it is safe to leave them until you have
 * the real details.
 * ============================================================================
 */

const SITE_CONTENT = {

  // ==========================================================================
  // BRAND
  // ==========================================================================
  brand: {
    name: "Jolly",
    // Big line on the first screen (keep it short, about 30 letters)
    tagline: "Build your shirt order",
    // One sentence under it
    description:
      "Plain 100% cotton round-neck shirts from the Philippines, priced per piece and made in bulk. Pick the colour, size, print and quantity, and the order slip adds it up for you.",
    // Optional logo file in /images/ (leave "" to use the word "Jolly")
    logo: "",
  },

  // ==========================================================================
  // CONTACT
  // ==========================================================================
  contact: {
    phone: "[YOUR PHONE NUMBER]",
    email: "[YOUR EMAIL ADDRESS]",
    address: "[YOUR BUSINESS ADDRESS]",
    businessHours: "[YOUR BUSINESS HOURS]",
    facebook: "https://facebook.com/[YOUR-PAGE]",
    instagram: "https://instagram.com/[YOUR-HANDLE]",
    // Get a free form ID at formspree.io, then paste it here (e.g. "xabcdefg")
    formspreeId: "",
  },

  // ==========================================================================
  // PRODUCTS
  // ==========================================================================
  // Only products with isActive: true AND at least one size can be ordered.
  // The others show as "coming soon" in the builder and the catalogue.
  products: [
    {
      id: "round-neck",
      name: "100% Pure Cotton Round Neck T-Shirt",
      shortName: "Round neck",
      description:
        "Complete with front & back print, woven tag on L-H sleeve, silk size tag.",
      // The shirt drawing to use: "tee", "vneck" or "polo"
      shape: "tee",
      minimumOrder: 200000, // pieces (number only)
      paymentTerms:
        "30% downpayment, full payment upon delivery. Prices subject to change without prior notice.",
      effectivityDate: "03/20/2026",
      // { size, width (inches), length (inches), price (pesos per piece) }
      sizes: [
        { size: "4",   width: 24, length: 17,   price: 100 },
        { size: "6",   width: 28, length: 18,   price: 105 },
        { size: "8",   width: 29, length: 19.5, price: 110 },
        { size: "10",  width: 30, length: 20.5, price: 115 },
        { size: "12",  width: 32, length: 21,   price: 125 },
        { size: "14",  width: 33, length: 22,   price: 135 },
        { size: "16",  width: 35, length: 23,   price: 145 },
        { size: "18",  width: 37, length: 24.5, price: 152 },
        { size: "20",  width: 38, length: 25.5, price: 158 },
        { size: "XS",  width: 40, length: 25.5, price: 165 },
        { size: "S",   width: 41, length: 26,   price: 172 },
        { size: "M",   width: 42, length: 27,   price: 180 },
        { size: "L",   width: 44, length: 28,   price: 199 }, // ← check: L is priced higher than XL
        { size: "XL",  width: 46, length: 29,   price: 195 },
        { size: "2XL", width: 48, length: 30,   price: 200 },
      ],
      isActive: true,
    },
    {
      id: "v-neck",
      name: "V-Neck T-Shirt",
      shortName: "V-neck",
      description: "Coming soon.",
      shape: "vneck",
      minimumOrder: 0,
      paymentTerms: "",
      effectivityDate: "",
      sizes: [],
      isActive: false,
    },
    {
      id: "polo",
      name: "Polo Shirt",
      shortName: "Polo",
      description: "Coming soon.",
      shape: "polo",
      minimumOrder: 0,
      paymentTerms: "",
      effectivityDate: "",
      sizes: [],
      isActive: false,
    },
  ],

  // ==========================================================================
  // SHIRT COLOURS (shown in the builder)
  // ==========================================================================
  // name = what customers see, hex = the colour of the drawing.
  // ← CONFIRM this list against the colours you actually stock.
  colors: [
    { name: "White",        hex: "#F7F5F0" },
    { name: "Black",        hex: "#1E1E1E" },
    { name: "Jolly red",    hex: "#D32F2F" },
    { name: "Navy",         hex: "#1F2A4A" },
    { name: "Royal blue",   hex: "#2952A3" },
    { name: "Heather grey", hex: "#A7A9AC" },
    { name: "Sun yellow",   hex: "#F6C343" },
    { name: "Forest green", hex: "#2F5D3A" },
    { name: "Maroon",       hex: "#6B1E2A" },
    { name: "Sky blue",     hex: "#8EC5E8" },
  ],

  // ==========================================================================
  // CUSTOM PRINTS & EMBROIDERY
  // ==========================================================================
  customServices: {
    title: "Custom prints & embroidery",
    description:
      "Every Jolly shirt can leave the factory plain, printed or embroidered. Send us the artwork and the quantity and we will quote the decoration per piece.",
    // note = short line under each service on the price sheet
    services: [
      { name: "Screen printing",  note: "Flat colours, best for big runs" },
      { name: "Digital printing", note: "Full colour and photo artwork" },
      { name: "Embroidery",       note: "Stitched logos for uniforms" },
      { name: "Heat transfer",    note: "Sharp detail, numbers and names" },
      { name: "Sublimation",      note: "Edge-to-edge colour on light shirts" },
    ],
    // Where a print can go (shown in the builder)
    placements: [
      { id: "chest", name: "Left chest" },
      { id: "front", name: "Full front" },
      { id: "back",  name: "Full back" },
      { id: "both",  name: "Front & back" },
    ],
  },

  // ==========================================================================
  // ORDER QUANTITIES (the last step of the builder)
  // ==========================================================================
  quantities: [200000, 250000, 300000, 500000, 1000000],

  // ==========================================================================
  // WHY JOLLY
  // ==========================================================================
  about: {
    title: "Why Jolly",
    description:
      "Jolly makes one thing well: plain cotton shirts, in the volumes real orders need.",
    // The big figures. figure = the big text, title = what it means,
    // description = one line under it.
    highlights: [
      {
        figure: "200,000",
        title: "pieces per order, minimum",
        description: "Made for volume: schools, companies, organisations and resellers.",
      },
      {
        figure: "100%",
        title: "pure cotton",
        description: "Every shirt, every size. Nothing blended in.",
      },
      {
        figure: "15",
        title: "sizes, kids 4 to adult 2XL",
        description: "Each one measured and priced on the list above.",
      },
      {
        figure: "2 tags",
        title: "on every shirt",
        description: "A woven Jolly tag on the left sleeve and a silk size tag at the neck.",
      },
    ],
  },

  // ==========================================================================
  // FOOTER
  // ==========================================================================
  footer: {
    copyrightText: "Jolly Philippines. All rights reserved.",
  },
};
