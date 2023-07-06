import {
  AuthorizationCodeWithPKCEStrategy,
  Scopes,
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";

const SPOTIFY_ID = "7d9978d669be45a1a23995ffd4a6b32b";
const SPOTIFY_SCOPES = Scopes.userPlaybackRead;
const REDIRECT_URI = (() => {
  const location = window.document.location;

  return `${location.protocol}//${location.host}/`;
})();

export async function login() {
  const client = new SpotifyApi(
    new AuthorizationCodeWithPKCEStrategy(
      SPOTIFY_ID,
      REDIRECT_URI,
      SPOTIFY_SCOPES
    )
  );
  await client.authenticate();
  console.log(await client.currentUser.profile());
  const currently_playing = await client.player.getCurrentlyPlayingTrack();
  console.log(currently_playing);
  const analysis = await client.tracks.audioAnalysis(currently_playing.item.id);
  console.dir(analysis);
}
