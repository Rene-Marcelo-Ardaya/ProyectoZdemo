import React, { useState } from 'react'
import {
  DSFormPanel,
  DSTextField,
  DSNumberField,
  DSComboBox,
  DSDateField,
  DSTimeField,
  DSCheckbox,
  DSRadioGroup,
  DSCheckboxGroup,
} from '../ds-forms'
import { DSTabs, DSAccordion, DSPanel } from '../ds-layout'

export function FormsPage() {
  const [form, setForm] = useState({
    name: '',
    age: 28,
    role: 'admin',
    langs: ['js'],
    country: 'mx',
    birth: '',
    time: '',
    agree: false,
  })

  const setField = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }))

  return (
    <DSTabs
      tabs={[
        {
          key: 'main',
          label: 'Formulario',
          content: (
            <DSFormPanel
              title="Ejemplo FormPage"
              footer={
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ds-btn ds-btn--primary">Guardar</button>
                  <button className="ds-btn ds-btn--ghost">Cancelar</button>
                </div>
              }
            >
              <div style={{ display: 'grid', gap: '10px' }}>
                <DSTextField
                  label="Nombre"
                  name="name"
                  value={form.name}
                  onChange={setField('name')}
                  help="Campo requerido"
                  error={!form.name ? 'Obligatorio' : ''}
                />
                <DSNumberField
                  label="Edad"
                  name="age"
                  value={form.age}
                  onChange={setField('age')}
                  min={0}
                  max={120}
                />
                <DSComboBox
                  label="Pais"
                  name="country"
                  value={form.country}
                  onChange={setField('country')}
                  options={[
                    { label: 'Argentina', value: 'ar' },
                    { label: 'Mexico', value: 'mx' },
                    { label: 'Espana', value: 'es' },
                  ]}
                />
                <DSDateField
                  label="Nacimiento"
                  name="birth"
                  value={form.birth}
                  onChange={setField('birth')}
                  help="Picker con calendario"
                  error={!form.birth ? 'Requerido' : ''}
                />
                <DSTimeField
                  label="Hora"
                  name="time"
                  value={form.time}
                  onChange={setField('time')}
                  help="Selecciona slot de hora"
                  error={!form.time ? 'Requerido' : ''}
                />
                <DSRadioGroup
                  label="Rol"
                  name="role"
                  value={form.role}
                  onChange={setField('role')}
                  options={[
                    { label: 'Admin', value: 'admin' },
                    { label: 'Editor', value: 'editor' },
                    { label: 'Viewer', value: 'viewer' },
                  ]}
                />
                <DSCheckboxGroup
                  label="Lenguajes"
                  name="langs"
                  values={form.langs}
                  onChange={setField('langs')}
                  options={[
                    { label: 'JS', value: 'js' },
                    { label: 'TS', value: 'ts' },
                    { label: 'Python', value: 'py' },
                  ]}
                />
                <DSCheckbox label="Acepto terminos" name="agree" checked={form.agree} onChange={setField('agree')} />
              </div>
            </DSFormPanel>
          ),
        },
        {
          key: 'accordion',
          label: 'Accordion',
          content: (
            <DSAccordion
              items={[
                {
                  key: 'section1',
                  title: 'Detalle',
                  content: (
                    <DSPanel title="Valores actuales">
                      <pre style={{ margin: 0 }}>{JSON.stringify(form, null, 2)}</pre>
                    </DSPanel>
                  ),
                },
                {
                  key: 'section2',
                  title: 'Notas',
                  content: <div className="ds-placeholder">Placeholder acorde al tema activo</div>,
                },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
