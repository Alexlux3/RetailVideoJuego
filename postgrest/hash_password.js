const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'tu_contraseña_secreta_de_admin'; // <-- CAMBIA ESTO
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log('Tu contraseña hasheada es:');
  console.log(hash);
}

hashPassword();