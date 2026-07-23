/**
 * Interrupteur 48×28 — maquette « Détail de la transaction » (statut pointée).
 * `SwitchLigne` reprend la mise en page complète : titre, description, switch
 * aligné à droite, séparé par une hairline.
 */

type PropsSwitch = {
  actif: boolean;
  onChange: (actif: boolean) => void;
  desactive?: boolean;
  label: string;
};

export function Switch({ actif, onChange, desactive = false, label }: PropsSwitch) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      disabled={desactive}
      className={"afi-switch" + (actif ? " afi-switch--on" : "")}
      onClick={() => onChange(!actif)}
    >
      <span className="afi-switch__knob" />
    </button>
  );
}

type PropsLigne = PropsSwitch & {
  titre: string;
  description?: string;
};

export function SwitchLigne({ titre, description, ...reste }: PropsLigne) {
  return (
    <div className="afi-switch-ligne">
      <div style={{ flex: 1 }}>
        <div className="afi-switch-ligne__titre">{titre}</div>
        {description && <div className="afi-switch-ligne__desc">{description}</div>}
      </div>
      <Switch {...reste} />
    </div>
  );
}