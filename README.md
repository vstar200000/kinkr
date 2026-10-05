# kinkr

A small React app for working through a checklist of kinks and rating each one. Pick a rating for every item, add your own items, then export the results as a color-coded PNG or as JSON to share with a partner. Everything runs in the browser; nothing is sent anywhere.

## Using the app

- **Name your list.** The landing page offers an optional list name. Leave it blank to start right away. A name is shown in the header and included in the JSON export. **New list** in the header returns to the landing page (after a confirmation) and clears all ratings and custom items.
- **Rate items.** Each item has six ratings, each with its own color and icon so they are distinguishable without color: **Hard Limit** (X), **Never** (triangle), **Ask Me** (square), **Willing** (circle), **Love** (heart), and **Crave** (star). Every item starts as **Ask Me**. After you choose a rating the app moves to the next item, and **Skip for now** moves on without changing anything.
- **Two-sided categories.** Some categories ask for two ratings per item (for example **self** and **partner**). The app advances once both are chosen.
- **Navigate.** The menu on the left lists every category and item, highlights where you are, and jumps to any item when clicked. Small dots next to each item show the rating you chose (one dot, or two for two-sided categories). On desktop the menu is always visible; on mobile, tap the **kinkr.** logo to open it.
- **Add your own items.** Each category ends with a **+ New Item** button. Name the item on its card and rate it using that category's rules. Use **Remove this item** to delete it.
- **Export.** **Export PNG** and **Export JSON** are in the header and can be used at any time.

Ratings and custom items live in page state only. They are lost when you refresh or leave the page, so export a copy first.

## Run locally

```sh
npm install
npm run dev
```

Built with React, TypeScript, Vite, and Bootstrap.

## Update the item list

Edit [`src/data/items.json`](./src/data/items.json). The list is grouped into categories; each item needs a `name` and may include a `description` and `image`.

```json
[
  {
    "category": "Examples",
    "items": [
      {
        "name": "An item",
        "description": "Optional extra detail.",
        "image": "/images/example.jpg"
      }
    ]
  }
]
```

For local images, put the files under `public/` and reference them from the root, such as `/images/example.jpg`. Items are shown in category and list order.

### Two-sided ratings

Add one of these flags to a category to have every item in it rated twice on the same scale:

| Flag                       | Ratings                      |
| -------------------------- | ---------------------------- |
| `"self-partner": true`     | **self** and **partner**     |
| `"giving-receiving": true` | **giving** and **receiving** |
| `"actor-subject": true`    | **actor** and **subject**    |

```json
{
  "category": "Examples",
  "self-partner": true,
  "items": [{ "name": "An item" }]
}
```

## Export

### PNG

Downloads `kinkr-results-YYYY-MM-DD.png`. Each item is a row with its rating icon in the rating color (see [`src/ratings.ts`](./src/ratings.ts)), with an icon legend in the top right. If you named the list, the name is the image title, with "kinkr results" in smaller text beneath it. Unrated slots show a small empty circle. Two-sided categories get two labeled icon columns. Categories flow into as many columns as make the image closest to square, and category and item order is preserved.

### JSON

Downloads `kinkr-results-YYYY-MM-DD.json` containing:

- `formatVersion`: currently `2`
- `listName`: the list name, only present if one was entered
- `exportedAt`: an ISO timestamp
- `categories`: each category with its two-sided flag (if any) and its items

Each item has a `name`, its optional `description` and `image`, and a `rating` of `Hard Limit`, `Never`, `Ask Me`, `Willing`, `Love`, or `Crave`. In two-sided categories, `rating` is an object keyed by role, such as `{ "self": "Love", "partner": "Ask Me" }`. Custom items appear after the category's built-in items and include `"custom": true`.

## TODO

- [ ] JSON import, to restore ratings from a previous export
- [ ] Cookie saving/loading, so ratings and custom items persist across visits
- [ ] "Extended list" item flag

## Validate

```sh
npm run build
npm run lint
```
