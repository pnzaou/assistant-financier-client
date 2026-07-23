/**
 * Saisie de montant avec la devise en suffixe.
 *
 * Contrat API : le montant est TOUJOURS positif ; le sens vient du `type`
 * (DEPENSE / REVENU). Ce composant refuse donc le signe moins à la saisie.
 *
 * La valeur reste une chaîne : un champ contrôlé en `number` empêcherait de
 * taper « 12, » ou de vider le champ. La conversion se fait à la soumission.
 */

type Props = {
  id: string;
  label: string;
  valeur: string;
  onChange: (valeur: string) => void;
  devise: string;
  requis?: boolean;
  erreur?: string;
  aide?: string;
  desactive?: boolean;
  placeholder?: string;
};

/** XOF n'a pas de décimales ; les autres devises en acceptent deux. */
function nettoyer(saisie: string, devise: string): string {
  const sansDecimale = devise === "XOF";
  // On ne garde que chiffres et séparateur décimal, jamais de signe.
  let valeur = saisie.replace(sansDecimale ? /[^\d]/g : /[^\d.,]/g, "");
  if (sansDecimale) return valeur;

  valeur = valeur.replace(",", ".");
  const parties = valeur.split(".");
  if (parties.length > 2) valeur = `${parties[0]}.${parties.slice(1).join("")}`;

  const [entier, decimales] = valeur.split(".");
  if (decimales !== undefined) return `${entier}.${decimales.slice(0, 2)}`;
  return valeur;
}

export function MontantInput({
  id,
  label,
  valeur,
  onChange,
  devise,
  requis = false,
  erreur,
  aide,
  desactive = false,
  placeholder,
}: Props) {
  return (
    <div>
      <label className="afi-lbl" htmlFor={id}>
        {label} {requis && <span className="afi-req">*</span>}
      </label>
      <div className="afi-amtwrap">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={"afi-fld" + (erreur ? " afi-fld--erreur" : "")}
          value={valeur}
          disabled={desactive}
          placeholder={placeholder ?? (devise === "XOF" ? "0" : "0,00")}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined}
          onChange={(e) => onChange(nettoyer(e.target.value, devise))}
        />
        <span className="afi-amtwrap__cur">{devise === "XOF" ? "FCFA" : devise}</span>
      </div>
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