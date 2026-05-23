let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;

export function initAudio(audio: HTMLAudioElement) {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
    }

    if (!source) {
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    return { audioCtx, analyser };
}