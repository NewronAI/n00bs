#!/usr/bin/env zx

const { ffmpeg } = require('zx');

const inputImage = 'image.png';
const inputAudio = 'audio.mp3';
const outputVideo = 'output.mp4';

// Use ffmpeg to create a video from the image and audio
await ffmpeg(
  `-loop 1 -i ${inputImage} -i ${inputAudio} -c:v libx264 -c:a aac -shortest ${outputVideo}`
);