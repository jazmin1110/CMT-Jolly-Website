/**
 * ============================================================================
 * JOLLY WEBSITE - EDITABLE CONTENT FILE
 * ============================================================================
 * 
 * HOW TO EDIT THIS FILE:
 * ----------------------
 * This file contains ALL the text, prices, and content shown on the website.
 * You can edit anything below WITHOUT touching any other files.
 * 
 * IMPORTANT RULES:
 * 1. Keep all quotes (" ") around text - don't delete them
 * 2. Keep all commas (,) at the end of lines - don't delete them
 * 3. For prices, use numbers only (no peso sign) - e.g., 100 not ₱100
 * 4. Save the file after editing, then refresh the website to see changes
 * 
 * FOR IMAGES:
 * - Put your images in the /images/ folder
 * - Use the exact filename in this file (e.g., "product-1.jpg")
 * - Recommended image sizes: Products = 600x600px, Logo = 200x60px
 * 
 * ============================================================================
 */

const SITE_CONTENT = {

  // ==========================================================================
  // BRAND INFORMATION
  // ==========================================================================
  
  brand: {
    // ← EDIT YOUR BRAND NAME HERE
    name: "Jolly",
    
    // ← EDIT YOUR TAGLINE HERE (shown in hero section)
    tagline: "[TAGLINE HERE]",
    
    // ← EDIT YOUR BRAND DESCRIPTION HERE (shown in hero section)
    description: "[Short brand description - Tell customers what makes Jolly special. Example: Premium quality plain t-shirts for wholesale and bulk orders in the Philippines.]",
    
    // ← EDIT YOUR LOGO FILENAME HERE (put the logo file in /images/ folder)
    // Recommended size: 200x60 pixels, PNG format with transparent background
    logo: "images/jolly-logo.png",
  },

  // ==========================================================================
  // CONTACT INFORMATION
  // ==========================================================================
  
  contact: {
    // ← EDIT YOUR PHONE NUMBER HERE
    phone: "[YOUR PHONE NUMBER]",
    
    // ← EDIT YOUR EMAIL ADDRESS HERE
    email: "[YOUR EMAIL ADDRESS]",
    
    // ← EDIT YOUR BUSINESS ADDRESS HERE
    address: "[YOUR BUSINESS ADDRESS]",
    
    // ← EDIT YOUR BUSINESS HOURS HERE
    businessHours: "[YOUR BUSINESS HOURS - e.g., Mon-Fri 8AM-5PM, Sat 8AM-12PM]",
    
    // ← EDIT YOUR SOCIAL MEDIA LINKS HERE (put the full URL)
    facebook: "https://facebook.com/[YOUR-PAGE]",
    instagram: "https://instagram.com/[YOUR-HANDLE]",
  },

  // ==========================================================================
  // PRODUCTS CATALOGUE
  // ==========================================================================
  // 
  // HOW TO ADD A NEW PRODUCT:
  // 1. Copy everything between { and }, including the curly braces
  // 2. Paste it after the last product (before the closing bracket ])
  // 3. Add a comma after the previous product's closing }
  // 4. Edit the new product's details
  //
  // HOW TO ADD A SIZE TO A PRODUCT:
  // 1. In the "sizes" section, copy one line like: { size: "S", width: 41, length: 26, price: 172 },
  // 2. Paste it where you want in the list
  // 3. Edit the values
  //
  // ==========================================================================
  
  products: [
    // --------------------------------------------------------------------------
    // PRODUCT 1: 100% Pure Cotton Round Neck T-Shirt
    // --------------------------------------------------------------------------
    {
      // ← EDIT PRODUCT NAME HERE
      name: "100% Pure Cotton Round Neck T-Shirt",
      
      // ← EDIT PRODUCT DESCRIPTION HERE
      description: "Complete with front & back print, woven tag on L-H sleeve, silk size tag.",
      
      // ← EDIT PRODUCT IMAGE FILENAME HERE (put image in /images/ folder)
      // Recommended size: 600x600 pixels
      image: "images/product-1.jpg",
      
      // ← EDIT MINIMUM ORDER QUANTITY HERE
      minimumOrder: "200,000 pcs",
      
      // ← EDIT PAYMENT TERMS HERE
      paymentTerms: "30% downpayment, full payment upon delivery. Prices subject to change without prior notice.",
      
      // ← EDIT PRICE EFFECTIVITY DATE HERE
      effectivityDate: "03/20/2026",
      
      // ← EDIT SIZES AND PRICES BELOW
      // Format: { size: "SIZE", width: WIDTH_IN_INCHES, length: LENGTH_IN_INCHES, price: PRICE_IN_PESOS }
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
        { size: "L",   width: 44, length: 28,   price: 199 },
        { size: "XL",  width: 46, length: 29,   price: 195 },
        { size: "2XL", width: 48, length: 30,   price: 200 },
      ],
      
      // Set to true to show this product, false to hide it
      isActive: true,
    },
    
    // --------------------------------------------------------------------------
    // PRODUCT 2: Placeholder - Edit or replace with your second product
    // --------------------------------------------------------------------------
    {
      name: "Coming Soon",
      description: "New product coming soon. Check back for updates!",
      image: "images/product-2.jpg",
      minimumOrder: "TBA",
      paymentTerms: "TBA",
      effectivityDate: "",
      sizes: [],
      isActive: true,
    },
    
    // --------------------------------------------------------------------------
    // PRODUCT 3: Placeholder - Edit or replace with your third product
    // --------------------------------------------------------------------------
    {
      name: "Coming Soon",
      description: "New product coming soon. Check back for updates!",
      image: "images/product-3.jpg",
      minimumOrder: "TBA",
      paymentTerms: "TBA",
      effectivityDate: "",
      sizes: [],
      isActive: true,
    },
  ],

  // ==========================================================================
  // CUSTOM DESIGN SERVICES
  // ==========================================================================
  
  customServices: {
    // ← EDIT SECTION TITLE HERE
    title: "Custom Prints & Embroidery",
    
    // ← EDIT SECTION DESCRIPTION HERE
    description: "[DESCRIPTION OF CUSTOM DESIGN SERVICES - Tell customers about your custom printing and embroidery capabilities, turnaround times, and what makes your service special.]",
    
    // ← EDIT LIST OF SERVICES HERE (add or remove as needed)
    services: [
      "Screen Printing",
      "Digital Printing", 
      "Embroidery",
      "Heat Transfer",
      "Sublimation Printing",
    ],
    
    // ← EDIT SAMPLE IMAGE FILENAMES HERE (put images in /images/ folder)
    // Recommended size: 400x400 pixels each
    sampleImages: [
      "images/custom-sample-1.jpg",
      "images/custom-sample-2.jpg",
      "images/custom-sample-3.jpg",
      "images/custom-sample-4.jpg",
    ],
  },

  // ==========================================================================
  // ABOUT / WHY JOLLY SECTION
  // ==========================================================================
  
  about: {
    // ← EDIT ABOUT SECTION TITLE HERE
    title: "Why Choose Jolly?",
    
    // ← EDIT ABOUT DESCRIPTION HERE
    description: "[ABOUT YOUR BRAND - Share your story, your commitment to quality, and what makes Jolly different from other suppliers.]",
    
    // ← EDIT HIGHLIGHTS HERE (the 3 feature boxes)
    highlights: [
      {
        icon: "📦", // You can change these emoji icons
        title: "High Volume Orders",
        description: "We specialize in bulk orders for businesses, schools, and organizations.",
      },
      {
        icon: "✨",
        title: "Quality Materials",
        description: "100% pure cotton shirts that are comfortable and durable.",
      },
      {
        icon: "⚡",
        title: "Fast Turnaround",
        description: "Efficient production process to meet your deadlines.",
      },
    ],
  },

  // ==========================================================================
  // FOOTER
  // ==========================================================================
  
  footer: {
    // ← EDIT COPYRIGHT TEXT HERE (year will be added automatically)
    copyrightText: "Jolly Philippines. All rights reserved.",
  },

};
