import type { SelectHTMLAttributes } from "react";

/**
 * Sélecteur applicatif : label + <select> stylé + erreur ou aide.
 * La flèche est dessinée en CSS (`select.afi-fld`), pas par le navigateur.
 */

type Option = {
  valeur: string;
  libelle: string;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  id: string;
  label: string;
  options: Option[];
  /** Entrée vide en tête de liste (ex. « Laisser l'assistant deviner »). */
  optionVide?: string;
  requis?: boolean;
  erreur?: string;
  aide?: string;
};

export function Select({
  id,
  label,
  options,
  optionVide,
  requis = false,
  erreur,
  aide,
  ...reste
}: Props) {
  return (
    <div>
      <label className="afi-lbl" htmlFor={id}>
        {label} {requis && <span className="afi-req">*</span>}
      </label>
      <select
        id={id}
        className={"afi-fld" + (erreur ? " afi-fld--erreur" : "")}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined}
        {...reste}
      >
        {optionVide !== undefined && <option value="">{optionVide}</option>}
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
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