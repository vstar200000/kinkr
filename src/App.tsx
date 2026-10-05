import { useMemo, useState } from "react";
import LandingPage from "./components/LandingPage.tsx";
import RatingIcon from "./components/RatingIcon.tsx";
import { ratingOptions } from "./ratings.ts";
import "./App.css";
import Item from "./components/item.tsx";
import NavMenu from "./components/navMenu.tsx";
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

interface CustomItem {
  id: number;
  category: string;
  name: string;
}

interface AppItem extends ItemData {
  key: string;
  category: string;
  roles: Role[];
  custom?: boolean;
  rawName?: string;
}

const UNTITLED_NAME = "Untitled item";

// Base items keep stable keys; custom items go after their category's own items
function buildItems(customItems: CustomItem[]): AppItem[] {
  let baseIndex = 0;
  return categories.flatMap(
    ({
      category,
      "self-partner": selfPartner = false,
      "giving-receiving": givingReceiving = false,
      "actor-subject": actorSubject = false,
      items: categoryItems,
    }) => {
      const roles = getRoles(selfPartner, givingReceiving, actorSubject);
      const base: AppItem[] = categoryItems.map((item) => ({
        ...item,
        category,
        roles,
        key: `base:${baseIndex++}`,
      }));
      const custom: AppItem[] = customItems
        .filter((customItem) => customItem.category === category)
        .map((customItem) => ({
          name: customItem.name.trim() || UNTITLED_NAME,
          rawName: customItem.name,
          category,
          roles,
          key: `custom:${customItem.id}`,
          custom: true,
        }));
      return [...base, ...custom];
    },
  );
}

const emptyAnswers: ItemAnswers = {
  self: null,
  partner: null,
  giving: null,
  receiving: null,
  actor: null,
  subject: null,
};
const DEFAULT_ANSWER: AnswerLevel = 1;

function getEffectiveAnswer(answer: AnswerLevel | null) {
  return answer ?? DEFAULT_ANSWER;
}

function getLabel(answer: AnswerLevel | null) {
  const effective = getEffectiveAnswer(answer);
  return (
    ratingOptions.find((option) => option.value === effective)?.label ?? null
  );
}

