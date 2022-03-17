import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';

import { detectFaces, drawResults } from '../../helpers/faceApi';

// import Button from '../Button/Button';
// import Gallery from '../Gallery/Gallery';
// import Results from '../Results/Results';
import Webcam from 'react-webcam';

import './Camera.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const svgIcon = () => (
    <svg
        width="100%"
        height="100%"
        className="svg"
        viewBox="0 0 260 200"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
        <mask id="overlay-mask" x="0" y="0" width="100%" height="100%">
          <rect x="0" y="0" width="100%" height="100%" fill="#fff"/>
          <ellipse id="ellipse-mask" cx="50%" cy="45%" rx="60" ry="85" />
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" mask="url(#overlay-mask)" fillOpacity="0.7"/>
    </svg>
);

const Camera = ({ photoMode }) => {
  const camera = useRef();
  const cameraCanvas = useRef();

  const [photo, setPhoto] = useState(undefined);
  const [showGallery, setShowGallery] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [results, setResults] = useState([]);

  const getFaces = async () => {
    if (camera.current !== null) {
      const faces = await detectFaces(camera.current.video);
      await drawResults(camera.current.video, cameraCanvas.current, faces, 'box');
      setResults(faces);
    }
  };

  const clearOverlay = (canvas) => {
    canvas.current.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (!photoMode && camera !== null) {
      const ticking = setInterval(async () => {
        await getFaces();
      }, 80);
      return () => {
        clearOverlay(cameraCanvas);
        clearInterval(ticking);
      };
    } else {
      return clearOverlay(cameraCanvas);
    }
  }, [photoMode]);

  const toggleGallery = () => setShowGallery(!showGallery);

  const capture = () => {
    const imgSrc = camera.current.getScreenshot();
    const newPhotos = [...photos, imgSrc];
    setPhotos(newPhotos);
    setPhoto(imgSrc);
    setShowGallery(true);
  };
  const reset = () => {
    setPhoto(undefined);
    setPhotos([]);
    setShowGallery(false);
  };
  const deleteImage = (target) => {
    const newPhotos = photos.filter((photo) => {
      return photo !== target;
    });
    setPhotos(newPhotos);
  };

  return (
    <div className="camera">

      {/*<p className="scroll_down">Scroll down for results ↓</p>*/}
      <div className="camera__wrapper">
        <div className="overlay-container">
          {svgIcon()}
        </div>
        <Webcam audio={false} ref={camera} width="100%" height="auto" />
        <canvas className={classnames('webcam-overlay', photoMode && 'webcam-overlay--hidden')} ref={cameraCanvas} />
      </div>

      {/*{photoMode ? (*/}
      {/*  <>*/}
      {/*    <div className="camera__button-container">*/}
      {/*      {photos.length > 0 && <Button onClick={toggleGallery}>{showGallery ? 'Hide ' : 'Show '} Gallery</Button>}*/}
      {/*      <Button onClick={capture} className="camera__button--snap">*/}
      {/*        <FontAwesomeIcon icon="camera" size="lg" />*/}
      {/*      </Button>*/}
      {/*      {photos.length > 0 && <Button onClick={reset}>Reset</Button>}*/}
      {/*    </div>*/}

      {/*    {photos.length > 0 && <Gallery photos={photos} selected={photo} show={showGallery} deleteImage={deleteImage} />}*/}
      {/*  </>*/}
      {/*) : (*/}
      {/*  <>*/}
      {/*    <div className="results__container">*/}
      {/*      <Results results={results} />*/}
      {/*    </div>*/}
      {/*  </>*/}
      {/*)}*/}
    </div>
  );
};

export default Camera;
