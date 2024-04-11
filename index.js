const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const port = 3000;
app.use(cors({
    origin: 'http://localhost:5173' // Adresa unde rulează frontend-ul SvelteKit
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');

// Configurați stocarea multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Directorul unde vor fi salvate imaginile; asigurați-vă că există
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Generează un nume unic pentru fiecare imagine
    }
});

const upload = multer({ storage: storage });
// Inițializarea bazei de date SQLite
let db = new sqlite3.Database('Products.db');
db.run('CREATE TABLE IF NOT EXISTS Products (id INTEGER PRIMARY KEY, category TEXT, name TEXT, code TEXT, description TEXT, image TEXT)', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Tabelul 'Products' a fost creat sau există deja.");
    }
});
// Endpoint GET pentru a obține toate produsele
app.get('/api/products/chromagar', (req, res) => {
    db.all("SELECT * FROM Products WHERE category = 'Chromagar'", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});
/// adaugam get pentru categoriile new
app.get('/api/products/news', (req, res) => {
    db.all("SELECT * FROM Products WHERE category = 'News'", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM Products", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});
app.get('/api/products/pcr', (req, res) => {
    db.all("SELECT * FROM Products WHERE category = 'GENEFIRST'", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

const fs = require('fs');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Endpoint POST pentru a adăuga un produs nou

// POST - Adăugarea unui produs nou cu imagine
app.post('/api/products', upload.single('image'), (req, res) => {
    const { category, name, code, description } = req.body;
    const imagePath = req.file ? req.file.path : ''; // Calea către imaginea încărcată

    db.run('INSERT INTO Products (category, name, code, description, image) VALUES (?, ?, ?, ?, ?)', [category, name, code, description, imagePath], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID, imagePath });
        }
    });
});

// PUT - Actualizarea unui produs existent cu imagine
app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { category, name, code, description } = req.body;
    const imagePath = req.file ? req.file.path : '';

    db.run('UPDATE Products SET category = ?, name = ?, code = ?, description = ?, image = ? WHERE id = ?', [category, name, code, description, imagePath, id], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send({ message: 'Produs actualizat cu succes', imagePath });
        }
    });
});


// Endpoint DELETE pentru a șterge un produs
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM Products WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send({ message: 'Produs șters cu succes' });
        }
    });
});

app.listen(port, () => {
    console.log(`Serverul rulează pe portul ${port}`);
});
