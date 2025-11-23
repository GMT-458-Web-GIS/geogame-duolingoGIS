import React from 'react';
import { getAssetPath } from '../utils/assetPath';
import './Navbar.css';

const Navbar = ({ isDarkMode, onHomeClick, onLeadershipClick, onOptionsClick }) => {
  return (
    <nav className={`bottombar ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="bottombar-icons">
        <div className="icon-item" onClick={onHomeClick}>
          <img src={getAssetPath("/images/components/home_button.svg")} alt="Ana Sayfa" className="icon-svg" />
        </div>

        <div className="icon-item" onClick={onLeadershipClick}>
          <img src={getAssetPath("/images/components/leadership_button.svg")} alt="Sıralama" className="icon-svg" />
        </div>
        
        <div className="icon-item" onClick={onOptionsClick}>
          <img src={getAssetPath("/images/components/options_button.svg")} alt="Seçenekler" className="icon-svg" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
