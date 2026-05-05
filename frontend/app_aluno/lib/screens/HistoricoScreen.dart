import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HistoricoScreen extends StatefulWidget {
  final String token;

  HistoricoScreen({required this.token});

  @override
  _HistoricoScreenState createState() => _HistoricoScreenState();
}

class _HistoricoScreenState extends State<HistoricoScreen> {

  // ✅ BASE URL CORRETA
  final String baseUrl =
      "https://mullpass-aplicativo-de-administra-o.onrender.com";

  List historico = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregarHistorico();
  }

  Future<void> carregarHistorico() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/presencas/historico'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      print('HIST GERAL STATUS: ${response.statusCode}');
      print('HIST GERAL BODY: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          historico = data;
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }

    } catch (e) {
      print('ERRO HIST GERAL: $e');
      setState(() => loading = false);
    }
  }

  String formatarData(String data) {
    try {
      final date = DateTime.parse(data);
      return "${date.day.toString().padLeft(2, '0')}/"
             "${date.month.toString().padLeft(2, '0')}/"
             "${date.year}";
    } catch (e) {
      return data;
    }
  }

  Widget cardHistorico(Map item) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(Icons.access_time, color: Colors.amber),
        title: Text(
          item['horario'] ?? '-',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(formatarData(item['data'] ?? '')),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Histórico de Presenças'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : historico.isEmpty
              ? Center(child: Text('Nenhuma presença encontrada'))
              : Padding(
                  padding: EdgeInsets.all(16),
                  child: ListView(
                    children:
                        historico.map((item) => cardHistorico(item)).toList(),
                  ),
                ),
    );
  }
}