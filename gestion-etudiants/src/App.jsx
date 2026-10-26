import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_STUDENTS_API || 'http://localhost/gestion-etudiants/api/students.php'
const emptyForm = { name: '', email: '', program: 'Informatique', year: 'L1', status: 'Actif' }

async function request(path = '', options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || `Erreur serveur (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [sortAscending, setSortAscending] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState(emptyForm)

  async function loadStudents() {
    setLoading(true)
    setError('')
    try {
      setStudents(await request())
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStudents() }, [])

  const visibleStudents = useMemo(() => students
    .filter((student) => `${student.name} ${student.email} ${student.program}`.toLowerCase().includes(query.toLowerCase()))
    .filter((student) => filter === 'Tous' || student.status === filter)
    .sort((first, second) => sortAscending
      ? first.name.localeCompare(second.name, 'fr')
      : second.name.localeCompare(first.name, 'fr')),
  [students, query, filter, sortAscending])

  const activeCount = students.filter((student) => student.status === 'Actif').length
  const waitingCount = students.filter((student) => student.status === 'En attente').length
  const programCount = new Set(students.map((student) => student.program)).size

  function openForm(student = null) {
    setEditingStudent(student)
    setForm(student ? { ...student } : emptyForm)
    setError('')
    setIsFormOpen(true)
  }

  async function saveStudent(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = await request(editingStudent ? `?id=${editingStudent.id}` : '', {
        method: editingStudent ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      setStudents((current) => editingStudent
        ? current.map((student) => student.id === saved.id ? saved : student)
        : [...current, saved])
      setIsFormOpen(false)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Supprimer ${student.name} de la liste ?`)) return
    setError('')
    try {
      await request(`?id=${student.id}`, { method: 'DELETE' })
      setStudents((current) => current.filter((item) => item.id !== student.id))
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#accueil"><span className="brand-mark">S</span><span>Sekoly<span className="brand-dot">.</span></span></a>
        <div className="nav-caption">ESPACE DE TRAVAIL</div>
        <nav aria-label="Navigation principale"><a className="nav-item active" href="#etudiants"><span className="nav-icon">▦</span>Étudiants</a></nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-dot" /><div><strong>Besoin d’aide ?</strong><small>Consultez le centre d’assistance</small></div><span aria-hidden="true">↗</span></div>
          <button className="profile-button" type="button"><span className="avatar admin-avatar">AD</span><span className="profile-copy"><strong>Admin Sekoly</strong><small>Administrateur</small></span><span className="profile-menu">···</span></button>
        </div>
      </aside>

      <main className="main-content" id="etudiants">
        <header className="topbar"><div className="breadcrumb">Espace de travail <span>/</span> <strong>Étudiants</strong></div><div className="topbar-right"><span className="term-label">Année universitaire</span><span className="term-value">2025–2026</span></div></header>
        <section className="page-heading"><div><div className="eyebrow">GESTION ACADÉMIQUE</div><h1>Étudiants</h1><p>Gérez les inscriptions et suivez votre communauté étudiante.</p></div><button className="primary-button" type="button" onClick={() => openForm()}><span>＋</span> Ajouter un étudiant</button></section>

        {error && <div className="notice error-notice" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')}>Fermer</button></div>}
        <section className="stats-grid" aria-label="Statistiques des étudiants">
          <article className="stat-card"><div className="stat-top"><span>Total étudiants</span><span className="stat-symbol purple">♙</span></div><div className="stat-value">{students.length}</div><div className="stat-note">dossiers enregistrés</div></article>
          <article className="stat-card"><div className="stat-top"><span>Étudiants actifs</span><span className="stat-symbol green">✓</span></div><div className="stat-value">{activeCount}</div><div className="stat-note">inscriptions confirmées</div></article>
          <article className="stat-card"><div className="stat-top"><span>En attente</span><span className="stat-symbol amber">◷</span></div><div className="stat-value">{waitingCount}</div><div className="stat-note">dossiers à vérifier</div></article>
          <article className="stat-card"><div className="stat-top"><span>Programmes</span><span className="stat-symbol blue">◇</span></div><div className="stat-value">{programCount}</div><div className="stat-note">filières représentées</div></article>
        </section>

        <section className="student-panel">
          <div className="panel-heading"><div><h2>Liste des étudiants</h2><p>Retrouvez et gérez les dossiers de vos étudiants.</p></div><button type="button" className="export-button" onClick={() => window.print()}><span>⇩</span> Imprimer</button></div>
          <div className="table-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un étudiant..." aria-label="Rechercher un étudiant" /></label><div className="filter-group" aria-label="Filtrer par statut">{['Tous', 'Actif', 'En attente', 'Inactif'].map((status) => <button key={status} type="button" className={filter === status ? 'filter-button selected' : 'filter-button'} onClick={() => setFilter(status)}>{status}</button>)}</div><button className="sort-button" type="button" onClick={() => setSortAscending((current) => !current)} aria-label={`Trier par nom ${sortAscending ? 'décroissant' : 'croissant'}`}>↕ <span>Nom {sortAscending ? 'A–Z' : 'Z–A'}</span></button></div>
          <div className="table-scroll"><table><thead><tr><th>ÉTUDIANT</th><th>FILIÈRE</th><th>NIVEAU</th><th>STATUT</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
            {loading && <tr><td className="empty-state" colSpan="5">Chargement des étudiants…</td></tr>}
            {!loading && visibleStudents.map((student, index) => <tr key={student.id}><td><div className="student-cell"><span className={`avatar avatar-${index % 5}`}>{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{student.name}</strong><small>{student.email}</small></span></div></td><td><span className="program-cell"><i />{student.program}</span></td><td><span className="year-pill">{student.year}</span></td><td><span className={`status-pill ${student.status === 'Actif' ? 'status-active' : student.status === 'Inactif' ? 'status-inactive' : 'status-pending'}`}><i />{student.status}</span></td><td><div className="row-actions"><button type="button" aria-label={`Modifier ${student.name}`} onClick={() => openForm(student)}>✎</button><button type="button" aria-label={`Supprimer ${student.name}`} onClick={() => deleteStudent(student)}>⌫</button></div></td></tr>)}
            {!loading && visibleStudents.length === 0 && <tr><td className="empty-state" colSpan="5">Aucun étudiant ne correspond à cette recherche.</td></tr>}
          </tbody></table></div>
          <footer className="table-footer"><span>Affichage de <strong>{visibleStudents.length ? 1 : 0}–{visibleStudents.length}</strong> sur <strong>{students.length}</strong> étudiants</span><button type="button" className="refresh-button" onClick={loadStudents}>Actualiser</button></footer>
        </section>
        <footer className="page-footer"><span>© 2026 Sekoly. Tous droits réservés.</span><span>Besoin d’aide ? <a href="mailto:support@campus.mg">Contacter le support</a></span></footer>
      </main>

      {isFormOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false) }}><section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">DOSSIER ÉTUDIANT</div><h2 id="modal-title">{editingStudent ? 'Modifier un étudiant' : 'Ajouter un étudiant'}</h2></div><button type="button" className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Fermer">×</button></div><form onSubmit={saveStudent}><label>Nom complet<input required maxLength="120" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex. Aina Rakoto" /></label><label>Adresse e-mail<input required type="email" maxLength="190" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nom@univ.mg" /></label><div className="form-row"><label>Filière<input required maxLength="100" value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} placeholder="Ex. Informatique" /></label><label>Niveau<select value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })}>{['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'].map((year) => <option key={year}>{year}</option>)}</select></label></div><label>Statut<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Actif</option><option>En attente</option><option>Inactif</option></select></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setIsFormOpen(false)}>Annuler</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Enregistrement…' : editingStudent ? 'Enregistrer' : 'Ajouter l’étudiant'}</button></div></form></section></div>}
    </div>
  )
}

export default App
