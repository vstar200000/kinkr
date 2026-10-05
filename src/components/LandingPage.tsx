import { useState, type ChangeEvent, type FormEvent } from "react";

interface LandingPageProps {
  onStart: (listName: string) => void;
  onImport: (text: string) => void;
}

function LandingPage({ onStart, onImport }: LandingPageProps) {
  const [listName, setListName] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart(listName.trim());
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setImportFile(event.target.files?.[0] ?? null);
    setImportError("");
  }

  async function handleImport() {
    if (!importFile) return;
    try {
      onImport(await importFile.text());
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "The file could not be imported.",
      );
    }
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
        <hr className="my-4" />
        <label className="form-label" htmlFor="import-file">
          Or import a previous export
        </label>
        <div className="input-group">
          <input
            accept=".json,application/json"
            className="form-control"
            id="import-file"
            onChange={handleFileChange}
            type="file"
          />
          <button
            className="btn btn-outline-dark"
            disabled={!importFile}
            onClick={handleImport}
            type="button"
          >
            Import
          </button>
        </div>
        {importError && (
          <p className="text-danger mt-2 mb-0" role="alert">
            {importError}
          </p>
        )}
      </div>
    </main>
  );
}

export default LandingPage;
