import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// import faceapi from 'face-api.js';
import { startVideo } from './utils.js';

const MODEL_URL = '/models';

let statusIcons = {
	default: { emoji: '😐', color: '#02c19c' },
	neutral: { emoji: '😐', color: '#54adad' },
	happy: { emoji: '😀', color: '#148f77' },
	sad: { emoji: '😥', color: '#767e7e' },
	angry: { emoji: '😠', color: '#b64518' },
	fearful: { emoji: '😨', color: '#90931d' },
	disgusted: { emoji: '🤢', color: '#1a8d1a' },
	surprised: { emoji: '😲', color: '#1230ce' },
};

function App() {
	const [emoji, setEmoji] = useState(statusIcons.default.emoji);
	const [textStatus, setTextStatus] = useState('...');
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');

		const setup = async () => {
			await Promise.all([
				faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
				faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
				faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
				faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
			]).then(() => startVideo(video));
	
			video.addEventListener('play', () => {
				const displaySize = { width: video.width, height: video.height }
			
				faceapi.matchDimensions(canvas, displaySize)
			
				setInterval(async () => {
					const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
					const resizedDetections = faceapi.resizeResults(detections, displaySize)
					context.clearRect(0, 0, canvas.width, canvas.height)
					faceapi.draw.drawDetections(canvas, resizedDetections)
					faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
			
					if (detections.length > 0) {
						detections.forEach((element) => {
							let status = '';
							let valueStatus = 0.0;
							for (const [key, value] of Object.entries(element.expressions)) {
								if (value > valueStatus) {
									status = key;
									valueStatus = value;
								};
							};
							
							setEmoji(statusIcons[status].emoji);
							setTextStatus(status);
						})
					} else {
						setEmoji(statusIcons.default.emoji);
						setTextStatus('...');
					};
				}, 100);
			});
		}

		setup();
	});

  return (
		<div className="content">
			<div className="container">
				<div className="mockup">
					<div className="video">
						<div className="window">
							<div className="windowTop"></div>
						</div>
						<canvas ref={canvasRef}></canvas>
						<video ref={videoRef} width="540" height="405" muted autoPlay></video>
					</div>
				</div>
				<div className="status">
					<span className="emoji">{emoji}</span>
					<span className="text">You look {textStatus}!</span>
				</div>
			</div>
		</div>
  );
};

export default App;