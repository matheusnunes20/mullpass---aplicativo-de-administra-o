import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'historico_screen.dart';
import '../config/api.dart';

class PresencaScreen extends StatefulWidget {

  final String token;
  final String nome;

  PresencaScreen({
    required this.token,
    required this.nome,
  });

  @override
  _PresencaScreenState createState() =>
      _PresencaScreenState();
}

class _PresencaScreenState
    extends State<PresencaScreen> {

  final String baseUrl =
      Api.baseUrl;

  List turmas = [];

  int? turmaSelecionada;

  bool confirmou = false;

  String horarioConfirmado = '';

  bool carregando = false;

  @override
  void initState() {

    super.initState();

    carregarTurmas();
  }

  /**
   * 📚 CARREGAR TURMAS
   */
  Future<void> carregarTurmas() async {

    final res = await http.get(

      Uri.parse(
        '$baseUrl/presencas/turmas',
      ),

      headers: {
        'Authorization':
            'Bearer ${widget.token}'
      },
    );

    if (!mounted) return;

    if (res.statusCode == 200) {

      final data =
          jsonDecode(res.body);

      setState(() {
        turmas = data;
      });

      // 🔥 depois de carregar turmas
      // verifica presença do dia
      carregarPresencaHoje();
    }
  }

  /**
   * 📅 PRESENÇA DE HOJE
   */
  Future<void> carregarPresencaHoje() async {

    final res = await http.get(

      Uri.parse(
        '$baseUrl/presencas/hoje',
      ),

      headers: {
        'Authorization':
            'Bearer ${widget.token}'
      },
    );

    if (!mounted) return;

    if (res.statusCode == 200) {

      final data =
          jsonDecode(res.body);

      if (data != null &&
          data is List &&
          data.isNotEmpty) {

        final presenca =
            data[0];

        final turma =
            turmas.firstWhere(

          (t) =>
              t['id'] ==
              presenca['turma_id'],

          orElse: () => null,
        );

        setState(() {

          confirmou = true;

          turmaSelecionada =
              presenca['turma_id'];

          horarioConfirmado =
              turma != null
                  ? turma['horario']
                  : '';
        });
      }
    }
  }

  /**
   * ✅ CONFIRMAR
   */
  Future<void> confirmarPresenca() async {

    if (turmaSelecionada == null) {
      return;
    }

    setState(() {
      carregando = true;
    });

    final res = await http.post(

      Uri.parse(
        '$baseUrl/presencas',
      ),

      headers: {

        'Authorization':
            'Bearer ${widget.token}',

        'Content-Type':
            'application/json',
      },

      body: jsonEncode({

        'turma_id':
            turmaSelecionada,
      }),
    );

    if (!mounted) return;

    setState(() {
      carregando = false;
    });

    if (res.statusCode == 201) {

      final turma =
          turmas.firstWhere(
        (t) =>
            t['id'] ==
            turmaSelecionada,
      );

      setState(() {

        confirmou = true;

        horarioConfirmado =
            turma['horario'];
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(
          content: Text(
            'Presença confirmada',
          ),
        ),
      );

    } else {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(
          content: Text(
            'Erro: ${res.body}',
          ),
        ),
      );
    }
  }

  /**
   * ❌ CANCELAR
   */
  Future<void> removerPresenca() async {

    final res = await http.delete(

      Uri.parse(
        '$baseUrl/presencas',
      ),

      headers: {
        'Authorization':
            'Bearer ${widget.token}'
      },
    );

    if (!mounted) return;

    if (res.statusCode == 200) {

      setState(() {

        confirmou = false;

        turmaSelecionada = null;

        horarioConfirmado = '';
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(
          content: Text(
            'Presença cancelada',
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor:
          Colors.grey[100],

      appBar: AppBar(

        title: Text('Presença'),

        backgroundColor:
            Colors.amber,

        foregroundColor:
            Colors.black,

        elevation: 0,

        actions: [

          IconButton(

            icon: Icon(
              Icons.history,
            ),

            onPressed: () {

              Navigator.push(

                context,

                MaterialPageRoute(

                  builder: (_) =>
                      HistoricoScreen(
                    token:
                        widget.token,
                  ),
                ),
              );
            },
          ),
        ],
      ),

      body: Padding(

        padding:
            EdgeInsets.all(20),

        child: Column(

          crossAxisAlignment:
              CrossAxisAlignment
                  .stretch,

          children: [

            Container(

              padding:
                  EdgeInsets.all(18),

              decoration:
                  BoxDecoration(

                color: Colors.white,

                borderRadius:
                    BorderRadius
                        .circular(18),

                boxShadow: [

                  BoxShadow(

                    color: Colors.black12,

                    blurRadius: 8,

                    offset:
                        Offset(0, 3),
                  ),
                ],
              ),

              child: Column(

                children: [

                  DropdownButtonFormField<int>(

                    initialValue:
                        turmaSelecionada,

                    decoration:
                        InputDecoration(

                      labelText:
                          'Escolher horário',

                      border:
                          OutlineInputBorder(

                        borderRadius:
                            BorderRadius
                                .circular(14),
                      ),
                    ),

                    items: turmas
                        .map<
                            DropdownMenuItem<
                                int>>((t) {

                      return DropdownMenuItem<int>(

                        value:
                            t['id'],

                        child: Text(
                          'Horário: ${t['horario']}',
                        ),
                      );

                    }).toList(),

                    onChanged:
                        confirmou

                            ? null

                            : (v) {

                                setState(() {

                                  turmaSelecionada =
                                      v;
                                });
                              },
                  ),

                  SizedBox(
                    height: 20,
                  ),

                  if (confirmou)

                    Container(

                      padding:
                          EdgeInsets.all(14),

                      decoration:
                          BoxDecoration(

                        color: Colors
                            .green
                            .shade50,

                        borderRadius:
                            BorderRadius
                                .circular(14),
                      ),

                      child: Row(

                        children: [

                          Icon(

                            Icons
                                .check_circle,

                            color:
                                Colors.green,
                          ),

                          SizedBox(
                            width: 10,
                          ),

                          Expanded(

                            child: Text(

                              'Presença confirmada para $horarioConfirmado',

                              style:
                                  TextStyle(

                                color: Colors
                                    .green
                                    .shade800,

                                fontWeight:
                                    FontWeight
                                        .bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            Spacer(),

            /**
             * ✅ BOTÃO CONFIRMAR
             */
            if (!confirmou)

              SizedBox(

                height: 55,

                child: ElevatedButton(

                  onPressed:
                      turmaSelecionada ==
                                  null ||
                              carregando

                          ? null

                          : confirmarPresenca,

                  style:
                      ElevatedButton
                          .styleFrom(

                    backgroundColor:
                        Colors.amber,

                    foregroundColor:
                        Colors.black,

                    shape:
                        RoundedRectangleBorder(

                      borderRadius:
                          BorderRadius
                              .circular(16),
                    ),
                  ),

                  child: carregando

                      ? SizedBox(

                          height: 22,

                          width: 22,

                          child:
                              CircularProgressIndicator(

                            color:
                                Colors.black,

                            strokeWidth:
                                2,
                          ),
                        )

                      : Text(

                          'Confirmar Presença',

                          style:
                              TextStyle(

                            fontSize: 16,

                            fontWeight:
                                FontWeight
                                    .bold,
                          ),
                        ),
                ),
              ),

            /**
             * ❌ BOTÃO CANCELAR
             */
            if (confirmou)

              SizedBox(

                height: 55,

                child:
                    ElevatedButton.icon(

                  onPressed:
                      removerPresenca,

                  icon: Icon(
                    Icons.close,
                  ),

                  label: Text(

                    'Cancelar Presença',

                    style: TextStyle(
                      fontWeight:
                          FontWeight.bold,
                    ),
                  ),

                  style:
                      ElevatedButton
                          .styleFrom(

                    backgroundColor:
                        Colors.red,

                    foregroundColor:
                        Colors.white,

                    shape:
                        RoundedRectangleBorder(

                      borderRadius:
                          BorderRadius
                              .circular(16),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}