const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const port = 3000;
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://gmmbiotech.md");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

let db = new sqlite3.Database('Products.db');
db.run('CREATE TABLE IF NOT EXISTS Products (id INTEGER PRIMARY KEY, category TEXT, name TEXT, code TEXT, description TEXT, image TEXT)', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Tabelul 'Products' a fost creat sau există deja.");
    }
});

app.get('/api/products/chromagar', (req, res) => {
    db.all("SELECT id, category, name, code, description, image FROM Products WHERE category = 'Chromagar'", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/api/products', (req, res) => {
    db.all("SELECT id, category, name, code, description, image FROM Products", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/api/products/pcr', (req, res) => {
    db.all("SELECT id, category, name, code, description, image FROM Products WHERE category = 'GENEFIRST'", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});

app.post('/api/products', upload.single('image'), (req, res) => {
    const { category, name, code, description } = req.body;
    let imagePath = '';
    if (req.file) {
        const imgData = fs.readFileSync(req.file.path);
        imagePath = imgData.toString('base64');
        fs.unlinkSync(req.file.path); // Șterge fișierul după ce a fost citit
    }

    db.run('INSERT INTO Products (category, name, code, description, image) VALUES (?, ?, ?, ?, ?)', [category, name, code, description, imagePath], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(201).send({ id: this.lastID, imagePath });
        }
    });
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { category, name, code, description } = req.body;
    let imagePath = '';
    if (req.file) {
        const imgData = fs.readFileSync(req.file.path);
        imagePath = imgData.toString('base64');
        fs.unlinkSync(req.file.path); // Șterge fișierul după ce a fost citit
    }

    db.run('UPDATE Products SET category = ?, name = ?, code = ?, description = ?, image = ? WHERE id = ?', [category, name, code, description, imagePath, id], function (err) {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).send({ message: 'Produs actualizat cu succes', imagePath });
        }
    });
});

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

app.post('/api/sendEmail', (req, res) => {
    const { name, mail, phone, message } = req.body;
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'testmaildevgav@gmail.com',
            pass: 'judl asgf vjni lhlf'
        }
    });

    const mailOptions = {
        from: 'testmaildevgavl@gmail.com',
        to: 'gmmbiotechnology@gmail.com',
        subject: 'Notificare',
        text: `Ati primit o comanda de la: \n\nNume: ${name}\nEmail: ${mail}\nTelefon: ${phone}\nMesaj: ${message}`,
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.status(500).send('Eroare la trimiterea emailului.');
        } else {
            console.log('Email sent: ' + info.response);
            res.send({ status: 'ok' });
        }
    });
});

app.listen(port, () => {
    console.log(`Serverul rulează pe portul ${port}`);
});
