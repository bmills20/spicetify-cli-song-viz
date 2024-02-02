//@ts-check

// NAME: SongAudioAnalysis
// AUTHOR: bmills20
// DESCRIPTION: Visualize a song's stats, such as danceability and acousticness, via a radar graph.

/// <reference path="../../spicetify-cli/globals.d.ts" />

(function initExtension() {
  const { CosmosAsync, ContextMenu, URI } = Spicetify;
  if (!(CosmosAsync && URI)) {
    setTimeout(initExtension, 300);
    return;
  }
  // @ts-ignore
  var local_language = Spicetify.Locale._locale;
  const translation = {
    en: {
      titletxt: "Audio Analysis",
      buttontxt: "View Audio Visualization",
      danceability: "Danceability",
      energy: "Energy",
      key: "Key",
      loudness: "Loudness",
      speechiness: "Speechiness",
      acousticness: "Acousticness",
      instrumentalness: "Instrumentalness",
      liveness: "Liveness",
      valence: "Valence",
      tempo: "Tempo",
      popularity: "Popularity",
      releaseDate: "Release Date",
    },
    fr: {
      titletxt: "Statistique de la musique",
      buttontxt: "Voir les statistique de la musique",
      danceability: "Capacité à danser",
      energy: "Énergie",
      key: "Tonalité",
      loudness: "Intensité sonore",
      speechiness: "Élocution",
      acousticness: "Acoustique",
      instrumentalness: "instrumentalité",
      liveness: "vivacité",
      valence: "Mood",
      tempo: "Tempo",
      popularity: "Popularité",
      releaseDate: "Date de sortie",
    },
    "fr-CA": {
      titletxt: "Statistique de la musique",
      buttontxt: "Voir les statistique de la musique",
      danceability: "Capacité à danser",
      energy: "Énergie",
      key: "Tonalité",
      loudness: "Intensité sonore",
      speechiness: "Élocution",
      acousticness: "Acoustique",
      instrumentalness: "instrumentalité",
      liveness: "vivacité",
      valence: "Mood",
      tempo: "Tempo",
      popularity: "Popularité",
      releaseDate: "Date de sortie",
    },
    cs: {
      titletxt: "Statistiky písně",
      buttontxt: "Zobrazit statistiky písně",
      danceability: "Tančitelnost",
      energy: "Energie",
      key: "Tónina",
      loudness: "Hlasitost",
      speechiness: "Mluvenost",
      acousticness: "Akustičnost",
      instrumentalness: "Nástrojovost",
      liveness: "Živost",
      valence: "Emoční náboj",
      tempo: "Tempo",
      popularity: "Popularita",
      releaseDate: "Datum vydání",
    },
    de: {
      titletxt: "Songstatistiken",
      buttontxt: "Songstatistiken anzeigen",
      danceability: "Tanzbarkeit",
      energy: "Energie",
      key: "Tonart",
      loudness: "Lautstärke",
      speechiness: "Sprechanteil",
      acousticness: "Akustik",
      instrumentalness: "Instrumentalität",
      liveness: "Lebendigkeit",
      valence: "Stimmung",
      tempo: "Tempo",
      popularity: "Beliebtheit",
      releaseDate: "Veröffentlichungsdatum",
    },
    es: {
      titletxt: "Estadísticas de la canción",
      buttontxt: "Ver estadísticas de la canción",
      danceability: "Bailable",
      energy: "Energía",
      key: "Tono",
      loudness: "Volumen",
      speechiness: "Habla",
      acousticness: "Acústica",
      instrumentalness: "Instrumental",
      liveness: "Vivacidad",
      valence: "Estado de ánimo",
      tempo: "Tempo",
      popularity: "Popularidad",
      releaseDate: "Fecha de lanzamiento",
    },
  };

  try {
    translation[local_language]["buttontxt"];
  } catch {
    local_language = "en";
  }

  const titletxt = translation[local_language]["titletxt"];
  const buttontxt = translation[local_language]["buttontxt"];
  const danceability = translation[local_language]["danceability"];
  const energy = translation[local_language]["energy"];
  const key = translation[local_language]["key"];
  const loudness = translation[local_language]["loudness"];
  const speechiness = translation[local_language]["speechiness"];
  const acousticness = translation[local_language]["acousticness"];
  const instrumentalness = translation[local_language]["instrumentalness"];
  const liveness = translation[local_language]["liveness"];
  const valence = translation[local_language]["valence"];
  const tempo = translation[local_language]["tempo"];
  const popularity = translation[local_language]["popularity"];
  const releaseDate = translation[local_language]["releaseDate"];

  const features = [
    "danceability",
    "energy",
    "loudness",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
  ];

  const angleSliceRadians = (2 * Math.PI) / features.length;
  const radius = 80;
  const labelRadius = radius;

  async function getSongStats(uris) {
    const uri = uris[0];
    const uriObj = Spicetify.URI.fromString(uri);
    const uriFinal = uri.split(":")[2];

    let res;
    try {
      res = await CosmosAsync.get(
        "https://api.spotify.com/v1/audio-features/" + uriFinal
      );
    } catch (error) {
      console.error("Error fetching audio features:", error);
      return;
    }

    if (!res || typeof res.danceability === "undefined") {
      console.error("Unexpected response:", res);
      return;
    }

    const radarChart = await RadarChart(res);

    const axes = radarChart.points
      .map((point, i) => {
        const feature = features[i];
        const label = feature.charAt(0).toUpperCase() + feature.slice(1);
        const angle = angleSliceRadians * i;
        const labelPoint = {
          x: Math.cos(angle - Math.PI / 2) * labelRadius,
          y: Math.sin(angle - Math.PI / 2) * labelRadius,
        };
        return `
          <line
            x1="0"
            y1="0"
            x2="${point.x}"
            y2="${point.y}"
            stroke="rgba(136, 132, 216, 0.8)"
            stroke-width="1"
          />
          <text
            x="${labelPoint.x}"
            y="${labelPoint.y}"
            fill="rgba(136, 132, 216, 0.8)"
            font-size="6"
            text-anchor="middle"
            alignment-baseline="middle"
          >
            ${label}
          </text>
        `;
      })
      .join("");
    if (radarChart && radarChart.radarPath && radarChart.points) {
      Spicetify.PopupModal.display({
        title: `${titletxt}`,
        isLarge: true,
        content: `
                    <style>
                            .stats-table {
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    width: 100%;
                                    height: 100%;
                                    border-collapse: collapse;
                                    background: var(--spice-background);
                            }
                            .stats-cell {
                                    display: table-cell;
                                    padding: 2px;
                                    font-weight: 550;
                                    color: var(--spice-text);
                            }
                            .stats-cell:nth-child(even) {
                                    font-weight: 400;
                            }
                    </style>
                    <div class="stats-table">
                            <svg width="90%" height="90%" viewBox="-110 -110 220 220">
                                    <path
                                            d="${radarChart.radarPath}"
                                            fill="rgba(136, 132, 216, 0.7)"
                                            stroke="rgba(136, 132, 216, 0.8)"
                                            stroke-width="2"
                                    />
                                    ${axes}
                            </svg>
                    </div>
            `,
      });
    }
  }

  async function RadarChart(data) {
    // Normalize the "ness" values and similar measures
    const normalizedData = features.map((feature) => {
      let value = data[feature];
      if (feature === "loudness") {
        // Normalize loudness (usually between -60 and 0) to 0-1
        value = (value + 60) / 60;
      } else if (feature === "tempo") {
        // Normalize tempo (usually between 50 and 200) to 0-1
        value = (value - 50) / 150;
      }

      // Ensure the value is between 0 and 1
      return Math.min(Math.max(value, 0), 1);
    });

    // Generate points for the radar chart
    const points = normalizedData.map((value, i) => {
      const angle = angleSliceRadians * i;
      return {
        x: Math.cos(angle - Math.PI / 2) * radius * value,
        y: Math.sin(angle - Math.PI / 2) * radius * value,
      };
    });

    // Generate SVG path for the radar chart
    const radarPath =
      points
        .map((point, i) => (i === 0 ? "M" : "L") + `${point.x},${point.y}`)
        .join(" ") + "Z";

    return { points, radarPath };
  }

  function shouldDisplayContextMenu(uris) {
    if (uris.length > 1) {
      return false;
    }

    const uri = uris[0];
    const uriObj = Spicetify.URI.fromString(uri);
    if (uriObj.type === Spicetify.URI.Type.TRACK) {
      return true;
    }
    return false;
  }

  const cntxMenu = new Spicetify.ContextMenu.Item(
    buttontxt,
    getSongStats,
    shouldDisplayContextMenu
  );

  cntxMenu.register();
})();
