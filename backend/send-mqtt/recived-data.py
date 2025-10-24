import paho.mqtt.client as mqtt

# Define the connection parameters
broker = "localhost"
port = 1883
topic_1 = "casa/habitacion1/temperatura"
topic_2 = "case/cocina/temperatura"


# Define the callback function
def on_connect(client, userdata, flag, rc):
    if rc == 0:
        print("Me he conectado al broker MQTT Mosquitto!")
        client.subscribe(topic_1)
        print(f"Suscrito al topico: {topic_1}")
    else:
        print(f"Hay un error en la conexion!")


def on_message(client, userdata, msg):
    print(f"Mensaje recibido: {msg.payload.decode()}")


# Create a client MQTT
client = mqtt.Client()

# Asignamos la funcion callback para la conexion
client.on_connect = on_connect
client.on_message = on_message

# Conectar al broker
client.connect(broker, port, 60)

# Dejar la coneccion en loop
client.loop_forever()
