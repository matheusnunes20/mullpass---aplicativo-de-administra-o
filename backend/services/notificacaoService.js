import pool from '../src/db.js';

export const gerarNotificacoesAutomaticas = async () => {

  try {

    /**
     * 🔔 VENCEM AMANHÃ
     */
    const vencendo = await pool.query(`
      SELECT 
        m.id,
        a.id as aluno_id,
        a.nome
      FROM mensalidades m
      JOIN alunos a ON a.id = m.aluno_id
      WHERE m.data_vencimento = CURRENT_DATE + INTERVAL '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM pagamentos pg
        WHERE pg.mensalidade_id = m.id
      )
    `);

    for (const item of vencendo.rows) {

      await pool.query(`
        INSERT INTO notificacoes (
          aluno_id,
          titulo,
          mensagem
        )
        VALUES ($1, $2, $3)
      `, [
        item.aluno_id,
        'Mensalidade vencendo',
        `Olá ${item.nome}, sua mensalidade vence amanhã 💰`
      ]);
    }

    /**
     * 🔴 ATRASADOS
     */
    const atrasados = await pool.query(`
      SELECT 
        m.id,
        a.id as aluno_id,
        a.nome,
        CURRENT_DATE - m.data_vencimento as dias
      FROM mensalidades m
      JOIN alunos a ON a.id = m.aluno_id
      WHERE m.data_vencimento < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM pagamentos pg
        WHERE pg.mensalidade_id = m.id
      )
    `);

    for (const item of atrasados.rows) {

      await pool.query(`
        INSERT INTO notificacoes (
          aluno_id,
          titulo,
          mensagem
        )
        VALUES ($1, $2, $3)
      `, [
        item.aluno_id,
        'Mensalidade atrasada',
        `Olá ${item.nome}, sua mensalidade está atrasada há ${item.dias} dias ⚠️`
      ]);
    }

    console.log('🔔 Notificações automáticas geradas');

  } catch (err) {
    console.error('ERRO NOTIFICAÇÕES:', err);
  }
};