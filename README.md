# Live Presence

Tiny project to replicate the "Live Presence" feature from [FigJam](https://www.figma.com/figjam/)

### Demo

https://presence.logs.pm/

### Usage (hosted version)

Just include this tag in your site to test things out:

```html
<script src="https://presence.logs.pm/presence.js" onload="_showPresence()"></script>
```

Including the script changes the cursor, begins data collection (mouse position), and allows users to send messages.

The `_showPresence()` function (optional) begins checking for other users, and displays their positions & messages on the screen.

### Self-hosting

Deploys to Heroku / Dokku / Docker / etc.

You might have to modify your BASE_URL in your local copy of `presence.js` if you self-host.

Alternatively, you can just set `window.__BASE_URL` to your base URL before including the script.
