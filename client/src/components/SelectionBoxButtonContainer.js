
import React from 'react';

// Don't currently use this wrapper for UnauthenticatedClusterSelectionBox
// button as does not work for this, as its button does not currently have an
// element using selection-box-inside as its immediate parent; fortunately this
// doesn't matter as its button lines up by other styling.
export default function SelectionBoxButtonContainer({children}) {
  return (
    <div className="selection-box-button-container">
      <div className="selection-box-button-inner-container">
        {children}
      </div>
    </div>
  );
}

