import React from 'react'
import { DSList } from './DSList'
import { DSGrid } from './DSGrid'
import { DSBadge, DSCount, DSCode } from './DSBadge'

export { DSList, DSGrid, DSBadge, DSCount, DSCode }

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSListItem = (props) => placeholder('DSListItem', props.children)
export const DSGridColumn = (props) => placeholder('DSGridColumn', props.children)
export const DSGridToolbar = (props) => placeholder('DSGridToolbar', props.children)
export const DSGridPagination = (props) => placeholder('DSGridPagination', props.children)
export const DSSortHeader = (props) => placeholder('DSSortHeader', props.children)
export const DSSelectionModel = (props) => placeholder('DSSelectionModel', props.children)
