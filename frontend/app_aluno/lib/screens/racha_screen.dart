import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'racha_players_screen.dart';
import 'create_racha_screen.dart';
import '../config/api.dart';

class RachaScreen extends StatefulWidget {

  final String token;
  final Map user;

  RachaScreen({

    required this.token,
    required this.user,
  });

  @override
  _RachaScreenState createState() =>
      _RachaScreenState();
}

class _RachaScreenState
    extends State<RachaScreen> {

  final String baseUrl =
      Api.baseUrl;

  List rachas = [];

  List meusRachas = [];

  @override
  void initState() {

    super.initState();

    buscarRachas();
  }

  Future<void> buscarRachas() async {

    try {

      final response =
          await http.get(

        Uri.parse(
          '$baseUrl/rachas',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      if (!mounted) return;

      print(
        'RACHAS STATUS: ${response.statusCode}',
      );

      print(
        'RACHAS BODY: ${response.body}',
      );

      if (response.statusCode == 200) {

        final data =
            jsonDecode(
              response.body,
            );

        setState(() {

          rachas = data;

          /**
           * 🔥 IDENTIFICA
           * RACHAS ENTRADOS
           */
          meusRachas =

              data

                  .where((r) =>

                      r['entrou'] == true)

                  .map((r) => r['id'])

                  .toList();
        });
      }

    } catch (e) {

      print(
        'ERRO RACHAS: $e',
      );
    }
  }

  Future<void> entrarRacha(
    int id,
  ) async {

    try {

      final response =
          await http.post(

        Uri.parse(
          '$baseUrl/rachas/entrar',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',

          'Content-Type':
              'application/json',
        },

        body: jsonEncode({

          'racha_id': id,
        }),
      );

      if (!mounted) return;

      print(
        'ENTRAR STATUS: ${response.statusCode}',
      );

      print(
        'ENTRAR BODY: ${response.body}',
      );

      final body =

          response.body.isNotEmpty

              ? jsonDecode(response.body)

              : {};

      if (

          response.statusCode == 200 ||

          response.statusCode == 201

      ) {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.green,

            content: Text(
              'Você entrou no racha ✅',
            ),
          ),
        );

        buscarRachas();

      } else {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.red,

            content: Text(

              body['erro'] ??

              'Erro ao entrar no racha',
            ),
          ),
        );
      }

    } catch (e) {

      print(
        'ERRO ENTRAR: $e',
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(

          content: Text(
            'Erro de conexão',
          ),
        ),
      );
    }
  }

  Future<void> sairRacha(
    int id,
  ) async {

    try {

      final response =
          await http.delete(

        Uri.parse(
          '$baseUrl/rachas/sair/$id',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      if (!mounted) return;

      final body =

          response.body.isNotEmpty

              ? jsonDecode(response.body)

              : {};

      if (response.statusCode == 200) {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.orange,

            content: Text(
              'Você saiu do racha',
            ),
          ),
        );

        buscarRachas();

      } else {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.red,

            content: Text(

              body['erro'] ??

              'Erro ao sair',
            ),
          ),
        );
      }

    } catch (e) {

      print(
        'ERRO SAIR: $e',
      );
    }
  }

  Future<void> deletarRacha(
    int id,
  ) async {

    try {

      final response =
          await http.delete(

        Uri.parse(
          '$baseUrl/rachas/$id',
        ),

        headers: {

          'Authorization':
              'Bearer ${widget.token}',
        },
      );

      if (!mounted) return;

      final body =

          response.body.isNotEmpty

              ? jsonDecode(response.body)

              : {};

      if (response.statusCode == 200) {

        buscarRachas();

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.green,

            content: Text(
              'Racha excluído',
            ),
          ),
        );

      } else {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            backgroundColor:
                Colors.red,

            content: Text(

              body['erro'] ??

              'Erro ao excluir',
            ),
          ),
        );
      }

    } catch (e) {

      print(
        'ERRO DELETE: $e',
      );
    }
  }

  void confirmarDelete(
    int id,
  ) {

    showDialog(

      context: context,

      builder: (_) => AlertDialog(

        shape:
            RoundedRectangleBorder(

          borderRadius:
              BorderRadius.circular(20),
        ),

        title:
            Text('Excluir racha'),

        content:
            Text(
          'Deseja realmente excluir este racha?',
        ),

        actions: [

          TextButton(

            onPressed: () {

              Navigator.pop(context);
            },

            child:
                Text('Cancelar'),
          ),

          ElevatedButton(

            style:
                ElevatedButton.styleFrom(

              backgroundColor:
                  Colors.red,
            ),

            onPressed: () {

              Navigator.pop(context);

              deletarRacha(id);
            },

            child:
                Text('Excluir'),
          ),
        ],
      ),
    );
  }

  void confirmarSaida(
    int id,
  ) {

    showDialog(

      context: context,

      builder: (_) => AlertDialog(

        shape:
            RoundedRectangleBorder(

          borderRadius:
              BorderRadius.circular(20),
        ),

        title:
            Text(
          'Sair do racha',
        ),

        content:
            Text(
          'Deseja realmente sair do racha?',
        ),

        actions: [

          TextButton(

            onPressed: () {

              Navigator.pop(context);
            },

            child:
                Text('Cancelar'),
          ),

          ElevatedButton(

            style:
                ElevatedButton.styleFrom(

              backgroundColor:
                  Colors.red,
            ),

            onPressed: () async {

              Navigator.pop(context);

              await sairRacha(id);
            },

            child:
                Text('Sair'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    final podeCriarRacha =

        widget.user['tipo'] == 'funcionario' ||

        widget.user['tipo'] == 'admin';

    return Scaffold(

      appBar: AppBar(

        title:
            Text('Rachas'),

        backgroundColor:
            Colors.amber,

        foregroundColor:
            Colors.black,
      ),

      floatingActionButton:

          podeCriarRacha

              ? FloatingActionButton(

                  backgroundColor:
                      Colors.amber,

                  child: Icon(

                    Icons.add,

                    color:
                        Colors.black,
                  ),

                  onPressed: () {

                    Navigator.push(

                      context,

                      MaterialPageRoute(

                        builder: (_) =>

                            CreateRachaScreen(
                          token:
                              widget.token,
                        ),
                      ),
                    ).then((_) {

                      if (!mounted) return;

                      buscarRachas();
                    });
                  },
                )

              : null,

      body:

          rachas.isEmpty

              ? Center(

                  child: Text(
                    'Nenhum racha criado ainda 😢',
                  ),
                )

              : ListView.builder(

                  itemCount:
                      rachas.length,

                  itemBuilder:
                      (_, i) {

                    final r =
                        rachas[i];

                    final isDono =

                        widget.user['id']
                                .toString() ==

                            r['criado_por']
                                .toString();

                    final isAdmin =

                        widget.user['tipo'] ==
                            'admin';

                    final entrou =

                        meusRachas.contains(
                          r['id'],
                        );

                    return Card(

                      elevation: 3,

                      margin:
                          EdgeInsets.symmetric(

                        horizontal: 12,
                        vertical: 8,
                      ),

                      shape:
                          RoundedRectangleBorder(

                        borderRadius:
                            BorderRadius.circular(
                          12,
                        ),
                      ),

                      child: ListTile(

                        contentPadding:
                            EdgeInsets.all(12),

                        title: Text(

                          '${r['local']} - ${r['quadra']}',

                          style: TextStyle(
                            fontWeight:
                                FontWeight.bold,
                          ),
                        ),

                        subtitle: Column(

                          crossAxisAlignment:
                              CrossAxisAlignment
                                  .start,

                          children: [

                            SizedBox(
                              height: 5,
                            ),

                            Text(
                              '📅 ${r['data']}',
                            ),

                            Text(
                              '⏰ ${r['hora']}',
                            ),

                            Text(
                              '👥 ${r['limite']} jogadores',
                            ),

                            Text(
                              '⚽ ${r['tipo']}',
                            ),
                          ],
                        ),

                        onTap: () {

                          Navigator.push(

                            context,

                            MaterialPageRoute(

                              builder: (_) =>

                                  RachaPlayersScreen(

                                token:
                                    widget.token,

                                rachaId:
                                    r['id'],

                                limite:
                                    r['limite'],
                              ),
                            ),
                          );
                        },

                        trailing: Row(

                          mainAxisSize:
                              MainAxisSize.min,

                          children: [

                            if (widget.user['tipo'] ==
                                'aluno')

                              ElevatedButton(

                                onPressed: () {

                                  entrou

                                      ? confirmarSaida(
                                          r['id'],
                                        )

                                      : entrarRacha(
                                          r['id'],
                                        );
                                },

                                style:
                                    ElevatedButton
                                        .styleFrom(

                                  backgroundColor:

                                      entrou

                                          ? Colors.red

                                          : Colors.green,

                                  foregroundColor:
                                      Colors.white,
                                ),

                                child: Text(

                                  entrou

                                      ? 'Sair'

                                      : 'Entrar',
                                ),
                              ),

                            if (isDono || isAdmin)

                              IconButton(

                                icon: Icon(

                                  Icons.delete,

                                  color:
                                      Colors.red,
                                ),

                                onPressed: () {

                                  confirmarDelete(
                                    r['id'],
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}