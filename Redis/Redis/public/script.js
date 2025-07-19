document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const tiendaContainer = document.getElementById('tienda-container');
    const loginModal = document.getElementById('login-modal');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const loginForm = document.getElementById('login-form');
    const loginLink = document.getElementById('login-link');
    const ordenarSelect = document.querySelector('select[name="ordenar"]');
    const searchInput = document.querySelector('.nav-search input');
    const plataformaSelect = document.querySelector('select[name="plataforma"]');
    const generoSelect = document.querySelector('select[name="genero"]');
    const navLinksContainer = document.querySelector('.nav-links');

    let productosCargados = [];

    // --- Datos de ejemplo locales ---
    const categoriasDeEjemplo = [{"id_categoria":1,"nombre":"Acción","activo":true},{"id_categoria":4,"nombre":"Aventura","activo":true},{"id_categoria":3,"nombre":"Deportes","activo":true},{"id_categoria":2,"nombre":"RPG","activo":true}];
    const plataformasDeEjemplo = [{"id_plataforma":3,"nombre":"Nintendo Switch","activo":true},{"id_plataforma":4,"nombre":"PC","activo":true},{"id_plataforma":1,"nombre":"PlayStation 5","activo":true},{"id_plataforma":2,"nombre":"Xbox Series X","activo":true}];

    // --- Carga de Datos Iniciales ---
    async function cargarDatosIniciales() {
        try {
            const productosRes = await fetch('/api/productos');
            const productos = await productosRes.json();
            productosCargados = productos.data || productos;
            
            mostrarProductos(productosCargados);
            popularFiltro(plataformaSelect, plataformasDeEjemplo, 'id_plataforma');
            popularFiltro(generoSelect, categoriasDeEjemplo, 'id_categoria');

        } catch (error) {
            tiendaContainer.innerHTML = '<p>Error: No se pudieron cargar los datos de los productos.</p>';
            console.error(error);
        }
    }

    // --- Función genérica para llenar los menús desplegables ---
    function popularFiltro(selectElement, items, idField) {
        if (!items) return;
        items.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item[idField];
            opcion.textContent = item.nombre;
            selectElement.appendChild(opcion);
        });
    }

    // --- Lógica para los links de navegación (PC, PlayStation, etc.) ---
    navLinksContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.plataforma) {
            e.preventDefault();
            const plataformaNombre = e.target.dataset.plataforma;
            const plataformaObj = plataformasDeEjemplo.find(p => p.nombre === plataformaNombre);
            if (!plataformaObj) return;

            // Al hacer clic, actualizamos el valor del <select> y aplicamos todos los filtros
            plataformaSelect.value = plataformaObj.id_plataforma;
            aplicarFiltros();
        }
    });

    // --- Función ÚNICA para aplicar todos los filtros y el orden ---
    function aplicarFiltros() {
        const terminoBusqueda = searchInput.value.toLowerCase();
        const plataformaId = plataformaSelect.value;
        const generoId = generoSelect.value;
        const orden = ordenarSelect.value;
        let productosFiltrados = [...productosCargados];

        if (terminoBusqueda) {
            productosFiltrados = productosFiltrados.filter(p => p.titulo.toLowerCase().includes(terminoBusqueda));
        }
        if (plataformaId) {
            productosFiltrados = productosFiltrados.filter(p => p.id_plataforma == plataformaId);
        }
        if (generoId) {
            productosFiltrados = productosFiltrados.filter(p => p.id_categoria == generoId);
        }
        if (orden === 'precio-asc') {
            productosFiltrados.sort((a, b) => a.precio_venta - b.precio_venta);
        } else if (orden === 'precio-desc') {
            productosFiltrados.sort((a, b) => b.precio_venta - a.precio_venta);
        }
        mostrarProductos(productosFiltrados);
    }

    // --- Añadimos los "escuchadores" de eventos a todos los filtros ---
    searchInput.addEventListener('input', aplicarFiltros);
    plataformaSelect.addEventListener('change', aplicarFiltros);
    generoSelect.addEventListener('change', aplicarFiltros);
    ordenarSelect.addEventListener('change', aplicarFiltros);

    // --- Función para mostrar las tarjetas de productos ---
    function mostrarProductos(productos) {
        tiendaContainer.innerHTML = '';
        if (!productos || productos.length === 0) {
            tiendaContainer.innerHTML = '<p>No se encontraron resultados para esta búsqueda.</p>';
            return;
        }
        productos.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <img src="${producto.imagen || 'https://via.placeholder.com/300x150.png?text=Game+Image'}" alt="${producto.titulo}">
                <div class="producto-info">
                    <h3>${producto.titulo}</h3>
                    <p>${producto.publisher}</p>
                    <div class="precio">$${producto.precio_venta}</div>
                    <button class="comprar-btn" data-id="${producto.id_producto}">Comprar</button>
                </div>
            `;
            tiendaContainer.appendChild(card);
        });
    }

    // --- Lógica del Modal de Login ---
    function abrirLoginModal(e) { if (e) e.preventDefault(); loginModal.className = 'modal-visible'; }
    tiendaContainer.addEventListener('click', (e) => { if (e.target.classList.contains('comprar-btn')) { abrirLoginModal(); } });
    loginLink.addEventListener('click', abrirLoginModal);
    cerrarModalBtn.addEventListener('click', () => { loginModal.className = 'modal-oculto'; });
    window.addEventListener('click', (e) => { if (e.target === loginModal) { loginModal.className = 'modal-oculto'; } });
    loginForm.addEventListener('submit', (e) => { e.preventDefault(); alert('¡Login exitoso! (Simulación)'); loginModal.className = 'modal-oculto'; });

    // --- Inicia todo ---
    cargarDatosIniciales();
});