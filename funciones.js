// ==========================================
// REFERENCIAS DOM – CONTROLES
// ==========================================
const q1_slider = document.getElementById('q1_slider');
const q1_input  = document.getElementById('q1_input');
const q2_slider = document.getElementById('q2_slider');
const q2_input  = document.getElementById('q2_input');
const q3_slider = document.getElementById('q3_slider');
const q3_input  = document.getElementById('q3_input');
 
const traj_q1         = document.getElementById('traj_q1');
const traj_q2         = document.getElementById('traj_q2');
const traj_q3         = document.getElementById('traj_q3');
const traj_time_input = document.getElementById('traj_time_input');
const playBtn         = document.getElementById('playBtn');
const progressBar     = document.getElementById('progressBar');
 
// Labels dinámicos
const lbl_q1 = document.getElementById('lbl_q1');
const lbl_q2 = document.getElementById('lbl_q2');
const lbl_q3 = document.getElementById('lbl_q3');
 
// ==========================================
// VALIDACIÓN Y SINCRONIZACIÓN
// ==========================================
function validarYActualizar(id, valor, origen) {
    let min, max, slider, input, lbl;
    if (id === 'q1') { min=-45; max=225; slider=q1_slider; input=q1_input; lbl=lbl_q1; }
    if (id === 'q2') { min=0;   max=125; slider=q2_slider; input=q2_input; lbl=lbl_q2; }
    if (id === 'q3') { min=0;   max=30;  slider=q3_slider; input=q3_input; lbl=lbl_q3; }
 
    const v = parseFloat(valor);
    if (isNaN(v) || v < min || v > max) {
        alert(`⚠️ Advertencia: ${id} debe estar entre ${min} y ${max}.`);
        if (origen === 'input') input.value = slider.value;
        return;
    }
    if (origen === 'slider') input.value = v;
    else slider.value = v;
    lbl.textContent = (id === 'q3') ? `${v} cm` : `${v}°`;
    actualizarRobot();
}
 
q1_slider.addEventListener('input',  e => validarYActualizar('q1', e.target.value, 'slider'));
q1_input .addEventListener('change', e => validarYActualizar('q1', e.target.value, 'input'));
q2_slider.addEventListener('input',  e => validarYActualizar('q2', e.target.value, 'slider'));
q2_input .addEventListener('change', e => validarYActualizar('q2', e.target.value, 'input'));
q3_slider.addEventListener('input',  e => validarYActualizar('q3', e.target.value, 'slider'));
q3_input .addEventListener('change', e => validarYActualizar('q3', e.target.value, 'input'));
 
// ==========================================
// CONSTANTES
// ==========================================
const L1             = 50;   // altura base [cm]
const LONGITUD_PINZA = 8;    // herramienta [cm]
 
function deg2rad(g) { return g * Math.PI / 180; }
 
// ==========================================
// ESCENA THREE.JS
// ==========================================
const container = document.getElementById('canvas-container');
container.innerHTML = '';
 
const scene = new THREE.Scene();
// Fondo oscuro estilo CAD (como en la imagen)
scene.background = new THREE.Color(0x22252a);
 
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
camera.position.set(130, 110, 160);
 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);
 
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping    = true;
controls.dampingFactor    = 0.08;
controls.minDistance      = 30;
controls.maxDistance      = 600;
 
// Luces ajustadas para fondo oscuro
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(80, 140, 80);
dirLight.castShadow = true;
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x666666));
 
// Grilla oscura sutil
const grid = new THREE.GridHelper(200, 20, 0x444444, 0x333333);
grid.position.y = -0.1; 
scene.add(grid);

// -----------------------------
// EJES X, Y, Z 
// -----------------------------
const axesGroup = new THREE.Group();
scene.add(axesGroup);

const axisLength = 100;
const tickStep   = 10;

// Colores exactos (X Rojo, Y Verde, Z Azul)
const colorX = '#ff4444';
const colorY = '#44ff44';
const colorZ = '#4488ff';

