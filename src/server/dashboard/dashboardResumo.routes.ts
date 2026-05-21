import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // Executa as consultas necessárias de forma concorrente para maximizar performance
    const [
      totalPacientesRes,
      novosPacientesRes,
      consultasHojeRes,
      receitasAtualRes,
      receitasAnteriorRes,
      despesasAtualRes,
      despesasAnteriorRes,
      financeiroMensalRes,
      consultasSemanaRes,
      proximosRes,
      estoqueBaixoRes
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int as count FROM pacientes WHERE ativo = TRUE`),
      pool.query(`
        SELECT COUNT(*)::int as count FROM pacientes 
        WHERE ativo = TRUE 
          AND criado_em >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      `),
      pool.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'confirmado')::int as confirmadas,
          COUNT(*) FILTER (WHERE status = 'agendado')::int as pendentes
        FROM agenda
        WHERE data_atendimento = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date
          AND ativo = TRUE
      `),
      pool.query(`
        SELECT COALESCE(SUM(valor), 0)::float as total FROM financeiro_receitas
        WHERE status = 'pago' AND ativo = TRUE
          AND data_receita >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      `),
      pool.query(`
        SELECT COALESCE(SUM(valor), 0)::float as total FROM financeiro_receitas
        WHERE status = 'pago' AND ativo = TRUE
          AND data_receita >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '1 month')
          AND data_receita < DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      `),
      pool.query(`
        SELECT COALESCE(SUM(valor), 0)::float as total FROM financeiro_despesas
        WHERE ativo = TRUE
          AND data_despesa >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      `),
      pool.query(`
        SELECT COALESCE(SUM(valor), 0)::float as total FROM financeiro_despesas
        WHERE ativo = TRUE
          AND data_despesa >= DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '1 month')
          AND data_despesa < DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
      `),
      pool.query(`
        SELECT 
          ano::int, 
          mes::int, 
          total_receitas::float as receitas, 
          total_despesas::float as despesas 
        FROM vw_resumo_financeiro_mensal 
        ORDER BY ano DESC, mes DESC 
        LIMIT 6
      `),
      pool.query(`
        SELECT 
          EXTRACT(ISODOW FROM data_atendimento)::int as dia_semana,
          COUNT(*)::int as consultas
        FROM agenda
        WHERE data_atendimento >= DATE_TRUNC('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
          AND data_atendimento < DATE_TRUNC('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '7 days'
          AND ativo = TRUE
        GROUP BY 1
        ORDER BY 1
      `),
      pool.query(`
        SELECT 
          a.id,
          p.nome_completo AS patient,
          a.hora_atendimento::TEXT AS time,
          a.tipo AS type,
          a.status
        FROM agenda a
        JOIN pacientes p ON a.paciente_id = p.id
        WHERE a.data_atendimento = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date
          AND a.ativo = TRUE
        ORDER BY a.hora_atendimento ASC
        LIMIT 5
      `),
      pool.query(`
        SELECT nome_produto as name, quantidade_atual as current, quantidade_minima as min
        FROM vw_lista_estoque_critico
        LIMIT 5
      `)
    ]);

    // Processamento de dados de pacientes
    const totalPacientes = totalPacientesRes.rows[0].count;
    const novosPacientes = novosPacientesRes.rows[0].count;
    const totalPacientesComparativo = `+${novosPacientes} este mês`;

    // Processamento de consultas do dia
    const { total: totalHoje, confirmadas: hojeConfirmadas, pendentes: hojePendentes } = consultasHojeRes.rows[0];

    // Processamento financeiro do mês
    const receitasMes = receitasAtualRes.rows[0].total;
    const receitasAnterior = receitasAnteriorRes.rows[0].total;
    const despesasMes = despesasAtualRes.rows[0].total;
    const despesasAnterior = despesasAnteriorRes.rows[0].total;

    let receitasVariacao = "0% vs mês anterior";
    if (receitasAnterior > 0) {
      const diff = ((receitasMes - receitasAnterior) / receitasAnterior) * 100;
      receitasVariacao = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs mês anterior`;
    } else if (receitasMes > 0) {
      receitasVariacao = "+100% vs mês anterior";
    }

    let despesasVariacao = "0% vs mês anterior";
    if (despesasAnterior > 0) {
      const diff = ((despesasMes - despesasAnterior) / despesasAnterior) * 100;
      despesasVariacao = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs mês anterior`;
    } else if (despesasMes > 0) {
      despesasVariacao = "+100% vs mês anterior";
    }

    // Processamento de evolução financeira (inverter ordem para gráfico cronológico)
    const mesesAbreviados = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const financeiroChart = financeiroMensalRes.rows
      .map(row => ({
        month: mesesAbreviados[row.mes - 1] || `${row.mes}`,
        receitas: row.receitas,
        despesas: row.despesas,
        ordenacao: row.ano * 100 + row.mes
      }))
      .sort((a, b) => a.ordenacao - b.ordenacao);

    // Se não tiver dados no chart, gerar mock amigável ou vazio
    if (financeiroChart.length === 0) {
      financeiroChart.push({ month: "Mês Atual", receitas: receitasMes, despesas: despesasMes, ordenacao: 0 });
    }

    // Processamento de consultas da semana (ISODOW retorna 1=Seg, 7=Dom)
    const diasSemanaMap: Record<number, string> = {
      1: "Seg",
      2: "Ter",
      3: "Qua",
      4: "Qui",
      5: "Sex",
      6: "Sáb",
      7: "Dom"
    };

    const consultasSemanaChart = [1, 2, 3, 4, 5, 6, 7].map(dia => {
      const match = consultasSemanaRes.rows.find(row => row.dia_semana === dia);
      return {
        day: diasSemanaMap[dia],
        consultas: match ? match.consultas : 0
      };
    });

    // Processamento de próximos atendimentos
    const proximosAtendimentos = proximosRes.rows.map(row => ({
      id: row.id,
      patient: row.patient,
      time: row.time.slice(0, 5),
      type: row.type,
      status: row.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPacientes,
          totalPacientesComparativo,
          consultasHoje: totalHoje,
          consultasHojeConfirmadas: hojeConfirmadas,
          consultasHojePendentes: hojePendentes,
          receitasMes,
          despesasMes,
          receitasVariacao,
          despesasVariacao
        },
        receitasDespesasChart: financeiroChart,
        consultasSemanaChart,
        proximosAtendimentos,
        estoqueBaixo: estoqueBaixoRes.rows
      }
    });
  } catch (error) {
    console.error("Erro ao gerar resumo do dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao gerar resumo do dashboard" },
      { status: 500 }
    );
  }
}