function Checklist({
  listName,
  onNewList,
}: {
  listName: string;
  onNewList: () => void;
}) {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ItemAnswers>>({});
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [nextCustomId, setNextCustomId] = useState(1);
  const [justAddedKey, setJustAddedKey] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

  const items = useMemo(() => buildItems(customItems), [customItems]);
  const getAnswers = (key: string) => answers[key] ?? emptyAnswers;

  const activeItem = items[activeItemIndex];
  const activeRoles = activeItem?.roles ?? [];
  const activeAnswers = activeItem ? getAnswers(activeItem.key) : emptyAnswers;
  const ratedCount = items.filter((item) =>
    item.roles.every((role) => getAnswers(item.key)[role] !== null),
  ).length;
  const isActiveItemRated = activeRoles.every(
    (role) => activeAnswers[role] !== null,
  );

  function handleAnswerClick(role: Role, answer: AnswerLevel) {
    const updatedAnswers = { ...activeAnswers, [role]: answer };

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeItem.key]: updatedAnswers,
    }));
    setExportMessage("");
    if (
      activeRoles.every((activeRole) => updatedAnswers[activeRole] !== null)
    ) {
      setActiveItemIndex((currentIndex) =>
        Math.min(currentIndex + 1, items.length - 1),
      );
    }
  }

  function handleAddItem(category: string) {
    const id = nextCustomId;
    const updatedCustomItems = [
      ...customItems,
      { id, category, name: "New item" },
    ];
    const key = `custom:${id}`;

    setCustomItems(updatedCustomItems);
    setNextCustomId(id + 1);
    setJustAddedKey(key);
    setActiveItemIndex(
      buildItems(updatedCustomItems).findIndex((item) => item.key === key),
    );
    setExportMessage("");
    setIsNavOpen(false);
  }

  function handleRenameItem(name: string) {
    const id = Number(activeItem.key.slice("custom:".length));
    setCustomItems((current) =>
      current.map((item) => (item.id === id ? { ...item, name } : item)),
    );
    setExportMessage("");
  }

  function handleRemoveItem() {
    const id = Number(activeItem.key.slice("custom:".length));
    setCustomItems((current) => current.filter((item) => item.id !== id));
    setAnswers((current) => {
      const rest = { ...current };
      delete rest[activeItem.key];
      return rest;
    });
    setActiveItemIndex((index) => Math.max(index - 1, 0));
    setExportMessage("");
  }

  function handleNavSelect(index: number) {
    setActiveItemIndex(index);
    setExportMessage("");
    setIsNavOpen(false);
  }

  async function exportPng() {
    const date = new Date().toISOString().slice(0, 10);
    try {
      const canvas = renderResultsCanvas(
        items.map((item) => ({
          name: item.name,
          category: item.category,
          roles: item.roles,
          ratings: item.roles.map((role) =>
            getEffectiveAnswer(getAnswers(item.key)[role]),
          ),
        })),
        ratingOptions,
        listName,
      );
      await downloadCanvasPng(canvas, `kinkr-results-${date}.png`);
      setExportMessage("Your PNG results have been downloaded.");
    } catch {
      setExportMessage("Sorry, the PNG could not be created.");
    }
  }

  function exportResults() {
    const exportData = {
      formatVersion: 2,
      ...(listName && { listName }),
      exportedAt: new Date().toISOString(),
      categories: categories.map((category) => {
        const categoryDetails = {
          category: category.category,
          "self-partner": category["self-partner"],
          "giving-receiving": category["giving-receiving"],
          "actor-subject": category["actor-subject"],
        };
        return {
          ...categoryDetails,
          items: items
            .filter((item) => item.category === categoryDetails.category)
            .map((item) => {
              const itemAnswers = getAnswers(item.key);

              return {
                name: item.name,
                ...(item.description && { description: item.description }),
                ...(item.image && { image: item.image }),
                ...(item.custom && { custom: true }),
                rating:
                  item.roles.length > 1
                    ? Object.fromEntries(
                        item.roles.map((role) => [
                          role,
                          getLabel(itemAnswers[role]),
                        ]),
                      )
                    : getLabel(itemAnswers.self),
              };
            }),
        };
      }),
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
          <button
            aria-controls="nav-menu"
            aria-expanded={isNavOpen}
            className="brand brand-button"
            id="top"
            onClick={() => setIsNavOpen((open) => !open)}
            type="button"
          >
            kinkr<span className="brand-period">.</span>
          </button>
          {listName && <h1 className="list-name h5 mb-0">{listName}</h1>}
          <button
            className="btn btn-outline-dark"
            onClick={() => {
              if (window.confirm("Start a new list? Your current ratings will be lost unless you export them.")) {
                onNewList();
              }
            }}
            type="button"
          >
            New list
          </button>
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

      <div className="app-body">
        <NavMenu
          activeIndex={activeItemIndex}
          isOpen={isNavOpen}
          items={items.map((item) => ({
            name: item.name,
            category: item.category,
            dots: item.roles.map(
              (role) =>
                ratingOptions.find(
                  (option) => option.value === getAnswers(item.key)[role],
                ) ?? null,
            ),
          }))}
          onClose={() => setIsNavOpen(false)}
          onAddItem={handleAddItem}
          onSelect={handleNavSelect}
        />
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
                      key={activeItem.key}
                      autoFocus={justAddedKey === activeItem.key}
                      description={activeItem.description}
                      name={activeItem.name}
                      onNameChange={
                        activeItem.custom ? handleRenameItem : undefined
                      }
                      onRemove={
                        activeItem.custom ? handleRemoveItem : undefined
                      }
                      rawName={activeItem.rawName}
                    />

                    <div className="rating-controls mt-auto">
                      <div className="rating-area mt-4">
                        {activeRoles.map((role) => (
                          <div
                            aria-label={
                              activeRoles.length > 1 ? role : undefined
                            }
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
                                    getEffectiveAnswer(activeAnswers[role]) ===
                                    option.value
                                  }
                                  className={`btn rating-choice ${option.className}${getEffectiveAnswer(activeAnswers[role]) === option.value ? " is-selected" : ""}`}
                                  key={option.value}
                                  onClick={() =>
                                    handleAnswerClick(role, option.value)
                                  }
                                  type="button"
                                >
                                  <RatingIcon option={option} size="1.1em" />
                                  <span className="rating-label">{option.label}</span>
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
                            setActiveItemIndex((index) =>
                              Math.max(index - 1, 0),
                            )
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
      </div>
    </main>
  );
}

function App() {
  const [listName, setListName] = useState<string | null>(null);

  if (listName === null) {
    return <LandingPage onStart={setListName} />;
  }

  return <Checklist listName={listName} onNewList={() => setListName(null)} />;
}

export default App;
