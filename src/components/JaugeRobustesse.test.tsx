import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JaugeRobustesse } from "./JaugeRobustesse";

/** La barre de remplissage est le seul élément à porter une largeur en %. */
function barreRemplissage(container: HTMLElement): HTMLElement {
  const barre = container.querySelector<HTMLElement>('div[style*="width"]');
  if (!barre) throw new Error("Barre de remplissage introuvable");
  return barre;
}

describe("JaugeRobustesse", () => {
  it("ne rend rien tant que le champ est vide", () => {
    const { container } = render(<JaugeRobustesse motDePasse="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("juge faible un mot de passe trop court", () => {
    render(<JaugeRobustesse motDePasse="abc" />);
    expect(screen.getByText("Faible")).toBeInTheDocument();
  });

  it("juge faible un mot de passe long mais sans variété", () => {
    // 10 caractères, minuscules seulement : la longueur seule ne suffit pas.
    render(<JaugeRobustesse motDePasse="motdepasse" />);
    expect(screen.getByText("Faible")).toBeInTheDocument();
  });

  it("juge moyen un mot de passe qui mélange casse et chiffres", () => {
    render(<JaugeRobustesse motDePasse="Motdepasse1" />);
    expect(screen.getByText("Moyen")).toBeInTheDocument();
  });

  it("juge robuste un mot de passe long et varié", () => {
    render(<JaugeRobustesse motDePasse="Motdepasse123!" />);
    expect(screen.getByText("Robuste")).toBeInTheDocument();
  });

  it("remplit la barre proportionnellement au score", () => {
    const faible = render(<JaugeRobustesse motDePasse="abc" />);
    expect(barreRemplissage(faible.container).style.width).toBe("0%");
    faible.unmount();

    const robuste = render(<JaugeRobustesse motDePasse="Motdepasse123!" />);
    expect(barreRemplissage(robuste.container).style.width).toBe("100%");
  });

  it("colore le libellé selon le niveau", () => {
    const { rerender } = render(<JaugeRobustesse motDePasse="abc" />);
    expect(screen.getByText("Faible").style.color).toBe("var(--erreur)");

    rerender(<JaugeRobustesse motDePasse="Motdepasse1" />);
    expect(screen.getByText("Moyen").style.color).toBe("var(--alerte)");

    rerender(<JaugeRobustesse motDePasse="Motdepasse123!" />);
    expect(screen.getByText("Robuste").style.color).toBe("var(--succes)");
  });
});
