import { useState } from "react";
import "./App.css";
import Item from "./components/item.tsx";
import itemsData from "./data/items.json";
import { downloadCanvasPng, renderResultsCanvas } from "./exportImage.ts";

export interface Category {
  category: string;
  "self-partner"?: boolean;
  "giving-receiving"?: boolean;
  "actor-subject"?: boolean;
  items: ItemData[];
}

export interface ItemData {
  name: string;
  description?: string;
  image?: string;
}

const categories: Category[] = itemsData;

const ratingOptions = [
  { value: -1, label: "Hard Limit", className: "rating-hard-limit", color: "#000000" },
  { value: 0, label: "Never", className: "rating-never", color: "#920000" },
  { value: 1, label: "Ask Me", className: "rating-ask", color: "#fdfd68" },
  { value: 2, label: "Willing", className: "rating-willing", color: "#ffa500" },
  { value: 3, label: "Love", className: "rating-love", color: "#23fd22" },
  { value: 4, label: "Crave", className: "rating-crave", color: "#007fff" },
] as const;

type AnswerLevel = (typeof ratingOptions)[number]["value"];

type Role = "self" | "partner" | "giving" | "receiving" | "actor" | "subject";

type ItemAnswers = Record<Role, AnswerLevel | null>;

function getRoles(
  selfPartner = false,
  givingReceiving = false,
  actorSubject = false,
): Role[] {
  if (actorSubject) {
    return ["actor", "subject"];
  }
  if (givingReceiving) {
    return ["giving", "receiving"];
  }
  return selfPartner ? ["self", "partner"] : ["self"];
}

const items = categories.flatMap(
  ({
    category,
    "self-partner": selfPartner = false,
    "giving-receiving": givingReceiving = false,
    "actor-subject": actorSubject = false,
    items: categoryItems,
  }) =>
    categoryItems.map((item) => ({
      ...item,
      category,
      roles: getRoles(selfPartner, givingReceiving, actorSubject),
    })),
);

const DEFAULT_ANSWER: AnswerLevel = 1;

function getEffectiveAnswer(answer: AnswerLevel | null) {
  return answer ?? DEFAULT_ANSWER;
}

function getLabel(answer: AnswerLevel | null) {
  const effective = getEffectiveAnswer(answer);
  return ratingOptions.find((option) => option.value === effective)?.label ?? null;
}

