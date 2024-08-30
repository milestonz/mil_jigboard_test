// engine_control_scripts.js
document.addEventListener('DOMContentLoaded', function() {
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', function() {
        console.log('WebSocket connected!');
    });

    socket.on('update_data', function(data) {
        document.getElementById('inputVoltage').value = data.input_voltage;
        document.getElementById('vccPlus').value = data.vcc_plus;
        document.getElementById('vccMinus').value = data.vcc_minus;
        document.getElementById('frequency').value = data.frequency;
        document.getElementById('temperature').value = data.temperature;

        updateLamp('lamp2', data.speed === 2);
        updateLamp('lamp72', data.speed === 72);
        updateLamp('lamp100', data.speed === 100);
        updateLamp('lampOS', data.speed === 'OS');
        updateLamp('overTempLamp', data.over_temp);
    });

    document.getElementById('startBtn').addEventListener('click', function() {
        socket.emit('start_engine');
    });

    document.getElementById('ledOnBtn').addEventListener('click', function() {
        controlLED('on');
    });

    document.getElementById('ledOffBtn').addEventListener('click', function() {
        controlLED('off');
    });

    function controlLED(action) {
        fetch('/led_control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: action })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
            document.getElementById('ledStatus').textContent = `LED Status: ${data.message}`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('ledStatus').textContent = 'Error controlling LED';
        });
    }

    function updateLamp(id, isOn) {
        const lamp = document.getElementById(id);
        if (lamp) {
            lamp.classList.toggle('on', isOn);
        }
    }
});