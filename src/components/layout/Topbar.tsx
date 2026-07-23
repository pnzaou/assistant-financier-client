/**
 * Barre supérieure (78px) : titre + sous-titre à gauche, actions à droite.
 *
 * La maquette montre « Rechercher une transaction… » à cet endroit, mais l'API
 * n'expose aucune recherche plein texte (`GET /transactions` ne filtre que par
 * compte, catégorie et période). Le champ n'est donc pas implémenté ; la zone
 * `actions` reste libre pour une recherche côté client si on la décide plus tard.
 */

type Props = {
  titre: string;
  sousTitre?: string;
  actions?: React.ReactNode;
};

export function Topbar({ titre, sousTitre, actions }: Props) {
  return (
    <header className="afi-topbar">
      <div>
        <div className="afi-topbar__titre">{titre}</div>
        {sousTitre && <div className="afi-topbar__sous-titre">{sousTitre}</div>}
      </div>
      {actions && <div className="afi-topbar__actions">{actions}</div>}
    </header>
  );
}