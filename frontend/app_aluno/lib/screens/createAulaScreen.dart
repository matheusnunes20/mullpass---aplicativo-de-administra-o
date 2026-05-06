import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api.dart';

class CreateAulaScreen extends StatefulWidget {
  final String token;

  CreateAulaScreen({required this.token});

  @override
  _CreateAulaScreenState createState() => _CreateAulaScreenState();
}

class _CreateAulaScreenState extends State<CreateAulaScreen> {

  // ✅ BASE URL CORRETA
  final String baseUrl =
      Api.baseUrl;

  final dataController = TextEditingController();
  final horarioController = TextEditingController();
  final professorController = TextEditingController();
  final modalidadeController = TextEditingController();

  bool loading = false;

  Future<void> criarAula() async {
    if (dataController.text.isEmpty ||
        horarioController.text.isEmpty ||
        professorController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Preencha os campos')),
      );
      return;
    }

    setState(() => loading = true);

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/aulas'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'data': dataController.text,
          'horario': horarioController.text,
          'professor': professorController.text,
          'modalidade': modalidadeController.text,
        }),
      );

      print('AULA STATUS: ${response.statusCode}');
      print('AULA BODY: ${response.body}');

      setState(() => loading = false);

      if (response.statusCode == 200 || response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Aula criada')),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.body)),
        );
      }
    } catch (e) {
      print('ERRO AULA: $e');

      setState(() => loading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de conexão')),
      );
    }
  }

  Widget campo(TextEditingController c, String label) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: c,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Agendar Aula')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            campo(dataController, 'Data'),
            campo(horarioController, 'Horário'),
            campo(professorController, 'Professor'),
            campo(modalidadeController, 'Modalidade'),

            SizedBox(height: 20),

            ElevatedButton(
              onPressed: loading ? null : criarAula,
              child: loading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Salvar'),
            )
          ],
        ),
      ),
    );
  }
}