import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'turmaPresencaScreen.dart';

class TurmasScreen extends StatefulWidget {
  final String token;

  TurmasScreen({required this.token});

  @override
  _TurmasScreenState createState() => _TurmasScreenState();
}

class _TurmasScreenState extends State<TurmasScreen> {
  List turmas = [];
  Map? minhaTurma;
  Map user = {};
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregarDados();
    buscarUsuario();
  }

  Future<void> buscarUsuario() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/usuarios/me'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        setState(() {
          user = jsonDecode(response.body);
        });
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> carregarDados() async {
    try {
      final turmasRes = await http.get(
        Uri.parse('http://10.0.2.2:3000/turmas'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      final minhaRes = await http.get(
        Uri.parse('http://10.0.2.2:3000/inscricoes/me'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      final data = jsonDecode(turmasRes.body);

      setState(() {
        // 🔥 CORREÇÃO AQUI
        turmas = [
          ...data['manha'],
          ...data['noite'],
        ];

        minhaTurma =
            minhaRes.body.isNotEmpty ? jsonDecode(minhaRes.body) : null;

        loading = false;
      });
    } catch (e) {
      print(e);
      setState(() => loading = false);
    }
  }

  Future<void> entrarNaTurma(int turmaId) async {
    try {
      await http.post(
        Uri.parse('http://10.0.2.2:3000/inscricoes'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'turma_id': turmaId,
        }),
      );

      carregarDados();
    } catch (e) {
      print(e);
    }
  }

  Widget cardTurma(Map turma) {
    final bool lotada = turma['lotada'];
    final bool minha = minhaTurma != null && minhaTurma!['id'] == turma['id'];

    final bool isFuncionario =
        user['tipo'] == 'funcionario' || user['tipo'] == 'admin';

    return Card(
      margin: EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(
          turma['horario'],
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${turma['ocupadas']}/${turma['limite']} vagas',
        ),

        trailing: isFuncionario
            ? ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => TurmaPresencaScreen(
                        token: widget.token,
                        turmaId: turma['id'],
                        horario: turma['horario'],
                      ),
                    ),
                  );
                },
                child: Text(
                  'Ver lista',
                  style: TextStyle(color: Colors.black),
                ),
              )
            : minha
                ? Text('Sua turma',
                    style: TextStyle(color: Colors.green))
                : ElevatedButton(
                    onPressed: lotada
                        ? null
                        : () => entrarNaTurma(turma['id']),
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                          lotada ? Colors.grey : Colors.black,
                    ),
                    child: Text(lotada ? 'Lotada' : 'Entrar'),
                  ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Turmas'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : turmas.isEmpty
              ? Center(child: Text('Nenhuma turma encontrada'))
              : Padding(
                  padding: EdgeInsets.all(16),
                  child: ListView(
                    children: turmas.map((t) => cardTurma(t)).toList(),
                  ),
                ),
    );
  }
}