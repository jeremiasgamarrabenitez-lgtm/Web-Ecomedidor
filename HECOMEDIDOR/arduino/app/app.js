const equipos={
 TV:{potencia:80,activo:false,energiaWh:0,segundos:0},
 COCINA:{potencia:1800,activo:false,energiaWh:0,segundos:0},
 CARGADOR:{potencia:10,activo:false,energiaWh:0,segundos:0}
};
let port=null,reader=null,buffer="",ultimo=Date.now();
const $=id=>document.getElementById(id);
function tarifa(){return Number($("tarifa").value)||0}
function actualizarAcumulados(){
 const ahora=Date.now(),dt=(ahora-ultimo)/1000;ultimo=ahora;
 Object.values(equipos).forEach(e=>{if(e.activo){e.energiaWh+=e.potencia*dt/3600;e.segundos+=dt;}});
}
function potenciaTotal(){return Object.values(equipos).reduce((s,e)=>s+(e.activo?e.potencia:0),0)}
function formatoTiempo(seg){seg=Math.floor(seg);const h=Math.floor(seg/3600),m=Math.floor(seg%3600/60),s=seg%60;return [h,m,s].map((v,i)=>i===0?String(v).padStart(2,"0"):String(v).padStart(2,"0")).join(":")}
function money(v){return "Gs. "+Math.round(v).toLocaleString("es-PY")}
function renderEquipo(nombre,card,txt,tiempo,energia,costo){
 const e=equipos[nombre];$(card).classList.toggle("activo",e.activo);$(txt).textContent=e.activo?"Conectado":"Desconectado";
 $(tiempo).textContent=formatoTiempo(e.segundos);$(energia).textContent=(e.energiaWh/1000).toFixed(3).replace(".",",")+" kWh";$(costo).textContent=money(e.energiaWh/1000*tarifa());
}
function render(){
 const p=potenciaTotal(),energia=Object.values(equipos).reduce((s,e)=>s+e.energiaWh,0);
 $("potenciaTotal").textContent=p+" W";$("energiaTotal").textContent=(energia/1000).toFixed(3).replace(".",",")+" kWh";$("costoTotal").textContent=money(energia/1000*tarifa());
 renderEquipo("TV","cardTv","txtTv","tiempoTv","energiaTv","costoTv");
 renderEquipo("COCINA","cardCocina","txtCocina","tiempoCocina","energiaCocina","costoCocina");
 renderEquipo("CARGADOR","cardCargador","txtCargador","tiempoCargador","energiaCargador","costoCargador");
}
function procesar(linea){
 linea=linea.trim();if(!linea)return;log(linea);if(linea==="READY")return;
 const [nombre,valor]=linea.split("=");if(!(nombre in equipos)||valor===undefined)return;
 actualizarAcumulados();equipos[nombre].activo=valor.trim()==="1";render();
 $("mensaje").textContent=nombre+" → "+(equipos[nombre].activo?"enchufado":"desenchufado");
}
function log(t){const d=document.createElement("div");d.textContent=new Date().toLocaleTimeString()+"  "+t;$("log").appendChild(d);$("log").scrollTop=$("log").scrollHeight}
async function conectar(){
 if(!("serial" in navigator)){ $("mensaje").textContent="Usa Chrome o Edge actualizado para Web Serial.";return;}
 try{port=await navigator.serial.requestPort();await port.open({baudRate:9600});$("estadoConexion").textContent="● Arduino conectado";$("estadoConexion").className="estado on";$("btnConectar").textContent="Desconectar";$("mensaje").textContent="Arduino conectado correctamente.";leer();}
 catch(e){$("mensaje").textContent="No se pudo conectar: "+e.message;log("ERROR: "+e.message)}
}
async function desconectar(){try{if(reader){await reader.cancel();reader.releaseLock();reader=null}if(port)await port.close()}catch(e){}port=null;$("estadoConexion").textContent="● Desconectado";$("estadoConexion").className="estado off";$("btnConectar").textContent="Conectar Arduino"}
async function leer(){
 const decoder=new TextDecoderStream();port.readable.pipeTo(decoder.writable);reader=decoder.readable.getReader();
 try{while(true){const {value,done}=await reader.read();if(done)break;buffer+=value;const lineas=buffer.split(/\r?\n/);buffer=lineas.pop();lineas.forEach(procesar)}}catch(e){log("Serial: "+e.message)}finally{try{reader.releaseLock()}catch(e){}}
}
$("btnConectar").onclick=async()=>port?await desconectar():await conectar();
$("btnReiniciar").onclick=()=>{Object.values(equipos).forEach(e=>{e.energiaWh=0;e.segundos=0});ultimo=Date.now();render();log("NUEVA SIMULACION")};
$("tarifa").oninput=render;
setInterval(()=>{actualizarAcumulados();render()},1000);
render();
