# Jolly Website

A simple, mobile-responsive catalogue website for Jolly t-shirts.

---

## Quick Start

1. Open `index.html` in a browser to view the site locally
2. Deploy to Vercel (already connected) by pushing to the repository

---

## How to Update Content (No Coding Required!)

All editable content is in one file: **`content.js`**

### Steps to Edit:

1. Open `content.js` in any text editor (Notepad, TextEdit, VS Code)
2. Find the section you want to edit (look for the big comment headers)
3. Change the text between the quotes `" "`
4. Save the file
5. Refresh your browser to see changes

### What You Can Edit:

| Section | What to Edit |
|---------|--------------|
| **Brand** | Name, the big first-screen line, the sentence under it, logo |
| **Contact** | Phone, email, address, hours, social links, Formspree form ID |
| **Products** | The tee and the polo: names, GSM, fabric, features, sizes, measurements, white and coloured prices, which colours each comes in |
| **Bulk discounts** | Inside each product: the ₱-off-per-piece tiers from its price list, counted per shirt style |
| **Payment terms** | Blank until set; add the terms and a downpayment % to show them on the slip |
| **Colors** | The Jolly Color Collection (name + colour code for the drawings) |
| **Custom Services** | DTF, DTG and embroidery, and where they can sit on the front and back |
| **About** | "Why Jolly" sentence and the four big figures |
| **Footer** | The footer sentence and copyright |

Anything still written like `[THIS]` is hidden on the site until you fill it in.

### How the site works

The first screen is an **order builder**. Visitors drag (or tap) choices from the turning
table onto the shirt: the shirt, the colour, the front print, the back print (each side
can use a different method: DTF, DTG or embroidery), then a quantity for every size.
"Add to order" puts the item on the order slip, and the next item keeps the same prints,
so a tee and a polo with the same logo take seconds. The slip groups items by design
(the same front and back prints), applies each shirt's bulk discount, and adds
up the estimated total. "Send this order" copies everything into the
inquiry form at the bottom.

Customers can also **add their own design**: under the shirt, "Add your design" puts an
uploaded PNG, JPG or SVG on the side they are looking at. They drag it to move it, use
the slider to resize it, and "Download mockup" saves a picture of the front and back.
The file stays in their browser; the inquiry message names the files and asks them to
email the artwork.

The shirts in the builder are drawn in code (`shirt.js`), so every colour works without a
photo of each one. The real product photos, catalogue sheets and logo from the Jolly
Google Drive folder are in `assets/jolly/`.

---

## How to Add/Update Images

Put new pictures in `assets/jolly/` and point to them from `content.js` (the logo and
each product's `photo`) or `index.html` (the photos in the poster wall and Why Jolly).
Keep photos under about 1,800 pixels wide so the page stays fast.

---

## How to Add a New Product

1. Open `content.js`
2. Find the `products: [` section
3. Copy an existing product block (everything between `{` and `},`)
4. Paste it after the last product, give it a new `id`, and edit the details
5. `shape` picks the drawing: `"tee"` or `"polo"`
6. Save and refresh

---

## How to Set Up the Contact Form

The form currently opens the user's email app (mailto link). To use Formspree instead:

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your form ID
3. In `content.js`, paste the ID into `formspreeId` (e.g. `"xabcdefg"`)

---

## File Structure

```
CMT-Jolly-Website/
├── index.html      # Main website page (don't edit unless you know HTML)
├── styles.css      # Styling (don't edit unless you know CSS)
├── script.js       # Functionality (don't edit unless you know JavaScript)
├── shirt.js        # Draws the shirts and print samples
├── assets/
│   ├── jolly/      # ✅ Jolly's own photos, catalogue sheets and logo
│   └── ...         # Credited photos (cotton, thread)
├── content.js      # ✅ EDIT THIS FILE for all content changes
└── README.md       # This file
```

---

## Deploying Updates

### If using Vercel (recommended):
1. Make your changes to `content.js` or images
2. Commit and push to GitHub
3. Vercel will automatically deploy

### Manual upload:
Upload all files to your web hosting provider.

---

## Color Scheme

The site uses these colors (defined in `styles.css`):
- **Jolly red**: #D8022A
- **Jolly blue**: #1436B4
- **Jolly yellow**: #F8C81C
- **Cream paper**: #FDF3E7
- **Ink**: #1E1E1E

To change colors, edit the CSS variables at the top of `styles.css`.

---

## Support

For technical issues, contact your web developer.

For content updates, just edit `content.js` - it's designed to be easy!
