import React from 'react'
import { DSFormPanel } from './DSFormPanel'
import { DSTextField } from './DSTextField'
import { DSNumberField } from './DSNumberField'
import { DSTextArea } from './DSTextArea'
import { DSPasswordField } from './DSPasswordField'
import { DSCheckbox } from './DSCheckbox'
import { DSRadio } from './DSRadio'
import { DSDateField } from './DSDateField'
import { DSComboBox } from './DSComboBox'
import { DSCheckboxGroup } from './DSCheckboxGroup'
import { DSRadioGroup } from './DSRadioGroup'
import { DSTimeField } from './DSTimeField'
import { DSButton, DSButtonGroup } from './DSButton'
import { DSField, DSFieldInput, DSFieldsGrid, DSFieldsRow, DSColorField } from './DSField'
import { DSImageUpload, DSImagesGrid } from './DSImageUpload'

export {
  DSFormPanel,
  DSTextField,
  DSNumberField,
  DSTextArea,
  DSPasswordField,
  DSCheckbox,
  DSRadio,
  DSDateField,
  DSComboBox,
  DSCheckboxGroup,
  DSRadioGroup,
  DSTimeField,

  // New components
  DSButton,
  DSButtonGroup,
  DSField,
  DSFieldInput,
  DSFieldsGrid,
  DSFieldsRow,
  DSColorField,
  DSImageUpload,
  DSImagesGrid,
}

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSFieldContainer = (props) => placeholder('DSFieldContainer', props.children)
export const DSFieldSet = (props) => placeholder('DSFieldSet', props.children)
export const DSLabel = (props) => placeholder('DSLabel', props.children)
export const DSFormToolbar = (props) => placeholder('DSFormToolbar', props.children)
export const DSHelpText = (props) => placeholder('DSHelpText', props.children)
export const DSValidationMessage = (props) => placeholder('DSValidationMessage', props.children)
