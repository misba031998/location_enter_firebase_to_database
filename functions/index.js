const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.sendLocationDataToSQL = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection("2025").get();
    if (snapshot.empty) return res.status(200).send("No data to send.");

    const locationData = [];
    const batch = db.batch();

    snapshot.forEach(doc => {
      const d = doc.data();
      locationData.push({
        userId: d.userId,
        userName: d.userName,
        latitude: d.latitude,
        longitude: d.longitude,
        latLongAddress: d.latLongAddress,
        timeStamp: d.timeStamp.toDate().toISOString(),
      });
      batch.delete(doc.ref);
    });

    await axios.post("https://location-rav4.onrender.com/Api/receive-location", {
      locations: locationData
    });

    await batch.commit();
    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});