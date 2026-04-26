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

  String statusAluno = ''; // 🔥 NOVO

  @override
  void initState() {
    super.initState();
    buscarAluno();
    buscarStatus(); // 🔥 NOVO
  }

  Future<void> buscarAluno() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/alunos/me'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      final presencaResponse = await http.get(
        Uri.parse('http://10.0.2.2:3000/presencas/me'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        final alunoData = jsonDecode(response.body);

        bool confirmouHoje = false;

        if (presencaResponse.statusCode == 200) {
          final presencaData = jsonDecode(presencaResponse.body);
          confirmouHoje = presencaData['confirmou'] ?? false;
        }

        setState(() {
          aluno = alunoData;
          confirmou = confirmouHoje;
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  // 🔥 NOVO: BUSCAR STATUS
  Future<void> buscarStatus() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/presencas/status'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          statusAluno = data['status'];
        });
      }
    } catch (e) {
      print(e);
    }
  }

  // 🔥 STATUS TEXTO
  String getStatusTexto() {
    if (statusAluno == 'frequente') {
      return '🟢 Você está frequentando bem';
    } else if (statusAluno == 'irregular') {
      return '🟡 Você está faltando algumas aulas';
    } else {
      return '🔴 Você está ausente';
    }
  }

  // 🔥 STATUS COR
  Color getStatusCor() {
    if (statusAluno == 'frequente') return Colors.green;
    if (statusAluno == 'irregular') return Colors.orange;
    return Colors.red;
  }

  bool podeConfirmarPresenca() {
    if (aluno.isEmpty) return false;

    final hoje = DateTime.now().weekday;

    final diasAluno = (aluno['dia_semana'] ?? '')
        .toString()
        .toLowerCase();

    Map<String, int> diasMap = {
      'segunda': 1,
      'terça': 2,
      'terca': 2,
      'quarta': 3,
      'quinta': 4,
      'sexta': 5,
      'sábado': 6,
      'sabado': 6,
      'domingo': 7,
    };

    List<int> dias = [];

    diasMap.forEach((key, value) {
      if (diasAluno.contains(key)) {
        dias.add(value);
      }
    });

    for (var dia in dias) {
      int diaAnterior = dia == 1 ? 7 : dia - 1;

      if (hoje == dia || hoje == diaAnterior) {
        return true;
      }
    }

    return false;
  }

  Future<void> confirmarPresenca() async {
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/presencas'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'aluno_id': aluno['id'],
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        setState(() => confirmou = true);
        buscarStatus(); // 🔥 atualiza status após confirmar
      }
    } catch (e) {}
  }

  Future<void> removerPresenca() async {
    try {
      final response = await http.delete(
        Uri.parse('http://10.0.2.2:3000/presencas/${aluno['id']}'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        setState(() => confirmou = false);
        buscarStatus(); // 🔥 atualiza status após remover
      }
    } catch (e) {}
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
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
        elevation: 0,
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
                        style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                      ),

                      SizedBox(height: 10),

                      // 🔥 STATUS DO ALUNO
                      Text(
                        getStatusTexto(),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: getStatusCor(),
                        ),
                      ),

                      SizedBox(height: 20),

                      infoBox('Dias da aula', aluno['dia_semana'] ?? ''),
                      infoBox('Horário', aluno['horario'] ?? ''),
                      infoBox('Professor', aluno['professor'] ?? ''),

                      Spacer(),

                      Column(
                        children: [

                          SizedBox(
                            width: double.infinity,
                            height: 55,
                            child: ElevatedButton(
                              onPressed: (confirmou || !podeConfirmarPresenca())
                                  ? null
                                  : confirmarPresenca,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: confirmou
                                    ? Colors.green
                                    : podeConfirmarPresenca()
                                        ? Colors.black
                                        : Colors.grey,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(15),
                                ),
                              ),
                              child: Text(
                                confirmou
                                    ? 'Presença Confirmada ✅'
                                    : podeConfirmarPresenca()
                                        ? 'Confirmar Presença'
                                        : 'Disponível 1 dia antes da aula',
                              ),
                            ),
                          ),

                          if (confirmou) ...[
                            SizedBox(height: 12),
                            OutlinedButton(
                              onPressed: removerPresenca,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                                side: BorderSide(color: Colors.red),
                              ),
                              child: Text('Remover Presença'),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }
}