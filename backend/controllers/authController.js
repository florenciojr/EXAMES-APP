const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; // Use uma chave forte em produção

// Lógica de registro
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log('❌ Registro falhou: Dados incompletos.');
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log('❌ Registro falhou: Email já registrado.');
            return res.status(409).json({ success: false, message: 'Email já registrado' });
        }

        const newUser = await User.create({ name, email, password });

        // Gera o token JWT para o novo usuário
        const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '24h' });

        console.log('✅ Registro bem-sucedido para:', newUser.email);
        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('❌ Erro no registro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
};

// Lógica de login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Log para verificar os dados recebidos
    console.log('Recebendo requisição de login para:', email);

    try {
        const user = await User.findByEmail(email);

        if (!user) {
            console.log('❌ Login falhou: Usuário não encontrado.');
            return res.status(404).json({ success: false, message: 'Credenciais inválidas' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('❌ Login falhou: Senha incorreta.');
            return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

        console.log('✅ Login bem-sucedido para:', user.email);
        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
};