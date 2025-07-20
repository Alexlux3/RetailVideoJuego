document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM ---
    const tiendaView = document.getElementById('tienda-view');
    const adminPanelView = document.getElementById('admin-panel-container');
    const userListContainer = document.getElementById('user-list-container');
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
    let plataformasCargadas = [];
    let categoriasCargadas = [];

    // --- Lógica de Vistas ---
    function mostrarVistaApropiada() {
        if (usuarioLogueado && usuarioLogueado.rol === 'admin') {
            tiendaView.classList.add('hidden');
            adminPanelView.classList.remove('hidden');
            cargarUsuariosAdmin();
        } else {
            tiendaView.classList.remove('hidden');
            adminPanelView.classList.add('hidden');
            if (productosCargados.length === 0) {
                cargarDatosIniciales();
            }
        }
    }

    // --- Lógica de Sesión ---
    function guardarSesion(sesionData) { sessionStorage.setItem('sesion', JSON.stringify(sesionData)); usuarioLogueado = sesionData.user; }
    function cargarSesion() { const s = sessionStorage.getItem('sesion'); if (s) { usuarioLogueado = JSON.parse(s).user; } }
    function cerrarSesion() { sessionStorage.removeItem('sesion'); usuarioLogueado = null; }

    // --- Lógica de Modales ---
    function abrirModal(modal) { modal.className = 'modal-visible'; }
    function cerrarModales() { loginModal.className = 'modal-oculto'; registerModal.className = 'modal-oculto'; }

    // --- Lógica de Autenticación ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorP = document.getElementById('login-error');
        errorP.textContent = '';
        try {
            const response = await fetch('/api/usuarios/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await response.json();
            if (response.ok) { guardarSesion(data); actualizarNavUsuario(); cerrarModales(); mostrarVistaApropiada(); } else { errorP.textContent = data.message; }
        } catch (error) { errorP.textContent = 'Error de conexión.'; }
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
            const response = await fetch('/api/usuarios/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre_completo, nombre_usuario, email, password, rol: 'cliente' }) });
            const data = await response.json();
            if (response.ok) { alert('¡Registro exitoso!'); cerrarModales(); abrirModal(loginModal); } else { errorP.textContent = data.message; }
        } catch (error) { errorP.textContent = 'Error de conexión.'; }
    });
    
    function actualizarNavUsuario() {
        navUsuarioContainer.innerHTML = '';
        if (usuarioLogueado) {
            const nombreUsuario = document.createElement('span');
            nombreUsuario.textContent = `Bienvenido, ${usuarioLogueado.username}`;
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logout-link';
            logoutLink.textContent = 'Cerrar Sesión';
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

    // --- Lógica del Panel de Administración ---
    async function cargarUsuariosAdmin() {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) { userListContainer.innerHTML = '<p>Error: Se requiere token de administrador.</p>'; return; }
        try {
            const response = await fetch('/api/admin/usuarios', { headers: { 'Authorization': `Bearer ${sesion.token}` } });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'No estás autorizado.'); }
            const usuarios = await response.json();
            userListContainer.innerHTML = `<table><thead><tr><th>ID</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>${usuarios.map(u => `<tr data-user-id="${u.id_usuario}"><td>${u.id_usuario}</td><td>${u.nombre_usuario}</td><td>${u.email}</td><td>${u.rol}</td><td><button class="delete-user-btn" data-id="${u.id_usuario}">Eliminar</button></td></tr>`).join('')}</tbody></table>`;
        } catch (error) { userListContainer.innerHTML = `<p>Error al cargar usuarios: ${error.message}</p>`; }
    }
    
    async function eliminarUsuario(idUsuario) {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) return alert('Se requiere token.');
        try {
            const response = await fetch(`/api/admin/usuarios/${idUsuario}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${sesion.token}` } });
            const data = await response.json();
            if (response.ok) { alert(data.message); cargarUsuariosAdmin(); } else { throw new Error(data.message); }
        } catch (error) { alert(`Error al eliminar usuario: ${error.message}`); }
    }

    // --- Lógica de la Tienda ---
    async function cargarDatosIniciales() {
        try {
            const [productosRes, plataformasRes, categoriasRes] = await Promise.all([ fetch('/api/productos'), fetch('/api/plataformas'), fetch('/api/categorias') ]);
            const productos = await productosRes.json();
            const plataformas = await plataformasRes.json();
            const categorias = await categoriasRes.json();
            productosCargados = productos.data || productos;
            plataformasCargadas = plataformas.data || plataformas;
            categoriasCargadas = categorias.data || categorias;
            popularFiltro(plataformaSelect, plataformasCargadas, 'id_plataforma');
            popularFiltro(generoSelect, categoriasCargadas, 'id_categoria');
            aplicarFiltros();
        } catch (error) { tiendaContainer.innerHTML = '<p>Error: No se pudieron cargar los datos iniciales.</p>'; console.error(error); }
    }
    
    function popularFiltro(selectElement, items, idField) { if (!items) return; items.forEach(item => { const o = document.createElement('option'); o.value = item[idField]; o.textContent = item.nombre; selectElement.appendChild(o); }); }
    
    function mostrarProductos() {
        tiendaContainer.innerHTML = '';
        if (!productosFiltrados || productosFiltrados.length === 0) { tiendaContainer.innerHTML = '<p>No se encontraron resultados.</p>'; actualizarPaginacion(); return; }
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productosDePagina = productosFiltrados.slice(startIndex, endIndex);
        productosDePagina.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.dataset.id = producto.id_producto;
            const imagenSrc = producto.imagen_url || 'https://via.placeholder.com/300x150.png?text=No+Image';
            card.innerHTML = `<img src="${imagenSrc}" alt="${producto.titulo}"><div class="producto-info"><h3>${producto.titulo}</h3><p>${producto.publisher}</p><div class="precio">$${producto.precio_venta}</div><button class="comprar-btn">Comprar</button></div>`;
            tiendaContainer.appendChild(card);
        });
        actualizarPaginacion();
    }

    function aplicarFiltros() {
        let resultado = [...productosCargados];
        if (searchInput.value) { resultado = resultado.filter(p => p.titulo.toLowerCase().includes(searchInput.value.toLowerCase())); }
        if (generoSelect.value) { resultado = resultado.filter(p => p.id_categoria == generoSelect.value); }
        if (plataformaSelect.value) { resultado = resultado.filter(p => p.id_plataforma == plataformaSelect.value); }
        if (ordenarSelect.value === 'precio-asc') { resultado.sort((a, b) => a.precio_venta - b.precio_venta); }
        if (ordenarSelect.value === 'precio-desc') { resultado.sort((a, b) => b.precio_venta - a.precio_venta); }
        productosFiltrados = resultado;
        currentPage = 1;
        mostrarProductos();
    }

    function actualizarPaginacion() {
        paginacionContainer.innerHTML = '';
        const totalPages = Math.ceil(productosFiltrados.length / productsPerPage);
        if (totalPages <= 1) return;
        const prevButton = document.createElement('button'); prevButton.className = 'pag-btn'; prevButton.textContent = 'Anterior'; prevButton.disabled = currentPage === 1; prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; mostrarProductos(); } });
        const pageIndicator = document.createElement('span'); pageIndicator.id = 'pagina-actual'; pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
        const nextButton = document.createElement('button'); nextButton.className = 'pag-btn'; nextButton.textContent = 'Siguiente'; nextButton.disabled = currentPage === totalPages; nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; mostrarProductos(); } });
        paginacionContainer.appendChild(prevButton); paginacionContainer.appendChild(pageIndicator); paginacionContainer.appendChild(nextButton);
    }
    
    async function simularCompra(idProducto) {
        const productoComprado = productosCargados.find(p => p.id_producto == idProducto);
        if (!productoComprado) return alert('Error: Producto no encontrado.');
        const sesionGuardada = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesionGuardada || !sesionGuardada.token) { return alert('Error: Se requiere token.'); }
        const token = sesionGuardada.token;
        const datosVenta = { id_cliente: usuarioLogueado.id, id_usuario: usuarioLogueado.id, metodo_pago: 'tarjeta', items: [{ id_producto: productoComprado.id_producto, cantidad: 1, precio_unitario: productoComprado.precio_venta }] };
        try {
            const response = await fetch('/api/ventas', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(datosVenta) });
            const resultado = await response.json();
            if (response.ok) { alert(`¡Compra exitosa!`); } else { alert(`Error en la compra: ${resultado.message}`); }
        } catch (error) { alert('Error: No se pudo conectar con el servicio de ventas.'); }
    }

    // --- Asignación de Eventos ---
    searchInput.addEventListener('input', aplicarFiltros);
    generoSelect.addEventListener('change', aplicarFiltros);
    plataformaSelect.addEventListener('change', aplicarFiltros);
    ordenarSelect.addEventListener('change', aplicarFiltros);
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); cerrarModales(); abrirModal(registerModal); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); cerrarModales(); abrirModal(loginModal); });
    document.querySelectorAll('.cerrar-modal').forEach(btn => btn.addEventListener('click', cerrarModales));
    
    navLinksContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.plataforma) {
            e.preventDefault();
            const pNombre = e.target.dataset.plataforma;
            const pObj = plataformasCargadas.find(p => p.nombre === pNombre);
            if (pObj) { plataformaSelect.value = pObj.id_plataforma; aplicarFiltros(); }
        }
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'logout-link') { e.preventDefault(); cerrarSesion(); actualizarNavUsuario(); mostrarVistaApropiada(); }
        if (e.target.id === 'login-link') { e.preventDefault(); abrirModal(loginModal); }
        const tarjetaProducto = e.target.closest('.producto-card');
        if (tarjetaProducto && !e.target.classList.contains('comprar-btn')) { const id = tarjetaProducto.dataset.id; mostrarDetalleProducto(id); }
        if (e.target.classList.contains('comprar-btn')) { if (usuarioLogueado) { const id = e.target.dataset.id || e.target.closest('.producto-card').dataset.id; simularCompra(id); } else { abrirModal(loginModal); } }
        if (e.target.classList.contains('delete-user-btn')) { const id = e.target.dataset.id; if (confirm(`¿Seguro?`)) { eliminarUsuario(id); } }
        if (e.target.classList.contains('volver-btn')) { mostrarTienda(); }
        if (e.target === loginModal || e.target === registerModal) { cerrarModales(); }
    });
    
    // --- Inicia todo ---
    cargarSesion();
    actualizarNavUsuario();
    mostrarVistaApropiada();
});