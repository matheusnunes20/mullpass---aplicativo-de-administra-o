import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'HistoricoAlunoScreen.dart';

class TurmaPresencaScreen extends StatefulWidget {
  final String token;
  final int turmaId;
  final String horario;

  TurmaPresencaScreen({
    required this.token,
    required this.turmaId,
    required this.horario,
  });

  @override
  _TurmaPresencaScreenState createState() =>
      _TurmaPresencaScreenState();
}

class _TurmaPresencaScreenState extends State<TurmaPresencaScreen> {
  List lista = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    buscarPresencas();
  }

  Future<void> buscarPresencas() async {
    try {
      final response = await http.get(
        Uri.parse(
            'https://mullpass--aplicativo-de-administra-o.onrender.com/presencas/turma/${widget.turmaId}'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          lista = jsonDecode(response.body);
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  Widget alunoCard(Map aluno) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        // 🔥 CLICK PARA VER HISTÓRICO
        onTap: () {
          final alunoId =
              int.tryParse(aluno['id'].toString()) ?? 0;

          if (alunoId == 0) return;

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => HistoricoAlunoScreen(
                token: widget.token,
                alunoId: alunoId,
                nome: aluno['nome'],
              ),
            ),
          );
        },

        leading: CircleAvatar(
          backgroundColor: Colors.green,
          child: Icon(Icons.check, color: Colors.white),
        ),
        title: Text(
          aluno['nome'],
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(aluno['telefone'] ?? ''),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],

      appBar: AppBar(
        title: Text('Presenças ${widget.horario}'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        elevation: 0,
      ),

      body: loading
          ? Center(child: CircularProgressIndicator())
          : lista.isEmpty
              ? Center(
                  child: Text(
                    'Nenhum aluno confirmou presença ainda',
                    style: TextStyle(color: Colors.grey),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: buscarPresencas,
                  child: ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: lista.length,
                    itemBuilder: (context, index) {
                      return alunoCard(lista[index]);
                    },
                  ),
                ),
    );
  }
}