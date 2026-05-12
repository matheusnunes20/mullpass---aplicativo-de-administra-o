import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'turma_presenca_screen.dart';
import '../config/api.dart';

class TurmasScreen extends StatefulWidget {

  final String token;

  TurmasScreen({
    required this.token,
  });

  @override
  _TurmasScreenState createState() =>
      _TurmasScreenState();
}

class _TurmasScreenState
    extends State<TurmasScreen> {

  final String baseUrl =
      Api.baseUrl;

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

      final response =
          await http.get(

        Uri.parse(
          '$baseUrl/usuarios/me',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      debugPrint(
        'USER STATUS: ${response.statusCode}',
      );

      debugPrint(
        'USER BODY: ${response.body}',
      );

      if (response.statusCode == 200) {

        if (!mounted) return;

        setState(() {

          user =
              jsonDecode(
                response.body,
              );
        });
      }

    } catch (e) {

      debugPrint(
        'ERRO USER: $e',
      );
    }
  }

  Future<void> carregarDados() async {

    try {

      final turmasRes =
          await http.get(

        Uri.parse(
          '$baseUrl/turmas',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      final minhaRes =
          await http.get(

        Uri.parse(
          '$baseUrl/inscricoes/me',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      debugPrint(
        'TURMAS STATUS: ${turmasRes.statusCode}',
      );

      debugPrint(
        'TURMAS BODY: ${turmasRes.body}',
      );

      final data =
          jsonDecode(
            turmasRes.body,
          );

      if (!mounted) return;

      setState(() {

        turmas = [

          ...data['manha'],

          ...data['noite'],
        ];

        minhaTurma =

            minhaRes.body.isNotEmpty

                ? jsonDecode(
                    minhaRes.body,
                  )

                : null;

        loading = false;
      });

    } catch (e) {

      debugPrint(
        'ERRO TURMAS: $e',
      );

      if (!mounted) return;

      setState(() {

        loading = false;
      });
    }
  }

  Future<void> entrarNaTurma(
    int turmaId,
  ) async {

    try {

      final res =
          await http.post(

        Uri.parse(
          '$baseUrl/inscricoes',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',

          'Content-Type':
              'application/json',
        },

        body: jsonEncode({

          'turma_id': turmaId,
        }),
      );

      debugPrint(
        'ENTRAR TURMA STATUS: ${res.statusCode}',
      );

      debugPrint(
        'ENTRAR TURMA BODY: ${res.body}',
      );

      carregarDados();

    } catch (e) {

      debugPrint(
        'ERRO ENTRAR TURMA: $e',
      );
    }
  }

  Widget cardTurma(
    Map turma,
  ) {

    final bool lotada =
        turma['lotada'] ?? false;

    final bool minha =

        minhaTurma != null &&

        minhaTurma!['id'] ==
            turma['id'];

    final bool isFuncionario =

        user['tipo'] == 'funcionario' ||

        user['tipo'] == 'admin';

    return Card(

      elevation: 3,

      margin:
          EdgeInsets.only(
        bottom: 14,
      ),

      shape:
          RoundedRectangleBorder(

        borderRadius:
            BorderRadius.circular(
          14,
        ),
      ),

      child: ListTile(

        contentPadding:
            EdgeInsets.all(16),

        title: Column(

          crossAxisAlignment:
              CrossAxisAlignment.start,

          children: [

            Text(

              turma['horario'] ?? '-',

              style: TextStyle(

                fontWeight:
                    FontWeight.bold,

                fontSize: 20,
              ),
            ),

            SizedBox(
              height: 8,
            ),

            Text(
              '🏖 ${turma['modalidade'] ?? '-'}',
            ),

            SizedBox(
              height: 3,
            ),

            Text(
              '👨‍🏫 ${turma['professor'] ?? '-'}',
            ),

            SizedBox(
              height: 8,
            ),

            Text(

              '👥 ${turma['inscritos']}/${turma['limite']} inscritos',
            ),

            SizedBox(
              height: 3,
            ),

            Text(
              '✅ ${turma['presentes_hoje']} presentes hoje',
            ),
          ],
        ),

        trailing:

            isFuncionario

                ? ElevatedButton(

                    style:
                        ElevatedButton.styleFrom(

                      backgroundColor:
                          Colors.amber,

                      foregroundColor:
                          Colors.black,
                    ),

                    onPressed: () {

                      Navigator.push(

                        context,

                        MaterialPageRoute(

                          builder: (_) =>

                              TurmaPresencaScreen(

                            token:
                                widget.token,

                            turmaId:
                                turma['id'],

                            horario:
                                turma['horario'],
                          ),
                        ),
                      );
                    },

                    child:
                        Text('Ver lista'),
                  )

                : minha

                    ? Column(

                        mainAxisAlignment:
                            MainAxisAlignment.center,

                        children: [

                          Icon(

                            Icons.check_circle,

                            color:
                                Colors.green,
                          ),

                          SizedBox(
                            height: 4,
                          ),

                          Text(

                            'Sua turma',

                            style: TextStyle(

                              color:
                                  Colors.green,

                              fontWeight:
                                  FontWeight.bold,
                            ),
                          ),
                        ],
                      )

                    : ElevatedButton(

                        onPressed:

                            lotada

                                ? null

                                : () {

                                    entrarNaTurma(
                                      turma['id'],
                                    );
                                  },

                        style:
                            ElevatedButton.styleFrom(

                          backgroundColor:

                              lotada

                                  ? Colors.grey

                                  : Colors.black,
                        ),

                        child: Text(

                          lotada

                              ? 'Lotada'

                              : 'Entrar',
                        ),
                      ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(

        title:
            Text('Turmas'),

        backgroundColor:
            Colors.amber,

        foregroundColor:
            Colors.black,
      ),

      body:

          loading

              ? Center(

                  child:
                      CircularProgressIndicator(),
                )

              : turmas.isEmpty

                  ? Center(

                      child: Text(
                        'Nenhuma turma encontrada',
                      ),
                    )

                  : Padding(

                      padding:
                          EdgeInsets.all(16),

                      child: ListView(

                        children:

                            turmas

                                .map(

                                  (t) =>

                                      cardTurma(t),
                                )

                                .toList(),
                      ),
                    ),
    );
  }
}