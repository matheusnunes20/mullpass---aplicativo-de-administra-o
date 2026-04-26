export const permit = (...tiposPermitidos) => {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.userTipo)) {
      return res.status(403).send('Acesso negado');
    }

    next();
  };
};