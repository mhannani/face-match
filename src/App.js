import React from 'react';
import { SnackbarProvider } from 'notistack';

import Content from './components/Content/Content'
import {Button} from '@mui/material'

import {useRef} from "react";

import './App.css';
// createFaLibrary();


function App() {
  const notistackRef = useRef();

  return (
  <SnackbarProvider ref={notistackRef} action={(key) => (
      <Button
          onClick={() => notistackRef.current.closeSnackbar(key)}
          style={{ color: '#fff', fontSize: '20px' }}
      >
          ✖
      </Button>
    )} maxSnack={3}>
    <Content/>
  </SnackbarProvider>
  );
}

export default App;
