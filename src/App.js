import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Content from './components/Content';
import Home from './components/Home';
import World from './components/World';
import NavigationBar from './components/NavigationBar';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-mainBg">
        <NavigationBar />
        <div className="flex flex-1">
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Content />} />
              <Route path="/world" element={<World />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
