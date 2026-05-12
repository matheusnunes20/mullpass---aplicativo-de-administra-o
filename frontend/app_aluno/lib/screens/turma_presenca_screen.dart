import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'historico_aluno_screen.dart';
import '../config/api.dart';

class TurmaPresencaScreen extends StatefulWidget {

  final String token;

  final int turmaId;

  final String horario;

  TurmaPresencaScreen({

    required this.token,

    required this.turmaId,

    required this.horario,
  });

  @override
  _TurmaPresencaScreenState createState() =>
      _TurmaPresencaScreenState();
}

class _TurmaPresencaScreenState
    extends State<TurmaPresencaScreen> {

  final String baseUrl =
      Api.baseUrl;

  List lista = [];

  bool loading = true;

  String modalidade = '-';

  String professor = '-';

  String sexo = 'todos';

  @override
  void initState() {

    super.initState();

    buscarPresencas();
  }

  Future<void> buscarPresencas() async {

    try {

      /**
       * 📌 BUSCAR TURMA
       */
      final turmaResponse =
          await http.get(

        Uri.parse(
          '$baseUrl/turmas/${widget.turmaId}',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      /**
       * 📌 BUSCAR PRESENÇAS
       */
      final response =
          await http.get(

        Uri.parse(
          '$baseUrl/presencas/turma/${widget.turmaId}',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      debugPrint(
        'PRESENCA TURMA STATUS: ${response.statusCode}',
      );

      debugPrint(
        'PRESENCA TURMA BODY: ${response.body}',
      );

      if (!mounted) return;

      /**
       * 🔥 DADOS DA TURMA
       */
      if (turmaResponse.statusCode == 200) {

        final turma =
            jsonDecode(
              turmaResponse.body,
            );

        modalidade =
            turma['modalidade'] ?? '-';

        professor =
            turma['professor'] ?? '-';

        sexo =
            turma['sexo'] ?? 'todos';
      }

      /**
       * 🔥 LISTA DE PRESENÇA
       */
      if (response.statusCode == 200) {

        setState(() {

          lista =
              jsonDecode(
                response.body,
              );

          loading = false;
        });

      } else {

        setState(() {

          loading = false;
        });
      }

    } catch (e) {

      debugPrint(
        'ERRO PRESENCA TURMA: $e',
      );

      if (!mounted) return;

      setState(() {

        loading = false;
      });
    }
  }

  Widget alunoCard(
    Map aluno,
  ) {

    final nome =
        aluno['nome']
            ?.toString() ?? '-';

    return Card(

      elevation: 2,

      margin:
          EdgeInsets.only(
        bottom: 10,
      ),

      shape:
          RoundedRectangleBorder(

        borderRadius:
            BorderRadius.circular(
          12,
        ),
      ),

      child: ListTile(

        onTap: () {

          final alunoId =

              int.tryParse(
                    aluno['id']
                        .toString(),
                  ) ??

                  0;

          if (alunoId == 0) return;

          Navigator.push(

            context,

            MaterialPageRoute(

              builder: (_) =>

                  HistoricoAlunoScreen(

                token:
                    widget.token,

                alunoId:
                    alunoId,

                nome:
                    nome,
              ),
            ),
          );
        },

        leading: CircleAvatar(

          backgroundColor:
              Colors.green,

          child: Icon(

            Icons.check,

            color:
                Colors.white,
          ),
        ),

        title: Text(

          nome,

          style: TextStyle(
            fontWeight:
                FontWeight.bold,
          ),
        ),

        subtitle: Text(
          aluno['telefone'] ?? '',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor:
          Colors.grey[100],

      appBar: AppBar(

        title: Text(
          'Lista de Presença',
        ),

        centerTitle: true,

        backgroundColor:
            Colors.amber,

        foregroundColor:
            Colors.black,

        elevation: 0,
      ),

      body:

          loading

              ? Center(
                  child:
                      CircularProgressIndicator(),
                )

              : Column(

                  children: [

                    /**
                     * 📌 HEADER TURMA
                     */
                    Container(

                      width:
                          double.infinity,

                      margin:
                          EdgeInsets.all(16),

                      padding:
                          EdgeInsets.all(16),

                      decoration:
                          BoxDecoration(

                        color:
                            Colors.white,

                        borderRadius:
                            BorderRadius.circular(
                          16,
                        ),

                        boxShadow: [

                          BoxShadow(

                            color:
                                Colors.black12,

                            blurRadius:
                                6,

                            offset:
                                Offset(0, 2),
                          ),
                        ],
                      ),

                      child: Column(

                        crossAxisAlignment:
                            CrossAxisAlignment.start,

                        children: [

                          Text(

                            '🏖 $modalidade',

                            style: TextStyle(

                              fontSize: 20,

                              fontWeight:
                                  FontWeight.bold,
                            ),
                          ),

                          SizedBox(
                            height: 8,
                          ),

                          Text(
                            '👨‍🏫 Professor: $professor',
                          ),

                          SizedBox(
                            height: 5,
                          ),

                          Text(
                            '🕢 ${widget.horario}',
                          ),

                          SizedBox(
                            height: 5,
                          ),

                          Text(

                            sexo == 'feminino'

                                ? '🚺 Turma Feminina'

                                : '👥 Turma Mista',

                            style: TextStyle(

                              color:

                                  sexo == 'feminino'

                                      ? Colors.pink

                                      : Colors.blueGrey,

                              fontWeight:
                                  FontWeight.bold,
                            ),
                          ),

                          SizedBox(
                            height: 10,
                          ),

                          Text(

                            '✅ ${lista.length} presentes hoje',

                            style: TextStyle(

                              fontWeight:
                                  FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    /**
                     * 📌 LISTA DE ALUNOS
                     */
                    Expanded(

                      child:

                          lista.isEmpty

                              ? Center(

                                  child: Text(

                                    'Nenhum aluno confirmou presença ainda',

                                    style: TextStyle(
                                      color:
                                          Colors.grey,
                                    ),
                                  ),
                                )

                              : RefreshIndicator(

                                  onRefresh:
                                      buscarPresencas,

                                  child: ListView.builder(

                                    padding:
                                        EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),

                                    itemCount:
                                        lista.length,

                                    itemBuilder:
                                        (context, index) {

                                      return alunoCard(
                                        lista[index],
                                      );
                                    },
                                  ),
                                ),
                    ),
                  ],
                ),
    );
  }
}