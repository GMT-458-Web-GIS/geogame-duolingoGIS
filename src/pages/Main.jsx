import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAssetPath } from '../utils/assetPath';
import Navbar from '../components/Navbar';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import './Main.css';
import { countryData, getFlagUrl, getRandomCountries, getRandomCountry } from '../data/countryData';

const Main = () => {
  const location = useLocation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    character: location.state?.selectedCharacter || 'blonde-kid',
    username: location.state?.username || 'Guest'
  });
  const [isClosing, setIsClosing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null); // 'header2', 'header1', 'header'
  const [selectedSection, setSelectedSection] = useState(null); // Seçilen bölüm (Continue için)
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [checkState, setCheckState] = useState('unchecked'); // 'unchecked', 'checked', 'correct', 'incorrect'
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(null); // Mevcut soru için ülke
  const [flagOptions, setFlagOptions] = useState([]); // 4 bayrak seçeneği
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // Doğru cevabın index'i
  const [correctlyAnsweredCountries, setCorrectlyAnsweredCountries] = useState([]); // Doğru bilinen ülkeler
  
  // Gem and Health system
  const [gems, setGems] = useState(0); // Kullanıcının gem'leri, 0'dan başlar
  const [health, setHealth] = useState(5); // Kullanıcının sağlığı, 5'ten başlar
  
  // Level progression system
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Current level being played (0-3)
  const [correctAnswersInLevel, setCorrectAnswersInLevel] = useState(0); // Correct answers in current level
  const [unlockedLevels, setUnlockedLevels] = useState({
    header2: [0], // Europe - first level unlocked
    header1: [0], // Americas - first level unlocked  
    header: [0]   // Asia - first level unlocked
  });
  
  // Intro video state
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentFadedOut, setContentFadedOut] = useState(false);
  const vectorSourceRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const tileLayerRef = useRef(null); // OSM tile layer referansı
  let highlightFeature = null;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const highlightCountryOnMap = (countryName) => {
    if (!vectorLayerRef.current) return;

    // Style fonksiyonu: ülkeleri durumlarına göre renklendir
    const styleFunction = (feature) => {
      const featureName = feature.get('name') || feature.get('NAME') || feature.get('admin');
      const isTargetCountry = featureName && featureName.toLowerCase().includes(countryName.toLowerCase());
      const isCorrectlyAnswered = correctlyAnsweredCountries.some(country => 
        featureName && featureName.toLowerCase().includes(country.toLowerCase())
      );
      
      let fillColor = 'rgba(255, 255, 255, 0.1)'; // Varsayılan renk
      
      if (isCorrectlyAnswered) {
        fillColor = '#58cc02'; // Doğru bilinen ülkeler yeşil
      } else if (isTargetCountry) {
        fillColor = '#ffc800'; // Mevcut soru sarı
      }
      
      return new Style({
        stroke: new Stroke({
          color: '#666',
          width: 1
        }),
        fill: new Fill({
          color: fillColor
        })
      });
    };

    vectorLayerRef.current.setStyle(styleFunction);
  };

  const loadContinentMap = (section) => {
    // Section'a göre JSON dosya yolunu belirle
    const geoJsonPaths = {
      header2: '/databases/maps/europe.json',    // Europe
      header1: '/databases/maps/america.json',   // Americas
      header: '/databases/maps/asia.json'        // Asia
    };

    const geoJsonPath = geoJsonPaths[section];
    
    if (!geoJsonPath || !vectorSourceRef.current) return;

    // Sadece vektör katmanını fade-out yap (OSM kalsın)
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setOpacity(0);
    }

    // 500ms sonra GeoJSON'ı değiştir ve fade-in yap
    setTimeout(() => {
      // Yeni GeoJSON'ı yükle
      const newSource = new VectorSource({
        url: geoJsonPath,
        format: new GeoJSON()
      });

      // Eski source'u yeni ile değiştir
      if (vectorLayerRef.current) {
        vectorLayerRef.current.setSource(newSource);
        vectorSourceRef.current = newSource;
        
        // Fade-in animasyonu başlat
        vectorLayerRef.current.setOpacity(0);
        setTimeout(() => {
          if (vectorLayerRef.current) {
            vectorLayerRef.current.setOpacity(1);
          }
        }, 10);
      }
    }, 10);
  };

  const startLevel = (section, levelIndex = 0) => {
    setCurrentLevel(section);
    setSelectedSection(section); // Seçilen section'ı kaydet
    setCurrentLevelIndex(levelIndex);
    setCorrectAnswersInLevel(0); // Reset correct answers counter
    setGameStarted(true);
    
    // İlgili kıta haritasını yükle (fade-out/fade-in ile)
    loadContinentMap(section);
    
    // Bu section için rastgele bir ülke seç (doğru cevap)
    const correctCountry = getRandomCountry(section);
    setCurrentQuestion(correctCountry);
    
    // Doğru cevap dışında 3 tane daha rastgele ülke seç
    const otherCountries = getRandomCountries(section, 3, correctCountry);
    
    // 4 seçeneği karıştır
    const allOptions = [correctCountry, ...otherCountries];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    // Doğru cevabın yeni index'ini bul
    const correctIndex = shuffledOptions.findIndex(country => country.code === correctCountry.code);
    
    setFlagOptions(shuffledOptions);
    setCorrectAnswerIndex(correctIndex);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setCheckState('unchecked');
    
    // Zoom animasyonunu section'a göre yap
    const zoomConfigs = {
      header2: { center: fromLonLat([15, 54]), zoom: 3.8 }, // Avrupa
      header1: { center: fromLonLat([-85, 35]), zoom: 2.3 }, // Amerika
      header: { center: fromLonLat([85, 30]), zoom: 3.5 } // Asya
    };
    
    if (mapInstanceRef.current && zoomConfigs[section]) {
      mapInstanceRef.current.getView().animate({
        ...zoomConfigs[section],
        duration: 1000
      });
    }

    // Haritada sorduğu ülkeyi vurgula (harita yüklendikten sonra)
    setTimeout(() => {
      highlightCountryOnMap(correctCountry.name);
    }, 600); // GeoJSON yüklenmesi için bekle
  };

  const handleAnswerSelect = (flagIndex) => {
    setSelectedAnswer(flagIndex);
    setCheckState('checked');
  };

  const handleCheckClick = () => {
    if (selectedAnswer !== null) {
      setIsAnswerChecked(true);
      // Doğru/yanlış kontrolü
      if (selectedAnswer === correctAnswerIndex) {
        setCheckState('correct');
        
        // Doğru cevaplanan ülkeyi listeye ekle ve 100 gem kazan
        if (currentQuestion && !correctlyAnsweredCountries.includes(currentQuestion.name)) {
          setCorrectlyAnsweredCountries(prev => [...prev, currentQuestion.name]);
          // 100 gem ekle
          setGems(prev => prev + 100);
          // Haritada rengi güncelle
          setTimeout(() => {
            highlightCountryOnMap(currentQuestion.name);
          }, 100);
        }
        
        // Increment correct answers in current level
        const newCorrectCount = correctAnswersInLevel + 1;
        setCorrectAnswersInLevel(newCorrectCount);
        
        // Check if level is completed (3 correct answers)
        if (newCorrectCount >= 3) {
          // Unlock next level if not already unlocked
          if (currentLevelIndex < 3) { // Max 4 levels (0,1,2,3)
            setUnlockedLevels(prev => ({
              ...prev,
              [selectedSection]: [...new Set([...prev[selectedSection], currentLevelIndex + 1])]
            }));
          }
        }
        
        // Doğru ses çal
        const correctAudio = new Audio(getAssetPath('/sfx/true.mp3'));
        correctAudio.volume = 0.5;
        correctAudio.play().catch(error => console.log('Audio play failed:', error));
      } else {
        setCheckState('incorrect');
        // Health azalt
        const newHealth = health - 1;
        setHealth(newHealth);
        
        // Eğer health 0 olduysa ana sayfaya dön
        if (newHealth <= 0) {
          // Oyun bitti mesajı
          setTimeout(() => {
            alert('Game Over! Your health reached 0. Returning to main menu.');
            handleBackToMain();
          }, 1500); // 1.5 saniye bekle, sonra ana sayfaya dön
        }
        
        // Yanlış ses çal
        const wrongAudio = new Audio(getAssetPath('/sfx/false.mp3'));
        wrongAudio.volume = 0.5;
        wrongAudio.play().catch(error => console.log('Audio play failed:', error));
      }
    }
  };

  const generateNewQuestion = () => {
    // Bu section için rastgele bir ülke seç (doğru cevap)
    const correctCountry = getRandomCountry(selectedSection);
    setCurrentQuestion(correctCountry);
    
    // Doğru cevap dışında 3 tane daha rastgele ülke seç
    const otherCountries = getRandomCountries(selectedSection, 3, correctCountry);
    
    // 4 seçeneği karıştır
    const allOptions = [correctCountry, ...otherCountries];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    // Doğru cevabın yeni index'ini bul
    const correctIndex = shuffledOptions.findIndex(country => country.code === correctCountry.code);
    
    setFlagOptions(shuffledOptions);
    setCorrectAnswerIndex(correctIndex);
    
    // Haritada sorduğu ülkeyi vurgula
    setTimeout(() => {
      highlightCountryOnMap(correctCountry.name);
    }, 100);
  };

  const handleContinueClick = () => {
    // Check if level is completed
    if (correctAnswersInLevel >= 3) {
      // Level completed, return to level selection
      setGameStarted(false);
      setCurrentLevel(null);
      setCorrectAnswersInLevel(0);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setCheckState('unchecked');
      return;
    }
    
    // Yeni soru için durumları sıfırla
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setCheckState('unchecked');
    
    // Yeni soru oluştur (same level, don't reset progress)
    if (selectedSection) {
      generateNewQuestion();
    }
  };

  const startGame = () => {
    setGameStarted(true);
    // Haritayı Avrupa'ya zoomla
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().animate({
        center: fromLonLat([15, 50]), // Avrupa merkezi
        zoom: 5,
        duration: 1000
      });
    }
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      // Açık moda geçerken kapanış animasyonunu başlat
      setIsClosing(true);
      // Animasyonun bitmesini bekle (0.8s)
      setTimeout(() => {
        setIsDarkMode(false);
        setIsClosing(false);
      }, 800);
    } else {
      // Karanlık moda geçerken direkt değiştir (açılış animasyonu CSS'den gelir)
      setIsDarkMode(true);
    }
  };

  const handleBackToMain = () => {
    setGameStarted(false);
    setCurrentLevel(null);
    setSelectedSection(null);
    setCorrectAnswersInLevel(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setCheckState('unchecked');
    // Health'i resetle
    setHealth(5);
  };

  const handleHomeClick = () => {
    setShowLeaderboard(false);
    setGameStarted(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
  };

  const handleLeadershipClick = () => {
    setShowLeaderboard(true);
  };

  const handleOptionsClick = () => {
    // Bu fonksiyonu sonra ekleyeceğiz
    console.log('Options clicked');
  };

  const handleTitleClick = () => {
    // Start transition sequence
    setIsTransitioning(true);
    
    // Play intro sound
    const playIntroSound = () => {
      const audio = new Audio(getAssetPath('/sfx/intro.mp3'));
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
    setShowIntroVideo(false);
    setShowCharacterSelection(false);
    setSelectedCharacter(null);
    setContentFadedOut(false);
    setIsTransitioning(false);
  };

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  useEffect(() => {
    // Play intro sound when Main page loads
    const playIntroSound = () => {
      const audio = new Audio(getAssetPath('/sfx/intro.mp3'));
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    };

    playIntroSound();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // OSM tile layer oluştur (başlangıçta görünür)
    const tileLayer = new TileLayer({
      source: new OSM()
    });
    tileLayerRef.current = tileLayer;

    // GeoJSON vektör katmanı oluştur (başlangıçta custom.geo.json ile)
    const vectorSource = new VectorSource({
      url: getAssetPath('/databases/maps/custom.geo.json'),
      format: new GeoJSON()
    });
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#666',
          width: 1
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        })
      })
    });
    vectorLayerRef.current = vectorLayer;

    // OpenLayers harita oluştur - Başlangıçta OSM + custom.geo.json
    const map = new Map({
      target: mapRef.current,
      layers: [
        tileLayer,    // OSM altlık
        vectorLayer   // custom.geo.json
      ],
      view: new View({
        center: fromLonLat([0, 45]),
        zoom: 1.5
      }),
      // Mouse interaksiyonlarını kapat
      interactions: [],
      controls: [] // Kontrolleri de kapat
    });

    // Mouse hover event'i ekle
    let hoverFeature = null;
    const highlightStyle = new Style({
      stroke: new Stroke({
        color: '#89e219',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(137, 226, 25, 0.6)'
      })
    });

    map.on('pointermove', (evt) => {
      if (hoverFeature) {
        hoverFeature.setStyle(undefined);
        hoverFeature = null;
      }

      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        hoverFeature = feature;
        feature.setStyle(highlightStyle);
        return true;
      });
    });

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
      }
    };
  }, []);

  return (
    <div className={`main-page ${isDarkMode ? 'dark-mode' : ''} ${showWelcomeModal ? 'modal-open' : ''}`}>
      <div className="top-bar">
        <div className="title-section">
          <h1 className="app-title" onClick={handleTitleClick}>
            <span className="duolingo-text">duolingo</span>
            <span className="gis-text">GIS</span>
          </h1>
        </div>
        <div className="stats-container">
          <div className="stat-item">
            <img src={getAssetPath("/images/components/streak_button.svg")} alt="Streak" className="stat-icon" />
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <img src={getAssetPath("/images/components/gem_button.svg")} alt="Gems" className="stat-icon" />
            <span className="stat-value">{gems}</span>
          </div>
          <div className="stat-item">
            <img src={getAssetPath("/images/components/health_button.svg")} alt="Health" className="stat-icon" />
            <span className="stat-value">{health}</span>
          </div>
        </div>
      </div>
      <Navbar 
        isDarkMode={isDarkMode} 
        onHomeClick={handleHomeClick}
        onLeadershipClick={handleLeadershipClick}
        onOptionsClick={handleOptionsClick}
      />
      <div className="dark-mode-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? (
          <img src={getAssetPath("/images/duo/icon.svg")} alt="Light Mode" className="dark-mode-icon" />
        ) : (
          <img src={getAssetPath("/images/duo/icon-dark.svg")} alt="Dark Mode" className="dark-mode-icon" />
        )}
      </div>
      <div className={`follow-banner ${isDarkMode ? 'slide-in' : ''} ${isClosing && isDarkMode ? 'slide-out' : ''}`}>
        <div className="follow-banner-content">
          <img src={getAssetPath("/images/duo/follow_for_more.png")} alt="Follow for more" className="follow-image" />

          <a href="https://github.com/kaanklcrsln" target="_blank" rel="noopener noreferrer" className="follow-button-link">
            <img src={getAssetPath("/images/duo/follow_button.png")} alt="Follow button" className="follow-button" />
          </a>

        </div>
      </div>
      <div className="main-content">
        <div className="hover-container left-panel">
          {showLeaderboard ? (
            <div className="leaderboard">
              <h3>Sıralama Tablosu</h3>

              {/* Locked / placeholder top users with an overlay */}
              <div className="leaderboard-locked">
                <div className="locked-items">
                  <div className="leaderboard-item">
                    <span className="rank">1.</span>
                    <span className="name">Kullanıcı 1</span>
                    <span className="score">1250</span>
                  </div>
                  <div className="leaderboard-item">
                    <span className="rank">2.</span>
                    <span className="name">Kullanıcı 2</span>
                    <span className="score">980</span>
                  </div>
                  <div className="leaderboard-item">
                    <span className="rank">3.</span>
                    <span className="name">Kullanıcı 3</span>
                    <span className="score">750</span>
                  </div>
                  <div className="leaderboard-item">
                    <span className="rank">4.</span>
                    <span className="name">Kullanıcı 4</span>
                    <span className="score">620</span>
                  </div>
                </div>

                <div className="leaderboard-overlay">
                  <div className="overlay-text">kaan is busy, he'll develop sometime</div>
                </div>
              </div>


            </div>
          ) : (
            <>
              {!gameStarted ? (
                <div className="level-path-container">
                  {/* Header 2 - Top Level */}
                  <div className={`level-section ${openSection === 'header2' ? 'open' : ''}`}>
                    <div className="header-wrapper" onClick={() => toggleSection('header2')}>
                      <img src={getAssetPath("/images/players/blonde-kid.svg")} alt="Blonde Kid" className="character-image" />
                      <img src={getAssetPath("/images/duo/level_path/Header (2).png")} alt="Header 2" className="header-image" />
                    </div>
                    {openSection === 'header2' && (
                      <div className="level-content">
                        <button 
                          className={`level-button div-button ${!unlockedLevels.header2.includes(0) ? 'locked' : ''}`}
                          title="Level 1" 
                          onClick={() => unlockedLevels.header2.includes(0) && startLevel('header2', 0)}
                          disabled={!unlockedLevels.header2.includes(0)}
                        >
                          <img src={getAssetPath("/images/duo/level_path/div.png")} alt="Level 1" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header2.includes(1) ? 'div-button' : 'story-button locked'}`}
                          title="Level 2"
                          onClick={() => unlockedLevels.header2.includes(1) && startLevel('header2', 1)}
                          disabled={!unlockedLevels.header2.includes(1)}
                        >
                          <img src={unlockedLevels.header2.includes(1) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 2" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header2.includes(2) ? 'div-button' : 'story-button locked'}`}
                          title="Level 3"
                          onClick={() => unlockedLevels.header2.includes(2) && startLevel('header2', 2)}
                          disabled={!unlockedLevels.header2.includes(2)}
                        >
                          <img src={unlockedLevels.header2.includes(2) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 3" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header2.includes(3) ? 'div-button' : 'story-button locked'}`}
                          title="Level 4"
                          onClick={() => unlockedLevels.header2.includes(3) && startLevel('header2', 3)}
                          disabled={!unlockedLevels.header2.includes(3)}
                        >
                          <img src={unlockedLevels.header2.includes(3) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Header 1 - Bottom Level */}
                  <div className={`level-section ${openSection === 'header1' ? 'open' : ''}`}>
                    <div className="header-wrapper" onClick={() => toggleSection('header1')}>
                      <img src={getAssetPath("/images/players/afro-woman.svg")} alt="Afro Woman" className="character-image" />
                      <img src={getAssetPath("/images/duo/level_path/Header (1).png")} alt="Header 1" className="header-image" />
                    </div>
                    {openSection === 'header1' && (
                      <div className="level-content">
                        <button 
                          className={`level-button div-button ${!unlockedLevels.header1.includes(0) ? 'locked' : ''}`}
                          title="Level 1" 
                          onClick={() => unlockedLevels.header1.includes(0) && startLevel('header1', 0)}
                          disabled={!unlockedLevels.header1.includes(0)}
                        >
                          <img src={getAssetPath("/images/duo/level_path/div.png")} alt="Level 1" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header1.includes(1) ? 'div-button' : 'story-button locked'}`}
                          title="Level 2"
                          onClick={() => unlockedLevels.header1.includes(1) && startLevel('header1', 1)}
                          disabled={!unlockedLevels.header1.includes(1)}
                        >
                          <img src={unlockedLevels.header1.includes(1) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 2" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header1.includes(2) ? 'div-button' : 'story-button locked'}`}
                          title="Level 3"
                          onClick={() => unlockedLevels.header1.includes(2) && startLevel('header1', 2)}
                          disabled={!unlockedLevels.header1.includes(2)}
                        >
                          <img src={unlockedLevels.header1.includes(2) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 3" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header1.includes(3) ? 'div-button' : 'story-button locked'}`}
                          title="Level 4"
                          onClick={() => unlockedLevels.header1.includes(3) && startLevel('header1', 3)}
                          disabled={!unlockedLevels.header1.includes(3)}
                        >
                          <img src={unlockedLevels.header1.includes(3) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Header - Final Level */}
                  <div className={`level-section ${openSection === 'header' ? 'open' : ''}`}>
                    <div className="header-wrapper" onClick={() => toggleSection('header')}>
                      <img src={getAssetPath("/images/players/purple-girl.svg")} alt="Purple Girl" className="character-image" />
                      <img src={getAssetPath("/images/duo/level_path/Header.png")} alt="Header" className="header-image" />
                    </div>
                    {openSection === 'header' && (
                      <div className="level-content">
                        <button 
                          className={`level-button div-button ${!unlockedLevels.header.includes(0) ? 'locked' : ''}`}
                          title="Level 1" 
                          onClick={() => unlockedLevels.header.includes(0) && startLevel('header', 0)}
                          disabled={!unlockedLevels.header.includes(0)}
                        >
                          <img src={getAssetPath("/images/duo/level_path/div.png")} alt="Level 1" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header.includes(1) ? 'div-button' : 'story-button locked'}`}
                          title="Level 2"
                          onClick={() => unlockedLevels.header.includes(1) && startLevel('header', 1)}
                          disabled={!unlockedLevels.header.includes(1)}
                        >
                          <img src={unlockedLevels.header.includes(1) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 2" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header.includes(2) ? 'div-button' : 'story-button locked'}`}
                          title="Level 3"
                          onClick={() => unlockedLevels.header.includes(2) && startLevel('header', 2)}
                          disabled={!unlockedLevels.header.includes(2)}
                        >
                          <img src={unlockedLevels.header.includes(2) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 3" />
                        </button>
                        <button 
                          className={`level-button ${unlockedLevels.header.includes(3) ? 'div-button' : 'story-button locked'}`}
                          title="Level 4"
                          onClick={() => unlockedLevels.header.includes(3) && startLevel('header', 3)}
                          disabled={!unlockedLevels.header.includes(3)}
                        >
                          <img src={unlockedLevels.header.includes(3) ? getAssetPath("/images/duo/level_path/div.png") : getAssetPath("/images/duo/level_path/Story.png")} alt="Level 4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="game-ui">
                      {/* Geri Butonu */}
                      <button className="back-button" onClick={handleHomeClick} title="Geri Dön">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                      </button>
                      
                      {/* Level Progress Indicator */}
                      <div className="level-progress">
                        <span className="level-info">Level {currentLevelIndex + 1}</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${(correctAnswersInLevel / 3) * 100}%`}}></div>
                        </div>
                        <span className="progress-text">{correctAnswersInLevel}/3</span>
                      </div>
                      
                      {/* Soru Kısımı */}
                      <div className="question-section">
                        <img src={getAssetPath("/images/duo/Image & Audio.png")} alt="Question" className="question-image" />
                        
                        {/* 4 Bayrak Seçeneği */}
                        <div className="flag-options-game">
                          {flagOptions.map((country, index) => (
                            <div 
                              key={index}
                              className={`flag-option ${selectedAnswer === index ? 'selected' : ''}`} 
                              onClick={() => handleAnswerSelect(index)}
                            >
                              <img 
                                src={getFlagUrl(country.code, country.name)} 
                                alt={country.name}
                                onError={(e) => {
                                  console.log(`Flag not found for ${country.name} (${country.code})`);
                                  e.target.src = getAssetPath('/images/duo/level_path/Story.png'); // Fallback image
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Check/Continue Button */}
                        <button 
                          className="check-button" 
                          onClick={checkState === 'correct' ? handleContinueClick : handleCheckClick} 
                          disabled={selectedAnswer === null && checkState !== 'correct'}
                        >
                          <img 
                            src={
                              checkState === 'correct' 
                                ? '/images/duo/continue.png' 
                                : selectedAnswer !== null 
                                  ? '/images/duo/check-2.png' 
                                  : '/images/duo/check-1.png'
                            } 
                            alt={checkState === 'correct' ? 'Continue' : 'Check'} 
                          />
                        </button>

                      </div>
                    </div>
                  )}
            </>
          )}
          
          {/* Sonuç Gösterimi - Left Panel Alt */}
          {isAnswerChecked && (
            <div className={`result-message ${checkState === 'correct' ? 'correct' : 'incorrect'}`}>
              <img 
                src={checkState === 'correct' ? '/images/duo/true.png' : '/images/duo/false.png'} 
                alt="Result" 
              />
            </div>
          )}
        </div>
        <div className="hover-container center-panel">
          <div ref={mapRef} className="map-container"></div>
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
            <source src={getAssetPath("/duointro.mp4")} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {showCharacterSelection && (
            <div className="character-selection">
              <div className="character-grid">
                <div 
                  className={`character-option ${selectedCharacter === 'wine-guy' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('wine-guy')}
                >
                  <img src={getAssetPath("/images/players/wine-guy.svg")} alt="Wine Guy" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'purple-girl' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('purple-girl')}
                >
                  <img src={getAssetPath("/images/players/purple-girl.svg")} alt="Purple Girl" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'blonde-kid' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('blonde-kid')}
                >
                  <img src={getAssetPath("/images/players/blonde-kid.svg")} alt="Blonde Kid" />
                </div>
                <div 
                  className={`character-option ${selectedCharacter === 'afro-woman' ? 'selected' : ''}`}
                  onClick={() => handleCharacterSelect('afro-woman')}
                >
                  <img src={getAssetPath("/images/players/afro-woman.svg")} alt="Afro Woman" />
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

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="welcome-modal-overlay" onClick={closeWelcomeModal}>
          <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeWelcomeModal}>×</button>
            
            {/* Developer Section */}
            <div className="developer-section">
              <img src={getAssetPath("/images/players/kaan.svg")} alt="Kaan Kılıçarslan" className="developer-image" />
              <div className="developer-info">
                <h3 className="developer-name">Kaan Kılıçarslan</h3>
                <p className="developer-username">@kaanklcrsln</p>
                <p className="developer-title">Geomatics Engineer</p>
              </div>
              {/* Duo Character */}
              <div className="duo-character">
                <img src={getAssetPath("/images/duo/duo-lover.svg")} alt="Duo" className="duo-image" />
              </div>
            </div>

            {/* Welcome Content */}
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to my project geolover!</h2>
              <p className="welcome-description">
                You can play flag quiz games for each continent by selecting sections and choosing levels. 
                Test your geography knowledge and learn about countries and their flags!
              </p>

            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
