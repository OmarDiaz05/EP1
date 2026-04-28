// Referencias a los inputs de q1
const q1_slider = document.getElementById('q1_slider');
const q1_input = document.getElementById('q1_input');

// Referencias a los inputs de q2
const q2_slider = document.getElementById('q2_slider');
const q2_input = document.getElementById('q2_input');

// Referencias a los inputs de q3
const q3_slider = document.getElementById('q3_slider');
const q3_input = document.getElementById('q3_input');

// Función para sincronizar y validar los valores
function validarYActualizar(idArticulacion, valor, origen) {
    let min, max;
    let slider, input;

    // Asignar límites según la articulación
    if (idArticulacion === 'q1') { min = -45; max = 225; slider = q1_slider; input = q1_input; }
    if (idArticulacion === 'q2') { min = 0; max = 125; slider = q2_slider; input = q2_input; }
    if (idArticulacion === 'q3') { min = 0; max = 30; slider = q3_slider; input = q3_input; }

    let numVal = parseFloat(valor);

    if (numVal < min || numVal > max) {
        alert(`¡Advertencia! El valor ingresado para ${idArticulacion} está fuera de los rangos permitidos (${min} a ${max}).`);
        
        // Si el error vino de la caja de texto, la regresamos al valor que tiene el slider
        if (origen === 'input') {
            input.value = slider.value;
        }
        return; 
    }

    if (origen === 'slider') {
        input.value = numVal;
    } else if (origen === 'input') {
        slider.value = numVal;
    }

    calcularCinematica();
}


q1_slider.addEventListener('input', (e) => validarYActualizar('q1', e.target.value, 'slider'));
q1_input.addEventListener('change', (e) => validarYActualizar('q1', e.target.value, 'input'));

q2_slider.addEventListener('input', (e) => validarYActualizar('q2', e.target.value, 'slider'));
q2_input.addEventListener('change', (e) => validarYActualizar('q2', e.target.value, 'input'));


q3_slider.addEventListener('input', (e) => validarYActualizar('q3', e.target.value, 'slider'));
q3_input.addEventListener('change', (e) => validarYActualizar('q3', e.target.value, 'input'));


//Motor cinematico


// altura inicial y valor de la pinza en cm
const L1 = 50; 
const LONGITUD_PINZA = 8; 

function gradosARadianes(grados) {
    return grados * (Math.PI / 180);
}

// Función que calcula la posición X, Y, Z
function calcularCinematica() {
    // 1. Leer los valores actuales
    let q1_grados = parseFloat(q1_input.value);
    let q2_grados = parseFloat(q2_input.value);
    let q3_cm = parseFloat(q3_input.value);

    // 2. Convertir ángulos a radianes
    let q1 = gradosARadianes(q1_grados);
    let q2 = gradosARadianes(q2_grados);

    // 3. Calcular la extensión total (q3 + valor pinza)
    let q3_total = q3_cm + LONGITUD_PINZA;

    // 4. Aplicar las ecuaciones de la matriz T3 (Última columna)
    let x = q3_total * Math.cos(q1) * Math.sin(q2);
    let y = q3_total * Math.sin(q1) * Math.sin(q2);
    let z = (q3_total * Math.cos(q2)) + L1;

    // 5. Mostrar los resultados en el HTML (redondeando a 2 decimales para que se vea limpio)
    document.getElementById('posX').innerText = x.toFixed(2);
    document.getElementById('posY').innerText = y.toFixed(2);
    document.getElementById('posZ').innerText = z.toFixed(2);
}

// Calcular la posición inicial al cargar la página (Inciso d)
calcularCinematica();