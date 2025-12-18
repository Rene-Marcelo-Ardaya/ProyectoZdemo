import React from 'react'
import { DSPanel } from './DSPanel'
import { DSTabs } from './DSTabs'
import { DSAccordion } from './DSAccordion'
import { DSPage, DSPageHeader, DSPageContent, DSPageGrid, DSBreadcrumbs, DSToolbar, DSToolbarGroup, DSToolbarSeparator, DSToolbarSpacer } from './DSPage'
import { DSSection, DSSubsection, DSSectionDivider } from './DSSection'

export {
  DSPanel,
  DSTabs,
  DSAccordion,
  DSBorderLayout,

  // New components
  DSPage, DSPageHeader, DSPageContent, DSPageGrid, DSBreadcrumbs, DSToolbar, DSToolbarGroup, DSToolbarSeparator, DSToolbarSpacer,
  DSSection, DSSubsection, DSSectionDivider
}

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSViewport = (props) => placeholder('DSViewport', props.children)
export const DSSplitter = (props) => placeholder('DSSplitter', props.children)
