SIMULADOR DE CARGAS ELECTRICAS - V4

Incluye:
- Arduino Nano por Web Serial.
- TV Smart 32: 150 W.
- Ventilador de pie: 80 W.
- Lampara LED: 9 W.
- Tarifas residenciales ANDE Categoria 142, Baja Tension, Pliego N21:
  0-50 kWh: 311,55 G/kWh
  51-150 kWh: 349,89 G/kWh
  151-300 kWh: 365,45 G/kWh
  301-500 kWh: 403,82 G/kWh
  501-1000 kWh: 420,27 G/kWh
  >1000 kWh: 435,51 G/kWh
- La factura ANDE estimada aplica un solo precio a todo el consumo mensual segun la faja alcanzada.
- Medidor prepago educativo: permite recargar saldo en guaranies y descontar el consumo durante la simulacion.
- Boton Cupo minimo 50 kWh: propone G. 15.577,50 (50 x 311,55).

IMPORTANTE:
El modo prepago es una simulacion educativa y no representa un servicio prepago comercial de ANDE.
La tarifa/facturacion simulada corresponde al componente de energia; no incluye IVA ni otros conceptos de una factura real.
No conectar la lampara de 240 V ni ninguna carga de red al Arduino. Los enchufes solamente accionan pulsadores de baja tension.

USO:
1. Abrir la carpeta app con VS Code.
2. Iniciar Live Server sobre app/index.html.
3. Cerrar PlatformIO Serial Monitor antes de conectar Web Serial.
4. Pulsar Conectar Arduino y seleccionar el puerto COM del Nano.
5. Recargar saldo, por ejemplo con el Cupo minimo 50 kWh.
6. Enchufar/desenchufar las cargas del tablero.
7. Observar W, kWh, faja ANDE, factura estimada y saldo prepago.

FUENTES OFICIALES ANDE:
https://www.ande.gov.py/tarifas_vigentes.php
https://www.ande.gov.py/consumo_electrod.php
