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
      "https://mullpass-aplicativo-de-administra-o.onrender.com";

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
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/presencas/turmas'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (res.statusCode == 200) {
        setState(() {
          turmas = jsonDecode(res.body);
        });
      }
    } catch (e) {
      print('ERRO TURMAS: $e');
    }
  }

  // ✅ CORRIGIDO
  Future<void> carregarPresencaHoje() async {
    try {
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
    } catch (e) {
      print('ERRO HOJE: $e');
    }
  }

  // ✅ CORRIGIDO
  Future<void> confirmarPresenca() async {
    try {
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
        print('ERRO BACKEND: ${res.body}');
      }
    } catch (e) {
      print('ERRO CONFIRMAR: $e');
    }
  }

  // ✅ CORRIGIDO
  Future<void> removerPresenca() async {
    try {
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
      } else {
        print('ERRO REMOVER: ${res.body}');
      }
    } catch (e) {
      print('ERRO REMOVER: $e');
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