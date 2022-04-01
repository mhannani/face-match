export const human_config = {
    debug: false,
    backend: 'wasm',
    filter: { enabled: false, equalization: false },
    modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models',
    face: { enabled: true, detector: { rotation: false, return: false }, mesh: { enabled: false },
        iris: { enabled: false }, description: { enabled: false },
        emotion: { enabled: false } },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
}