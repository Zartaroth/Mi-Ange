const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Ruta al archivo index.html
  const filePath = path.join(__dirname, 'index.html');

  // Leer el contenido del archivo index.html
  fs.readFile(filePath, 'utf8', (err, htmlContent) => {
    if (err) {
      res.writeHead(500);
      return res.end('Error al leer el archivo HTML.');
    }

    // Configurar encabezados de respuesta
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // Enviar el contenido del archivo HTML como respuesta
    res.end(htmlContent);
  });
});

// Puerto en el que se ejecutará el servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}/`);
});
