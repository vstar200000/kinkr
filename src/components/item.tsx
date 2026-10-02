// A thing to be voted on. very dumb component. Requires a title. Optional: a description, and an image.
function Item({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
}) {
  // Returns a card with the title, and the description.
  // The card's background should be the image, or the default color if no image is provided
  return (
    <>
      <div
        className="item-card"
        style={{ backgroundImage: image ? `url(${image})` : "none" }}
      >
        <div className="item-content">
          <h3 className="item-title">{title}</h3>
          <p className="item-description">{description}</p>
        </div>
      </div>
    </>
  );
}

export default Item;
