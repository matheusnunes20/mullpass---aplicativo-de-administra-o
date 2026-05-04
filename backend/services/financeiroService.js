import pool from '../src/db.js';
export const gerarMensalidades = async () => {
  try {
    const alunos = await pool.query(`
      SELECT a.id, p.preco
      FROM alunos a
      JOIN planos p ON p.id = a.plano_id
    `);

    for (const aluno of alunos.rows) {
      const existe = await pool.query(`
        SELECT 1 FROM mensalidades
        WHERE aluno_id = $1
        AND DATE_TRUNC('month', data_vencimento) = DATE_TRUNC('month', CURRENT_DATE)
      `, [aluno.id]);

      if (existe.rows.length === 0) {

        await pool.query(`
          INSERT INTO mensalidades (
            aluno_id,
            valor,
            data_vencimento
          )
          VALUES (
            $1,
            $2,
            DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '5 days'
          )
        `, [aluno.id, aluno.preco]);

} else {
      }
    }

} catch (err) {
    console.error('💥 ERRO AO GERAR MENSALIDADES:', err);
  }
};