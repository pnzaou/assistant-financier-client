import { create } from "zustand";
import { envoyerMessageChatbot } from "../lib/chatbot";
import { messageErreur } from "../lib/api";
import { enregistrerReinitialisation } from "./authStore";
import type { MessageChat } from "../lib/types";

/**
 * Fil de conversation avec l'assistant, ÉPHÉMÈRE côté client.
 *
 * Le serveur gère sa propre mémoire (en RAM, 12 derniers messages) mais ne
 * l'expose par aucune route GET : au rechargement de page, le fil affiché
 * repart donc de zéro. C'est assumé — voir la note de conception dans l'écran.
 *
 * On n'envoie qu'un message brut : le serveur reconstruit contexte financier
 * et historique à partir de l'utilisateur connecté.
 */

/** id unique et stable pour les clés React (crypto.randomUUID dispo partout). */
function nouvelId(): string {
  return crypto.randomUUID();
}

const MESSAGE_ACCUEIL: MessageChat = {
  id: "accueil",
  role: "assistant",
  contenu:
    "Bonjour ! Je suis votre assistant financier. Posez-moi une question sur vos " +
    "comptes, vos dépenses ou vos habitudes — par exemple « Combien ai-je dépensé " +
    "ce mois-ci ? ».",
};

interface EtatChatbot {
  messages: MessageChat[];
  /** Vrai pendant que l'assistant « réfléchit » → bulle « écrit… ». */
  envoi: boolean;

  envoyer: (texte: string) => Promise<void>;
  reinitialiser: () => void;
}

const etatInitial = {
  messages: [MESSAGE_ACCUEIL],
  envoi: false,
};

export const useChatbotStore = create<EtatChatbot>()((set, get) => ({
  ...etatInitial,

  envoyer: async (texte) => {
    const message = texte.trim();
    // Un envoi vide déclencherait un 400 côté serveur ; on l'arrête ici. On
    // bloque aussi les envois concurrents tant qu'une réponse est en vol.
    if (message === "" || get().envoi) return;

    const bulleUtilisateur: MessageChat = {
      id: nouvelId(),
      role: "utilisateur",
      contenu: message,
    };

    // Affichage optimiste : le message de l'utilisateur apparaît tout de suite.
    set((etat) => ({ messages: [...etat.messages, bulleUtilisateur], envoi: true }));

    try {
      const { message: reponse } = await envoyerMessageChatbot(message);
      set((etat) => ({
        messages: [
          ...etat.messages,
          { id: nouvelId(), role: "assistant", contenu: reponse },
        ],
        envoi: false,
      }));
    } catch (err) {
      // Rappel : une panne Grok ou une clé absente reviennent en 200 avec une
      // phrase d'excuse — ce catch ne se déclenche donc que sur une vraie
      // erreur réseau ou une session expirée. On l'affiche comme une bulle
      // d'erreur plutôt que de bloquer toute la conversation.
      set((etat) => ({
        messages: [
          ...etat.messages,
          {
            id: nouvelId(),
            role: "assistant",
            contenu: messageErreur(
              err,
              "Je n'ai pas pu joindre le service. Vérifiez votre connexion et réessayez.",
            ),
            erreur: true,
          },
        ],
        envoi: false,
      }));
    }
  },

  reinitialiser: () => set({ messages: [MESSAGE_ACCUEIL], envoi: false }),
}));

// Purge à la déconnexion, comme les autres stores : le fil d'un utilisateur ne
// doit pas rester affiché au suivant.
enregistrerReinitialisation(() => useChatbotStore.getState().reinitialiser());

// ── Sélecteurs ───────────────────────────────────────────────────
export const useMessagesChat = () => useChatbotStore((s) => s.messages);
export const useEnvoiChat = () => useChatbotStore((s) => s.envoi);