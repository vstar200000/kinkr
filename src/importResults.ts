import { ratingOptions } from "./ratings.ts";

type AnswerLevel = (typeof ratingOptions)[number]["value"];
type Role = "self" | "partner" | "giving" | "receiving" | "actor" | "subject";

interface CategoryShape {
  category: string;
  "self-partner"?: boolean;
  "giving-receiving"?: boolean;
  "actor-subject"?: boolean;
  items: { name: string }[];
}

export interface ImportedResults {
  listName: string;
  answers: Record<string, Record<Role, AnswerLevel | null>>;
  customItems: { id: number; category: string; name: string }[];
  nextCustomId: number;
  skipped: number;
}

const ALL_ROLES: Role[] = [
  "self",
  "partner",
  "giving",
  "receiving",
  "actor",
  "subject",
];

function getRoles(category: CategoryShape): Role[] {
  if (category["actor-subject"]) return ["actor", "subject"];
  if (category["giving-receiving"]) return ["giving", "receiving"];
  return category["self-partner"] ? ["self", "partner"] : ["self"];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function levelOf(label: unknown): AnswerLevel | null {
  return ratingOptions.find((option) => option.label === label)?.value ?? null;
}

export function parseResults(
  text: string,
  categories: CategoryShape[],
): ImportedResults {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (
    !isRecord(data) ||
    data.formatVersion !== 2 ||
    !Array.isArray(data.categories)
  ) {
    throw new Error("That file is not a kinkr results export.");
  }

  const baseKeys = new Map<string, string>();
  const categoryByName = new Map<string, CategoryShape>();
  let baseIndex = 0;
  for (const category of categories) {
    categoryByName.set(category.category, category);
    for (const item of category.items) {
      baseKeys.set(`${category.category}\n${item.name}`, `base:${baseIndex++}`);
    }
  }

  const result: ImportedResults = {
    listName: typeof data.listName === "string" ? data.listName : "",
    answers: {},
    customItems: [],
    nextCustomId: 1,
    skipped: 0,
  };
  let imported = 0;

  for (const rawCategory of data.categories) {
    if (!isRecord(rawCategory) || !Array.isArray(rawCategory.items)) continue;
    const category = categoryByName.get(String(rawCategory.category));
    if (!category) {
      result.skipped += rawCategory.items.length;
      continue;
    }
    const roles = getRoles(category);

    for (const rawItem of rawCategory.items) {
      if (!isRecord(rawItem) || typeof rawItem.name !== "string") {
        result.skipped += 1;
        continue;
      }
      let key = baseKeys.get(`${category.category}\n${rawItem.name}`);
      if (rawItem.custom === true) {
        const id = result.nextCustomId++;
        result.customItems.push({
          id,
          category: category.category,
          name: rawItem.name,
        });
        key = `custom:${id}`;
      }
      if (!key) {
        result.skipped += 1;
        continue;
      }

      const rating = rawItem.rating;
      const answers = Object.fromEntries(
        ALL_ROLES.map((role) => [role, null]),
      ) as Record<Role, AnswerLevel | null>;
      for (const role of roles) {
        answers[role] = levelOf(
          roles.length > 1 && isRecord(rating) ? rating[role] : rating,
        );
      }
      result.answers[key] = answers;
      imported += 1;
    }
  }

  if (imported === 0) {
    throw new Error("No items in that file match this list.");
  }
  return result;
}
