## Description

1. Create .env file in root directory, add your keys:

```
PHONE_NUMBER=+79991113322
API_ID=7777777
API_HASH=supersecretkey
```

## Before starting set everything you need in src/index.js
example:
```
* telegram channel id:      myChannelId = '1793809121'
* fullVideoName:            videoName = 'The.Lord.of.the.Rings.The.Rings.of.Power.S01E01.720p.ColdFilm.mp4';
* video mimeType:           mimeType = 'video/mp4';
* full video path:          videoPath = path.join(__dirname, 'videos', videoName);
```

## To start script run command

```
npm install

npm run start
```

### List of all command available in package.json