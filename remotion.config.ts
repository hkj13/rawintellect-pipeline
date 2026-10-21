import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setPublicDir('public');
// In cloud sessions, use the preinstalled headless Chromium instead of downloading one.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
