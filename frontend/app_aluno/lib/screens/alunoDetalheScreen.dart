import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AlunoDetalheScreen extends StatefulWidget {
  final int alunoId;
  final String token;

  AlunoDetalheScreen({required this.alunoId, required this.token});

  @override
  _AlunoDetalheScreenState createState() => _AlunoDetalheScreenState();
}

class _AlunoDetalheScreenState extends State<AlunoDetalheScreen> {
  Map aluno = {};
  String status = '';
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    try {
      final alunoRes = await http.get(
        Uri.parse('http://10.0.2.2:3000/alunos/${widget.alunoId}'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      final statusRes = await http.get(
        Uri.parse('http://10.0.2.2:3000/presencas/status/${widget.alunoId}'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (alunoRes.statusCode == 200 && statusRes.statusCode == 200) {
        setState(() {
          aluno = jsonDecode(alunoRes.body);
          status = jsonDecode(statusRes.body)['status'];
          loading = false;
        });
      }
    } catch (e) {
      print(e);
    }
  }

  Color getStatusCor() {
    if (status == 'frequente') return Colors.green;
    if (status == 'irregular') return Colors.orange;
    return Colors.red;
  }

  String getStatusTexto() {
    if (status == 'frequente') return '🟢 Frequente';
    if (status == 'irregular') return '🟡 Irregular';
    return '🔴 Ausente';
  }

  Widget info(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey)),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Detalhes do Aluno'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Text(
                    aluno['nome'] ?? '',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),

                  SizedBox(height: 10),

                  Text(
                    getStatusTexto(),
                    style: TextStyle(
                      color: getStatusCor(),
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 20),

                  info('Telefone', aluno['telefone'] ?? ''),
                  info('Email', aluno['email'] ?? ''),
                  info('CPF', aluno['documento'] ?? ''),
                  info('Dias', aluno['dia_semana'] ?? ''),
                  info('Horário', aluno['horario'] ?? ''),
                  info('Professor', aluno['professor'] ?? ''),
                ],
              ),
            ),
    );
  }
}