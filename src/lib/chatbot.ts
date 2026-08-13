import { api } from "./api";

/**
 * Envoie un message à l'assistant. Le serveur reconstruit lui-même le contexte
 * (comptes, transactions récentes) et l'historique de conversation à partir de
 * l'identité de l'utilisateur connecté — on n'envoie donc que le message brut.
 *
 * La réponse est toujours `200 { message }` : même une erreur Grok, une clé
 * absente ou un quota dépassé reviennent comme une phrase d'excuse, pas comme
 * une erreur HTTP. Le seul vrai échec possible est un 400 (message vide), que
 * l'UI empêche en amont, ou un 401 (session expirée), géré par api.ts.
 */
export function envoyerMessageChatbot(message: string): Promise<{ message: string }> {
  return api.post("/chatbot", { message });
}