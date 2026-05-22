# Sentinel-Core

Sistema académico de monitoreo preventivo para infraestructura eléctrica industrial.

## Objetivo

Sentinel-Core busca detectar condiciones críticas de operación mediante monitoreo continuo de:

- Corriente eléctrica
- Temperatura
- Humedad relativa

Generando alertas tempranas y simulando mecanismos preventivos de protección.

## Tecnologías

Backend:

- Python 3.11
- Django
- Django REST Framework
- SQLite

Frontend:

- React
- TailwindCSS
- Axios

Hardware objetivo:

- ESP32
- ACS712
- DHT22

## Restricciones del proyecto

- tiempo_actualizacion ≤ 2 s
- tiempo_respuesta_alerta ≤ 3 s
- registros_almacenados ≥ 100
- tiempo_interrupcion ≤ 5 s
- 20 °C ≤ temperatura_operacion ≤ 40 °C
- costo_total ≤ 250000 COP
- tiempo_respaldo ≥ 5 min

## Estado

MVP académico local para demostración universitaria.