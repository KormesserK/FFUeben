let devices = [];

fetch('data.json')
    .then(response => response.json())
    .then(data => devices = data);

function getRandomDevices() {
    const randomDevices = [];
    while (randomDevices.length < 5) {
        const randomIndex = Math.floor(Math.random() * devices.length);
        if (!randomDevices.includes(devices[randomIndex])) {
            randomDevices.push(devices[randomIndex]);
        }
    }
    displayDevices(randomDevices);
}

function displayDevices(devices) {
    const container = document.getElementById('devices');
    container.innerHTML = '';
    devices.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.textContent = `${device.number}: ${device.name}`;
        container.appendChild(deviceElement);
    });
}
