import { useState, type FormEvent } from "react";

interface LandingPageProps {
  onStart: (listName: string) => void;
}

function LandingPage({ onStart }: LandingPageProps) {
  const [listName, setListName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart(listName.trim());
  }

  return (
    <main className="app-shell landing d-flex align-items-center">
      <div className="container py-5" style={{ maxWidth: "32rem" }}>
        <div className="brand text-center mb-2">
          kinkr<span className="brand-period">.</span>
        </div>
        <p className="text-center text-secondary mb-4">
          Work through a checklist and rate each item.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="list-name">
            List name <span className="text-secondary">(optional)</span>
          </label>
          <input
            autoFocus
            className="form-control form-control-lg mb-3"
            id="list-name"
            maxLength={60}
            onChange={(event) => setListName(event.target.value)}
            type="text"
            value={listName}
          />
          <button className="btn btn-dark btn-lg w-100" type="submit">
            Start
          </button>
        </form>
      </div>
    </main>
  );
}

export default LandingPage;
