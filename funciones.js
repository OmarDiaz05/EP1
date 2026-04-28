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

    // Validación de la ventana emergente (Cumpliendo el inciso e)
    if (numVal < min || numVal > max) {
        alert(`¡Advertencia! El valor ingresado para ${idArticulacion} está fuera de los rangos permitidos (${min} a ${max}).`);
        
        // Si el error vino de la caja de texto, la regresamos al valor que tiene el slider
        if (origen === 'input') {
            input.value = slider.value;
        }
        return; // Detenemos la ejecución
    }

    // Si todo está correcto, sincronizamos slider y input
    if (origen === 'slider') {
        input.value = numVal;
    } else if (origen === 'input') {
        slider.value = numVal;
    }

    // TODO: Aquí llamaremos más adelante a la función de la matriz cinemática
    // calcularCinematica();
}


q1_slider.addEventListener('input', (e) => validarYActualizar('q1', e.target.value, 'slider'));
q1_input.addEventListener('change', (e) => validarYActualizar('q1', e.target.value, 'input'));

q2_slider.addEventListener('input', (e) => validarYActualizar('q2', e.target.value, 'slider'));
q2_input.addEventListener('change', (e) => validarYActualizar('q2', e.target.value, 'input'));


q3_slider.addEventListener('input', (e) => validarYActualizar('q3', e.target.value, 'slider'));
q3_input.addEventListener('change', (e) => validarYActualizar('q3', e.target.value, 'input'));