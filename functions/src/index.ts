import * as functions from "firebase-functions";
import fetch from "node-fetch";
export const getRoute = functions.https.onRequest(async (req, res) => {
  const start = req.query.start as string;
  const end = req.query.end as string;
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM2ZTcyZWQ2YTE0MTQ1ZmViNjBjZjUyMGM5Y2U1NGRlIiwiaCI6Im11cm11cjY0In0="; // 🔹 ta clé API ici

  if (!start || !end) {
    res.status(400).json({ error: "start and end query params required" });
    return; // <-- important pour arrêter l'exécution
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data); // <-- on envoie juste la réponse, pas de "return res"
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch route" });
  }
});
