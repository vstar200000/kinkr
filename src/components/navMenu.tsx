import { useEffect, useRef } from "react";
import type { RatingOption } from "../ratings.ts";
import RatingIcon from "./RatingIcon.tsx";

interface NavItem {
  name: string;
  category: string;
  dots: (RatingOption | null)[];
}

interface NavMenuProps {
  items: NavItem[];
  activeIndex: number;
  isOpen: boolean;
  onSelect: (index: number) => void;
  onAddItem: (category: string) => void;
  onClose: () => void;
}

function NavMenu({
  items,
  activeIndex,
  isOpen,
  onSelect,
  onAddItem,
  onClose,
}: NavMenuProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const groups: {
    category: string;
    entries: { item: NavItem; index: number }[];
  }[] = [];
  items.forEach((item, index) => {
    const last = groups[groups.length - 1];
    if (last && last.category === item.category) {
      last.entries.push({ item, index });
    } else {
      groups.push({ category: item.category, entries: [{ item, index }] });
    }
  });
  const activeCategory = items[activeIndex]?.category;

  return (
    <>
      {isOpen && (
        <div aria-hidden="true" className="nav-backdrop" onClick={onClose} />
      )}
      <nav
        aria-label="Categories and items"
        className={`nav-menu${isOpen ? " is-open" : ""}`}
        id="nav-menu"
      >
        {groups.map((group, groupIndex) => (
          <section key={`${group.category}-${groupIndex}`}>
            <h2
              className={`nav-category${group.category === activeCategory && group.entries.some((e) => e.index === activeIndex) ? " is-active" : ""}`}
            >
              {group.category}
            </h2>
            <ul className="nav-list">
              {group.entries.map(({ item, index }) => (
                <li key={index}>
                  <button
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={`nav-item${index === activeIndex ? " is-active" : ""}`}
                    onClick={() => onSelect(index)}
                    ref={index === activeIndex ? activeRef : undefined}
                    type="button"
                  >
                    <span className="nav-dots" aria-hidden="true">
                      {item.dots.map((rating, dotIndex) => (
                        <RatingIcon
                          key={dotIndex}
                          option={rating}
                          size="1rem"
                        />
                      ))}
                    </span>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="nav-add"
              onClick={() => onAddItem(group.category)}
              type="button"
            >
              + New Item
            </button>
          </section>
        ))}
      </nav>
    </>
  );
}

export default NavMenu;
