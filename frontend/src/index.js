import './styles.css';

const form = document.querySelector('#searchForm');
const output = document.querySelector('#output');

let tideContainer = document.querySelector('#tide-display');

if (!tideContainer) {
    tideContainer = document.createElement('div');
    tideContainer.id = 'tide-display';
    tideContainer.style.padding = '1rem';
    tideContainer.style.backgroundColor = '#f0f8ff';
    tideContainer.style.borderRadius = '1rem';
    tideContainer.style.marginTop = '2rem';
    document.body.appendChild(tideContainer);
}

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

        output.textContent = '';
        tideContainer.innerHTML = '';

        const locationName = tideData.station || "Unidentified Location";
        const firstTideDate = tideData.extrames?.[0]?.date?.split("T")[0] || "Unspecified Date";

        function formatDateLabel(dateString) {
            const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'};
            return new Date(dateString).toLocaleDateString('en-US', options);
        }

        const title = document.createElement('h2');
        title.textContent = `${locationName} Tide Chart for ${formatDateLabel(firstTideDate)}`;
        title.style.textAlign = 'center';
        title.style.fontFamily = 'serif';
        title.style.color = '#003366';
        tideContainer.appendChild(title);

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "150");
        svg.setAttribute("viewBox", "0 0 800 150");
        svg.style.background = "#e6f7ff";
        svg.style.borderRadius = "10px";
        svg.style.marginBottom = "1rem";

        const maxHeight = Math.max(...tideData.extremes.map(e => e.height));
        const minHeight = Math.min(...tideData.extremes.map(e => e.height));

        const points = tideData.extremes.map((point, i) => {
            const x = i * (800 / (tideData.extremes.length - 1));
            const y = 130 - ((point.height - minHeight) / (maxHeight - minHeight)) * 100;
            return `${x},${y}`;
        }).join(' ');

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", points);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", "#003366");
        polyline.setAttribute("stroke-width", "2");

        svg.appendChild(polyline);
        tideContainer.appendChild(svg);

        const tideList = document.createElement('ul');
        tideList.style.listStyle = 'none';
        tideList.style.padding = 0;

        tideData.extremes.forEach(extreme => {
            const item = document.createElement('li');
            const time = new Date(extreme.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            item.textContent = `${extreme.type} Tide: ${time} — ${extreme.height}m`;
            item.style.fontFamily = 'monospace';
            item.style.padding = '0.25rem 0';
            tideList.appendChild(item);
        });

        tideContainer.appendChild(tideList);
    } catch (err) {
        output.textContent = `Error fetching data: ${err.message}`;
    }
});