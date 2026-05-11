import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../config/api.dart';

class NotificacoesScreen extends StatefulWidget {

  final String token;

  const NotificacoesScreen({
    required this.token,
  });

  @override
  State<NotificacoesScreen> createState() =>
      _NotificacoesScreenState();
}

class _NotificacoesScreenState
    extends State<NotificacoesScreen> {

  final String baseUrl =
      Api.baseUrl;

  List notificacoes = [];

  bool loading = true;

  @override
  void initState() {

    super.initState();

    iniciarTela();
  }

  /**
   * 🚀 INICIA
   */
  Future<void> iniciarTela() async {

    await marcarComoLida();

    if (!mounted) return;

    await carregarNotificacoes();

    if (!mounted) return;

    setState(() {});
  }

  /**
   * 🔔 CARREGAR
   */
  Future<void> carregarNotificacoes() async {

    try {

      final res =
          await http.get(

        Uri.parse(
          "$baseUrl/notificacoes/me",
        ),

        headers: {

          "Authorization":
              "Bearer ${widget.token}",
        },
      );

      if (!mounted) return;

      if (res.statusCode == 200) {

        setState(() {

          notificacoes =
              jsonDecode(
                res.body,
              );

          loading = false;
        });

      } else {

        setState(() {

          loading = false;
        });
      }

    } catch (e) {

     (
        "ERRO NOTIFICAÇÕES: $e",
      );

      if (!mounted) return;

      setState(() {

        loading = false;
      });
    }
  }

  /**
   * ✅ MARCAR COMO LIDA
   */
  Future<void> marcarComoLida() async {

    try {

      await http.put(

        Uri.parse(
          "$baseUrl/notificacoes/lida",
        ),

        headers: {

          "Authorization":
              "Bearer ${widget.token}",
        },
      );

    } catch (e) {

     (
        "ERRO MARCAR LIDA: $e",
      );
    }
  }

  /**
   * 🎨 ÍCONE
   */
  IconData iconePorTitulo(
    String titulo,
  ) {

    if (titulo
        .toLowerCase()
        .contains('atrasada')) {

      return Icons.warning;
    }

    if (titulo
        .toLowerCase()
        .contains('vencendo')) {

      return Icons.schedule;
    }

    return Icons.notifications;
  }

  /**
   * 🎨 COR
   */
  Color corPorTitulo(
    String titulo,
  ) {

    if (titulo
        .toLowerCase()
        .contains('atrasada')) {

      return Colors.red;
    }

    if (titulo
        .toLowerCase()
        .contains('vencendo')) {

      return Colors.orange;
    }

    return Colors.blue;
  }

  /**
   * 📅 DATA
   */
  String formatarData(
    String? data,
  ) {

    if (data == null) {
      return '';
    }

    try {

      final date =
          DateTime.parse(data);

      return

          '${date.day.toString().padLeft(2, '0')}/'

          '${date.month.toString().padLeft(2, '0')}/'

          '${date.year}';

    } catch (e) {

      return data;
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor:
          Colors.grey[100],

      appBar: AppBar(

        title:
            Text("Notificações"),

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

              : notificacoes.isEmpty

                  ? Center(

                      child: Text(

                        "Nenhuma notificação 🎉",

                        style: TextStyle(
                          fontSize: 16,
                        ),
                      ),
                    )

                  : ListView.builder(

                      padding:
                          EdgeInsets.all(12),

                      itemCount:
                          notificacoes.length,

                      itemBuilder:
                          (_, i) {

                        final n =
                            notificacoes[i];

                        final titulo =

                            n['titulo']
                                    ?.toString() ??

                                'Notificação';

                        final mensagem =

                            n['mensagem']
                                    ?.toString() ??

                                '';

                        final data =

                            n['created_at']
                                ?.toString();

                        return Card(

                          elevation: 3,

                          margin:
                              EdgeInsets.only(
                            bottom: 12,
                          ),

                          shape:
                              RoundedRectangleBorder(

                            borderRadius:
                                BorderRadius.circular(
                              14,
                            ),
                          ),

                          child: ListTile(

                            leading:
                                CircleAvatar(

                              backgroundColor:

                                  corPorTitulo(
                                    titulo,
                                  ).withValues(
                                    alpha: 0.15,
                                  ),

                              child: Icon(

                                iconePorTitulo(
                                  titulo,
                                ),

                                color:
                                    corPorTitulo(
                                  titulo,
                                ),
                              ),
                            ),

                            title: Text(

                              titulo,

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
                                  height: 6,
                                ),

                                Text(
                                  mensagem,
                                ),

                                SizedBox(
                                  height: 6,
                                ),

                                Text(

                                  formatarData(
                                    data,
                                  ),

                                  style: TextStyle(

                                    fontSize: 12,

                                    color:
                                        Colors.grey[600],
                                  ),
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