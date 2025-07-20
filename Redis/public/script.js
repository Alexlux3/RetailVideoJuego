document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const tiendaContainer = document.getElementById('tienda-container');
    const paginacionContainer = document.getElementById('paginacion-container');
    const navUsuarioContainer = document.getElementById('nav-usuario-container');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const ordenarSelect = document.querySelector('select[name="ordenar"]');
    const generoSelect = document.querySelector('select[name="genero"]');
    const plataformaSelect = document.querySelector('select[name="plataforma"]');
    const searchInput = document.querySelector('.nav-search input');
    const navLinksContainer = document.querySelector('.nav-links');

    // --- Almacenamiento de datos y estado ---
    let productosCargados = [];
    let productosFiltrados = [];
    let usuarioLogueado = null;
    let currentPage = 1;
    const productsPerPage = 15;
    const categoriasDeEjemplo = [{"id_categoria":1,"nombre":"Acción"},{"id_categoria":4,"nombre":"Aventura"},{"id_categoria":3,"nombre":"Deportes"},{"id_categoria":2,"nombre":"RPG"}];
    const plataformasDeEjemplo = [{"id_plataforma":3,"nombre":"Nintendo Switch"},{"id_plataforma":4,"nombre":"PC"},{"id_plataforma":1,"nombre":"PlayStation 5"},{"id_plataforma":2,"nombre":"Xbox Series X"}];
    let plataformasCargadas = [...plataformasDeEjemplo];

    // --- Lógica de Sesión ---
    function guardarSesion(sesionData) {
        sessionStorage.setItem('sesion', JSON.stringify(sesionData));
        usuarioLogueado = sesionData.user;
    }
    function cargarSesion() {
        const sesionGuardada = sessionStorage.getItem('sesion');
        if (sesionGuardada) {
            usuarioLogueado = JSON.parse(sesionGuardada).user;
        }
    }
    function cerrarSesion() {
        sessionStorage.removeItem('sesion');
        usuarioLogueado = null;
    }

    // --- Lógica de Modales ---
    function abrirModal(modal) { modal.className = 'modal-visible'; }
    function cerrarModales() {
        loginModal.className = 'modal-oculto';
        registerModal.className = 'modal-oculto';
    }

    // --- Lógica de Autenticación ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorP = document.getElementById('login-error');
        errorP.textContent = '';
        try {
            const response = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                guardarSesion(data);
                actualizarNavUsuario();
                cerrarModales();
            } else {
                errorP.textContent = data.message;
            }
        } catch (error) {
            errorP.textContent = 'Error de conexión.';
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre_completo = document.getElementById('register-nombrecompleto').value;
        const nombre_usuario = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorP = document.getElementById('register-error');
        errorP.textContent = '';
        try {
            const response = await fetch('/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_completo, nombre_usuario, email, password, rol: 'cliente' })
            });
            const data = await response.json();
            if (response.ok) {
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                cerrarModales();
                abrirModal(loginModal);
            } else {
                errorP.textContent = data.message;
            }
        } catch (error) {
            errorP.textContent = 'Error de conexión.';
        }
    });
    
    function actualizarNavUsuario() {
        navUsuarioContainer.innerHTML = '';
        if (usuarioLogueado) {
            const nombreUsuario = document.createElement('span');
            nombreUsuario.textContent = `Bienvenido, ${usuarioLogueado.username}`;
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Cerrar Sesión';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                cerrarSesion();
                actualizarNavUsuario();
            });
            navUsuarioContainer.appendChild(nombreUsuario);
            navUsuarioContainer.appendChild(logoutLink);
        } else {
            const loginLinkOriginal = document.createElement('a');
            loginLinkOriginal.href = '#';
            loginLinkOriginal.id = 'login-link';
            loginLinkOriginal.textContent = 'Iniciar Sesión';
            navUsuarioContainer.appendChild(loginLinkOriginal);
        }
    }

    // --- Lógica de la Tienda ---
    async function cargarDatosIniciales() {
        try {
            const productosRes = await fetch('/api/productos');
            const productos = await productosRes.json();
            productosCargados = productos.data || productos;
            
            popularFiltro(generoSelect, categoriasDeEjemplo, 'id_categoria');
            popularFiltro(plataformaSelect, plataformasDeEjemplo, 'id_plataforma');
            aplicarFiltros();
        } catch (error) {
            tiendaContainer.innerHTML = '<p>Error: No se pudieron cargar los datos de los productos. Revisa la conexión con el servidor principal.</p>';
            console.error(error);
        }
    }
    
    function popularFiltro(selectElement, items, idField) {
        if (!items) return;
        items.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item[idField];
            opcion.textContent = item.nombre;
            selectElement.appendChild(opcion);
        });
    }

    function mostrarProductos() {
        tiendaContainer.innerHTML = '';
        if (!productosFiltrados || productosFiltrados.length === 0) {
            tiendaContainer.innerHTML = '<p>No se encontraron resultados para esta búsqueda.</p>';
            actualizarPaginacion();
            return;
        }
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productosDePagina = productosFiltrados.slice(startIndex, endIndex);
        productosDePagina.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            const imagenSrc = producto.imagen_url || 'https://via.placeholder.com/300x150.png?text=No+Image';
            card.innerHTML = `
                <img src="${imagenSrc}" alt="${producto.titulo}">
                <div class="producto-info">
                    <h3>${producto.titulo}</h3>
                    <p>${producto.publisher}</p>
                    <div class="precio">$${producto.precio_venta}</div>
                    <button class="comprar-btn" data-id="${producto.id_producto}">Comprar</button>
                </div>
            `;
            tiendaContainer.appendChild(card);
        });
        actualizarPaginacion();
    }

    function aplicarFiltros() {
        const terminoBusqueda = searchInput.value.toLowerCase();
        const generoId = generoSelect.value;
        const plataformaId = plataformaSelect.value;
        const orden = ordenarSelect.value;
        let resultado = [...productosCargados];
        if (terminoBusqueda) {
            resultado = resultado.filter(p => p.titulo.toLowerCase().includes(terminoBusqueda));
        }
        if (generoId) {
            resultado = resultado.filter(p => p.id_categoria == generoId);
        }
        if (plataformaId) {
            resultado = resultado.filter(p => p.id_plataforma == plataformaId);
        }
        if (orden === 'precio-asc') {
            resultado.sort((a, b) => a.precio_venta - b.precio_venta);
        } else if (orden === 'precio-desc') {
            resultado.sort((a, b) => b.precio_venta - a.precio_venta);
        }
        productosFiltrados = resultado;
        currentPage = 1;
        mostrarProductos();
    }

    function actualizarPaginacion() {
        paginacionContainer.innerHTML = '';
        const totalPages = Math.ceil(productosFiltrados.length / productsPerPage);
        if (totalPages <= 1) return;
        const prevButton = document.createElement('button');
        prevButton.className = 'pag-btn';
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) { currentPage--; mostrarProductos(); }
        });
        const pageIndicator = document.createElement('span');
        pageIndicator.id = 'pagina-actual';
        pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
        const nextButton = document.createElement('button');
        nextButton.className = 'pag-btn';
        nextButton.textContent = 'Siguiente';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) { currentPage++; mostrarProductos(); }
        });
        paginacionContainer.appendChild(prevButton);
        paginacionContainer.appendChild(pageIndicator);
        paginacionContainer.appendChild(nextButton);
    }
    
    async function simularCompra(idProducto) {
        const productoComprado = productosCargados.find(p => p.id_producto == idProducto);
        if (!productoComprado) return alert('Error: Producto no encontrado.');
        const sesionGuardada = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesionGuardada || !sesionGuardada.token) {
            return alert('Error: No se encontró el token. Por favor, inicia sesión de nuevo.');
        }
        const token = sesionGuardada.token;
        const datosVenta = {
            id_cliente: usuarioLogueado.id,
            id_usuario: usuarioLogueado.id,
            metodo_pago: 'tarjeta',
            items: [{
                id_producto: productoComprado.id_producto,
                cantidad: 1,
                precio_unitario: productoComprado.precio_venta
            }]
        };
        try {
            const response = await fetch('/api/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosVenta)
            });
            const resultado = await response.json();
            if (response.ok) {
                alert(`¡Compra exitosa! Has comprado: ${productoComprado.titulo}`);
            } else {
                alert(`Error en la compra: ${resultado.message}`);
            }
        } catch (error) {
            alert('Error: No se pudo conectar con el servicio de ventas.');
        }
    }

    // --- Asignación de Eventos ---
    searchInput.addEventListener('input', aplicarFiltros);
    generoSelect.addEventListener('change', aplicarFiltros);
    plataformaSelect.addEventListener('change', aplicarFiltros);
    ordenarSelect.addEventListener('change', aplicarFiltros);
    
    document.querySelectorAll('.cerrar-modal').forEach(btn => btn.addEventListener('click', cerrarModales));
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); cerrarModales(); abrirModal(registerModal); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); cerrarModales(); abrirModal(loginModal); });
    navLinksContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.plataforma) {
            e.preventDefault();
            const plataformaNombre = e.target.dataset.plataforma;
            const plataformaObj = plataformasDeEjemplo.find(p => p.nombre === plataformaNombre);
            if (!plataformaObj) return;
            plataformaSelect.value = plataformaObj.id_plataforma;
            aplicarFiltros();
        }
    });
    navUsuarioContainer.addEventListener('click', (e) => {
        if(e.target.id === 'logout-link') {
            e.preventDefault();
            cerrarSesion();
            actualizarNavUsuario();
        } else if (e.target.id === 'login-link') {
            e.preventDefault();
            abrirModal(loginModal);
        }
    });
    tiendaContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('comprar-btn')) {
            if (usuarioLogueado) {
                const idProducto = e.target.dataset.id;
                simularCompra(idProducto);
            } else {
                abrirModal(loginModal);
            }
        }
    });
    window.addEventListener('click', (e) => { if (e.target === loginModal || e.target === registerModal) { cerrarModales(); } });
    
    // --- Inicia todo ---
    cargarSesion();
    actualizarNavUsuario();
    cargarDatosIniciales();
});