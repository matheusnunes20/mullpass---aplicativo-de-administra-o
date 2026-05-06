import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api.dart';

class FrequenciaScreen extends StatefulWidget {

  final String token;

  const FrequenciaScreen({
    required this.token,
  });

  @override
  State<FrequenciaScreen> createState() =>
      _FrequenciaScreenState();
}

class _FrequenciaScreenState
    extends State<FrequenciaScreen> {

  final String baseUrl =
      Api.baseUrl;

  bool loading = true;

  int presencas = 0;

  int aulas = 0;

  double frequencia = 0;

  @override
  void initState() {
    super.initState();

    carregar();
  }

  /**
   * 🚀 CARREGAR
   */
  Future<void> carregar() async {

    try {

      final res = await http.get(

        Uri.parse(
          "$baseUrl/presencas/me/frequencia",
        ),

        headers: {
          "Authorization":
              "Bearer ${widget.token}",
        },
      );

      if (res.statusCode == 200) {

        final json =
            jsonDecode(res.body);

        setState(() {

          presencas =
              json['presencas'] ?? 0;

          aulas =
              json['aulas'] ?? 0;

          frequencia =
              double.tryParse(
                    json['frequencia']
                        .toString(),
                  ) ??
                  0;

          loading = false;
        });

      } else {

        setState(() => loading = false);
      }

    } catch (e) {

      print(
        "ERRO FREQUÊNCIA: $e",
      );

      setState(() => loading = false);
    }
  }

  /**
   * 🎨 COR
   */
  Color corFrequencia() {

    if (frequencia >= 75) {
      return Colors.green;
    }

    if (frequencia >= 50) {
      return Colors.orange;
    }

    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: Colors.grey[100],

      appBar: AppBar(

        title: Text("Minha Frequência"),

        backgroundColor: Colors.amber,

        foregroundColor: Colors.black,
      ),

      body: loading

          ? Center(
              child:
                  CircularProgressIndicator(),
            )

          : SingleChildScrollView(

              padding: EdgeInsets.all(20),

              child: Column(

                children: [

                  /**
                   * 🔥 CARD PRINCIPAL
                   */
                  Container(

                    width: double.infinity,

                    padding: EdgeInsets.all(24),

                    decoration: BoxDecoration(

                      color: Colors.white,

                      borderRadius:
                          BorderRadius.circular(
                        18,
                      ),

                      boxShadow: [

                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 8,
                        ),
                      ],
                    ),

                    child: Column(

                      children: [

                        Text(

                          "Frequência do mês",

                          style: TextStyle(
                            fontSize: 18,
                            fontWeight:
                                FontWeight.bold,
                          ),
                        ),

                        SizedBox(height: 30),

                        /**
                         * 📊 CÍRCULO
                         */
                        SizedBox(

                          width: 170,
                          height: 170,

                          child: Stack(

                            alignment:
                                Alignment.center,

                            clipBehavior:
                                Clip.none,

                            children: [

                              /**
                               * 🔥 CÍRCULO
                               */
                              SizedBox(

                                width: 140,
                                height: 140,

                                child:
                                    CircularProgressIndicator(

                                  value:
                                      frequencia >= 100
                                          ? 0.999
                                          : frequencia / 100,

                                  strokeWidth: 8,

                                  strokeCap:
                                      StrokeCap.round,

                                  backgroundColor:
                                      Colors.grey[300],

                                  valueColor:
                                      AlwaysStoppedAnimation(
                                    corFrequencia(),
                                  ),
                                ),
                              ),

                              /**
                               * 🔥 TEXTO CENTRAL
                               */
                              Positioned(

                                top: 58,

                                child: Column(

                                  children: [

                                    Text(

                                      "${frequencia.toStringAsFixed(1)}%",

                                      style: TextStyle(
                                        fontSize: 28,
                                        fontWeight:
                                            FontWeight.bold,
                                        color:
                                            corFrequencia(),
                                      ),
                                    ),

                                    SizedBox(height: 2),

                                    Text(

                                      "de presença",

                                      style: TextStyle(
                                        fontSize: 14,
                                        color:
                                            Colors.grey[700],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        SizedBox(height: 30),

                        Divider(),

                        SizedBox(height: 20),

                        /**
                         * 📚 ESTATÍSTICAS
                         */
                        Row(

                          mainAxisAlignment:
                              MainAxisAlignment
                                  .spaceAround,

                          children: [

                            Column(

                              children: [

                                Icon(
                                  Icons.check_circle,
                                  color: Colors.green,
                                  size: 36,
                                ),

                                SizedBox(height: 8),

                                Text(

                                  "$presencas",

                                  style: TextStyle(
                                    fontSize: 26,
                                    fontWeight:
                                        FontWeight.bold,
                                  ),
                                ),

                                Text(
                                  "Presenças",
                                ),
                              ],
                            ),

                            Column(

                              children: [

                                Icon(
                                  Icons.school,
                                  color: Colors.blue,
                                  size: 36,
                                ),

                                SizedBox(height: 8),

                                Text(

                                  "$aulas",

                                  style: TextStyle(
                                    fontSize: 26,
                                    fontWeight:
                                        FontWeight.bold,
                                  ),
                                ),

                                Text(
                                  "Aulas",
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 24),

                  /**
                   * 🔥 MENSAGEM
                   */
                  Container(

                    width: double.infinity,

                    padding: EdgeInsets.all(18),

                    decoration: BoxDecoration(

                      color:
                          corFrequencia()
                              .withOpacity(0.1),

                      borderRadius:
                          BorderRadius.circular(
                        14,
                      ),
                    ),

                    child: Text(

                      frequencia >= 75

                          ? "🔥 Excelente frequência! Continue assim."

                          : frequencia >= 50

                              ? "⚠️ Você pode melhorar sua frequência."

                              : "🚨 Sua frequência está baixa.",

                      style: TextStyle(

                        color: corFrequencia(),

                        fontWeight:
                            FontWeight.bold,

                        fontSize: 15,
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}