import React from 'react';
import './misc/styles/layout.scss';
import './App.scss';
import BasicInterface from './components/basic-interface/BasicInterface';

function App() {
  return (
    <div className="App flex-col-top-left">
      <div className="container">
        <BasicInterface />
      </div>
    </div>
  );
}

export default App;
