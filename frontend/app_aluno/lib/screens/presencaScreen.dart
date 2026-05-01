import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PresencaScreen extends StatefulWidget {
  final String token;

  PresencaScreen({required this.token});

  @override
  _PresencaScreenState createState() => _PresencaScreenState();
}

class _PresencaScreenState extends State<PresencaScreen> {
  Map aluno = {};
  bool loading = true;
  bool confirmou = false;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      // 🔥 BUSCA ALUNO (ROTA NOVA)
      final res = await http.get(
        Uri.parse('http://10.0.2.2:3000/presencas/minha-turma'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);

        setState(() {
          aluno = data;
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (e) {
      print(e);
      setState(() => loading = false);
    }
  }

  // 🔥 CONFIRMAR PRESENÇA
  Future<void> confirmarPresenca() async {
    final res = await http.post(
      Uri.parse('http://10.0.2.2:3000/presencas/confirmar'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (res.statusCode == 200 || res.statusCode == 201) {
      setState(() => confirmou = true);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Presença confirmada ✅')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(jsonDecode(res.body)['erro'] ?? 'Erro')),
      );
    }
  }

  // 🔥 REMOVER PRESENÇA
  Future<void> removerPresenca() async {
    final res = await http.delete(
      Uri.parse('http://10.0.2.2:3000/presencas/remover'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (res.statusCode == 200) {
      setState(() => confirmou = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Presença removida ❌')),
      );
    }
  }

  Widget infoBox(String label, String value) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(16),
      margin: EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          SizedBox(height: 4),
          Text(value,
              style:
                  TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text('Presença'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : aluno.isEmpty
              ? Center(child: Text('Aluno não encontrado'))
              : Padding(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        aluno['nome'] ?? '',
                        style: TextStyle(
                            fontSize: 26, fontWeight: FontWeight.bold),
                      ),

                      SizedBox(height: 20),

                      infoBox('Dias da aula',
                          aluno['dia_semana'] ?? '-'),
                      infoBox(
                          'Horário', aluno['horario'] ?? '-'),
                      infoBox(
                          'Professor', aluno['professor'] ?? '-'),

                      Spacer(),

                      Column(
                        children: [
                          SizedBox(
                            width: double.infinity,
                            height: 55,
                            child: ElevatedButton(
                              onPressed:
                                  confirmou ? null : confirmarPresenca,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: confirmou
                                    ? Colors.green
                                    : Colors.black,
                                shape: RoundedRectangleBorder(
                                  borderRadius:
                                      BorderRadius.circular(15),
                                ),
                              ),
                              child: Text(
                                confirmou
                                    ? 'Presença Confirmada ✅'
                                    : 'Confirmar Presença',
                              ),
                            ),
                          ),

                          if (confirmou) ...[
                            SizedBox(height: 12),
                            OutlinedButton(
                              onPressed: removerPresenca,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                              ),
                              child: Text('Remover Presença'),
                            ),
                          ]
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }
}