const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Middleware para analizar solicitudes JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Archivo para guardar los datos
const DATA_FILE = 'data.json';

// Función para leer los datos desde el archivo
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { counter: -1, usedCodes: [] }; // Si el archivo no existe, devuelve valores predeterminados
  }
}

// Función para guardar los datos en el archivo
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Middleware para reiniciar el archivo data.json al iniciar el servidor
app.use((req, res, next) => {
  // Eliminar el archivo data.json si existe
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
  next(); // Pasar al siguiente middleware
});

// Leer los datos iniciales
let { counter, usedCodes } = readData();

// Almacenamiento de códigos y registro de códigos utilizados
const codes = ['1234', '5678', '9012', '3456', '7890'];
const pagesToShow = {
  '1234': 'pagina1.html',
  '5678': 'pagina2.html',
  '9012': 'pagina3.html',
  '3456': 'pagina4.html',
  '7890': 'pagina5.html'
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

      // Verificar si el contador es igual a 4 para mostrar el botón
      if (counter === 4) {
        // Redirigir a la página correspondiente y mostrar el botón
        const nextPage = pagesToShow[codigo];
        saveData({ counter, usedCodes });
        res.status(200).json({ nextPage, showButton: true });
      } else {
        // Redirigir a la página correspondiente sin mostrar el botón
        const nextPage = pagesToShow[codigo];
        saveData({ counter, usedCodes });
        res.status(200).json({ nextPage, showButton: false });
      }

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

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
});
