import { useState } from "react";
import type { ItemData } from "../App.tsx";

function Item({
  name,
  description,
  image,
  category,
}: ItemData & { category: string }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <article aria-label={name} className="card item-card shadow-sm">
      {image && !imageUnavailable ? (
        <img
          alt={`Illustration for ${name}`}
          className="item-image"
          onError={() => setImageUnavailable(true)}
          src={image}
        />
      ) : (
        <div aria-hidden="true" className="item-image-placeholder">
          <span className="placeholder-mark">K</span>
        </div>
      )}
      <div className="card-body">
        <p className="eyebrow mb-2">{category}</p>
        <h2 className="item-title mb-2">{name}</h2>
        {description && <p className="item-description mb-0">{description}</p>}
      </div>
    </article>
  );
}

export default Item;
