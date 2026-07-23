/**
 * Segmented control en pilule — maquette « Nouvelle transaction ».
 *
 * Générique sur la valeur : `<Segmented<TypeTransaction> ... />` conserve le
 * typage des options, sans cast dans les écrans.
 */

type Option<T extends string> = {
  valeur: T;
  libelle: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  valeur: T;
  onChange: (valeur: T) => void;
  desactive?: boolean;
  /** Décrit le groupe pour les lecteurs d'écran (ex. « Type de transaction »). */
  label?: string;
};

export function Segmented<T extends string>({
  options,
  valeur,
  onChange,
  desactive = false,
  label,
}: Props<T>) {
  return (
    <div className="afi-seg" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const actif = option.valeur === valeur;
        return (
          <button
            key={option.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            disabled={desactive}
            className={actif ? "afi-seg--on" : undefined}
            onClick={() => onChange(option.valeur)}
          >
            {option.libelle}
          </button>
        );
      })}
    </div>
  );
}