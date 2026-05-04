import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'HistoricoScreen.dart'; // 🔥 IMPORT

class PresencaScreen extends StatefulWidget {
  final String token;
  final String nome;

  PresencaScreen({required this.token, required this.nome});

  @override
  _PresencaScreenState createState() => _PresencaScreenState();
}

class _PresencaScreenState extends State<PresencaScreen> {
  List turmas = [];
  int? turmaSelecionada;

  bool confirmou = false;
  String horarioConfirmado = '';

  @override
  void initState() {
    super.initState();
    carregarTurmas();
    carregarPresencaHoje();
  }

  Future<void> carregarTurmas() async {
    final res = await http.get(
      Uri.parse('http://10.0.2.2:3000/presencas/turmas'),
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
      Uri.parse('http://10.0.2.2:3000/presencas/hoje'),
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
    final res = await http.post(
      Uri.parse('http://10.0.2.2:3000/presencas/confirmar'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json'
      },
      body: jsonEncode({
        'turma_id': turmaSelecionada,
      }),
    );

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
    }
  }

  Future<void> removerPresenca() async {
    final res = await http.delete(
      Uri.parse('http://10.0.2.2:3000/presencas/remover'),
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

      // 🔥 APPBAR COM BOTÃO DE HISTÓRICO
      appBar: AppBar(
        title: Text('Presença'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(Icons.history),
            tooltip: 'Ver histórico',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      HistoricoScreen(token: widget.token),
                ),
              );
            },
          )
        ],
      ),

      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.nome,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            SizedBox(height: 20),

            DropdownButtonFormField<int>(
              value: turmaSelecionada,
              hint: Text('Escolher turma hoje'),
              items: turmas.map<DropdownMenuItem<int>>((t) {
                return DropdownMenuItem<int>(
                  value: t['id'],
                  child: Text('Horário: ${t['horario']}'),
                );
              }).toList(),
              onChanged: confirmou
                  ? null
                  : (v) {
                      setState(() {
                        turmaSelecionada = v;
                      });
                    },
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),

            SizedBox(height: 15),

            if (confirmou)
              Text(
                'Presença confirmada: $horarioConfirmado',
                style: TextStyle(
                  color: Colors.green,
                  fontWeight: FontWeight.bold,
                ),
              ),

            Spacer(),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: (confirmou || turmaSelecionada == null)
                    ? null
                    : confirmarPresenca,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text('Confirmar Presença'),
              ),
            ),

            SizedBox(height: 10),

            if (confirmou)
              Center(
                child: TextButton(
                  onPressed: removerPresenca,
                  child: Text(
                    'Cancelar presença',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}