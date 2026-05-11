import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api.dart';

class AlunoDetalheScreen extends StatefulWidget {
  final int alunoId;
  final String token;

  AlunoDetalheScreen({required this.alunoId, required this.token});

  @override
  _AlunoDetalheScreenState createState() => _AlunoDetalheScreenState();
}

class _AlunoDetalheScreenState extends State<AlunoDetalheScreen> {
  Map aluno = {};
  bool loading = true;

  // ✅ BASE URL CENTRALIZADA
  final String baseUrl =
      Api.baseUrl;

  @override
  void initState() {
    super.initState();
    carregarDados();
  }

  Future<void> carregarDados() async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/alunos/${widget.alunoId}'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

     debugPrint('DETALHE STATUS: ${res.statusCode}');
     debugPrint('DETALHE BODY: ${res.body}');

      if (res.statusCode == 200) {
        setState(() {
          aluno = jsonDecode(res.body);
          loading = false;
        });
      } else {
        if (!mounted) return;
        setState(() => loading = false);
      }
    } catch (e) {
     debugPrint('ERRO DETALHE: $e');
      if (!mounted) return;
      setState(() => loading = false);
    }
  }

  Widget info(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey)),
          Text(
            value,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
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
                          fontSize: 24,
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