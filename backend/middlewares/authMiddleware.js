import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {

    /**
     * 🔐 HEADER AUTHORIZATION
     */
    const authHeader =
      req.headers.authorization;

    /**
     * ❌ TOKEN NÃO ENVIADO
     */
    if (!authHeader) {

      return res.status(401).json({
        erro: 'Token não informado'
      });
    }

    /**
     * 🔥 FORMATO:
     * Bearer TOKEN
     */
    const parts =
      authHeader.split(' ');

    /**
     * ❌ FORMATO INVÁLIDO
     */
    if (
      parts.length !== 2 ||
      parts[0] !== 'Bearer'
    ) {

      return res.status(401).json({
        erro: 'Formato do token inválido'
      });
    }

    /**
     * 🔑 TOKEN
     */
    const token = parts[1];

    /**
     * ❌ JWT SECRET
     */
    if (!process.env.JWT_SECRET) {

      throw new Error(
        'JWT_SECRET não definido'
      );
    }

    /**
     * 🔓 VERIFICA TOKEN
     */
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    /**
     * 👤 ID USUÁRIO
     */
    const userId =
      parseInt(
        decoded.id ||
        decoded.usuario_id,
        10
      );

    /**
     * ❌ TOKEN SEM ID
     */
    if (!userId) {

      return res.status(401).json({
        erro: 'Token inválido (sem ID)'
      });
    }

    /**
     * ✅ DADOS USUÁRIO
     */
    req.user = {
      id: userId,
      tipo: decoded.tipo
    };

    /**
     * 🚀 CONTINUA
     */
    next();

  } catch (err) {

    console.error(
      'ERRO AUTH:',
      err
    );

    return res.status(401).json({
      erro: 'Token inválido'
    });
  }
};