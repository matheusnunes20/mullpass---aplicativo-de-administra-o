import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Token não fornecido');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: parseInt(decoded.id || decoded.usuario_id), // 🔥 CORREÇÃO
      tipo: decoded.tipo
    };

    console.log('USER LOGADO:', req.user); // 🔥 antes do next

    next();

  } catch (err) {
    return res.status(401).send('Token inválido');
  }
};