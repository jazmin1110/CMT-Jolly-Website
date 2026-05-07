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
| **Brand** | Company name, tagline, description, logo |
| **Contact** | Phone, email, address, business hours, social links |
| **Products** | Names, descriptions, prices, sizes, images |
| **Custom Services** | Title, description, list of services |
| **About** | Title, description, feature highlights |

---

## How to Add/Update Images

### Step 1: Prepare Your Images
- **Logo**: 200x60 pixels, PNG with transparent background
- **Product images**: 600x600 pixels, JPG or PNG
- **Custom samples**: 400x400 pixels, JPG or PNG

### Step 2: Add to the `/images/` folder
Put your images in the `images` folder with these exact filenames:
- `jolly-logo.png` (your logo)
- `product-1.jpg` (first product)
- `product-2.jpg`, `product-3.jpg` (additional products)
- `custom-sample-1.jpg` through `custom-sample-4.jpg`

### Step 3: Update content.js (if using different filenames)
```javascript
// In content.js, change the image path:
image: "images/your-filename.jpg",
```

---

## How to Add a New Product

1. Open `content.js`
2. Find the `products: [` section
3. Copy an existing product block (everything between `{` and `},`)
4. Paste it after the last product
5. Edit the details
6. Save and refresh

Example:
```javascript
{
  name: "V-Neck T-Shirt",
  description: "Comfortable V-neck design.",
  image: "images/product-4.jpg",
  minimumOrder: "100,000 pcs",
  paymentTerms: "30% down, balance on delivery",
  effectivityDate: "04/01/2026",
  sizes: [
    { size: "S", width: 40, length: 26, price: 175 },
    { size: "M", width: 42, length: 27, price: 185 },
    // ... more sizes
  ],
  isActive: true,
},
```

---

## How to Set Up the Contact Form

The form currently opens the user's email app (mailto link). To use Formspree instead:

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your form ID
3. In `index.html`, find this line:
   ```html
   action="https://formspree.io/f/[YOUR-FORM-ID]"
   ```
4. Replace `[YOUR-FORM-ID]` with your actual ID (e.g., `xabcdefg`)

---

## File Structure

```
CMT-Jolly-Website/
├── index.html      # Main website page (don't edit unless you know HTML)
├── styles.css      # Styling (don't edit unless you know CSS)
├── script.js       # Functionality (don't edit unless you know JavaScript)
├── content.js      # ✅ EDIT THIS FILE for all content changes
├── images/         # ✅ PUT YOUR IMAGES HERE
│   ├── jolly-logo.png
│   ├── product-1.jpg
│   ├── product-2.jpg
│   └── ...
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
- **Primary Red**: #D32F2F
- **Dark Charcoal**: #2D2D2D
- **Light Gray**: #F5F5F5
- **White**: #FFFFFF

To change colors, edit the CSS variables at the top of `styles.css`.

---

## Support

For technical issues, contact your web developer.

For content updates, just edit `content.js` - it's designed to be easy!
