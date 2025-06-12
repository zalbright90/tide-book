import './styles.css';

const form = document.querySelector('#searchForm');
const output = document.querySelector('#output');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.querySelector('#locationInput').value;
    const date = document.querySelector('#dateInput').value;
    if (!date) {
        output.textContent = 'Please select a date.';
        return;
    }

    try {
        const geoRes = await fetch(`http://localhost:3000/api/geocode?location=${encodeURIComponent(location)}`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            output.textContent = 'Location not found.';
            return;
        }

        const { lat, lng } = geoData.results[0].geometry;

        const tideRes = await fetch(`http://localhost:3000/api/tides?lat=${lat}&lon=${lng}&date=${date}`);
        const tideData = await tideRes.json();

        output.textContent = JSON.stringify(tideData, null, 2);
    } catch (err) {
        output.textContent = `Error fetching data: ${err.message}`;
    }
});