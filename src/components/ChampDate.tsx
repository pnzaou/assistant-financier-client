/* eslint-disable react-refresh/only-export-components -- aujourdhui est partagé avec les formulaires. */

/**
 * Champ date natif. L'API attend et renvoie `AAAA-MM-JJ`, ce qui est
 * exactement le format de `<input type="date">` : aucune conversion.
 */

type Props = {
  id: string;
  label: string;
  valeur: string;
  onChange: (valeur: string) => void;
  requis?: boolean;
  erreur?: string;
  aide?: string;
  desactive?: boolean;
  max?: string;
};

/** Date du jour au format `AAAA-MM-JJ`, en heure locale (pas UTC). */
export function aujourdhui(): string {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

export function ChampDate({
  id,
  label,
  valeur,
  onChange,
  requis = false,
  erreur,
  aide,
  desactive = false,
  max,
}: Props) {
  return (
    <div>
      <label className="afi-lbl" htmlFor={id}>
        {label} {requis && <span className="afi-req">*</span>}
      </label>
      <input
        id={id}
        type="date"
        className={"afi-fld" + (erreur ? " afi-fld--erreur" : "")}
        value={valeur}
        max={max}
        disabled={desactive}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {erreur ? (
        <div className="afi-msg-erreur" id={`${id}-erreur`}>
          {erreur}
        </div>
      ) : aide ? (
        <div className="afi-hint" id={`${id}-aide`}>
          {aide}
        </div>
      ) : null}
    </div>
  );
}