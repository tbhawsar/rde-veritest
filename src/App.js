import React from "react"
import './css/App.css';
import Tracker from './components/WatchTracker'

const App = () => {

  return (
    <div className="App-container">
      <h1 className="App-title">RDE VeriTest</h1>
      <h2 className="App-version">Release Candidate 1 (v1.2.1)</h2>
      <Tracker />
    </div>
  );

};

export default App;
