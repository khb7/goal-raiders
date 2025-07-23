import React from 'react';

const HeroSection = () => {
  return (
    <div className="jumbotron jumbotron-fluid text-center py-5 mb-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-color)' }}>
      <div className="container">
        <h1 className="display-4">Welcome to Goal Raiders!</h1>
        <p className="lead">Your adventure to conquer goals and defeat bosses begins here.</p>
      </div>
    </div>
  );
};

export default HeroSection;