import React, { useState } from 'react';

import { loadModels } from './helpers/faceApi';
import { createFaLibrary } from './helpers/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Switch from 'react-switch';
import Camera from './components/Camera/Camera';

import './App.css';
// createFaLibrary();
loadModels();
function App() {
  const [mode, setMode] = useState(false); //true = photo mode; false = video mode

  return (
    <div className="App">
      <header>
        {/*<div className="App__header">*/}
          <div className="App__switcher">

          </div>
        {/*</div>*/}
      </header>
      <Camera photoMode={mode} />
    </div>
  );
}

export default App;
