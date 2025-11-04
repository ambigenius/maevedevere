import React from 'react';
import './App.css';

function HomePage() {
  return (
    <div className="App">
      <main>
        <div className="flex-container">
          <div className="row-buffer"></div>
          <div className="left-sections">
            <section>
              <h2 className="section-subtitle">Words</h2>
              {/* Placeholder for words content */}
            </section>
            <section>
              <h2 className="section-subtitle">Lines</h2>
              {/* Placeholder for lines content */}
            </section>
            <section>
              <h2 className="section-subtitle">Motion</h2>
              {/* Placeholder for motion content */}
            </section>
            <section>
              <h2 className="section-subtitle">Sound</h2>
              {/* Placeholder for sound content */}
            </section>
          </div>
          <div className="right-wrapper">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="divider-bar">|</span>
            </div>
            <section>
              <h2 className="section-subtitle">All</h2>
              {/* Placeholder for All tag */}
            </section>
            <section>
              <h2 className="section-subtitle">About</h2>
              {/* Placeholder for about section */}
            </section>
          </div>
          <div className="row-buffer"></div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;