function createTextSprite(text, color, scale = 10, isBold = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; 
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.font = `${isBold ? 'bold' : 'normal'} 50px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale, scale, 1);
    sprite.renderOrder = 999;
    return sprite;
}

// Materiales de las líneas principales
const matX = new THREE.LineBasicMaterial({ color: colorX, linewidth: 2 });
const matY = new THREE.LineBasicMaterial({ color: colorY, linewidth: 2 });
const matZ = new THREE.LineBasicMaterial({ color: colorZ, linewidth: 2 });

// Geometrías de las líneas
const geoX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(axisLength,0,0)]);
const geoY = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,axisLength,0)]);
const geoZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,axisLength)]);

// Agregar líneas a la escena
axesGroup.add(new THREE.Line(geoX, matX));
axesGroup.add(new THREE.Line(geoY, matY));
axesGroup.add(new THREE.Line(geoZ, matZ));

// Etiquetas principales X, Y, Z
const lblX = createTextSprite('X', colorX, 14, true);
lblX.position.set(axisLength + 8, 0, 0);
axesGroup.add(lblX);

const lblY = createTextSprite('Y', colorY, 14, true);
lblY.position.set(0, axisLength + 8, 0);
axesGroup.add(lblY);

const lblZ = createTextSprite('Z', colorZ, 14, true);
lblZ.position.set(0, 0, axisLength + 8);
axesGroup.add(lblZ);

// Ticks (Marcas) y Números (10 a 100)
for (let i = tickStep; i <= axisLength; i += tickStep) {
    const textColor = '#dddddd'; // Color blanco grisáceo para los números

    // Eje X
    const numX = createTextSprite(i.toString(), textColor, 6.5);
    numX.position.set(i, -3, 0); // Desplazado ligeramente hacia abajo
    axesGroup.add(numX);
    const tX = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0,0), new THREE.Vector3(i,-1.5,0)]), matX);
    axesGroup.add(tX);

    // Eje Y
    const numY = createTextSprite(i.toString(), textColor, 6.5);
    numY.position.set(-3.5, i, 0); // Desplazado a la izquierda
    axesGroup.add(numY);
    const tY = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,i,0), new THREE.Vector3(-1.5,i,0)]), matY);
    axesGroup.add(tY);

    // Eje Z
    const numZ = createTextSprite(i.toString(), textColor, 6.5);
    numZ.position.set(0, -3, i); // Desplazado hacia abajo en Z
    axesGroup.add(numZ);
    const tZ = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,i), new THREE.Vector3(0,-1.5,i)]), matZ);
    axesGroup.add(tZ);
}

// ==========================================
// MATERIALES
// ==========================================
const matRojo   = new THREE.MeshPhongMaterial({ color: 0xdd3333 });
const matMorado = new THREE.MeshPhongMaterial({ color: 0xaa44cc });
const matAzul   = new THREE.MeshPhongMaterial({ color: 0x3366ee });
const matVerde  = new THREE.MeshPhongMaterial({ color: 0x33cc55 });
const matGris   = new THREE.MeshPhongMaterial({ color: 0x888888 });
const matGrisOsc= new THREE.MeshPhongMaterial({ color: 0x555555 });
const matAmarillo = new THREE.MeshPhongMaterial({
    color: 0xffdd00, emissive: 0xffaa00, emissiveIntensity: 0.5
});
 
// ==========================================
// CONSTRUCCIÓN DEL ROBOT
// ==========================================
 
// BASE – cilindro rojo (l1 = 50 cm)
const geoBase = new THREE.CylinderGeometry(10, 12, L1, 32);
geoBase.translate(0, L1 / 2, 0);
const baseMesh = new THREE.Mesh(geoBase, matRojo);
baseMesh.castShadow = true;
scene.add(baseMesh);
 
// q1 (rota en Y)
const q1Group = new THREE.Group();
q1Group.position.y = L1;
scene.add(q1Group);
 
// Unión q1 (cilindro morado) – collar decorativo en la cima de la base,
// sin agregar altura: se centra en y=0 del q1Group (tapa de la base L1=50).
const geoUnion = new THREE.CylinderGeometry(11, 11, 6, 32);
geoUnion.translate(0, 0, 0);   // centrado en y=50 (tapa de la base)
q1Group.add(new THREE.Mesh(geoUnion, matMorado));

//  q2 (rota en Z) – pivote exactamente en y = L1 = 50 cm desde el suelo
const q2Group = new THREE.Group();
q2Group.position.y = 0;        // 0 relativo a q1Group que ya está en y=L1
q1Group.add(q2Group);
 
// Articulación esférica 
const geoCodo = new THREE.SphereGeometry(8, 32, 32);
q2Group.add(new THREE.Mesh(geoCodo, matAzul));
 
// 4. GRUPO q3 – brazo extensible
const q3Group = new THREE.Group();
q2Group.add(q3Group);
 
// Brazo verde (escala dinámica en Y)
const geoBrazo = new THREE.CylinderGeometry(4, 4, 1, 32);
geoBrazo.translate(0, 0.5, 0);
const brazoMesh = new THREE.Mesh(geoBrazo, matVerde);
brazoMesh.castShadow = true;
q3Group.add(brazoMesh);
 
// ==========================================
// PINZA DE 8 CM
// ==========================================
const pinzaGroup = new THREE.Group();
q3Group.add(pinzaGroup);
 
// -- Muñeca (conector entre brazo y palma)
const geoMuneca = new THREE.CylinderGeometry(3.5, 3.5, 3, 16);
geoMuneca.translate(0, 1.5, 0);
pinzaGroup.add(new THREE.Mesh(geoMuneca, matGris));
 
// -- Palma (cuerpo central de la pinza)
const geoPalma = new THREE.BoxGeometry(11, 2, 5);
geoPalma.translate(0, 4, 0);  // y: 3 a 5
pinzaGroup.add(new THREE.Mesh(geoPalma, matGris));
 
// -- Función para crear un dedo
function crearDedo(offsetX) {
    const group = new THREE.Group();
    // Nudo superior (esfera)
    const geoNudo = new THREE.SphereGeometry(1.6, 12, 12);
    geoNudo.translate(0, 5.2, 0);
    group.add(new THREE.Mesh(geoNudo, matGrisOsc));
    // Falange (caja)
    const geoFal = new THREE.BoxGeometry(2.8, 3, 2.8);
    geoFal.translate(0, 6.5, 0);  // y: 5..8
    group.add(new THREE.Mesh(geoFal, matGris));
    // Punta 
    const geoPunta = new THREE.CylinderGeometry(0.8, 1.4, 1, 12);
    geoPunta.translate(0, 8.5, 0);
    group.add(new THREE.Mesh(geoPunta, matGrisOsc));
    group.position.x = offsetX;
    return group;
}
 
pinzaGroup.add(crearDedo(-2.8));
pinzaGroup.add(crearDedo( 2.8));
 
// -- Marcador del efector final (esfera amarilla en la punta)
const marcadorMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16),
    matAmarillo
);

marcadorMesh.position.y = 9;
pinzaGroup.add(marcadorMesh);
 
// ==========================================
// MOTOR CINEMÁTICO
// ==========================================
function actualizarRobot() {
    const q1_deg = parseFloat(q1_input.value);
    const q2_deg = parseFloat(q2_input.value);
    const q3_cm  = parseFloat(q3_input.value);
 
    const q1 = deg2rad(q1_deg);
    const q2 = deg2rad(q2_deg);
    const q3 = q3_cm + LONGITUD_PINZA;  // extensión total con pinza
 
    // ── Cinemática directa (matriz T3)
    const x = q3 * Math.cos(q1) * Math.sin(q2);
    const y = q3 * Math.sin(q1) * Math.sin(q2);
    const z = q3 * Math.cos(q2) + L1;
 
    document.getElementById('posX').textContent = x.toFixed(2);
    document.getElementById('posY').textContent = y.toFixed(2);
    document.getElementById('posZ').textContent = z.toFixed(2);
 
    // ── Movimiento 3D ──
    q1Group.rotation.y = q1;
    q2Group.rotation.z = q2;
 
    // Escalar el brazo verde 
    brazoMesh.scale.y = Math.max(q3_cm, 0.1);
 
    // Colocar la pinza en la punta del brazo extensible
    pinzaGroup.position.y = q3_cm;
}
 

function calcCoef(q0, qf, T) {
    const d = qf - q0;
    return {
        a0: q0,
        a1: 0,
        a2: 0,
        a3:  10*d / T**3,
        a4: -15*d / T**4,
        a5:   6*d / T**5
    };
}
function evalPoly(c, t) {
    return c.a0 + c.a1*t + c.a2*t**2 + c.a3*t**3 + c.a4*t**4 + c.a5*t**5;
}
 
// ==========================================
// ESTADO DE TRAYECTORIA
// ==========================================
let animando     = false;
let t0           = null;
let durMs        = 0;
let coefs        = null;
 
function iniciarTrayectoria() {
    if (animando) return;
 
    const qd1 = parseFloat(traj_q1.value);
    const qd2 = parseFloat(traj_q2.value);
    const qd3 = parseFloat(traj_q3.value);
    const T   = parseFloat(traj_time_input.value);
 
    if (isNaN(qd1)||qd1<-45||qd1>225) { alert('⚠️ q1 deseado fuera de rango (−45° a 225°)'); return; }
    if (isNaN(qd2)||qd2<0  ||qd2>125) { alert('⚠️ q2 deseado fuera de rango (0° a 125°)');  return; }
    if (isNaN(qd3)||qd3<0  ||qd3>30)  { alert('⚠️ q3 deseado fuera de rango (0 a 30 cm)');  return; }
    if (isNaN(T)  ||T<=0)              { alert('⚠️ El tiempo debe ser mayor a 0');            return; }
 
    const qi1 = parseFloat(q1_input.value);
    const qi2 = parseFloat(q2_input.value);
    const qi3 = parseFloat(q3_input.value);
 
    coefs = {
        q1: calcCoef(qi1, qd1, T),
        q2: calcCoef(qi2, qd2, T),
        q3: calcCoef(qi3, qd3, T)
    };
 
    durMs    = T * 1000;
    animando = true;
    t0       = null;
 
    playBtn.disabled    = true;
    playBtn.textContent = '⏳ Animando…';
    progressBar.style.width = '0%';
}
 
playBtn.addEventListener('click', iniciarTrayectoria);
 
// ==========================================
// BUCLE DE RENDERIZADO
// ==========================================
function animate(ts) {
    requestAnimationFrame(animate);
    controls.update();
 
    // ── Actualizar trayectoria dentro del mismo frame ──
    if (animando) {
        if (!t0) t0 = ts;
        const elapsed = ts - t0;
        const T  = durMs / 1000;
        const t  = Math.min(elapsed / 1000, T);
        const pct = Math.min(elapsed / durMs, 1);
 
        const v1 = evalPoly(coefs.q1, t);
        const v2 = evalPoly(coefs.q2, t);
        const v3 = evalPoly(coefs.q3, t);
 
        // Sincronizar controles
        q1_input.value  = v1.toFixed(2); q1_slider.value = v1;
        q2_input.value  = v2.toFixed(2); q2_slider.value = v2;
        q3_input.value  = v3.toFixed(2); q3_slider.value = v3;
 
        lbl_q1.textContent = `${v1.toFixed(1)}°`;
        lbl_q2.textContent = `${v2.toFixed(1)}°`;
        lbl_q3.textContent = `${v3.toFixed(1)} cm`;
 
        actualizarRobot();
 
        progressBar.style.width = (pct * 100).toFixed(1) + '%';
 
        if (pct >= 1) {
            animando = false;
            playBtn.disabled    = false;
            playBtn.textContent = '▶ Empezar Animacion';
        }
    }
 
    renderer.render(scene, camera);
}
 
// ==========================================
// RESIZE – mantiene canvas a pantalla completa
// ==========================================
function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);
 
// ── Inicio ──
actualizarRobot();
animate(0);