# Mobile music playback — 17 November 2026

A phone tester reported no audible music. The previous oscillator-based Web Audio player resumed AudioContext and displayed an enabled state, but did not distinguish interruption/suspension or silent audio routing. The specific phone/browser cause was not independently reproduced.

The soundtrack now uses native HTML audio and two local MP3 loops rendered from Money Lab's original 96-BPM motif. No streaming service or external music dependency is used. `play()` is called directly during the button gesture. The UI waits for playback, handles rejection/stalls, and exposes a retry message. Where supported, the audio session is set to playback. Hiding the page pauses the track; the player explicitly asks for a tap to resume. There is no automatic music on page load.

Some phones control media loudness through hardware buttons rather than the HTML volume property. When programmatic volume is unsupported the player shows a device-volume hint. Users should also check their output device and media volume. No app setting can guarantee audible speaker output on every phone or embedded browser.

Both preview and production serve MP3 with `audio/mpeg`, byte-range responses (including Safari's 0–1 probe), correct lengths and HEAD support. Rendering source: `scripts/render-soundtrack.py` (Python standard library and ffmpeg/libmp3lame). No change to gameplay, HUB, wallet signing or settlement.

Validation: 213 automated tests passed, including synchronous play initiation, rejected/stalled play recovery, background interruption, stale promise rejection and binary range responses. Preview Chrome observed native audio `readyState=4`, `paused=false` and advancing playback time, followed by a successful pause. Physical iPhone/Android speaker confirmation is still pending the reporter's retest.

Background: [Apple media guidance](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html), [WebKit silent-switch issue](https://bugs.webkit.org/show_bug.cgi?id=251532). These describe possible browser constraints, not a confirmed diagnosis of the tester's device.
