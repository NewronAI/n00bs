
console.log('script running');

function addVideoElement () {
    const usp = new URLSearchParams(window.location.search);
    const pathToFile = usp.get('p');

    console.log(pathToFile);


    if(pathToFile){
        const videoElem = document.createElement('video');
        videoElem.src = pathToFile;
        videoElem.autoplay = true;
        // width="320" height="240" controls
        videoElem.width = 320;
        videoElem.height = 240;
        videoElem.controls = true;

        document.body.appendChild(videoElem);
    }
}

window.addEventListener('load', addVideoElement);
