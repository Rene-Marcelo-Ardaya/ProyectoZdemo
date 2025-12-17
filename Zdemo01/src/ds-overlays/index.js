import React from 'react'
import { DSWindow } from './DSWindow'
import { DSDialog } from './DSDialog'
import { DSLoadingMask } from './DSLoadingMask'
import { DSMessageBox } from './DSMessageBox'
import { DSOverlayProvider, useMessageBox } from './DSOverlayContext'

export { DSWindow, DSDialog, DSLoadingMask, DSMessageBox, DSOverlayProvider, useMessageBox }

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSToast = (props) => placeholder('DSToast', props.children)
