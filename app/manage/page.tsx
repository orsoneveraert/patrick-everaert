import { artworks, collections, getCollectionWorks } from "../../lib/artworks";

export default function ManagePage() {
  return (
    <main className="manage-page">
      <header className="manage-header">
        <div>
          <p className="manage-kicker">Local content back-office</p>
          <h1>Patrick Everaert — Artwork index</h1>
          <p>
            The editable source of truth is <code>data/artworks.json</code>.
            Source order is explicit, stable and retained from the scraped
            portfolio.
          </p>
        </div>
        <a href="/">Return to museum</a>
      </header>

      <section className="manage-summary" aria-label="Dataset summary">
        <div>
          <strong>{artworks.length}</strong>
          <span>works</span>
        </div>
        <div>
          <strong>{new Set(artworks.map((work) => work.year)).size}</strong>
          <span>years represented</span>
        </div>
        <div>
          <strong>{collections.length}</strong>
          <span>named collections</span>
        </div>
      </section>

      <section className="collection-cards">
        {collections.map((collection) => (
          <article key={collection.id}>
            <span>{getCollectionWorks(collection.id).length} works</span>
            <h2>{collection.label}</h2>
            <p>{collection.note}</p>
            <code>{collection.id}</code>
          </article>
        ))}
      </section>

      <section className="manage-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>ID</th>
              <th>Work</th>
              <th>Year</th>
              <th>Dimensions</th>
              <th>Material</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((work) => (
              <tr key={work.id}>
                <td>{String(work.sourceOrder).padStart(3, "0")}</td>
                <td>
                  <code>{work.id}</code>
                </td>
                <td>{work.title}</td>
                <td>{work.year}</td>
                <td>{work.physical_dimensions}</td>
                <td>{work.material}</td>
                <td>
                  <a href={work.source_url} target="_blank" rel="noreferrer">
                    Attribution ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
