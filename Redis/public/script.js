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
    const compraForm = document.getElementById('compra-form');
    const proveedorSelect = document.getElementById('compra-proveedor');
    const productListForPurchaseContainer = document.getElementById('product-list-for-purchase');
    const productoNombreInput = document.getElementById('compra-producto-nombre');
    const cantidadInput = document.getElementById('compra-cantidad');
    const compraErrorP = document.getElementById('compra-error');
    const backupBtn = document.getElementById('backup-manual-btn');
    const backupMensaje = document.getElementById('backup-mensaje');

    // --- Almacenamiento de datos y estado ---
    let productosCargados = [];
    let productosFiltrados = [];
    let usuarioLogueado = null;
    let currentPage = 1;
    const productsPerPage = 15;
    let plataformasCargadas = [];
    let categoriasCargadas = [];
    let productoSeleccionadoParaCompra = null;
    let productosDelProveedorActual = []; // <-- CAMBIO 1: Nueva variable para guardar la lista del proveedor
    const IP_ESTUDIANTE_1 = '100.91.20.100';

    // --- Lógica de Vistas ---
    function mostrarVistaApropiada() {
        if (usuarioLogueado && usuarioLogueado.rol === 'admin') {
            tiendaView.classList.add('hidden');
            adminPanelView.classList.remove('hidden');
            iniciarPanelAdmin();
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
    function iniciarPanelAdmin() {
        cargarUsuariosAdmin();
        cargarProveedoresAdmin();
    }
    async function cargarUsuariosAdmin() {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) { userListContainer.innerHTML = '<p>Error: Se requiere token.</p>'; return; }
        try {
            const response = await fetch('/api/admin/usuarios', { headers: { 'Authorization': `Bearer ${sesion.token}` } });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'No autorizado.'); }
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
    async function cargarProveedoresAdmin() {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) return;
        try {
            const response = await fetch('/api/admin/proveedores', { headers: { 'Authorization': `Bearer ${sesion.token}` } });
            const proveedores = await response.json();
            proveedorSelect.innerHTML = '<option value="">Seleccione un proveedor...</option>';
            proveedores.forEach(prov => {
                const opcion = document.createElement('option');
                opcion.value = prov.id_proveedor;
                opcion.textContent = prov.nombre_empresa;
                proveedorSelect.appendChild(opcion);
            });
        } catch (error) { console.error("Error al cargar proveedores:", error); }
    }
    compraForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        compraErrorP.textContent = '';
        if (!productoSeleccionadoParaCompra) {
            compraErrorP.textContent = 'Por favor, seleccione un producto válido.';
            return;
        }
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) return alert('Se requiere token.');
        const datosCompra = {
            id_proveedor: proveedorSelect.value,
            id_usuario: usuarioLogueado.id,
            items: [{
                id_producto: productoSeleccionadoParaCompra.id_producto,
                cantidad: cantidadInput.value,
                precio_unitario: productoSeleccionadoParaCompra.precio_compra
            }]
        };
        try {
            const response = await fetch('/api/admin/compras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sesion.token}`},
                body: JSON.stringify(datosCompra)
            });
            const resultado = await response.json();
            if (response.ok) {
                alert(`¡Compra a proveedor registrada exitosamente!`);
                compraForm.reset();
                productoSeleccionadoParaCompra = null;
                productListForPurchaseContainer.innerHTML = '';
            } else { throw new Error(resultado.message); }
        } catch (error) { compraErrorP.textContent = `Error: ${error.message}`; }
    });
    backupBtn.addEventListener('click', async () => {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) {
            return alert("Tu sesión ha expirado. Inicia sesión de nuevo.");
        }
        if (!confirm("¿Estás seguro de que quieres iniciar un backup completo?")) {
            return;
        }
        backupMensaje.textContent = "Iniciando proceso de backup...";
        backupBtn.disabled = true;
        try {
        // CORRECCIÓN: Usar la URL completa de la API
            const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/admin/backup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sesion.token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el servidor.');
            }

            backupMensaje.textContent = `Éxito: ${data.message}`;
        } catch (error) {
            backupMensaje.textContent = `Error: ${error.message}`;
        } finally {
            setTimeout(() => {
                backupBtn.disabled = false;
            }, 5000);
        }
    });

        // INICIO DEL CÓDIGO AÑADIDO PARA EL BACKUP
    // =================================================================
    backupBtn.addEventListener('click', async () => {
        // 1. Obtiene la sesión guardada (usando tu método actual)
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) {
            return alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo como administrador.");
        }

        // 2. Pide confirmación al usuario
        if (!confirm("¿Estás seguro de que quieres iniciar un backup completo del sistema? Esta operación no se puede cancelar.")) {
            return;
        }

        // 3. Actualiza la interfaz para dar feedback al usuario
        backupMensaje.textContent = "Iniciando proceso de backup, por favor espera...";
        backupBtn.disabled = true;

        try {
            // Se usa la URL completa del backend del Estudiante 1
            const response = await fetch(`http://${IP_ESTUDIANTE_1}:3000/api/admin/backup`, {
                method: 'POST',
                headers: {
                    // Envía el token para que el backend sepa que es un admin autorizado
                    'Authorization': `Bearer ${sesion.token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'El servidor devolvió un error.');
            }

            // 5. Muestra un mensaje de éxito
            backupMensaje.textContent = `Éxito: ${data.message}`;

        } catch (error) {
            // 6. Muestra un mensaje de error
            backupMensaje.textContent = `Error: ${error.message}`;
        } finally {
            // 7. Vuelve a habilitar el botón después de un tiempo
            setTimeout(() => {
                backupBtn.disabled = false;
            }, 5000);
        }
    });

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
            card.innerHTML = `<img src="${imagenSrc}" alt="${producto.titulo}"><div class="producto-info"><h3>${producto.titulo}</h3><p>${producto.publisher}</p><div class="precio">$${producto.precio_venta}</div><button class="comprar-btn" data-id="${producto.id_producto}">Comprar</button></div>`;
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
    async function registrarVentaCliente(idProducto) {
        const productoComprado = productosFiltrados.find(p => p.id_producto == idProducto);
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
        if (e.target.classList.contains('comprar-btn')) { if (usuarioLogueado) { const id = e.target.dataset.id; registrarVentaCliente(id); } else { abrirModal(loginModal); } }
        if (e.target.classList.contains('delete-user-btn')) { const id = e.target.dataset.id; if (confirm(`¿Seguro?`)) { eliminarUsuario(id); } }
        if (e.target === loginModal || e.target === registerModal) { cerrarModales(); }
        if (e.target.id === 'backup-btn') {
            e.preventDefault();
            alert('(Simulación) Iniciando proceso de backup...');
        }
    });
    proveedorSelect.addEventListener('change', async () => {
        const idProveedor = proveedorSelect.value;
        productoNombreInput.value = '';
        productoSeleccionadoParaCompra = null;
        productListForPurchaseContainer.innerHTML = '';
        if (!idProveedor) return;
        try {
            const sesion = JSON.parse(sessionStorage.getItem('sesion'));
            if (!sesion || !sesion.token) return;
            const response = await fetch(`/api/productos?id_proveedor=${idProveedor}`, {
                 headers: { 'Authorization': `Bearer ${sesion.token}` }
            });
            const productosDelProveedor = await response.json();
            productosDelProveedorActual = productosDelProveedor; // <-- CAMBIO 2: Guarda la lista del proveedor
            productosDelProveedor.forEach(producto => {
                const item = document.createElement('div');
                item.className = 'product-list-item';
                item.textContent = producto.titulo;
                item.dataset.id = producto.id_producto;
                productListForPurchaseContainer.appendChild(item);
            });
        } catch (error) {
            productListForPurchaseContainer.innerHTML = '<p>Error al cargar productos de este proveedor.</p>';
        }
    });
    productListForPurchaseContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('product-list-item')) {
            document.querySelectorAll('.product-list-item.selected').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            const idProducto = e.target.dataset.id;
            // <-- CAMBIO 3: Busca en la lista correcta
            productoSeleccionadoParaCompra = productosDelProveedorActual.find(p => p.id_producto == idProducto);
            if (productoSeleccionadoParaCompra) {
                productoNombreInput.value = productoSeleccionadoParaCompra.titulo;
                compraErrorP.textContent = ''; // Limpia el mensaje de error si la selección es válida
            }
        }
    });

    backupBtn.addEventListener('click', async () => {
        const sesion = JSON.parse(sessionStorage.getItem('sesion'));
        if (!sesion || !sesion.token) {
            return alert("Tu sesión ha expirado. Inicia sesión de nuevo.");
        }

        if (!confirm("¿Estás seguro de que quieres iniciar un backup completo?")) {
            return;
        }

        backupMensaje.textContent = "Iniciando proceso de backup...";
        backupBtn.disabled = true;

        try {
            const response = await fetch('/api/admin/backup', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sesion.token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el servidor.');
            }

            backupMensaje.textContent = `Éxito: ${data.message}`;
        } catch (error) {
            backupMensaje.textContent = `Error: ${error.message}`;
        } finally {
            setTimeout(() => {
                backupBtn.disabled = false;
            }, 5000);
        }
    });
    
    // --- Inicia todo ---
    cargarSesion();
    actualizarNavUsuario();
    mostrarVistaApropiada();
});