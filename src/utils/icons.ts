import L from "leaflet";

// Fonction utilitaire pour créer une icône emoji personnalisée
const createEmojiIcon = (emoji: string, bgColor: string) =>
  L.divIcon({
    html: `<div style="
      font-size: 28px;
      background: ${bgColor};
      border-radius: 50%;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    ">${emoji}</div>`,
    className: "", // important pour ne pas appliquer le style par défaut de Leaflet
    iconSize: [42, 42], // 👈 Taille de ton marqueur
    iconAnchor: [21, 21], // centre l’icône sur la position
    popupAnchor: [0, -20]
  });

export const icons = {
  Restaurant: createEmojiIcon("🍴", "#ffb84d"),
  Parc: createEmojiIcon("🌳", "#7bd389"),
  Museum: createEmojiIcon("🏛️", "#a0a0ff"),
  Subway: createEmojiIcon("🚇", "#ff5e5e"),
  Airport: createEmojiIcon("✈️", "#66ccff"),
};
