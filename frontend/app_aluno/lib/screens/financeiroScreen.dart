import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class FinanceiroScreen extends StatefulWidget {
  final String token;

  FinanceiroScreen({required this.token});

  @override
  _FinanceiroScreenState createState() => _FinanceiroScreenState();
}

class _FinanceiroScreenState extends State<FinanceiroScreen> {

  final String baseUrl = "http://10.0.2.2:3000";

  Map<String, dynamic>? dados;
  List historico = [];

  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      // 🔥 STATUS ATUAL
      final res = await http.get(
        Uri.parse('$baseUrl/financeiro/me'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      // 🔥 HISTÓRICO
      final hist = await http.get(
        Uri.parse('$baseUrl/financeiro/me/historico'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      print('FIN STATUS: ${res.statusCode}');
      print('FIN HIST: ${hist.statusCode}');

      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);

        setState(() {
          dados = Map<String, dynamic>.from(json);
        });
      }

      if (hist.statusCode == 200) {
        setState(() {
          historico = jsonDecode(hist.body);
        });
      }

      setState(() => loading = false);

    } catch (e) {
      print('ERRO FIN USER: $e');
      setState(() => loading = false);
    }
  }

  String formatarData(String? data) {
    if (data == null) return '-';
    try {
      final date = DateTime.parse(data);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return data;
    }
  }

  Color corStatus(String status) {
    switch (status) {
      case 'pago':
        return Colors.green;
      case 'atrasado':
        return Colors.red;
      case 'pendente':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String textoStatus(String status) {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'atrasado':
        return 'Atrasado';
      case 'pendente':
        return 'Pendente';
      default:
        return '---';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Financeiro'),
          backgroundColor: Colors.amber,
          foregroundColor: Colors.black,
        ),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (dados == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Financeiro')),
        body: Center(child: Text('Erro ao carregar dados')),
      );
    }

    final status = dados?['status']?.toString() ?? 'sem mensalidade';
    final valor = dados?['valor']?.toString() ?? '0';
    final plano = dados?['plano']?.toString() ?? '-';

    return Scaffold(
      appBar: AppBar(
        title: Text('Financeiro'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [

            // 🔥 CARD PRINCIPAL
            Card(
              elevation: 4,
              margin: EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                    Text('Status', style: TextStyle(fontWeight: FontWeight.bold)),

                    SizedBox(height: 8),

                    Text(
                      textoStatus(status),
                      style: TextStyle(
                        fontSize: 22,
                        color: corStatus(status),
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    SizedBox(height: 16),

                    Text('💰 Valor: R\$ $valor'),
                    SizedBox(height: 8),

                    Text('📅 Vencimento: ${formatarData(dados?['data_vencimento'])}'),
                    SizedBox(height: 8),

                    Text('📌 Plano: $plano'),

                    if (status == 'atrasado') ...[
                      SizedBox(height: 16),
                      Container(
                        padding: EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '⚠️ Vá até a recepção e renove sua mensalidade',
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // 🔥 HISTÓRICO
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Histórico',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),

            SizedBox(height: 10),

            if (historico.isEmpty)
              Padding(
                padding: EdgeInsets.all(20),
                child: Text('Nenhum histórico encontrado'),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: historico.length,
                itemBuilder: (_, i) {
                  final h = historico[i];

                  return ListTile(
                    title: Text("R\$ ${h['valor']}"),
                    subtitle: Text(
                      "Vencimento: ${formatarData(h['vencimento'])}",
                    ),
                    trailing: Text(
                      textoStatus(h['status']),
                      style: TextStyle(color: corStatus(h['status'])),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}