import React from 'react';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux'
import Content from './components/Content/Content'
import {Button} from '@mui/material'
import { store } from './store'
import {useRef} from "react";

import './App.css';
// createFaLibrary();

function App(){
  const notistackRef = useRef();

  return (
      <SnackbarProvider ref={notistackRef}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left'}}
                        maxSnack={2}>
          <Provider store={store}>
            <Content/>
          </Provider>
      </SnackbarProvider>
  );
}

export default App;
