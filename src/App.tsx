import { useEffect, useState } from 'react'
import './App.css'

// Toujours passer par la variable injectée par le compose (jamais d'URL en dur).
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

type EtatApi = 'verification' | 'ok' | 'hors-ligne'

interface ReponseHealth {
  status?: string
  db?: string
  categories?: number
}

function App() {
  const [etat, setEtat] = useState<EtatApi>('verification')
  const [categories, setCategories] = useState<number | null>(null)

  useEffect(() => {
    let annule = false
    fetch(`${API}/health`, { credentials: 'include' })
      .then((reponse) => reponse.json() as Promise<ReponseHealth>)
      .then((data) => {
        if (annule) return
        setEtat(data.db === 'ok' ? 'ok' : 'hors-ligne')
        setCategories(data.categories ?? null)
      })
      .catch(() => {
        if (!annule) setEtat('hors-ligne')
      })
    return () => {
      annule = true
    }
  }, [])

  const libelleEtat: Record<EtatApi, string> = {
    verification: 'Vérification de la connexion à l’API…',
    ok: 'API connectée',
    'hors-ligne': 'API injoignable',
  }

  return (
    <main className="app">
      <div className="logo" aria-hidden="true">
        📈
      </div>
      <h1>Assistant Financier</h1>
      <p className="tagline">
        Le socle du front est en place. À partir d’ici : inscription, connexion,
        puis tableau de bord des finances.
      </p>

      <div className={`statut statut--${etat}`}>
        <span className="pastille" aria-hidden="true" />
        <span>{libelleEtat[etat]}</span>
      </div>

      {etat === 'ok' && categories !== null && (
        <p className="detail">
          {categories} catégories système chargées côté serveur.
        </p>
      )}
      {etat === 'hors-ligne' && (
        <p className="detail">
          Lance l’API : depuis <code>server/</code>, <code>docker compose up</code>.
        </p>
      )}

      <p className="api">
        API : <code>{API}</code>
      </p>
    </main>
  )
}

export default App
