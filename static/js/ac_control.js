document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('connect', function() {
        console.log('Connected to server');
    });

    socket.on('update_data', function(data) {
        document.getElementById('frequency').textContent = data.frequency;
        document.getElementById('acVoltage').textContent = data.ac_voltage;
        document.getElementById('inputCurrent').textContent = data.input_current;
        document.getElementById('outputVoltage').textContent = data.output_voltage;
        document.getElementById('engineCurrent1').textContent = data.engine_current1;
        document.getElementById('engineCurrent2').textContent = data.engine_current2;
        document.getElementById('dcVoltage').textContent = data.dc_voltage;
        document.getElementById('acPower').textContent = data.ac_power;
        document.getElementById('crashSwitch').textContent = data.crash_switch;
        document.getElementById('aSwitch').textContent = data.a_switch;
        document.getElementById('faultReset').textContent = data.fault_reset;
        document.getElementById('bSwitch').textContent = data.b_switch;
    });

    socket.on('disconnect', function() {
        console.log('Disconnected from server');
    });

    // 기타 필요한 이벤트 핸들러 및 함수들...
});