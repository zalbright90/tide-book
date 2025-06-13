import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

import { getCache, setCache } from './cache.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/geocode', async (req, res) => {
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

app.get('/api/tides', async (req, res) => {
    const { lat, lon, date } = req.query;
    const key = `${lat}_${lon}_${date}`;
    console.log(`Received tide request: ${key}`);

    const cached = getCache(key);
        if (cached) {
            console.log('Serving tide data from cache');
            return res.json(cached);
        }

    try {
        const url = `https://www.worldtides.info/api/v3?extremes&date=${date}&lat=${lat}&lon=${lon}&key=${process.env.WORLDTIDES_API_KEY}`;
        console.log(`Fetching from WorldTides: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log(`WorldTides response received for ${key}`);

        setCache(key,data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching tide data:', error);
        res.status(500).json({ error: 'failed to fetch tide data' });
    }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));