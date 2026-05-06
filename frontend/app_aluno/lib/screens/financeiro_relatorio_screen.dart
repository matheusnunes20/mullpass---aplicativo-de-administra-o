import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api.dart';

class FinanceiroRelatorioScreen extends StatefulWidget {
  final String token;

  const FinanceiroRelatorioScreen({required this.token});

  @override
  State<FinanceiroRelatorioScreen> createState() =>
      _FinanceiroRelatorioScreenState();
}

class _FinanceiroRelatorioScreenState
    extends State<FinanceiroRelatorioScreen> {

  final String baseUrl = Api.baseUrl;

  bool loading = true;

  double faturamento = 0;
  Map<String, int> statusMap = {
    'pago': 0,
    'pendente': 0,
    'atrasado': 0
  };

  @override
  void initState() {
    super.initState();
    carregarRelatorio();
  }

  Future<void> carregarRelatorio() async {
    try {
      final res = await http.get(
        Uri.parse("$baseUrl/financeiro/relatorio"),
        headers: {
          "Authorization": "Bearer ${widget.token}"
        },
      );

      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);

        // 💰 faturamento
        faturamento =
            double.tryParse(json['faturamento_mes'].toString()) ?? 0;

        // 📊 status
          statusMap['pago'] = json['pagos'] ?? 0;

          statusMap['pendente'] = json['pendentes'] ?? 0;

          statusMap['atrasado'] = json['atrasados'] ?? 0;
      }

      setState(() => loading = false);

    } catch (e) {
      print("ERRO RELATORIO: $e");
      setState(() => loading = false);
    }
  }

  Widget linhaStatus(String titulo, int valor, Color cor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(Icons.circle, color: cor, size: 12),
          SizedBox(width: 8),
          Text(
            "$titulo: $valor alunos",
            style: TextStyle(fontSize: 16),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Relatório Financeiro"),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  // 💰 FATURAMENTO
                  Card(
                    elevation: 3,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        "💰 Faturamento do mês: R\$ ${faturamento.toStringAsFixed(2)}",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 20),

                  Text(
                    "Situação",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 10),

                  linhaStatus(
                      "Pago", statusMap['pago'] ?? 0, Colors.green),
                  linhaStatus(
                      "Pendente", statusMap['pendente'] ?? 0, Colors.orange),
                  linhaStatus(
                      "Atrasado", statusMap['atrasado'] ?? 0, Colors.red),
                ],
              ),
            ),
    );
  }
}