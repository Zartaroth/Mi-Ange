const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware para analizar solicitudes JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Almacenamiento de códigos y registro de códigos utilizados
const codes = ['1234', '5678', '9012', '3456', '7890'];
const pagesToShow = {
  '1234': 'pagina1.html',
  '5678': 'pagina2.html',
  '9012': 'pagina3.html',
  '3456': 'pagina4.html',
  '7890': 'pagina5.html'
};
let counter = -1;
const usedCodes = new Set(); // Conjunto para registrar los códigos utilizados

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
    if (!usedCodes.has(codigo)) {
      // Incrementar el contador y marcar el código como utilizado
      counter++;
      usedCodes.add(codigo);

      // Verificar si el contador es igual a 4 para mostrar el botón
      if (counter === 4) {
        // Redirigir a la página correspondiente y mostrar el botón
        const nextPage = pagesToShow[codigo];
        res.status(200).json({ nextPage, showButton: true });
      } else {
        // Redirigir a la página correspondiente sin mostrar el botón
        const nextPage = pagesToShow[codigo];
        res.status(200).json({ nextPage, showButton: false });
      }

    } else {
      // Si el código ya ha sido utilizado
      res.status(400).json({ error: 'El código ya ha sido utilizado.' });
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
