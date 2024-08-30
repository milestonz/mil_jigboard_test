# app.py
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import serial
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # 보안을 위해 실제 배포 시 변경 필요
socketio = SocketIO(app)

# 시리얼 포트 설정
SERIAL_PORT = 'COM14'
BAUD_RATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Serial port successfully opened at: {SERIAL_PORT}")
except serial.SerialException as e:
    print(f"Error opening serial port: {e}")
    ser = None

def read_serial():
    while True:
        if ser and ser.in_waiting:
            try:
                line = ser.readline().decode('utf-8').strip()
                data = parse_serial_data(line)
                socketio.emit('update_data', data)
            except Exception as e:
                print(f"Error reading from serial: {e}")
        time.sleep(0.1)

def parse_serial_data(line):
    # 실제 구현은 수신되는 데이터 형식에 따라 달라집니다
    return {
        'input_voltage': 0,
        'vcc_plus': 0,
        'vcc_minus': 0,
        'frequency': 0,
        'temperature': 0,
        'speed': 0,
        'over_temp': False
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/engine_control')
def engine_control():
    return render_template('engine_control.html')

@app.route('/led_control', methods=['POST'])
def led_control():
    if ser is None:
        return jsonify({'message': 'Serial port not available'}), 500

    data = request.get_json()
    action = data.get('action')

    if action == 'on':
        command = b'LED_ON\n'
    elif action == 'off':
        command = b'LED_OFF\n'
    else:
        return jsonify({'message': 'Invalid action'}), 400

    try:
        ser.write(command)
        print(f"Sent to Serial Port: {command.decode('utf-8').strip()}")
        return jsonify({'message': f'LED_{action.upper()}'})
    except Exception as e:
        print(f"Error sending command to serial port: {e}")
        return jsonify({'message': 'Error controlling LED'}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_engine')
def handle_start_engine():
    if ser:
        ser.write(b'START_ENGINE\n')
        print("Sent to Serial Port: START_ENGINE")
    else:
        print("Serial port not available")

if __name__ == '__main__':
    # 시리얼 읽기 스레드 시작
    if ser:
        thread = threading.Thread(target=read_serial)
        thread.daemon = True
        thread.start()

    socketio.run(app, debug=True, use_reloader=False)