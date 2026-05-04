import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'loginScreen.dart';

class CreateFuncionarioScreen extends StatefulWidget {
  @override
  _CreateFuncionarioScreenState createState() =>
      _CreateFuncionarioScreenState();
}

class _CreateFuncionarioScreenState extends State<CreateFuncionarioScreen> {

  final nomeController = TextEditingController();
  final emailController = TextEditingController();
  final documentoController = TextEditingController();
  final usernameController = TextEditingController();
  final senhaController = TextEditingController();
  final codigoController = TextEditingController();

  bool loading = false;
  final cpfMask = MaskTextInputFormatter(
    mask: '###.###.###-##',
    filter: {"#": RegExp(r'[0-9]')},
  );

  Future<void> cadastrarFuncionario() async {
    setState(() => loading = true);

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': emailController.text,
          'senha': senhaController.text,
          'username': usernameController.text,
          'documento': documentoController.text,
          'tipo': 'funcionario',
          'codigo': codigoController.text,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Funcionário cadastrado com sucesso')),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => LoginScreen(),
          ),
          (route) => false,
        );

      } else {

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Código inválido ou erro no cadastro')),
        );
      }

    } catch (e) {

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de conexão')),
      );
    } finally {
      setState(() => loading = false);
    }
  }

  Widget campo(TextEditingController controller, String label,
      {TextInputType? tipo, List<TextInputFormatter>? formatters}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controller,
        keyboardType: tipo,
        inputFormatters: formatters,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        title: Text('Cadastro Funcionário'),
        backgroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [

            campo(nomeController, 'Nome'),
            campo(emailController, 'Email'),
            campo(
              documentoController,
              'CPF',
              tipo: TextInputType.number,
              formatters: [cpfMask],
            ),

            campo(usernameController, 'Username'),

            TextField(
              controller: senhaController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Senha',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),

            SizedBox(height: 10),
            campo(codigoController, 'Código de acesso'),

            SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : cadastrarFuncionario,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                ),
                child: loading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Cadastrar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}