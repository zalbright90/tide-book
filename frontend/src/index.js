import './styles.css';
import Chart from 'chart.js/auto';

const form = document.querySelector('#searchForm');
const pre = document.querySelector('pre');
const output = document.querySelector('#output');

let tideContainer = document.querySelector('#tide-display');

if (!tideContainer) {
    tideContainer = document.createElement('div');
    tideContainer.id = 'tide-display';
    tideContainer.style.padding = '1rem';
    tideContainer.style.backgroundColor = '#f0f8ff';
    tideContainer.style.borderRadius = '1rem';
    tideContainer.style.marginTop = '2rem';
    const main = document.querySelector('main');
    main.appendChild(tideContainer);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = document.querySelector('#locationInput').value;
    const date = document.querySelector('#dateInput').value;
    if (!date) {
        alert('Please select a date.');
        return;
    }

    try {
        const geoRes = await fetch(`http://localhost:3000/api/geocode?location=${encodeURIComponent(location)}`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('Location not found.');
            return;
        }

        const { lat, lng } = geoData.results[0].geometry;

        const tideRes = await fetch(`http://localhost:3000/api/tides?lat=${lat}&lon=${lng}&date=${date}`);

        const tideData = await tideRes.json();

        const astroRes = await fetch(`http://localhost:3000/api/astronomy?location=${encodeURIComponent(location)}&date=${date}`);
        const astroData = await astroRes.json();
        console.log('Astronomy data:', astroData);

        output.textContent = '';
        tideContainer.innerHTML = '';
        form.style.display = 'none';
        if (output) pre.style.display = 'none';

        const locationName = tideData.station || "Unidentified Location";

        function formatDateLabel(dateString) {
            const parts = dateString.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const dateObject = new Date(year, month, day);

            const options = {weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'};
            return dateObject.toLocaleDateString('en-US', options);
        }

        const dateLabel = formatDateLabel(date);

        const title = document.createElement('h2');
        title.textContent = `${locationName} Tide Chart for ${dateLabel}`;
        title.style.textAlign = 'center';
        title.style.fontFamily = 'serif';
        title.style.color = '#003366';
        tideContainer.appendChild(title);

        const heightsInFeet = tideData.extremes.map(e => +(e.height * 3.28084).toFixed(2));

        const labels = tideData.extremes.map(e => {
            const d = new Date(e.date);
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = d.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
            return `${time} [${date}]`;
        });
        const heights = heightsInFeet;

        const chartListWrapper = document.createElement('div');
        chartListWrapper.classList.add('chart-list-wrapper');

        const chartWrapper = document.createElement('div');
            chartWrapper.classList.add('chart-wrapper');

        const canvas = document.createElement('canvas');
            chartWrapper.appendChild(canvas);

        new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Tide Height (ft)',
                    data: heights,
                    borderColor: '#006699',
                    backgroundColor: 'rgba(0,102,153,0.1)',
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#006699',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: '#003366',
                        },
                        title: {
                            display: true,
                            text: 'Height (ft)',
                            color: '#003366'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#003366',
                        },
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#003366'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.raw.toFixed(2)} feet`
                        }
                    }
                }
            }
        });

        const tideList = document.createElement('ul');
        tideList.classList.add('tide-list');

        tideData.extremes.forEach(extreme => {
            const item = document.createElement('li');
            const time = new Date(extreme.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            item.textContent = `${extreme.type} Tide: ${time} | ${(extreme.height * 3.28084).toFixed(2)} ft`;
            tideList.appendChild(item);
        });

        chartListWrapper.appendChild(chartWrapper);
        chartListWrapper.appendChild(tideList);

        tideContainer.appendChild(chartListWrapper);
    } catch (err) {
        alert(`Error fetching data: ${err.message}`);
    }
});