require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID;

async function getAccessToken(clientId, clientSecret) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const res = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    }
  });
  return res.data.access_token;
}

async function getTracksFromPlaylist(playlistId, accessToken) {
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  let tracks = [];
  let next = url;

  while (next) {
    const res = await axios.get(next, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = res.data;
    data.items.forEach(item => {
      const track = item.track || {};
      tracks.push(track);
    });
    next = data.next;
  }
  return tracks;
}

(async () => {
  try {
    const accessToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET);
    const tracks = await getTracksFromPlaylist(PLAYLIST_ID, accessToken);
    console.log('Tracks in playlist:');
    tracks.forEach((track, idx) => {
      console.log(`${idx + 1}. [${track.name}](https://open.spotify.com/track/${track.id})`);
    });
  } catch (err) {
    console.error(err.response ? err.response.data : err);
  }
})();
