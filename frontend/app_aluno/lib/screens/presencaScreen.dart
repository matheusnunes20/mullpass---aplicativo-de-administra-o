import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'HistoricoScreen.dart';

class PresencaScreen extends StatefulWidget {
  final String token;
  final String nome;

  PresencaScreen({required this.token, required this.nome});

  @override
  _PresencaScreenState createState() => _PresencaScreenState();
}

class _PresencaScreenState extends State<PresencaScreen> {

  final String baseUrl =
      "http://10.0.2.2:3000";

  List turmas = [];
  int? turmaSelecionada;

  bool confirmou = false;
  String horarioConfirmado = '';

  bool carregando = false;

  @override
  void initState() {
    super.initState();
    carregarTurmas();
    carregarPresencaHoje();
  }

  Future<void> carregarTurmas() async {
    final res = await http.get(
      Uri.parse('$baseUrl/presencas/turmas'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (res.statusCode == 200) {
      setState(() {
        turmas = jsonDecode(res.body);
      });
    }
  }

  Future<void> carregarPresencaHoje() async {
    final res = await http.get(
      Uri.parse('$baseUrl/presencas/me/hoje'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (res.statusCode == 200 && res.body != 'null') {
      final data = jsonDecode(res.body);

      if (data != null) {
        setState(() {
          confirmou = true;
          turmaSelecionada = data['id'];
          horarioConfirmado = data['horario'];
        });
      }
    }
  }

  Future<void> confirmarPresenca() async {
    if (turmaSelecionada == null) return;

    setState(() => carregando = true);

    final res = await http.post(
      Uri.parse('$baseUrl/presencas'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json'
      },
      body: jsonEncode({
        'turma_id': turmaSelecionada,
      }),
    );

    setState(() => carregando = false);

    if (res.statusCode == 201) {
      final turma =
          turmas.firstWhere((t) => t['id'] == turmaSelecionada);

      setState(() {
        confirmou = true;
        horarioConfirmado = turma['horario'];
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Presença confirmada')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro: ${res.body}')),
      );
    }
  }

  Future<void> removerPresenca() async {
    final res = await http.delete(
      Uri.parse('$baseUrl/presencas'),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (res.statusCode == 200) {
      setState(() {
        confirmou = false;
        turmaSelecionada = null;
        horarioConfirmado = '';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Presença cancelada')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],

      appBar: AppBar(
        title: Text('Presença'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),

      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [

            DropdownButtonFormField<int>(
              value: turmaSelecionada,
              hint: Text('Escolher turma'),
              items: turmas.map<DropdownMenuItem<int>>((t) {
                return DropdownMenuItem<int>(
                  value: t['id'],
                  child: Text('Horário: ${t['horario']}'),
                );
              }).toList(),
              onChanged: confirmou
                  ? null
                  : (v) => setState(() => turmaSelecionada = v),
            ),

            SizedBox(height: 20),

            if (confirmou)
              Text(
                'Confirmado: $horarioConfirmado',
                style: TextStyle(color: Colors.green),
              ),

            Spacer(),

            ElevatedButton(
              onPressed: (confirmou || turmaSelecionada == null || carregando)
                  ? null
                  : confirmarPresenca,
              child: carregando
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Confirmar Presença'),
            ),
          ],
        ),
      ),
    );
  }
}