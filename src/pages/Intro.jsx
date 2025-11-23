import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';

const Intro = () => {
  const [showDuolingo, setShowDuolingo] = useState(false);
  const [showGIS, setShowGIS] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentFadedOut, setContentFadedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fade in animations
    setTimeout(() => setShowDuolingo(true), 100);
    setTimeout(() => setShowGIS(true), 1100);
  }, []);

  const handleClick = () => {
    // Start transition sequence
    setIsTransitioning(true);
    
    // Play intro sound
    const playIntroSound = () => {
      const audio = new Audio('/sfx/intro.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    };

    playIntroSound();
    
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
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleStartGame = () => {
    navigate('/main');
  };

  const handleContinueToMain = () => {
    navigate('/main');
  };

  return (
    <>
      <div className={`intro-container ${isTransitioning ? 'transitioning' : ''}`} onClick={handleClick}>
        <div className={`intro-content ${contentFadedOut ? 'fade-out' : ''}`}>
          <div className="title-with-images">

            <img src="/images/players/duo-race.svg" alt="Duo" className={`duo-race-image ${contentFadedOut ? 'fade-out' : ''}`} />
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
            <source src="/assets/duointro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {showCharacterSelection && (
            <div className="character-selection">
              <div className="character-grid">
                <div 
                  className={`character-option ${selectedCharacter === 'wine-guy' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('wine-guy')}
                >
                  <img src="/images/players/wine-guy.svg" alt="Wine Guy" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'purple-girl' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('purple-girl')}
                >
                  <img src="/images/players/purple-girl.svg" alt="Purple Girl" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'blonde-kid' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('blonde-kid')}
                >
                  <img src="/images/players/blonde-kid.svg" alt="Blonde Kid" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'afro-woman' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('afro-woman')}
                >
                  <img src="/images/players/afro-woman.svg" alt="Afro Woman" />
                </div>
              </div>
              
              {selectedCharacter && (
                <button className="start-game-btn" onClick={handleStartGame}>
                  Start
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Intro;
