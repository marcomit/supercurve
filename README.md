# SuperCurve

It's a 3D-style pong game written in pure Javascript.

![](multi/images/supercurve_ss_280.jpg)

[Single version](https://icebob.info/supercurve/)


[Multiplayer version](https://icebob.info/supercurve/multi/)

# History

I created this game in 2011 (13 years ago) in pure ES5 Javascript (without any frameworks). The game was developed for a competition showcasing the HTML5 capabilities of Microsoft Hungary, and it secured the second place in the competition.

Later on, I also created a multiplayer version of the game.

# Tech stack

- The game is deployed to Github Pages with Github Actions
- The highscores is rewritten from PHP + MySQL to Cloudflare Workers + D1
- The multiplayer server is written by Node.js (v0.8.x not v8.0) and deployed to Fly.io

# Deploy

## Frontend

Push the commits and GH Actions will deploy to Github Pages

## Highscores

```bash
cd workers
npm run deploy
```

## Multi server

```bash
fly deploy
```

# Contact

Copyright (C) 2024 Icebob

[![@icebob](https://img.shields.io/badge/github-icebob-green.svg)](https://github.com/icebob) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)
