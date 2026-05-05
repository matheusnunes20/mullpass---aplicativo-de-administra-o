import pool from '../src/db.js';
export const gerarMensalidades = async () => {
  try {

    const alunos = await pool.query(`
      SELECT a.id, p.valor
      FROM alunos a
      JOIN planos p ON p.id = a.plano_id
    `);

    for (const aluno of alunos.rows) {

      // 🔍 VERIFICA SE JÁ EXISTE NO MÊS
      const existe = await pool.query(`
        SELECT 1 FROM mensalidades
        WHERE aluno_id = $1
        AND DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE)
      `, [aluno.id]);

      if (existe.rows.length === 0) {

        // 📅 DEFINE VENCIMENTO (ex: dia 5 do mês)
        const vencimento = await pool.query(`
          SELECT (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days') as data
        `);

        await pool.query(`
          INSERT INTO mensalidades (
            aluno_id,
            valor,
            data_vencimento,
            status
          )
          VALUES ($1, $2, $3, 'pendente')
        `, [
          aluno.id,
          aluno.valor,
          vencimento.rows[0].data
        ]);

        console.log(`✅ Mensalidade criada para aluno ${aluno.id}`);
      }
    }

  } catch (err) {
    console.error('ERRO GERAR MENSALIDADES:', err);
  }
};

export const atualizarStatusMensalidades = async () => {
  try {

    await pool.query(`
      UPDATE mensalidades
      SET status = 'atrasado'
      WHERE status = 'pendente'
      AND data_vencimento < CURRENT_DATE
    `);

    console.log('✅ Status atualizado');

  } catch (err) {
    console.error('ERRO STATUS:', err);
  }
};