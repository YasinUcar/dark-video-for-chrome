# Video Dark Mode (Chrome Extension)

On pages that play videos (YouTube, Udemy, etc.), if the video's own content has a bright/white background (for example, a white-themed code editor or a white slide), it automatically makes the video dark. It does not affect the rest of the page; it only applies a CSS filter to the `<video>` element.

## How does it work?

* While the video is playing, a frame is periodically drawn to a small canvas and its average brightness is measured.
* If the brightness exceeds the threshold (default: 140/255), the `invert(1) hue-rotate(180deg)` filter is applied to the video — this produces the most natural result for code/screen-recording videos.
  You can also switch to "darken" mode in the settings (more suitable for colorful/real-life videos; it does not invert the colors, it only reduces the brightness).

## Installation (unpacked)

1. Extract the ZIP file into a folder.
2. Go to `chrome://extensions` in Chrome.
3. Enable **Developer mode** in the top-right corner.
4. Click the **Load unpacked** button and select the folder you extracted.
5. Click the extension icon in the top-right corner to open the settings.

## Important limitation (browser security)

On some websites (especially YouTube and DRM-protected content — Netflix, some Udemy players, etc.), the browser completely prevents JavaScript from reading the video's pixels for security reasons (CORS / DRM). In these cases, automatic detection will not work for that video — this is not a bug, but an intentional browser security restriction that an extension cannot bypass.

In these cases:

* You can disable **"Auto detect"** from the popup and always display the video using the selected mode, or
* Use the `Alt+Shift+D` shortcut to instantly toggle the dark mode for the video on the current page
  (you can change the shortcut from `chrome://extensions/shortcuts`).

## Settings (click the extension icon)

* **Global on/off**: Completely disables the extension.
* **Auto detect**: When enabled, it decides based on brightness; when disabled, it always applies the selected mode on the site.
* **Sensitivity**: The lower the threshold, the sooner the video is considered to have a "bright background."
* **Invert / Darken**: Two different dark mode strategies.
* **Disable on this site**: Disables the extension only for the current domain
  (for example, if you do not want the colors to be altered on a website where you watch movies).

## Files

* `manifest.json` — extension definition (Manifest V3)
* `content.js` — video detection, brightness measurement, filter application
* `content.css` — dark filter classes
* `background.js` — installation and keyboard shortcut
* `popup.html / popup.css / popup.js` — settings interface
* `icons/` — extension icons
