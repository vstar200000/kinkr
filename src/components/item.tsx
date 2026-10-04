import type { ItemData } from "../App.tsx";

interface ItemProps extends ItemData {
  rawName?: string;
  autoFocus?: boolean;
  onNameChange?: (name: string) => void;
  onRemove?: () => void;
}

function Item({
  name,
  description,
  rawName,
  autoFocus,
  onNameChange,
  onRemove,
}: ItemProps) {
  return (
    <article aria-label={name} className="card item-card shadow-sm">
      <div className="card-body">
        {onNameChange ? (
          <>
            <input
              aria-label="Item name"
              autoFocus={autoFocus}
              className="form-control item-title-input mb-2"
              maxLength={60}
              onChange={(event) => onNameChange(event.target.value)}
              onFocus={(event) => event.target.select()}
              placeholder="Name your item"
              value={rawName ?? name}
            />
            <div>
              <button
                className="btn btn-link text-danger p-0"
                onClick={onRemove}
                type="button"
              >
                Remove this item
              </button>
            </div>
          </>
        ) : (
          <h2 className="item-title mb-2">{name}</h2>
        )}
        {description && <p className="item-description mb-0">{description}</p>}
      </div>
    </article>
  );
}

export default Item;
