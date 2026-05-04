import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HistoricoAlunoScreen extends StatefulWidget {
  final String token;
  final int alunoId;
  final String nome;

  HistoricoAlunoScreen({
    required this.token,
    required this.alunoId,
    required this.nome,
  });

  @override
  _HistoricoAlunoScreenState createState() =>
      _HistoricoAlunoScreenState();
}

class _HistoricoAlunoScreenState extends State<HistoricoAlunoScreen> {
  List historico = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregarHistorico();
  }

  Future<void> carregarHistorico() async {
    final res = await http.get(
      Uri.parse(
          'https://mullpass--aplicativo-de-administra-o.onrender.com/presencas/aluno/${widget.alunoId}/historico'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
      },
    );

    if (res.statusCode == 200) {
      setState(() {
        historico = jsonDecode(res.body);
        loading = false;
      });
    }
  }

  String formatar(String data) {
    final d = DateTime.parse(data);
    return "${d.day}/${d.month}/${d.year}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.nome),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : historico.isEmpty
              ? Center(child: Text('Sem histórico'))
              : ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: historico.length,
                  itemBuilder: (_, i) {
                    final item = historico[i];
                    return Card(
                      child: ListTile(
                        title: Text(item['horario']),
                        subtitle: Text(formatar(item['data'])),
                      ),
                    );
                  },
                ),
    );
  }
}