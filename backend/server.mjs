import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { getCache, setCache } from './cache.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/public')));
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

app.get('/api/astronomy', async (req, res) => {
    const { location, date } = req.query;
    if (!location || !date) {
        return res.status(400).json({ error: 'Missing location, or date'});
    }

    const astroUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${date}?unitGroup=us&key=${process.env.VISUALCROSSING_API_KEY}&include=days&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`;

    try {
        const response = await fetch(astroUrl);
        const astroData = await response.json();

        if (!astroData.days || astroData.days.length === 0) {
            return res.status(404).json({ error: 'Astronomy Data not found'});
        }

        const { sunrise, sunset, moonrise, moonset, moonphase } = astroData.days[0];

        res.json({
            astronomy: {
                sunrise,
                sunset,
                moonrise,
                moonset,
                moonphase,
            }
        });
    } catch (error) {
        console.log('Astronomy API error', error);
        res.status(500).json({ error: 'Failed to fetch astronomy data '});
    }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));