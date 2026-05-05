import pool from '../src/db.js';

/**
 * 📌 CRIAR AULA
 */
export const criarAula = async (req, res) => {
  try {
    const { data, horario, professor, modalidade } = req.body;

    // 🔥 VALIDAÇÃO
    if (!data || !horario || !professor) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: data, horario, professor'
      });
    }

    // 🔥 VALIDA DATA
    const dataValida = new Date(data);
    if (isNaN(dataValida)) {
      return res.status(400).json({ erro: 'Data inválida' });
    }

    const result = await pool.query(
      `INSERT INTO aulas (data, horario, professor, modalidade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data, horario, professor, modalidade]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('ERRO CRIAR AULA:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 LISTAR AULAS
 */
export const listarAulas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM aulas ORDER BY data ASC'
    );

    res.json(result.rows);

  } catch (err) {
    console.error('ERRO LISTAR AULAS:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};

/**
 * 📌 DELETAR AULA
 */
export const deletarAula = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const result = await pool.query(
      'DELETE FROM aulas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Aula não encontrada' });
    }

    res.json({
      mensagem: 'Aula deletada com sucesso'
    });

  } catch (err) {
    console.error('ERRO DELETAR AULA:', err);

    res.status(500).json({
      erro: err.message
    });
  }
};