import { GlypheAfi } from "./layout/icones";

/**
 * Bandeau affiché après création d'une transaction sans catégorie : le serveur
 * a deviné la catégorie à partir du libellé (service de catégorisation, US3).
 *
 * `motCle` est le terme du libellé qui a déclenché la règle. L'API ne le
 * renvoie pas aujourd'hui — la prop est optionnelle et le texte s'adapte.
 */

type Props = {
  nomCategorie: string;
  motCle?: string;
  onModifier: () => void;
};

export function BandeauSuggestion({ nomCategorie, motCle, onModifier }: Props) {
  return (
    <div className="afi-sugg" role="status">
      <div className="afi-sugg__ic">
        <GlypheAfi taille={18} />
      </div>
      <div className="afi-sugg__txt">
        Transaction enregistrée. Catégorie suggérée : <b>{nomCategorie}</b>
        {motCle && <> — d'après «&nbsp;{motCle}&nbsp;»</>}.
      </div>
      <button type="button" className="afi-chip" onClick={onModifier}>
        Modifier
      </button>
    </div>
  );
}