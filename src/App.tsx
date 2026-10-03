import { useState } from "react";
import "./App.css";
import Item from "./components/item.tsx";
import itemsData from "./data/items.json";

export interface Category {
  category: string;
  items: ItemData[];
}

export interface ItemData {
  name: string;
  description?: string;
  image?: string;
}

const categories: Category[] = itemsData;

const ratingOptions = [
  { value: 0, label: "Never" },
  { value: 1, label: "Ask Me" },
  { value: 2, label: "Willing" },
  { value: 3, label: "Love" },
  { value: 4, label: "Crave" },
] as const;

type AnswerLevel = (typeof ratingOptions)[number]["value"];

const items = categories.flatMap(({ category, items: categoryItems }) =>
  categoryItems.map((item) => ({ ...item, category })),
);

function App() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<AnswerLevel | null>>(() =>
    items.map(() => null),
  );
  const [exportMessage, setExportMessage] = useState("");

  const activeItem = items[activeItemIndex];
  const ratedCount = answers.filter((answer) => answer !== null).length;
  const activeAnswer = answers[activeItemIndex] ?? null;

  function handleAnswerClick(answer: AnswerLevel) {
    setAnswers((currentAnswers) =>
      currentAnswers.map((currentAnswer, index) =>
        index === activeItemIndex ? answer : currentAnswer,
      ),
    );
    setExportMessage("");
    setActiveItemIndex((currentIndex) =>
      Math.min(currentIndex + 1, items.length - 1),
    );
  }

  function exportResults() {
    let itemIndex = 0;
    const exportData = {
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      categories: categories.map(({ category, items: categoryItems }) => ({
        category,
        items: categoryItems.map((item) => {
          const answer = answers[itemIndex];
          itemIndex += 1;

          return {
            ...item,
            rating:
              answer === null || answer === undefined
                ? null
                : (ratingOptions.find((option) => option.value === answer)
                    ?.label ?? null),
          };
        }),
      })),
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
          <button
            className="btn btn-outline-dark export-button"
            onClick={exportResults}
            type="button"
          >
            Export
          </button>
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
                      category={activeItem.category}
                      description={activeItem.description}
                      name={activeItem.name}
                    />

                    <div className="rating-area mt-4">
                      <div className="rating-options">
                        {ratingOptions.map((option) => (
                          <button
                            aria-pressed={activeAnswer === option.value}
                            className={`btn rating-choice${activeAnswer === option.value ? " is-selected" : ""}`}
                            key={option.value}
                            onClick={() => handleAnswerClick(option.value)}
                            type="button"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
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
                        {activeAnswer === null ? "Skip for now" : "Next item"}
                      </button>
                    </nav>
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

                <p
                  aria-live="polite"
                  className="export-message text-center mt-3 mb-0"
                >
                  {exportMessage}
                </p>
                <p className="privacy-note text-center mt-3 mb-0">
                  Your ratings stay in this browser session. Export a copy before
                  leaving.
                </p>
              </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
