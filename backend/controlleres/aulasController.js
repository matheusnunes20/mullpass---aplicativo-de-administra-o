import pool from '../src/db.js';

// 🔥 CRIAR
export const criarAula = async (req, res) => {
  try {
    const { data, horario, professor, modalidade } = req.body;

    if (!data || !horario || !professor) {
      return res.status(400).send('Campos obrigatórios faltando');
    }

    const result = await pool.query(
      `INSERT INTO aulas (data, horario, professor, modalidade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data, horario, professor, modalidade]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar aula');
  }
};

// 🔥 LISTAR
export const listarAulas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aulas ORDER BY data ASC'
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar aulas');
  }
};

// 🔥 DELETAR
export const deletarAula = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM aulas WHERE id = $1', [id]);

    res.send('Aula deletada');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar aula');
  }
};