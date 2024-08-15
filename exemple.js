import express from 'express';
import mysql from 'mysql2/promise';
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;

async function init() {
  try {

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bd_test'
    });

    console.log('Conexão ao banco de dados bem-sucedida!');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use(cookieParser()); 

    app.post('/cadastro', async (req, res) => {
      const { email, senha } = req.body;
      try {
        const [results] = await connection.execute('INSERT INTO usuario (email, senha) VALUES (?, ?)', [email, senha]);
        res.redirect("http://localhost:3000/login.html");
      } catch (err) {
        console.error('Erro ao inserir:', err);
        res.send('Erro ao inserir dados no banco.');
      }
    });

    app.post('/login', async (req, res) => {
      const { email, senha } = req.body;
      try {
        const [rows, fields] = await connection.execute('SELECT * FROM usuario WHERE email = ? AND senha = ?', [email, senha]);
        if (rows.length > 0) {
          res.cookie('userEmail', email, { httpOnly: true });
          res.redirect("http://localhost:3000/main.html");
        } else {
          res.send('Login falhou. Usuário ou senha incorretos.');
        }
      } catch (error) {
        console.error('Erro ao tentar login:', error);
        res.send('Erro ao tentar login.');
      }
    });

    app.get('/usuario', async (req, res) => {
      const userEmail = req.cookies.userEmail;

      if (!userEmail) {
        res.status(401).send('Usuário não encontrado');
        return;
      }

      try {
        const [rows] = await connection.execute('SELECT * FROM usuario WHERE email = ?', [userEmail]);
        if (rows.length > 0) {
          res.json(rows[0]);
        } else {
          res.status(404).send('Usuário não encontrado');
        }
      } catch (err) {
        console.error('Erro ao buscar usuário no banco de dados', err);
        res.send('Erro ao encontrar o usuário no banco');
      }
    });

    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
}

init();
