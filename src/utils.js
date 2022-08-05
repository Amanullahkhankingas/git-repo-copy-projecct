export const startVideo = (video) => {
	if (navigator.mediaDevices === undefined) {
		navigator.mediaDevices = {}
	}
	
	if (navigator.mediaDevices.getUserMedia === undefined) {
		navigator.mediaDevices.getUserMedia = (constraints) => {
			let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			if (!getUserMedia) {
				return Promise.reject(
					new Error('getUserMedia is not implemented in this browser')
				);
			};

			return new Promise((resolve, reject) => {
				getUserMedia.call(navigator, constraints, resolve, reject)
			});
		};
	};

	navigator.mediaDevices
		.getUserMedia({ video: true })
		.then((stream) => {
			if ('srcObject' in video) {
				video.srcObject = stream
			} else {
				video.src = window.URL.createObjectURL(stream)
			}
			video.addEventListener('loadedmetadata', () => {
				video.play();
			});
		})
		.catch((error) => {
			console.error(error)
		});
}