require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const cache = {};

app.get('api/tides', async (req, res) => {
    const { lat, lon, date } = req.query;
    const key = `${lat}_${lon}_${date}`;

    if (cache[key] && (Date.now() - cache[key].timestamp < 24 * 60 * 60 * 1000)) {
        return res.json(cache[key].data);
    }

    try {
        const url = `https://www.worldtides.info/api/v3?heights&extremes&date=${date}&lat=${lat}&lon=${lon}&key=${process.env.WORLDTIDES_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        cache[key] = { data, timestamp: Date.now() };
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch tide data'});
    }
});

app.get('api/geocode', async (req, res) => {
    const { location } = req.query;
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.OPENCAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch(error) {
        res.status(500).json({ error: `Failed to fetch location data` });
    }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));