function App() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [answers, setAnswers] = useState<ItemAnswers[]>(() =>
    items.map(() => ({
      self: null,
      partner: null,
      giving: null,
      receiving: null,
      actor: null,
      subject: null,
    })),
  );
  const [exportMessage, setExportMessage] = useState("");

  const activeItem = items[activeItemIndex];
  const activeRoles = activeItem?.roles ?? [];
  const activeAnswers = answers[activeItemIndex];
  const ratedCount = answers.filter((itemAnswers, index) =>
    items[index].roles.every((role) => itemAnswers[role] !== null),
  ).length;
  const isActiveItemRated = activeRoles.every(
    (role) => activeAnswers?.[role] !== null,
  );

  function handleAnswerClick(role: Role, answer: AnswerLevel) {
    const updatedAnswers = { ...activeAnswers, [role]: answer };

    setAnswers((currentAnswers) =>
      currentAnswers.map((currentAnswer, index) =>
        index === activeItemIndex ? updatedAnswers : currentAnswer,
      ),
    );
    setExportMessage("");
    if (
      activeRoles.every((activeRole) => updatedAnswers[activeRole] !== null)
    ) {
      setActiveItemIndex((currentIndex) =>
        Math.min(currentIndex + 1, items.length - 1),
      );
    }
  }

  async function exportPng() {
    const date = new Date().toISOString().slice(0, 10);
    try {
      const canvas = renderResultsCanvas(
        items.map((item, index) => ({
          name: item.name,
          category: item.category,
          roles: item.roles,
          ratings: item.roles.map((role) =>
            getEffectiveAnswer(answers[index][role]),
          ),
        })),
        ratingOptions,
      );
      await downloadCanvasPng(canvas, `kinkr-results-${date}.png`);
      setExportMessage("Your PNG results have been downloaded.");
    } catch {
      setExportMessage("Sorry, the PNG could not be created.");
    }
  }

  function exportResults() {
    let itemIndex = 0;
    const exportData = {
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      categories: categories.map(
        ({ items: categoryItems, ...categoryDetails }) => ({
          ...categoryDetails,
          items: categoryItems.map((item) => {
            const itemAnswers = answers[itemIndex];
            const itemRoles = items[itemIndex].roles;
            itemIndex += 1;

            return {
              ...item,
              rating:
                itemRoles.length > 1
                  ? Object.fromEntries(
                      itemRoles.map((role) => [
                        role,
                        getLabel(itemAnswers[role]),
                      ]),
                    )
                  : getLabel(itemAnswers.self),
            };
          }),
        }),
      ),
    };
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    downloadLink.href = downloadUrl;
    downloadLink.download = `kinkr-results-${date}.json`;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
    setExportMessage("Your JSON results have been downloaded.");
  }

  return (
    <main className="app-shell">
      <header className="container py-4 py-md-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <a className="brand text-decoration-none" href="#top" id="top">
            kinkr<span className="brand-period">.</span>
          </a>
          <div className="btn-group" role="group" aria-label="Export options">
            <button
              className="btn btn-outline-dark export-button"
              onClick={exportPng}
              type="button"
            >
              Export PNG
            </button>
            <button
              className="btn btn-outline-dark export-button"
              onClick={exportResults}
              type="button"
            >
              Export JSON
            </button>
          </div>
        </div>
      </header>

      <section
        aria-label="Item ratings"
        className="rating-workspace pb-5"
        style={
          activeItem?.image
            ? {
                backgroundImage: `linear-gradient(rgb(251 250 252 / 78%), rgb(251 250 252 / 88%)), url(${JSON.stringify(activeItem.image)})`,
              }
            : undefined
        }
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-9 col-xl-8">
              {activeItem ? (
                <>
                  <div className="d-flex justify-content-between align-items-end mb-3">
                    <div>
                      <p className="eyebrow mb-1">{activeItem.category}</p>
                    </div>
                    {ratedCount === items.length && (
                      <span className="complete-badge">All rated</span>
                    )}
                  </div>

                  <Item
                    key={activeItemIndex}
                    description={activeItem.description}
                    name={activeItem.name}
                  />

                  <div className="rating-controls mt-auto">
                    <div className="rating-area mt-4">
                      {activeRoles.map((role) => (
                        <div
                          aria-label={activeRoles.length > 1 ? role : undefined}
                          className="rating-group"
                          key={role}
                          role={activeRoles.length > 1 ? "group" : undefined}
                        >
                          {activeRoles.length > 1 && (
                            <p className="rating-group-label">{role}</p>
                          )}
                          <div className="rating-options">
                            {ratingOptions.map((option) => (
                              <button
                                aria-pressed={
                                  getEffectiveAnswer(activeAnswers[role]) === option.value
                                }
                                className={`btn rating-choice ${option.className}${getEffectiveAnswer(activeAnswers[role]) === option.value ? " is-selected" : ""}`}
                                key={option.value}
                                onClick={() =>
                                  handleAnswerClick(role, option.value)
                                }
                                type="button"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <nav
                      aria-label="Item navigation"
                      className="d-flex justify-content-between mt-4"
                    >
                      <button
                        className="btn btn-link navigation-button"
                        disabled={activeItemIndex === 0}
                        onClick={() =>
                          setActiveItemIndex((index) => Math.max(index - 1, 0))
                        }
                        type="button"
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-link navigation-button"
                        disabled={activeItemIndex === items.length - 1}
                        onClick={() =>
                          setActiveItemIndex((index) =>
                            Math.min(index + 1, items.length - 1),
                          )
                        }
                        type="button"
                      >
                        {isActiveItemRated ? "Next item" : "Skip for now"}
                      </button>
                    </nav>

                    <p
                      aria-live="polite"
                      className="export-message text-center mt-3 mb-0"
                    >
                      {exportMessage}
                    </p>
                    <p className="privacy-note text-center mt-3 mb-0">
                      Your ratings stay in this browser session. Export a copy
                      before leaving.
                    </p>
                  </div>
                </>
              ) : (
                <div className="empty-state text-center p-5">
                  <h2 className="h4">There are no items yet.</h2>
                  <p className="text-secondary mb-0">
                    Add items to <code>src/data/items.json</code> to get
                    started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
