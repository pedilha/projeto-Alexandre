// Importação de módulos
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
require('dotenv').config();

// Configuração de variáveis de ambiente
dotenv.config();

// Inicialização do servidor
const app = express();
const PORT = process.env.PORT || 5000;

// Conexão com o banco de dados
const sequelize = require('./config/database');

// Modelos
const User = require('./models/User');

const Book = require('./models/Book');

// Sincroniza o banco de dados
sequelize.sync({ force: false }) // 'force: true' recria as tabelas
    .then(() => {
        console.log("Tabelas criadas/sincronizadas com sucesso.");
    })
    .catch(error => {
        console.error("Erro ao criar/sincronizar tabelas:", error);
    });


// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Função para gerar token JWT
function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.SECRET_KEY,  // A chave secreta vem do .env
        { expiresIn: '1h' }
    );
}

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor backend funcionando!');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se o email já está cadastrado
        const usuarioExistente = await User.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ mensagem: 'Email já cadastrado.' });
        }

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria o usuário no banco de dados
        const novoUsuario = await User.create({
            nome,
            email,
            senha: senhaHash
        });

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario: novoUsuario });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Verifica se o usuário existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login realizado com sucesso!', token });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).json({ message: 'Erro no servidor. Tente novamente mais tarde.' });
    }
});


app.post('/usuarios', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Verifica se o e-mail já está cadastrado
        const usuarioExistente = await User.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria o novo usuário
        const novoUsuario = await User.create({ nome, email, senha: senhaHash });

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            }
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await User.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: "Erro ao listar usuários" });
    }
});

// Middleware de autenticação
function autenticarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'Token não fornecido' });

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });

        req.userId = decoded.id;  // Anexa o ID do usuário ao req
        next();
    });
}

// Rota para adicionar livro
app.post('/api/livros/adicionar', autenticarToken, async (req, res) => {
    const { title, author, totalPages, image, currentPage } = req.body;

    try {
        const novoLivro = await Book.create({
            title,
            author,
            totalPages,
            image,
            currentPage,
            UserId: req.userId
        });
        res.status(201).json({ message: 'Livro adicionado com sucesso!', livro: novoLivro });
    } catch (error) {
        console.error('Erro ao adicionar livro:', error);
        res.status(500).json({ message: 'Erro ao adicionar livro' });
    }
});

// Rota para listar livros
app.get('/api/livros', autenticarToken, async (req, res) => {
    try {
        console.log("ID do usuário autenticado:", req.userId);
        const livros = await Book.findAll({ where: { UserId: req.userId } });
        console.log("Livros encontrados:", livros);
        res.status(200).json(livros);
    } catch (error) {
        console.error("Erro ao listar livros:", error);
        res.status(500).json({ message: "Erro ao listar livros" });
    }
});








