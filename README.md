# Dark Video 🌙

A lightweight Chrome extension that automatically makes bright HTML5 videos darker and more comfortable to watch.

Dark Video is designed for video-based learning, coding tutorials, lectures, and other content where a bright white video background can be distracting.

## What it does

- **Smart Mode** — checks the current video frame and applies the dark filter when the video appears predominantly bright.
- **Always Dark** — applies the dark filter to every detected HTML5 video.
- **Adjustable Darkness** — control how strongly the video is darkened.
- **Adjustable Brightness** — fine-tune the final result.
- **Runs locally** — video processing happens directly in the browser; no account or external backend is required.
- **Works across sites** — targets standard HTML5 `<video>` elements, including many players used by YouTube, Udemy, and other video websites.

## How to install

This project is distributed as an unpacked Chrome extension.

1. Download or clone this repository.
2. Open `chrome://extensions/` in Chrome or another Chromium-based browser.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder (the folder containing `manifest.json`).
6. Open a video website and click the **Dark Video** extension icon.

Chrome may show a notice that the extension is running in developer mode. That is expected for an unpacked extension.

## How to use

Open the extension popup and choose:

- **Enabled** — turn Dark Video on or off.
- **Smart — light videos only** — automatically darken bright videos.
- **Always dark** — always apply the filter.
- **Darkness** — adjust the strength of the dark effect.
- **Brightness** — adjust the resulting brightness.

Click **Apply settings** after changing the options.

## How it works

In Smart Mode, Dark Video samples a small version of the current video frame and estimates its overall brightness. When the frame is sufficiently bright, a CSS filter is applied directly to the video element.

This keeps the extension lightweight and avoids sending video data to a server.

## Compatibility

Dark Video works with pages that expose a standard HTML5 `<video>` element.

Some DRM-protected, canvas-based, embedded, or heavily customized players may behave differently. In those cases the browser may not allow the current video frame to be sampled, and Smart Mode may not be able to determine whether the video is bright.

## Permissions

The extension only requests the `storage` permission so it can save your settings.

## Project structure

```text
Dark-Video/
├── content.js
├── content.css
├── manifest.json
├── popup.html
├── popup.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## License

MIT License. See `LICENSE` for details.
