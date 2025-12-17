import React from 'react'
import { DSFormPanel, DSTextField } from '../ds-forms'

export function BasicFormPlayground() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
  })
  const [submitted, setSubmitted] = React.useState(null)

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DSFormPanel
      title="Formulario demo"
      footer={
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={() => setSubmitted(form)}>
            Guardar
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setForm({ name: '', email: '' })
              setSubmitted(null)
            }}
          >
            Limpiar
          </button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: '10px' }}>
        <DSTextField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Escribe un nombre"
          help="Usa tokens de tema para estilos."
        />
        <DSTextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="email@demo.com"
        />
        {submitted ? (
          <div className="ds-pill">
            <strong>Guardado:</strong> {submitted.name} · {submitted.email}
          </div>
        ) : null}
      </div>
    </DSFormPanel>
  )
}
