
console.log('Parsing image and audio file paths and adding them to the DOM');

function addVideoElement () {

    console.log('Page loaded, adding video element to DOM');

    // Format of links required : http://{server url / ip}/?a={path of audio from root}&i={path of image from root}

    const usp = new URLSearchParams(window.location.search);
    const pathToFile = usp.get('a');
    const imageFile = usp.get('i');

    console.log({imageFile});

    const container = document.getElementById("main");

    if(imageFile) {
        const imageElement = document.createElement('img');
        // width="320" height="240" controls
        imageElement.src = imageFile;
        imageElement.width = 320;
        imageElement.height = 240;
        imageElement.alt = 'Image ' + imageFile;
        container.appendChild(imageElement);
    }

    console.log({pathToFile});

    if(pathToFile) {
        const audioElement = document.createElement('audio');
        audioElement.src = pathToFile;
        audioElement.autoplay = true;

        audioElement.controls = true;
        container.appendChild(audioElement);
    }

    if(!pathToFile && !imageFile) {
        const errorElement = document.createElement('p');
        errorElement.innerText = 'No file path provided';
        container.appendChild(errorElement);
    }
}

window.addEventListener('load', addVideoElement);
