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
 * 3. Prices are numbers only, no peso sign: 230, not ₱230.
 * 4. Save, then refresh the browser to see the change.
 *
 * Anything still written like "[THIS]" is a placeholder. The site hides
 * placeholders automatically, so it is safe to leave them until you have
 * the real details.
 *
 * Source for products, prices and colours: the Jolly Google Drive folder
 * (price lists effective October 10, 2026).
 * ============================================================================
 */

const SITE_CONTENT = {

  // ==========================================================================
  // BRAND
  // ==========================================================================
  brand: {
    name: "Jolly",
    // Big line on the first screen
    tagline: "Your everyday, made Jolly.",
    // One sentence under it
    description:
      "Premium cotton tees and polos from the Philippines. Build your order below: shirt, colour, front and back prints, sizes. Add as many items as you need.",
    // Logo file (leave "" to use the word "Jolly")
    logo: "assets/jolly/logo-96.png",
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
  // Each size has a price for WHITE shirts and a price for COLOURED shirts.
  // width and length are in inches.
  products: [
    {
      id: "tee",
      name: "Round Neck Tubular Tee",
      shortName: "Round neck tee",
      line: "Classics",
      shape: "tee",          // the drawing to use: "tee" or "polo"
      gsm: 195,
      fabric: "100% premium compact siro cotton, single jersey, seamless tubular body",
      features: [
        "Semi-mercerized for colour vibrancy and colour fastness",
        "Ribbed collar with high-density stitching that holds its shape",
        "Shoulder-to-shoulder taping",
        "Double-needle stitching on sleeves and hem",
        "Pre-shrunk, smooth and soft to the touch",
      ],
      photo: "assets/jolly/tee-catalogue.jpg",
      // Bulk discount from this shirt's price list: pesos off per piece,
      // counted on all pieces of this shirt in the order
      bulkDiscounts: [
        { min: 6,    max: 119,  off: 10 },
        { min: 120,  max: 599,  off: 15 },
        { min: 600,  max: 1199, off: 20 },
        { min: 1200, max: null, off: 25 },
      ],
      effectivityDate: "October 10, 2026",
      sizes: [
        { size: "XS",  width: 19, length: 25, white: 230, colored: 260 },
        { size: "S",   width: 20, length: 26, white: 235, colored: 265 },
        { size: "M",   width: 21, length: 27, white: 240, colored: 270 },
        { size: "L",   width: 22, length: 28, white: 245, colored: 275 },
        { size: "XL",  width: 23, length: 29, white: 255, colored: 285 },
        { size: "2XL", width: 24, length: 30, white: 275, colored: 315 },
        { size: "3XL", width: 25, length: 32, white: 295, colored: 335 },
      ],
      // Colour names from the list below. Leave [] to offer every colour.
      colors: [],
    },
    {
      id: "polo",
      name: "Pique Polo Shirt",
      shortName: "Pique polo",
      line: "Classics",
      shape: "polo",
      gsm: 235,
      fabric: "100% premium compact siro cotton pique",
      features: [
        "Flat-knit collar and cuffs",
        "3-button placket, tightly stitched for durability",
        "Shoulder-to-shoulder taping",
        "Semi-mercerized for colour vibrancy and colour fastness",
        "Double-needle stitching on sleeves and hem, pre-shrunk",
      ],
      photo: "assets/jolly/polo-catalogue.jpg",
      // Bulk discount from this shirt's price list: pesos off per piece,
      // counted on all pieces of this shirt in the order
      bulkDiscounts: [
        { min: 6,    max: 119,  off: 10 },
        { min: 120,  max: 599,  off: 15 },
        { min: 600,  max: 1199, off: 20 },
        { min: 1200, max: null, off: 25 },
      ],
      effectivityDate: "October 10, 2026",
      sizes: [
        { size: "XS",  width: 19, length: 28, white: 300, colored: 335 },
        { size: "S",   width: 20, length: 29, white: 310, colored: 340 },
        { size: "M",   width: 21, length: 30, white: 315, colored: 345 },
        { size: "L",   width: 22, length: 31, white: 320, colored: 350 },
        { size: "XL",  width: 24, length: 32, white: 335, colored: 365 },
        { size: "2XL", width: 26, length: 33, white: 360, colored: 390 },
      ],
      // The Drive price list only says "white" and "coloured" for the polo.
      // List the polo's colours here when there is a polo colour card. [] = every colour.
      colors: [],
    },
  ],

  // Payment terms are not on the Drive price lists yet. Add them here when
  // they are set (e.g. "30% downpayment, full payment upon delivery."), and
  // set downpayment to the percentage (e.g. 30) to show it on the order slip.
  paymentTerms: "",
  downpayment: 0,
  priceNote: "All prices are subject to change without prior notice.",

  // ==========================================================================
  // COLOURS (the Jolly Color Collection)
  // ==========================================================================
  // name = what customers see, hex = the colour of the drawing.
  colors: [
    { name: "White",         hex: "#F4F2EE" },
    { name: "Turtle Dove",   hex: "#E2D3B8" },
    { name: "Gargoyle",      hex: "#58534F" },
    { name: "Cork",          hex: "#5E3F2D" },
    { name: "Estate Blue",   hex: "#18204F" },
    { name: "Snorkel Blue",  hex: "#0C3DB4" },
    { name: "Pastel Yellow", hex: "#F5DF66" },
    { name: "First Blush",   hex: "#F5A2AD" },
    { name: "True Red",      hex: "#B0121F" },
    { name: "Jolly Green",   hex: "#0B6B2C" },
    { name: "Black",         hex: "#161517" },
  ],

  // ==========================================================================
  // CUSTOM PRINTS & EMBROIDERY
  // ==========================================================================
  // The front and the back are decorated separately, so methods can be
  // mixed: DTF on the front and embroidery on the back, for example.
  customServices: {
    title: "Custom prints & embroidery",
    description:
      "Decorate the front and the back separately, and mix the methods: a DTF print on the front with an embroidered logo on the back, or DTG on both. Send us the artwork and we quote the decoration per piece.",
    // id must stay "dtf", "dtg" or "embroidery" (it picks the drawing)
    methods: [
      { id: "dtf",        name: "DTF",        long: "Direct-to-film print", note: "Bright full colour on any shirt colour, light or dark" },
      { id: "dtg",        name: "DTG",        long: "Direct-to-garment print", note: "Photo detail printed straight into the cotton, soft to the touch" },
      { id: "embroidery", name: "Embroidery", long: "Embroidery", note: "Stitched logos that last, best for uniforms and polos" },
    ],
    // Where a decoration can sit on each side
    placements: {
      front: [
        { id: "chest", name: "Left chest" },
        { id: "front", name: "Full front" },
      ],
      back: [
        { id: "nape", name: "Upper back" },
        { id: "back", name: "Full back" },
      ],
    },
  },

  // ==========================================================================
  // WHY JOLLY
  // ==========================================================================
  about: {
    title: "Why Jolly",
    description:
      "Everyday shirts, made properly: premium compact siro cotton, finished the way good shirts should be, in eleven colours.",
    highlights: [
      {
        figure: "11",
        title: "colours",
        description: "From White and Turtle Dove to True Red and Jolly Green.",
      },
      {
        figure: "195",
        title: "GSM single jersey tee",
        description: "A seamless tubular body. The pique polo is a heavier 235 GSM.",
      },
      {
        figure: "100%",
        title: "premium compact siro cotton",
        description: "Semi-mercerized for colour that stays bright, and pre-shrunk.",
      },
      {
        figure: "₱25",
        title: "off every piece at 1,200+",
        description: "Bulk discounts start at just 6 pieces.",
      },
    ],
  },

  // ==========================================================================
  // FOOTER
  // ==========================================================================
  footer: {
    statement: "Premium cotton tees and polos, from six pieces to thousands.",
    copyrightText: "Jolly Philippines. All rights reserved.",
  },
};
