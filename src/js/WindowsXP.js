function mostrarHora() {
    const ahora = new Date();
    let hora = ahora.getHours();
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const amPm = hora >= 12 ? 'p.m.' : 'a.m.';
    hora = hora % 12 || 12; // Convertir la hora a formato de 12 horas

    const horaActual = `${hora}:${minutos} ${amPm}`;
    document.getElementById('statusBar').innerText = horaActual;
}

// Actualiza la hora cada segundo
setInterval(mostrarHora, 1000);

// Mostrar la hora actual al cargar la página
mostrarHora();


// Definición de ventanas
const windows = document.querySelectorAll('.window');

// Iterar sobre cada ventana
windows.forEach(windowElement => {
    // Variables para el arrastre de esta ventana
    let isDragging = false;
    let startPositionX;
    let startPositionY;
    let windowOffsetX = 0;
    let windowOffsetY = 0;

    // Elemento de la barra de título de esta ventana
    const titleBar = windowElement.querySelector('.title-bar');

    // Eventos de arrastre para esta ventana
    titleBar.addEventListener("mousedown", startDragging, false);
    window.addEventListener("mouseup", stopDragging, false);
    window.addEventListener("mousemove", drag, false);

    // Función para iniciar el arrastre de esta ventana
    function startDragging(e) {
        isDragging = true;
        startPositionX = e.clientX;
        startPositionY = e.clientY;
        windowOffsetX = windowElement.offsetLeft;
        windowOffsetY = windowElement.offsetTop;

        bringToFront(windowElement); // Llevar la ventana al frente cuando se haga clic en ella
    }

    // Función para finalizar el arrastre de esta ventana
    function stopDragging() {
        isDragging = false;
    }

    // Función para arrastrar esta ventana
    function drag(e) {
        if (isDragging) {
            const dx = e.clientX - startPositionX;
            const dy = e.clientY - startPositionY;
            const newLeft = windowOffsetX + dx;
            const newTop = windowOffsetY + dy;
            windowElement.style.left = newLeft + "px";
            windowElement.style.top = newTop + "px";
        }
    }
});

// Evento para restablecer la posición de todas las ventanas al cambiar el tamaño de la ventana del navegador
window.addEventListener("resize", resetWindowsPosition);

// Función para restablecer la posición de todas las ventanas
function resetWindowsPosition() {
    windows.forEach(windowElement => {
        windowElement.style.left = "5px"; // Cambia la posición izquierda de la ventana
        windowElement.style.top = "5px"; // Cambia la posición superior de la ventana
    });
}

// Función para llevar la ventana al frente y agregar un borde blanco
function bringToFront(windowElement) {
    // Restablecer el borde blanco de todas las ventanas
    windows.forEach(w => {
        w.style.border = "2px solid #0c8dea"; // Restablecer borde blanco
        w.style.zIndex = "1"; // Restablecer z-index de todas las ventanas
    });
    // Agregar borde blanco a la ventana clickeada
    windowElement.style.border = "2px solid #2600ff"; // Agregar borde blanco
    windowElement.style.zIndex = "2"; // Llevar la ventana clickeada al frente
}


// Selecciona todos los elementos con la clase "btn"
const botonesCerrar = document.querySelectorAll('.X');

// Itera sobre cada botón
botonesCerrar.forEach(boton => {
    // Agrega un event listener para detectar el clic en cada botón
    boton.addEventListener('click', function () {
        // Encuentra el elemento padre (la ventana) del botón de cerrar y ocúltalo
        const ventana = this.closest('.window');
        ventana.style.display = 'none';
    });
});


// Selecciona el elemento con el ID "menuStart"
const menuStart = document.getElementById('menuStart');

// Selecciona el elemento con el ID "menu"
const menu = document.getElementById('menu');

// Agrega un event listener para detectar el clic en el elemento "menuStart"
menuStart.addEventListener('click', function () {
    // Cambia la clase del menú para mostrarlo
    menu.classList.toggle('menu-hidden');

    // Agrega un event listener al documento para detectar clics
    document.addEventListener('click', closeMenuOutside);
});

// Función para cerrar el menú si se hace clic fuera de él
function closeMenuOutside(event) {
    // Verifica si el clic ocurrió fuera del menú y fuera del botón de inicio del menú
    if (!menu.contains(event.target) && event.target !== menuStart) {
        // Oculta el menú
        menu.classList.add('menu-hidden');

        // Remueve el event listener del documento para evitar múltiples event listeners
        document.removeEventListener('click', closeMenuOutside);
    }
}

// Agrega un event listener para detectar el clic en el botón "start" y detener la propagación del evento
menuStart.addEventListener('click', function (event) {
    event.stopPropagation();
});


/* LOGICA DE APLICACIONES  */

// Función para mostrar la ventana de la aplicación correspondiente
function mostrarVentana(appName) {
    const windows = document.querySelectorAll('.window');
    windows.forEach(windowElement => {
        if (windowElement.classList.contains(appName)) {
            windowElement.style.display = 'block'; // Mostrar la ventana de la aplicación
        }
    });
}

// Evento clic en los enlaces de la lista de aplicaciones
document.addEventListener('DOMContentLoaded', function () {
    const targetItems = document.querySelectorAll('.target');
    targetItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
            const appName = this.dataset.app; // Obtener el nombre de la aplicación
            console.log(`Abriendo la aplicación: ${appName}`);
            mostrarVentana(appName); // Mostrar la ventana correspondiente
        });
    });
});