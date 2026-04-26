export const me = async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, username, tipo FROM usuarios WHERE id = $1',
    [req.user.id]
  );

  res.json(result.rows[0]);
};