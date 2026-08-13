import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useChatbotStore } from "../stores";
import { IconeEnvoyer } from "../components/layout/icones";

/**
 * Écran de conversation avec l'assistant financier.
 *
 * Fil ÉPHÉMÈRE : le serveur garde sa propre mémoire (en RAM) mais ne l'expose
 * par aucune route GET. Recharger la page repart donc d'un fil vide — c'est
 * assumé, et le seul comportement cohérent avec une mémoire serveur volatile.
 *
 * Le serveur reconstruit contexte financier et historique à partir de
 * l'utilisateur connecté : on n'envoie qu'un message brut.
 */

const SUGGESTIONS = [
  "Combien ai-je dépensé ce mois-ci ?",
  "Quelles sont mes plus grosses dépenses ?",
  "Quel est mon solde total ?",
];

export function Assistant() {
  const messages = useChatbotStore((e) => e.messages);
  const envoi = useChatbotStore((e) => e.envoi);
  const envoyer = useChatbotStore((e) => e.envoyer);

  const [texte, setTexte] = useState("");
  const filRef = useRef<HTMLDivElement>(null);
  const champRef = useRef<HTMLTextAreaElement>(null);

  // Autoscroll vers le bas à chaque nouveau message ou pendant la frappe.
  useEffect(() => {
    const fil = filRef.current;
    if (fil) fil.scrollTop = fil.scrollHeight;
  }, [messages, envoi]);

  function soumettre() {
    if (texte.trim() === "" || envoi) return;
    void envoyer(texte);
    setTexte("");
    // Rendre la main au champ pour enchaîner les messages sans re-cliquer.
    champRef.current?.focus();
  }

  function gererTouche(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Entrée envoie ; Maj+Entrée insère un saut de ligne.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      soumettre();
    }
  }

  function utiliserSuggestion(suggestion: string) {
    if (envoi) return;
    void envoyer(suggestion);
    champRef.current?.focus();
  }

  // Les suggestions n'apparaissent qu'au tout début, quand seul le message
  // d'accueil est présent : passé le premier échange, elles encombreraient.
  const conversationVierge = messages.length <= 1;

  return (
    <div className="afi-chat">
      <div className="afi-chat__fil" ref={filRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "afi-bulle " +
              (m.erreur
                ? "afi-bulle--erreur"
                : m.role === "utilisateur"
                  ? "afi-bulle--utilisateur"
                  : "afi-bulle--assistant")
            }
          >
            {m.contenu}
          </div>
        ))}

        {envoi && (
          <div className="afi-typing" aria-label="L'assistant rédige une réponse">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {conversationVierge && !envoi && (
        <div className="afi-suggest">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => utiliserSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="afi-saisie">
        <textarea
          ref={champRef}
          rows={1}
          placeholder="Posez une question sur vos finances…"
          value={texte}
          disabled={envoi}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={gererTouche}
          aria-label="Votre message"
        />
        <button
          type="button"
          className="afi-envoi"
          onClick={soumettre}
          disabled={envoi || texte.trim() === ""}
          aria-label="Envoyer"
        >
          <IconeEnvoyer />
        </button>
      </div>
    </div>
  );
}