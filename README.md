# kinkr

A small React app for rating a bundled list of items on a five-level scale and exporting your results as JSON.

## Run locally

```sh
npm install
npm run dev
```

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

For local images, put the files under `public/` and reference them from the root, such as `/images/example.jpg`. The app shows items in category and list order. Ratings are kept in page state and are not saved after leaving or refreshing the page.

### Self and partner ratings

Add `"self-partner": true` to a category to have every item in it rated twice, once for **self** and once for **partner**, using the same scale. The app advances after both are chosen.

```json
{ "category": "Examples", "self-partner": true, "items": [{ "name": "An item" }] }
```

## Export format

Choose **Export JSON** at any time to download `kinkr-results-YYYY-MM-DD.json`. The export contains a `formatVersion`, an ISO `exportedAt` timestamp, and the original categories and items. Each item includes a `rating` property containing one of `Never`, `Ask Me`, `Willing`, `Love`, or `Crave`; items not rated yet have `"rating": null`. In categories with `"self-partner": true`, `rating` is instead an object, `{ "self": ..., "partner": ... }`, with `null` for whichever side is unrated. The category's `self-partner` flag is preserved in the export.

## Validate

```sh
npm run build
npm run lint
```
