import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        erro: 'Formato do token inválido'
      });
    }

    const token = parts[1];

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = parseInt(decoded.id || decoded.usuario_id, 10);

    if (!userId) {
      return res.status(401).json({
        erro: 'Token inválido (sem ID)'
      });
    }

    req.user = {
      id: userId,
      tipo: decoded.tipo
    };

    next();

  } catch (err) {
    console.error('ERRO AUTH:', err);

    return res.status(401).json({
      erro: 'Token inválido'
    });
  }
};