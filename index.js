const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Middleware para analizar solicitudes JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Archivo para guardar los datos
const DATA_FILE = 'data.json';

// Función para leer los datos desde el archivo
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { counter: -1, usedCodes: [], showButton: false }; // Si el archivo no existe, devuelve valores predeterminados
  }
}

// Función para guardar los datos en el archivo
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Variable para rastrear si el servidor se ha iniciado
let serverStarted = false;

// Middleware para reiniciar el archivo data.json al iniciar el servidor
app.use((req, res, next) => {

  if (!serverStarted) { // Si el servidor no se ha iniciado aún
    serverStarted = true; // Marcar que el servidor se ha iniciado
    // Eliminar el archivo data.json si existe
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.unlinkSync(DATA_FILE);
        console.log('Archivo data.json eliminado al iniciar el servidor.');
      } catch (error) {
        console.error('Error al eliminar el archivo data.json al iniciar el servidor:', error);
      }
    }
    // Si el archivo no existe después de eliminarlo, crearlo con valores predeterminados
    if (!fs.existsSync(DATA_FILE)) {
      console.log('Creando archivo data.json con valores predeterminados.');
      saveData({ counter: -1, usedCodes: [], showButton: false });
    }
  }
  next(); // Pasar al siguiente middleware
});

// Leer los datos iniciales
let { counter, usedCodes, showButton } = readData();

// Almacenamiento de códigos y registro de códigos utilizados
const codes = ['1234', '5246', '9012', '1015', '1404'];
const pagesToShow = {
  '1234': 'regalo1.html',
  '5246': 'regalo2.html',
  '9012': 'regalo3.html',
  '1015': 'regalo4.html',
  '1404': 'regalo5.html'
};

// Ruta para servir el formulario HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Ruta para manejar la solicitud del formulario
app.post('/submit', (req, res) => {
  const { codigo } = req.body;

  // Verificar si el código está en la lista de códigos
  if (codes.includes(codigo)) {
    // Verificar si el código ya ha sido utilizado antes
    if (!usedCodes.includes(codigo)) {
      // Incrementar el contador y marcar el código como utilizado
      counter++;
      usedCodes.push(codigo);

      // Log para registrar el código válido
      console.log(`Código válido insertado: ${codigo}`);

      // Verificar si el contador es igual a 4 para mostrar el botón
      if (counter === 4 && !showButton) {
        // Actualizar el estado del botón a mostrar
        showButton = true;
        // Guardar los datos actualizados en el archivo
        saveData({ counter, usedCodes, showButton });
      }

      const nextPage = pagesToShow[codigo];
      saveData({ counter, usedCodes, showButton });

      // Redirigir a la página correspondiente
      res.status(200).json({ nextPage, showButton });

    } else {
      // Si el código ya ha sido utilizado
      const nextPage = pagesToShow[codigo];
      res.status(200).json({ nextPage, showButton: false });
    }

  } else {
    // Enviar un código de estado HTTP 400 si el código es inválido
    res.status(400).json({ error: 'Código inválido.' });
  }
});

// Ruta para obtener el valor actual del contador
app.get('/counter', (req, res) => {
  res.json({ counter });
});


// Ruta para obtener el valor actual de ShowButton
app.get('/showButton', (req, res) => {
  res.json({ showButton });
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
});
