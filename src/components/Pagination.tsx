/**
 * Pagination en offset (l'API renvoie `page`, `limite`, `total`).
 *
 * Affiche au plus 7 boutons : les extrêmes, la fenêtre autour de la page
 * courante, et des ellipses. Sans ça, 142 transactions donneraient 18 boutons.
 */

type Props = {
  page: number;
  limite: number;
  total: number;
  onChange: (page: number) => void;
};

/** Suite de numéros et d'ellipses : [1, "…", 7, 8, 9, "…", 18]. */
function fenetre(courante: number, dernier: number): (number | "…")[] {
  if (dernier <= 7) {
    return Array.from({ length: dernier }, (_, i) => i + 1);
  }
  const pages = new Set([1, dernier, courante, courante - 1, courante + 1]);
  const triees = [...pages].filter((p) => p >= 1 && p <= dernier).sort((a, b) => a - b);

  const avecEllipses: (number | "…")[] = [];
  let precedente = 0;
  for (const p of triees) {
    if (p - precedente > 1) avecEllipses.push("…");
    avecEllipses.push(p);
    precedente = p;
  }
  return avecEllipses;
}

export function Pagination({ page, limite, total, onChange }: Props) {
  const dernier = Math.max(1, Math.ceil(total / limite));
  const debut = total === 0 ? 0 : (page - 1) * limite + 1;
  const fin = Math.min(page * limite, total);

  return (
    <div className="afi-pager">
      <span>
        {debut} – {fin} sur {total} transaction{total > 1 ? "s" : ""}
      </span>

      {dernier > 1 && (
        <div className="afi-pg">
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page <= 1}
            aria-label="Page précédente"
          >
            ‹
          </button>

          {fenetre(page, dernier).map((element, index) =>
            element === "…" ? (
              <span key={`e${index}`} className="afi-pg__ellipse">
                …
              </span>
            ) : (
              <button
                key={element}
                type="button"
                className={element === page ? "afi-pg--on" : undefined}
                aria-current={element === page ? "page" : undefined}
                onClick={() => onChange(element)}
              >
                {element}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page >= dernier}
            aria-label="Page suivante"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}