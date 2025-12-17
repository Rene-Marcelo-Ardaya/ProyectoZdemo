import React from 'react'
import { DSPanel } from './DSPanel'
import { DSTabs } from './DSTabs'
import { DSAccordion } from './DSAccordion'
import { DSBorderLayout } from './DSBorderLayout'

export { DSPanel, DSTabs, DSAccordion, DSBorderLayout }

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSViewport = (props) => placeholder('DSViewport', props.children)
export const DSSplitter = (props) => placeholder('DSSplitter', props.children)
