# oslopack-site

Static HTML build of the oslopack website design (from the Doop canvas). No framework and no build step: plain HTML, CSS and a little JavaScript.

## Run it

Open `index.html` in a browser, or serve the folder so paths behave like production:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Pages

| File | Page |
|---|---|
| `index.html` | Home, with the sub-brands section (Oslo Pack, Safe Pack, Oslo Fresh, Oslo Soft) |
| `product.html` | Product detail (Paper cup 8 oz) |
| `blog.html`, `blog-article.html` | Blog index and sample article |
| `request-for-quote.html`, `thank-you.html`, `quotes-history.html` | Quote pages |
| `wishlist.html`, `reviews.html` | Account and social proof |
| `about.html`, `contact.html`, `faqs.html` | Company and help |
| `shipping-policy.html`, `refund-policy.html`, `privacy-policy.html`, `terms.html` | Policies |

## Add to request (no payment)

Product cards, the product page and the blog article have an **Add to request** button that opens a right-side drawer:

1. Product and quantity (options, stepper, quick picks, live estimate)
2. Review and send (edit quantities, contact name, WhatsApp, delivery area, note)
3. Sent (reference number and next steps)

Wire it to any button with `data-add="cup|box|bag|bagasse"`. Any element with `data-open-request` opens the review step, and `data-request-count` shows the item count.

The drawer keeps the request in `localStorage` only. **Nothing is sent anywhere yet.** To go live, post the items and contact details to your backend or support inbox inside the `send` case of `assets/js/request-drawer.js`.

## Structure

```
assets/css/site.css      tokens (brand blue #17488A), header, buttons, footer
assets/css/drawer.css    request drawer
assets/js/site.js        click-through for [data-href] cards
assets/js/request-drawer.js
assets/img/              logo and product photos
```

## Notes

- Brand blue comes from the logo (`#17488A`). The CSS variable is still named `--green` for compatibility with the design export.
- Copy, prices, authors, reviews and quote numbers are placeholders from the design.
- `request-for-quote.html` is the static design of the full quote form.
