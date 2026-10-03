import type { ItemData } from "../App.tsx";

function Item({
  name,
  description,
  category,
}: ItemData & { category: string }) {
  return (
    <article aria-label={name} className="card item-card shadow-sm">
      <div className="card-body">
        <p className="eyebrow mb-2">{category}</p>
        <h2 className="item-title mb-2">{name}</h2>
        {description && <p className="item-description mb-0">{description}</p>}
      </div>
    </article>
  );
}

export default Item;
