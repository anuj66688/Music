// src/services/lyricsApi.js

// Pre-defined mock lyrics to use if the API goes down or doesn't have the song
const mockLyricsDatabase = {
  "neon skyline": {
    "midnight drive": `[00:05.00] Speeding through the neon light
[00:10.00] Underneath the starry night
[00:15.00] Midnight drive, just you and me
[00:20.00] Driving wild and driving free
[00:25.00] 
[00:30.00] Synthesizer in the air
[00:35.00] Wind is blowing in your hair
[00:40.00] Oh, we live for nights like these
[00:45.00] Drifting down the memories
[00:50.00] 
[00:55.00] (Chorus)
[01:00.00] Into the sunset, we will go
[01:05.00] Feel the rhythm, let it flow
[01:10.00] Neon lines and cyber space
[01:15.00] We have found our perfect place`
  },
  "acoustic dreams": {
    "summer breeze": `[00:12.00] Golden sun is going down
[00:18.00] Far away from busy town
[00:24.00] Feel the grass beneath our feet
[00:30.00] Summer breeze so soft and sweet
[00:36.00] 
[00:42.00] Singing tunes of simple days
[00:48.00] Lost inside the acoustic haze
[00:54.00] Nothing is as fine as this
[01:00.00] Pure and natural summer bliss`
  },
  "lo-fi lullabies": {
    "rainy cafe": `[00:05.00] (Instrumental Chill Beats)
[00:30.00] Raindrops falling on the glass
[00:45.00] Coffee warm and hours pass
[01:00.00] Soft piano in the background plays
[01:15.00] Cozy lo-fi rainy days...
[01:30.00] (Instrumental Outro)`
  }
};

/**
 * Fetches lyrics for a given artist and song title.
 * Automatically falls back to high-fidelity mock lyrics if not found or if the API fails.
 */
export const lyricsApi = {
  async fetchLyrics(artist, title) {
    const cleanArtist = artist.trim().toLowerCase();
    const cleanTitle = title.trim().toLowerCase();

    // Check if we have standard mock lyrics first
    if (mockLyricsDatabase[cleanArtist]?.[cleanTitle]) {
      return mockLyricsDatabase[cleanArtist][cleanTitle];
    }

    try {
      // Fetch from lyrics.ovh
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
        headers: { "Accept": "application/json" }
      });
      
      if (!response.ok) throw new Error("Lyrics not found on lyrics.ovh");
      
      const data = await response.json();
      if (data.lyrics) {
        return data.lyrics;
      }
      throw new Error("No lyrics returned in payload");
    } catch (error) {
      console.warn(`Lyrics.ovh fetch failed for "${title}" by "${artist}". Generating simulated lyrics.`);
      return generateDynamicMockLyrics(artist, title);
    }
  }
};

// Generates beautiful placeholders if lyrics are unavailable
const generateDynamicMockLyrics = (artist, title) => {
  return `[00:00.00] "VibeFlow - Synced Lyrics Engine"
[00:05.00] Now playing: ${title}
[00:10.00] By: ${artist}
[00:15.00] 
[00:20.00] [Verse 1]
[00:25.00] Listening to the rhythms in the air
[00:30.00] Feel the bass line floating everywhere
[00:35.00] Waves of music crash upon the shore
[00:40.00] Making us just want to listen more
[00:45.00] 
[00:50.00] [Chorus]
[00:55.00] VibeFlow is in your soul tonight
[01:00.00] Sing along under the flashing light
[01:05.00] Turn it up and let the music play
[01:10.00] All our worries start to fade away
[01:15.00] 
[01:20.00] [Verse 2]
[01:25.00] Moving to the heartbeat of the sound
[01:30.00] Floating high, our feet off the ground
[01:35.00] In this flow, we finally are free
[01:40.00] Riding waves of pure harmony
[01:45.00] 
[01:50.00] [Outro]
[01:55.00] (Music fades...)
[02:00.00] Thank you for listening to VibeFlow!`;
};

export default lyricsApi;
