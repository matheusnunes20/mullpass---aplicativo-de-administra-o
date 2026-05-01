export const permit = (...tiposPermitidos) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        erro: 'Não autenticado'
      });
    }

    if (!req.user.tipo) {
      return res.status(403).json({
        erro: 'Tipo de usuário não definido'
      });
    }

    if (!tiposPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({
        erro: 'Acesso negado'
      });
    }

    next();
  };
};