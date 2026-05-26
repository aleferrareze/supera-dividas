import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import AplicacaoPratica from './pages/AplicacaoPratica';

const pathname = window.location.pathname;
const Root = pathname === '/aplicacao-pratica' ? AplicacaoPratica : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
