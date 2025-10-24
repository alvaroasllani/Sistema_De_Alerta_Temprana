import paho.mqtt.client as mqtt
import time
import random

# Define the connection parameters
broker = "localhost"
port = 1883
topic_1 = "casa/habitacion1/temperatura"
topic_2 = "case/cocina/temperatura"
intervalo = 5


# Define the callback function
def on_connect(client, userdata, flag, rc):
    if rc == 0:
        print(f"Me he conectado al broker MQTT Mosquitto!")
    else:
        print(f"Hay un error en la conexion!")


# Create a client MQTT -> Publica los datos
client = mqtt.Client()

# Asignamos la funcion callback para la conexion
client.on_connect = on_connect

# Conectar al broker
client.connect(broker, port, 60)

# Dejar la coneccion en loop
client.loop_start()

# Publicamos la temperatura cada 5 segundos
try:
    while True:
        temperatura_habitacion = round(random.uniform(20, 30), 2)
        temperatura_cocina = round(random.uniform(20, 30), 2)
        client.publish(topic_1, str(temperatura_habitacion))
        client.publish(topic_2, str(temperatura_cocina))
        time.sleep(intervalo)
except KeyboardInterrupt:
    print("Desconectado del Broker")
    client.loop_stop()
    client.disconnect()
    print("Desconectado")
