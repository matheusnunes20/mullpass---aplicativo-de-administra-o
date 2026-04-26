import pool from '../src/db.js';

// 🔥 CRIAR RACHA (FUNCIONÁRIO)
export const criarRacha = async (req, res) => {
  try {
    const { data, hora, local, quadra, limite, tipo } = req.body;

    if (!data || !hora || !local || !quadra || !limite || !tipo) {
      return res.status(400).send('Campos obrigatórios faltando');
    }

    const result = await pool.query(
      `INSERT INTO rachas (data, hora, local, quadra, limite, tipo, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [data, hora, local, quadra, limite, tipo, req.userId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar racha');
  }
};


// 🔥 LISTAR RACHAS
export const listarRachas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rachas ORDER BY data DESC'
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar rachas');
  }
};

export const listarJogadoresRacha = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.nome, a.telefone
       FROM racha_jogadores rj
       JOIN alunos a ON a.id = rj.aluno_id
       WHERE rj.racha_id = $1`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar jogadores');
  }
};


// 🔥 ENTRAR NO RACHA (ALUNO)
export const entrarRacha = async (req, res) => {
  try {
    const { racha_id } = req.body;

    if (!racha_id) {
      return res.status(400).send('Racha não informado');
    }

    // 🔥 pegar aluno logado
    const alunoResult = await pool.query(
      'SELECT * FROM alunos WHERE usuario_id = $1',
      [req.userId]
    );

    const aluno = alunoResult.rows[0];

    if (!aluno) {
      return res.status(400).send('Aluno não encontrado');
    }

    // 🔥 evitar duplicado
    const jaExiste = await pool.query(
      'SELECT * FROM racha_jogadores WHERE racha_id = $1 AND aluno_id = $2',
      [racha_id, aluno.id]
    );

    if (jaExiste.rows.length > 0) {
      return res.status(400).send('Você já está nesse racha');
    }

    // 🔥 pegar racha
    const rachaResult = await pool.query(
      'SELECT * FROM rachas WHERE id = $1',
      [racha_id]
    );

    const racha = rachaResult.rows[0];

    if (!racha) {
      return res.status(404).send('Racha não encontrado');
    }

    // 🔥 validar limite
    const count = await pool.query(
      'SELECT COUNT(*) FROM racha_jogadores WHERE racha_id = $1',
      [racha_id]
    );

    if (parseInt(count.rows[0].count) >= racha.limite) {
      return res.status(400).send('Racha lotado');
    }

    // 🔥 validar feminino
    if (racha.tipo === 'feminino' && aluno.sexo !== 'feminino') {
      return res.status(400).send('Racha exclusivo feminino');
    }

    // 🔥 inserir
    await pool.query(
      'INSERT INTO racha_jogadores (racha_id, aluno_id) VALUES ($1,$2)',
      [racha_id, aluno.id]
    );

    res.send('Entrou no racha');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao entrar no racha');
  }
};