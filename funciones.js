// ==========================================
// REFERENCIAS DOM Y EVENTOS
// ==========================================
const q1_slider = document.getElementById('q1_slider');
const q1_input = document.getElementById('q1_input');
const q2_slider = document.getElementById('q2_slider');
const q2_input = document.getElementById('q2_input');
const q3_slider = document.getElementById('q3_slider');
const q3_input = document.getElementById('q3_input');

function validarYActualizar(idArticulacion, valor, origen) {
    let min, max, slider, input;

    if (idArticulacion === 'q1') { min = -45; max = 225; slider = q1_slider; input = q1_input; }
    if (idArticulacion === 'q2') { min = 0; max = 125; slider = q2_slider; input = q2_input; }
    if (idArticulacion === 'q3') { min = 0; max = 30; slider = q3_slider; input = q3_input; }

    let numVal = parseFloat(valor);

    // Validación de límites
    if (numVal < min || numVal > max) {
        alert(`¡Advertencia! El valor para ${idArticulacion} está fuera del rango (${min} a ${max}).`);
        if (origen === 'input') input.value = slider.value;
        return; 
    }

    if (origen === 'slider') input.value = numVal;
    else if (origen === 'input') slider.value = numVal;

    actualizarRobot();
}

// Escuchadores corregidos para todas las articulaciones
q1_slider.addEventListener('input', (e) => validarYActualizar('q1', e.target.value, 'slider'));
q1_input.addEventListener('change', (e) => validarYActualizar('q1', e.target.value, 'input'));

q2_slider.addEventListener('input', (e) => validarYActualizar('q2', e.target.value, 'slider'));
q2_input.addEventListener('change', (e) => validarYActualizar('q2', e.target.value, 'input'));

q3_slider.addEventListener('input', (e) => validarYActualizar('q3', e.target.value, 'slider'));
q3_input.addEventListener('change', (e) => validarYActualizar('q3', e.target.value, 'input'));

// ==========================================
// CONSTANTES MATEMÁTICAS
// ==========================================
const L1 = 50; 
const LONGITUD_PINZA = 8; 

function gradosARadianes(grados) {
    return grados * (Math.PI / 180);
}

// ==========================================
// CONFIGURACIÓN DE LA ESCENA 3D (Estilo MATLAB)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd3d3d3); // Fondo gris claro como en la imagen

const container = document.getElementById('canvas-container');
container.innerHTML = ''; 

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(120, 100, 150);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50);
scene.add(light);
scene.add(new THREE.AmbientLight(0x888888));

// Cuadrícula del piso
scene.add(new THREE.GridHelper(200, 20, 0x888888, 0xaaaaaa));
// Ejes: X (Rojo), Y (Verde - que es Z en tu examen), Z (Azul)
scene.add(new THREE.AxesHelper(60));

// ==========================================
// CONSTRUCCIÓN DEL ROBOT (Modelo Académico)
// ==========================================
// 1. Base (Cilindro Rojo)
const matRojo = new THREE.MeshPhongMaterial({ color: 0xff4444 });
const geoBase = new THREE.CylinderGeometry(10, 10, L1, 16);
geoBase.translate(0, L1 / 2, 0); 
const baseMesh = new THREE.Mesh(geoBase, matRojo);
scene.add(baseMesh);

// 2. Articulación q1 (Rotación sobre la base)
const q1Group = new THREE.Group();
q1Group.position.y = L1; 
scene.add(q1Group);

const matMorado = new THREE.MeshPhongMaterial({ color: 0xaa44aa });
const geoUnion = new THREE.CylinderGeometry(8, 8, 10, 16);
geoUnion.translate(0, 5, 0);
q1Group.add(new THREE.Mesh(geoUnion, matMorado));

// 3. Articulación q2 (Inclinación)
const q2Group = new THREE.Group();
q2Group.position.y = 10; 
q1Group.add(q2Group);

const matAzul = new THREE.MeshPhongMaterial({ color: 0x4444ff });
const geoCodo = new THREE.SphereGeometry(7, 16, 16);
q2Group.add(new THREE.Mesh(geoCodo, matAzul));

// 4. Brazo Extensible q3 (Cilindro Verde)
const q3Group = new THREE.Group();
q2Group.add(q3Group);

const matVerde = new THREE.MeshPhongMaterial({ color: 0x44ff44 });
// El cilindro crece a lo largo del eje Y local
const geoBrazo = new THREE.CylinderGeometry(4, 4, 1, 16);
geoBrazo.translate(0, 0.5, 0); 
const brazoMesh = new THREE.Mesh(geoBrazo, matVerde);
q3Group.add(brazoMesh);

// 5. Efector Final / Pinza (Cubo Gris de 8cm)
const matGris = new THREE.MeshPhongMaterial({ color: 0x666666 });
const geoPinza = new THREE.BoxGeometry(6, LONGITUD_PINZA, 6);
geoPinza.translate(0, LONGITUD_PINZA / 2, 0);
const pinzaMesh = new THREE.Mesh(geoPinza, matGris);
q3Group.add(pinzaMesh);

// ==========================================
// MOTOR CINEMÁTICO Y DE MOVIMIENTO
// ==========================================
function actualizarRobot() {
    let q1_grados = parseFloat(q1_input.value);
    let q2_grados = parseFloat(q2_input.value);
    let q3_cm = parseFloat(q3_input.value);

    let q1 = gradosARadianes(q1_grados);
    let q2 = gradosARadianes(q2_grados);
    let q3_total = q3_cm + LONGITUD_PINZA;

    // 1. Matemáticas (Matriz T3 del examen)
    let x = q3_total * Math.cos(q1) * Math.sin(q2);
    let y = q3_total * Math.sin(q1) * Math.sin(q2);
    let z = (q3_total * Math.cos(q2)) + L1;

    document.getElementById('posX').innerText = x.toFixed(2);
    document.getElementById('posY').innerText = y.toFixed(2);
    document.getElementById('posZ').innerText = z.toFixed(2);

    // 2. Movimiento Gráfico
    q1Group.rotation.y = q1; 
    q2Group.rotation.z = q2; 
    
    // El brazo verde se escala según la medida de q3
    let medidaVisual = Math.max(q3_cm, 0.1); // Evitamos que desaparezca si está en 0
    brazoMesh.scale.y = medidaVisual;
    
    // La pinza se acomoda justo en la punta del brazo verde
    pinzaMesh.position.y = q3_cm;
}

// Carga inicial
actualizarRobot();

// Bucle de renderizado 3D
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();


