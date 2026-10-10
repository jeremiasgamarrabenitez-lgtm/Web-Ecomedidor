const equipos={
TV:{nombre:'TV Smart 32"',potencia:150,activo:false,energiaWh:0,segundos:0},
VENTILADOR:{nombre:'Ventilador de pie',potencia:80,activo:false,energiaWh:0,segundos:0},
LUZ:{nombre:'Lámpara LED',potencia:9,activo:false,energiaWh:0,segundos:0}
};
const fajas=[
{hasta:50,precio:311.55},
{hasta:150,precio:349.89},
{hasta:300,precio:365.45},
{hasta:500,precio:403.82},
{hasta:1000,precio:420.27},
{hasta:Infinity,precio:435.51}
];
let port=null,reader=null,buffer="",ultimo=Date.now(),saldo=0,recargado=0,ultimoCostoPrepago=0;
const $=id=>document.getElementById(id);
function tarifaAnde(energiaKwh){const f=fajas.find(x=>energiaKwh<=x.hasta)||fajas[fajas.length-1];return f.precio}
function nombreFaja(kwh){if(kwh<=50)return'0–50 kWh';if(kwh<=150)return'51–150 kWh';if(kwh<=300)return'151–300 kWh';if(kwh<=500)return'301–500 kWh';if(kwh<=1000)return'501–1000 kWh';return'Más de 1000 kWh'}
function actualizarAcumulados(){const ahora=Date.now(),dt=Math.max(0,(ahora-ultimo)/1000);ultimo=ahora;const kwhAntes=energiaTotal();const w=potenciaTotal();if(w>0){const costo=dt*w/3600000*tarifaAnde(kwhAntes);saldo=Math.max(0,saldo-costo);ultimoCostoPrepago+=costo}Object.values(equipos).forEach(e=>{if(e.activo){e.energiaWh+=e.potencia*dt/3600;e.segundos+=dt}})}
function potenciaTotal(){return Object.values(equipos).reduce((s,e)=>s+(e.activo?e.potencia:0),0)}
function energiaTotal(){return Object.values(equipos).reduce((s,e)=>s+e.energiaWh,0)/1000}
function formatoTiempo(seg){seg=Math.floor(seg);const h=Math.floor(seg/3600),m=Math.floor(seg%3600/60),s=seg%60;return[h,m,s].map(v=>String(v).padStart(2,'0')).join(':')}
function money(v){return'Gs. '+Math.round(v).toLocaleString('es-PY')}
function num(v){return Number(v).toLocaleString('es-PY',{minimumFractionDigits:2,maximumFractionDigits:2})}
function renderEquipo(nombre,card,txt,tiempo,energia,costo){const e=equipos[nombre];$(card).classList.toggle('activo',e.activo);$(txt).textContent=e.activo?'Conectado':'Desconectado';$(tiempo).textContent=formatoTiempo(e.segundos);$(energia).textContent=num(e.energiaWh/1000)+' kWh';$(costo).textContent=money(e.energiaWh/1000*tarifaAnde(energiaTotal()))}
function render(){
const p=potenciaTotal(),kwh=energiaTotal(),tarifa=tarifaAnde(kwh),costoAnde=kwh*tarifa;
$('potenciaTotal').textContent=p+' W';
$('energiaTotal').textContent=num(kwh)+' kWh';
$('tarifaActual').textContent=num(tarifa)+' Gs/kWh';
$('fajaActual').textContent=nombreFaja(kwh);
$('costoTotal').textContent=money(costoAnde);
$('costoPrepago').textContent=money(Math.max(0,ultimoCostoPrepago));
$('saldo').textContent=money(saldo);
$('saldoKwh').textContent=num(tarifa?saldo/tarifa:0)+' kWh aprox.';
$('recargado').textContent=money(recargado);
$('estadoSaldo').textContent=saldo>0?'Saldo disponible':'Saldo agotado';
$('estadoSaldo').className=saldo>0?'saldo-ok':'saldo-zero';
$('barraSaldo').style.width=Math.min(100,recargado?Math.max(0,saldo/recargado*100):0)+'%';
renderEquipo('TV','cardTv','txtTv','tiempoTv','energiaTv','costoTv');
renderEquipo('VENTILADOR','cardVentilador','txtVentilador','tiempoVentilador','energiaVentilador','costoVentilador');
renderEquipo('LUZ','cardLuz','txtLuz','tiempoLuz','energiaLuz','costoLuz');
}

function procesar(linea){linea=linea.trim();if(!linea)return;log(linea);if(linea==='READY')return;const[nombre,valor]=linea.split('=');if(!(nombre in equipos)||valor===undefined)return;actualizarAcumulados();equipos[nombre].activo=valor.trim()==='1';render();$('mensaje').textContent=equipos[nombre].nombre+' → '+(equipos[nombre].activo?'enchufado':'desenchufado')}
function log(t){const d=document.createElement('div');d.textContent=new Date().toLocaleTimeString()+'  '+t;$('log').appendChild(d);$('log').scrollTop=$('log').scrollHeight}
async function conectar(){if(!('serial'in navigator)){$('mensaje').textContent='Usa Chrome o Edge actualizado para Web Serial.';return}try{port=await navigator.serial.requestPort();await port.open({baudRate:9600});$('estadoConexion').textContent='● Arduino conectado';$('estadoConexion').className='estado on';$('btnConectar').textContent='Desconectar';$('mensaje').textContent='Arduino conectado correctamente.';leer()}catch(e){$('mensaje').textContent='No se pudo conectar: '+e.message;log('ERROR: '+e.message)}}
async function desconectar(){try{if(reader){await reader.cancel();reader.releaseLock();reader=null}if(port)await port.close()}catch(e){}port=null;$('estadoConexion').textContent='● Desconectado';$('estadoConexion').className='estado off';$('btnConectar').textContent='Conectar Arduino'}
async function leer(){const decoder=new TextDecoderStream();port.readable.pipeTo(decoder.writable);reader=decoder.readable.getReader();try{while(true){const{value,done}=await reader.read();if(done)break;buffer+=value;const lineas=buffer.split(/\r?\n/);buffer=lineas.pop();lineas.forEach(procesar)}}catch(e){if(e.name!=='AbortError')log('Serial: '+e.message)}finally{try{reader.releaseLock()}catch(e){}}}
function recargar(){actualizarAcumulados();const monto=Number($('montoRecarga').value)||0;if(monto<=0){$('mensaje').textContent='Ingrese un monto de recarga mayor a 0.';return}saldo+=monto;recargado+=monto;$('mensaje').textContent='Recarga aplicada: '+money(monto);log('RECARGA +'+money(monto));render()}
function cupoMinimo(){const monto=50*fajas[0].precio;$('montoRecarga').value=monto.toFixed(2);$('mensaje').textContent='Cupo mínimo educativo: costo de 50 kWh a la tarifa más baja.'}
$('btnConectar').onclick=async()=>port?await desconectar():await conectar();
$('btnReiniciar').onclick=()=>{Object.values(equipos).forEach(e=>{e.energiaWh=0;e.segundos=0});saldo=0;recargado=0;ultimoCostoPrepago=0;ultimo=Date.now();render();log('NUEVA SIMULACION')};
$('btnRecargar').onclick=recargar;
$('btnCupoMinimo').onclick=cupoMinimo;
setInterval(()=>{actualizarAcumulados();render()},1000);
render();
