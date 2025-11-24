import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssetPath } from '../utils/assetPath';
import './Intro.css';

const Intro = () => {
  const [showDuolingo, setShowDuolingo] = useState(false);
  const [showGIS, setShowGIS] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [bgFadeIn, setBgFadeIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentFadedOut, setContentFadedOut] = useState(false);
    const [characterFadeIn, setCharacterFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fade in animations
    setTimeout(() => setShowDuolingo(true), 100);
    setTimeout(() => setShowGIS(true), 1100);
  }, []);

  const handleClick = () => {
    // Start transition sequence
    setIsTransitioning(true);
    
    // Fade out content first
    setTimeout(() => {
      setContentFadedOut(true);
    }, 100);
    
    // Show video after background transition
    setTimeout(() => {
      setShowIntroVideo(true);
    }, 1000);
  };

  const handleVideoEnd = () => {
    setShowCharacterSelection(true);
    setTimeout(() => setCharacterFadeIn(true), 100); // trigger fade-in after grid mounts
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setBgFadeIn(false);
    setTimeout(() => setBgFadeIn(true), 50); // trigger fade-in for bg
  };

  const handleStartGame = () => {
    if (selectedCharacter && username.trim()) {
      // Play intro sound
      const audio = new Audio(getAssetPath('/sfx/intro.mp3'));
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
      
      // Pass character and username data
      navigate('/main', { 
        state: { 
          selectedCharacter, 
          username: username.trim() 
        } 
      });
    }
  };

  return (
    <>
      <div className={`intro-container ${isTransitioning ? 'transitioning' : ''}`} onClick={handleClick}>
        <div className={`intro-content ${contentFadedOut ? 'fade-out' : ''}`}>
          <div className="title-with-images">

            <img src={getAssetPath('/images/players/duo-race.svg')} alt="Duo" className={`duo-race-image ${contentFadedOut ? 'fade-out' : ''}`} />
            <h1 className="intro-title">
              <span className={`duolingo-text ${showDuolingo ? 'fade-in' : ''} ${contentFadedOut ? 'fade-out' : ''}`}>
                duolingo
              </span>
              <span className={`gis-text ${showGIS ? 'fade-in' : ''} ${contentFadedOut ? 'fade-out' : ''}`}>
                GIS
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Intro Video */}
      {showIntroVideo && (
        <div className="intro-video-overlay">
          <video 
            className="intro-video"
            autoPlay
            onEnded={handleVideoEnd}
          >
            <source src={getAssetPath('/duointro.mp4')} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {showCharacterSelection && (
            <>
              {/* Karakter seçildiğinde büyük karakter önizlemesi arkaplanda */}
              {selectedCharacter && (
                <>
                  <div className={`character-preview-background${bgFadeIn ? ' fade-in' : ''}`}></div>
                  <div className={`character-preview-large${bgFadeIn ? ' fade-in' : ''}`}>
                    <img src={getAssetPath(`/images/players/${selectedCharacter}.svg`)} alt="Selected Character Background" />
                  </div>
                </>
              )}
              
              <div className={`character-selection${characterFadeIn ? ' fade-in' : ''}`}> 
                <div className={`character-grid${characterFadeIn ? ' fade-in' : ''}`}> 
                  <div 
                    className={`character-option ${selectedCharacter === 'wine-guy' ? 'selected' : ''}`}
                    onClick={() => handleCharacterSelect('wine-guy')}
                  >
                    <img src={getAssetPath('/images/players/wine-guy.svg')} alt="Wine Guy" />
                  </div>
                  <div 
                    className={`character-option ${selectedCharacter === 'purple-girl' ? 'selected' : ''}`}
                    onClick={() => handleCharacterSelect('purple-girl')}
                  >
                    <img src={getAssetPath('/images/players/purple-girl.svg')} alt="Purple Girl" />
                  </div>
                  <div 
                    className={`character-option ${selectedCharacter === 'blonde-kid' ? 'selected' : ''}`}
                    onClick={() => handleCharacterSelect('blonde-kid')}
                  >
                    <img src={getAssetPath('/images/players/blonde-kid.svg')} alt="Blonde Kid" />
                  </div>
                  <div 
                    className={`character-option ${selectedCharacter === 'afro-woman' ? 'selected' : ''}`}
                    onClick={() => handleCharacterSelect('afro-woman')}
                  >
                    <img src={getAssetPath('/images/players/afro-woman.svg')} alt="Afro Woman" />
                  </div>
                </div>
                {selectedCharacter && (
                  <div className="character-preview-section">

                    <div className="username-input-section">
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="username-input"
                        maxLength="20"
                      />
                    </div>
                    <button 
                      className={`start-game-btn ${!username.trim() ? 'disabled' : ''}`} 
                      onClick={handleStartGame}
                      disabled={!username.trim()}
                    >
                      Start
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Intro;
