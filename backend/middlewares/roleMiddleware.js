export const permit = (...tiposPermitidos) => {
  return (req, res, next) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          erro: 'Usuário não autenticado'
        });
      }

      if (!req.user.tipo) {
        return res.status(403).json({
          erro: 'Tipo de usuário não definido'
        });
      }

      if (!Array.isArray(tiposPermitidos) || tiposPermitidos.length === 0) {
        console.warn('⚠️ permit() sem tipos definidos');
        return res.status(500).json({
          erro: 'Configuração de permissão inválida'
        });
      }

      if (!tiposPermitidos.includes(req.user.tipo)) {
        return res.status(403).json({
          erro: 'Acesso negado',
          tipoUsuario: req.user.tipo
        });
      }

      next();

    } catch (err) {
      console.error('ERRO ROLE MIDDLEWARE:', err);

      return res.status(500).json({
        erro: err.message
      });
    }
  };
};