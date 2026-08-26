import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    onLogin(email, password)
      .catch((err) => setError(err.message || 'Gagal masuk'))
      .finally(() => setBusy(false))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-surface border border-line rounded-xl p-8 shadow-sm"
      >
        <h1 className="font-serif text-3xl mb-1">Aniata</h1>
        <p className="text-muted text-sm mb-6">Masuk Admin</p>

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-4 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          autoComplete="username"
        />

        <label className="block text-sm font-medium mb-1">Kata Sandi</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-4 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          autoComplete="current-password"
        />

        {error && <p className="text-rose text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Masuk…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
