# Stores (Zustand)

L'état global de l'app. Pas de `Provider`, pas de prop drilling : on importe le
hook là où on en a besoin.

```tsx
import { useUtilisateur, useComptesStore } from "../stores";
```

## Règle n°1 — toujours passer par un sélecteur

```tsx
const utilisateur = useAuthStore((s) => s.utilisateur); // ✅ re-rendu si l'utilisateur change
const { utilisateur } = useAuthStore();                 // ❌ re-rendu à CHAQUE changement du store
```

⚠️ **Un sélecteur ne doit jamais construire un nouvel objet/tableau** — Zustand v5
compare par référence, un nouveau tableau à chaque rendu = boucle infinie.

```tsx
useCategoriesStore((s) => s.categories.filter((c) => c.type === "DEPENSE")); // ❌
useCategoriesDepense();                                                     // ✅ précalculé
```

Les sélecteurs courants sont déjà exportés (`useUtilisateur`, `useComptes`,
`useSoldes`…). Si un dérivé manque, le calculer **dans le store au moment du
`set`**, pas dans le sélecteur.

## Règle n°2 — appeler les actions hors composant

Les actions ne changent jamais de référence, donc pas besoin de les sélectionner :

```tsx
await useTransactionsStore.getState().creer({ ... });
```

## Les stores

| Store | Contenu | Chargement |
|---|---|---|
| `authStore` | `utilisateur`, `chargement` | `chargerSession()` — déjà appelé au démarrage par `<AuthProvider>` |
| `comptesStore` | `comptes` | `charger()` / `chargerSiNecessaire()` |
| `categoriesStore` | `categories`, `depenses`, `revenus`, `parId` | `chargerSiNecessaire()` — données système, un seul appel par session |
| `transactionsStore` | `items`, `page`, `total`, `filtres` | `charger()`, `definirFiltres()`, `allerPage()` |
| `dashboardStore` | `soldes`, `depenses`, `periode` | `charger()` — tire les 2 endpoints en parallèle |

## Ce qui est automatique

- **Session** : `<AuthProvider>` appelle `GET /auth/moi` au démarrage. Un 401 en
  cours de route déclenche un refresh ; si le refresh échoue, `utilisateur`
  repasse à `null` et `<ProtectedRoute>` redirige vers `/connexion`.
- **Déconnexion** : tous les stores de données sont vidés (pas de fuite entre
  deux comptes).
- **Soldes** : créer / modifier / supprimer une transaction recharge
  automatiquement `comptesStore` et `dashboardStore` — mais seulement s'ils
  avaient déjà été chargés.

## Erreurs

- Les **lectures** stockent le message dans `erreur` → à afficher tel quel.
- Les **écritures** (`creer`, `modifier`, `connecter`…) laissent l'`ApiError`
  remonter, pour que le formulaire récupère le détail champ par champ :

```tsx
try {
  await useComptesStore.getState().creer({ nom, type });
} catch (err) {
  if (err instanceof ApiError) setErreurs(err.parChamp());
}
```

## Exemple complet

```tsx
function Historique() {
  const items = useTransactions();
  const chargement = useTransactionsStore((s) => s.chargement);

  useEffect(() => {
    void useTransactionsStore.getState().charger();
    void useCategoriesStore.getState().chargerSiNecessaire();
  }, []);

  if (chargement) return <p>Chargement…</p>;
  return <ul>{items.map((t) => <LigneTransaction key={t.id} transaction={t} />)}</ul>;
}
```
