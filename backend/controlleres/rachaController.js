import pool from '../src/db.js';
export const criarRacha = async (req, res) => {
  try {

    const userId = req.user?.id || req.user?.usuario_id;

    if (!userId) {
      return res.status(401).send('Acesso negado');
    }

    const { data, hora_inicio, hora_fim, local, quadra, limite, tipo } = req.body;

    if (!data || !hora_inicio || !hora_fim || !local || !quadra || !limite || !tipo) {
      return res.status(400).send('Campos obrigatórios faltando');
    }
    const horaInicioFormatada = hora_inicio.includes(':')
      ? hora_inicio
      : `${hora_inicio}:00`;

    const horaFimFormatada = hora_fim.includes(':')
      ? hora_fim
      : `${hora_fim}:00`;

    const horaFinal = `${horaInicioFormatada} - ${horaFimFormatada}`;

    const result = await pool.query(
      `INSERT INTO rachas 
      (data, hora, local, quadra, limite, tipo, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        data,
        horaFinal,
        local,
        quadra,
        limite,
        tipo,
        userId
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('ERRO CRIAR RACHA:', err);
    res.status(500).send('Erro ao criar racha');
  }
};
export const listarRachas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        data,
        hora,
        local,
        quadra,
        limite,
        tipo,
        criado_por  -- 🔥 ESSENCIAL
      FROM rachas
      ORDER BY data DESC
    `);

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
export const entrarRacha = async (req, res) => {
  try {
    const { racha_id } = req.body;

    if (!racha_id) {
      return res.status(400).send('Racha não informado');
    }

    const userId = req.user?.id || req.user?.usuario_id;

    if (!userId) {
      return res.status(401).send('Acesso negado');
    }

    const alunoResult = await pool.query(
      `SELECT id FROM alunos WHERE usuario_id = $1`,
      [req.user.id]
    );

    const aluno = alunoResult.rows[0];

    if (!aluno) {
      return res.status(400).send('Aluno não encontrado');
    }

    const jaExiste = await pool.query(
      'SELECT * FROM racha_jogadores WHERE racha_id = $1 AND aluno_id = $2',
      [racha_id, aluno.id]
    );

    if (jaExiste.rows.length > 0) {
      return res.status(400).send('Você já está nesse racha');
    }

    const rachaResult = await pool.query(
      'SELECT * FROM rachas WHERE id = $1',
      [racha_id]
    );

    const racha = rachaResult.rows[0];

    if (!racha) {
      return res.status(404).send('Racha não encontrado');
    }

    const count = await pool.query(
      'SELECT COUNT(*) FROM racha_jogadores WHERE racha_id = $1',
      [racha_id]
    );

    if (parseInt(count.rows[0].count) >= racha.limite) {
      return res.status(400).send('Racha lotado');
    }

    if (racha.tipo === 'feminino' && aluno.sexo !== 'feminino') {
      return res.status(400).send('Racha exclusivo feminino');
    }

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

export const deletarRacha = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id || req.user?.usuario_id;

    if (!userId) {
      return res.status(401).send('Acesso negado');
    }

    const result = await pool.query(
      'SELECT * FROM rachas WHERE id = $1',
      [id]
    );

    const racha = result.rows[0];

    if (!racha) {
      return res.status(404).send('Racha não encontrado');
    }
    if (
      racha.criado_por.toString() !== userId.toString() &&
      req.user.tipo !== 'admin'
    ) {
      return res.status(403).send('Sem permissão');
    }

    await pool.query(
      'DELETE FROM racha_jogadores WHERE racha_id = $1',
      [id]
    );

    await pool.query(
      'DELETE FROM rachas WHERE id = $1',
      [id]
    );

    res.send('Racha deletado');

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar racha');
  }
};