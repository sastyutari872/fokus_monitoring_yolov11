import React from 'react';
import { createRoot } from 'react-dom/client';
import PresentationApp from './PresentationApp';
import './presentation.css';

const container = document.getElementById('presentation-root');
if (container) {
  const root = createRoot(container);
  root.render(<PresentationApp />);
}