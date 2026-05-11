import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../config/api.dart';

class ForgotPasswordScreen extends StatefulWidget {

  @override
  _ForgotPasswordScreenState createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState
    extends State<ForgotPasswordScreen> {

  final String baseUrl =
      Api.baseUrl;

  final emailController =
      TextEditingController();

  bool loading = false;

  /**
   * 📧 ENVIAR EMAIL
   */
  Future<void> enviarEmail() async {

    final email =
        emailController.text.trim();

    if (email.isEmpty) {

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(
          content: Text(
            'Digite seu email',
          ),
        ),
      );

      return;
    }

    setState(() {
      loading = true;
    });

    try {

      final response =
          await http.post(

        Uri.parse(
          '$baseUrl/auth/esqueci-senha',
        ),

        headers: {

          'Content-Type':
              'application/json',
        },

        body: jsonEncode({

          'email': email,
        }),
      );

      if (!mounted) return;

     (response.body);

      if (response.statusCode == 200) {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            content: Text(
              'Email enviado com sucesso',
            ),
          ),
        );

        Navigator.pop(context);

      } else {

        final data =
            jsonDecode(
              response.body,
            );

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            content: Text(

              data['erro'] ??

                  'Erro ao enviar email',
            ),
          ),
        );
      }

    } catch (e) {

     (e);

      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(

        SnackBar(

          content: Text(
            'Erro ao conectar servidor',
          ),
        ),
      );

    } finally {

      if (mounted) {

        setState(() {

          loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(

        title:
            Text('Recuperar senha'),

        backgroundColor:
            Colors.amber,

        foregroundColor:
            Colors.black,
      ),

      body: Padding(

        padding:
            EdgeInsets.all(20),

        child: Column(

          children: [

            SizedBox(
              height: 20,
            ),

            Icon(

              Icons.lock_reset,

              size: 90,

              color: Colors.amber,
            ),

            SizedBox(
              height: 20,
            ),

            Text(

              'Digite seu email para recuperar sua senha.',

              textAlign:
                  TextAlign.center,

              style: TextStyle(
                fontSize: 16,
              ),
            ),

            SizedBox(
              height: 30,
            ),

            TextField(

              controller:
                  emailController,

              keyboardType:
                  TextInputType.emailAddress,

              decoration:
                  InputDecoration(

                labelText:
                    'Email',

                border:
                    OutlineInputBorder(),

                prefixIcon:
                    Icon(Icons.email),
              ),
            ),

            SizedBox(
              height: 30,
            ),

            SizedBox(

              width:
                  double.infinity,

              height: 55,

              child:
                  ElevatedButton(

                onPressed:
                    loading
                        ? null
                        : enviarEmail,

                style:
                    ElevatedButton.styleFrom(

                  backgroundColor:
                      Colors.amber,

                  foregroundColor:
                      Colors.black,
                ),

                child:
                    loading

                        ? CircularProgressIndicator(
                            color:
                                Colors.black,
                          )

                        : Text(

                            'Enviar Email',

                            style: TextStyle(
                              fontWeight:
                                  FontWeight.bold,
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