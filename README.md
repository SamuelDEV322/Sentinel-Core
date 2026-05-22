# Sentinel-Core

Sistema academico de monitoreo preventivo para infraestructura electrica industrial.

El MVP local recibe lecturas de corriente, temperatura y humedad desde un ESP32 o desde botones de simulacion, guarda los datos en SQLite y los muestra en un dashboard web con metricas, tabla y graficas en tiempo real.

## Correr backend

Desde la raiz del proyecto:

```bash
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

API local:

```text
http://localhost:8000/api/readings/
http://localhost:8000/api/readings/latest/
http://localhost:8000/api/readings/stats/
http://localhost:8000/api/readings/clear/
```

## Correr frontend

En otra terminal:

```bash
cd frontend
npm install
npm install recharts
npm run dev
```

Abrir la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Endpoint para ESP32

Enviar una lectura con `POST` a:

```text
http://localhost:8000/api/readings/
```

Headers:

```text
Content-Type: application/json
```

JSON normal:

```json
{
  "current_a": 1.8,
  "temperature_c": 31.5,
  "humidity_pct": 62
}
```

JSON critico:

```json
{
  "current_a": 3.2,
  "temperature_c": 32,
  "humidity_pct": 60
}
```

El backend calcula automaticamente `critical` y `alert`. Una lectura es critica si `temperature_c < 20`, `temperature_c > 40`, `current_a >= 2.5` o `humidity_pct > 90`.

## Probar con Bruno

Crear una coleccion local con estas peticiones:

```text
GET http://localhost:8000/api/readings/
GET http://localhost:8000/api/readings/latest/
GET http://localhost:8000/api/readings/stats/
POST http://localhost:8000/api/readings/
DELETE http://localhost:8000/api/readings/clear/
```

Para el `POST`, usar `Body -> JSON` y pegar cualquiera de los ejemplos anteriores. La respuesta debe incluir `alert`, `critical` y `created_at`.

## Dashboard

El frontend consulta el backend cada 2 segundos y muestra:

- Corriente, temperatura, humedad y estado actual
- Graficas de corriente, temperatura y humedad vs tiempo con Recharts
- Estado de conexion API y ultima actualizacion
- Total real de registros almacenados
- Ultimas 10 lecturas recibidas
- Umbrales operativos para demo con ESP32

## Stack

- Django 5.2
- Django REST Framework
- django-cors-headers
- SQLite
- React + Vite
- TailwindCSS
- Axios
- Recharts
