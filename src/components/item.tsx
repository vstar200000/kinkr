import type { ItemData } from "../App.tsx";

function Item({ name, description }: ItemData) {
  return (
    <article aria-label={name} className="card item-card shadow-sm">
      <div className="card-body">
        <h2 className="item-title mb-2">{name}</h2>
        {description && <p className="item-description mb-0">{description}</p>}
      </div>
    </article>
  );
}

export default Item;
