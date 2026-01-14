import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import '@/styles/index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      gap={8}
      toastOptions={{
        duration: 2000,
        style: {
          background: '#262626',
          color: '#FAFAFA',
          border: '1px solid #404040',
        },
      }}
    />
  </StrictMode>,
);
