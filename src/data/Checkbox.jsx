import React from 'react';
import { styled } from '@stitches/react';

const CheckboxWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
});

const HiddenCheckbox = styled('input', {
  border: '0',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
});

const StyledCheckbox = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  backgroundColor: 'white',
  border: '2px solid #1DA19E',
  borderRadius: '3px',
  transition: 'all 150ms',
  marginRight: '8px', // Space between checkbox and label

  'input:focus + &': {
    boxShadow: '0 0 0 3px rgba(29, 161, 158, 0.3)',
  },

  'input:checked + &': {
    backgroundColor: '#1DA19E',
  },
});

const CheckboxIcon = styled('svg', {
  fill: 'none',
  stroke: 'white',
  strokeWidth: 2,
  width: '16px',
  height: '16px',
});

const Label = styled('label', {
  fontFamily: 'Quicksand, sans-serif',
  fontSize: '16px',
  color: '#3A3A3A',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

const Checkbox = ({ id, checked, onCheckedChange, label }) => (
  <CheckboxWrapper>
    <Label htmlFor={id}>
      <HiddenCheckbox
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <StyledCheckbox>
        {checked && (
          <CheckboxIcon viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </CheckboxIcon>
        )}
      </StyledCheckbox>
      {label}
    </Label>
  </CheckboxWrapper>
);

export default Checkbox;
