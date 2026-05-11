import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

import 'login_screen.dart';
import '../config/api.dart';

class CreateFuncionarioScreen extends StatefulWidget {

  @override
  _CreateFuncionarioScreenState createState() =>
      _CreateFuncionarioScreenState();
}

class _CreateFuncionarioScreenState
    extends State<CreateFuncionarioScreen> {

  // ✅ BASE URL CORRETA
  final String baseUrl =
      Api.baseUrl;

  final nomeController =
      TextEditingController();

  final emailController =
      TextEditingController();

  final documentoController =
      TextEditingController();

  final usernameController =
      TextEditingController();

  final senhaController =
      TextEditingController();

  final codigoController =
      TextEditingController();

  bool loading = false;

  bool esconderSenha = true;

  final cpfMask =
      MaskTextInputFormatter(

    mask: '###.###.###-##',

    filter: {
      "#": RegExp(r'[0-9]')
    },
  );

  @override
  void dispose() {

    nomeController.dispose();

    emailController.dispose();

    documentoController.dispose();

    usernameController.dispose();

    senhaController.dispose();

    codigoController.dispose();

    super.dispose();
  }

  Future<void> cadastrarFuncionario() async {

    setState(() {

      loading = true;
    });

    try {

      final response =
          await http.post(

        Uri.parse(
          '$baseUrl/auth/register',
        ),

        headers: {

          'Content-Type':
              'application/json',
        },

        body: jsonEncode({

          'email':
              emailController.text.trim(),

          'senha':
              senhaController.text.trim(),

          'username':
              usernameController.text.trim(),

          'documento':
              documentoController.text.trim(),

          'tipo':
              'funcionario',

          'codigo':
              codigoController.text.trim(),
        }),
      );

      if (!mounted) return;

     (
        'FUNC STATUS: ${response.statusCode}',
      );

     (
        'FUNC BODY: ${response.body}',
      );

      if (

          response.statusCode == 200 ||

          response.statusCode == 201

      ) {

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(

            content: Text(
              'Funcionário cadastrado com sucesso',
            ),
          ),
        );

        Navigator.pushAndRemoveUntil(

          context,

          MaterialPageRoute(

            builder: (_) =>
                LoginScreen(),
          ),

          (route) => false,
        );

      } else {

        String erro =
            'Código inválido ou erro no cadastro';

        try {

          final body =
              jsonDecode(
                response.body,
              );

          erro =

              body['erro'] ??

              erro;

        } catch (_) {}

        ScaffoldMessenger.of(context)
            .showSnackBar(

          SnackBar(
            content: Text(erro),
          ),
        );
      }

    } catch (e) {

     (
        'ERRO FUNC: $e',
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

    } finally {

      if (mounted) {

        setState(() {

          loading = false;
        });
      }
    }
  }

  Widget campo(

    TextEditingController controller,

    String label,

    {

      TextInputType? tipo,

      List<TextInputFormatter>? formatters,
    }
  ) {

    return Padding(

      padding:
          EdgeInsets.only(
        bottom: 10,
      ),

      child: TextField(

        controller:
            controller,

        keyboardType:
            tipo,

        inputFormatters:
            formatters,

        decoration:
            InputDecoration(

          labelText:
              label,

          border:
              OutlineInputBorder(

            borderRadius:
                BorderRadius.circular(
              10,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      resizeToAvoidBottomInset:
          true,

      appBar: AppBar(

        title:
            Text(
          'Cadastro Funcionário',
        ),

        backgroundColor:
            Colors.black,
      ),

      body: SingleChildScrollView(

        padding:
            EdgeInsets.all(16),

        child: Column(

          children: [

            campo(
              nomeController,
              'Nome',
            ),

            campo(
              emailController,
              'Email',
            ),

            campo(

              documentoController,

              'CPF',

              tipo:
                  TextInputType.number,

              formatters: [
                cpfMask,
              ],
            ),

            campo(
              usernameController,
              'Username',
            ),

            TextField(

              controller:
                  senhaController,

              obscureText:
                  esconderSenha,

              decoration:
                  InputDecoration(

                labelText:
                    'Senha',

                border:
                    OutlineInputBorder(

                  borderRadius:
                      BorderRadius.circular(
                    10,
                  ),
                ),

                suffixIcon:
                    IconButton(

                  icon: Icon(

                    esconderSenha

                        ? Icons.visibility_off

                        : Icons.visibility,
                  ),

                  onPressed: () {

                    setState(() {

                      esconderSenha =
                          !esconderSenha;
                    });
                  },
                ),
              ),
            ),

            SizedBox(
              height: 10,
            ),

            campo(
              codigoController,
              'Código de acesso',
            ),

            SizedBox(
              height: 20,
            ),

            SizedBox(

              width:
                  double.infinity,

              child:
                  ElevatedButton(

                onPressed:

                    loading

                        ? null

                        : cadastrarFuncionario,

                style:
                    ElevatedButton.styleFrom(

                  backgroundColor:
                      Colors.black,
                ),

                child:

                    loading

                        ? CircularProgressIndicator(
                            color:
                                Colors.white,
                          )

                        : Text(
                            'Cadastrar',
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}