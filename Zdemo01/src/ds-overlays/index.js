import React from 'react'
import { DSWindow } from './DSWindow'
import { DSDialog } from './DSDialog'
import { DSLoadingMask } from './DSLoadingMask'
import { DSMessageBox } from './DSMessageBox'
import { DSOverlayProvider, useMessageBox } from './DSOverlayContext'
import { DSModal, DSModalSection, DSModalGrid } from './DSModal'
import { DSAlert } from './DSAlert'
import { DSLoading, DSSkeleton, DSSkeletonGroup, DSSkeletonRow, DSEmpty, DSErrorState } from './DSLoading'
import { DSBulkImportModal } from './DSBulkImportModal'

export {
  DSWindow, DSDialog, DSLoadingMask, DSMessageBox, DSOverlayProvider, useMessageBox,
  // New components
  DSModal, DSModalSection, DSModalGrid,
  DSAlert,
  DSLoading, DSSkeleton, DSSkeletonGroup, DSSkeletonRow, DSEmpty, DSErrorState,
  DSBulkImportModal
}

const placeholder = (name, children) =>
  React.createElement(
    'div',
    { className: 'ds-placeholder' },
    React.createElement('span', { className: 'ds-placeholder__tag' }, name),
    React.createElement('span', null, children || 'Placeholder'),
  )

export const DSToast = (props) => placeholder('DSToast', props.children)

