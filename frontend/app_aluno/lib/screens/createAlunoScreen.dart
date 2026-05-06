import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'completarAlunoScreen.dart';
import '../config/api.dart';

class CreateAlunoScreen extends StatefulWidget {
  @override
  _CreateAlunoScreenState createState() => _CreateAlunoScreenState();
}

class _CreateAlunoScreenState extends State<CreateAlunoScreen> {

  // ✅ BASE URL CENTRALIZADA
  final String baseUrl =
      Api.baseUrl;

  final nomeController = TextEditingController();
  final telefoneController = TextEditingController();
  final emailController = TextEditingController();
  final documentoController = TextEditingController();
  final usernameController = TextEditingController();
  final senhaController = TextEditingController();

  bool loading = false;

  final telefoneMask = MaskTextInputFormatter(
    mask: '(##) #####-####',
    filter: {"#": RegExp(r'[0-9]')},
  );

  final cpfMask = MaskTextInputFormatter(
    mask: '###.###.###-##',
    filter: {"#": RegExp(r'[0-9]')},
  );

  Future<void> registrarUsuario() async {
    setState(() => loading = true);

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': emailController.text.trim(),
          'senha': senhaController.text.trim(),
          'username': usernameController.text.trim(),
          'documento': documentoController.text.trim(),
          'tipo': 'aluno',
        }),
      );

      print('REGISTER STATUS: ${response.statusCode}');
      print('REGISTER BODY: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {

        final user = jsonDecode(response.body);

        final int usuarioId = user['id'] is int
            ? user['id']
            : int.parse(user['id'].toString());

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => CompletarAlunoScreen(
              usuarioId: usuarioId,
              nome: nomeController.text,
              telefone: telefoneController.text,
              email: emailController.text,
              documento: documentoController.text,
            ),
          ),
        );

      } else {

        // 🔥 MOSTRA ERRO REAL DO BACKEND
        String erro = 'Erro desconhecido';

        try {
          final body = jsonDecode(response.body);
          erro = body['erro'] ?? response.body;
        } catch (_) {
          erro = response.body;
        }

        print('ERRO BACKEND: $erro');

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(erro)),
        );
      }

    } catch (e) {

      print('ERRO REGISTER: $e');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de conexão com servidor')),
      );

    } finally {
      setState(() => loading = false);
    }
  }

  Widget campo(TextEditingController controller, String label,
      {TextInputType? type, List<TextInputFormatter>? formatters}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controller,
        keyboardType: type,
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
        title: Text('Cadastro'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [

            campo(nomeController, 'Nome'),

            campo(
              telefoneController,
              'Telefone',
              type: TextInputType.number,
              formatters: [telefoneMask],
            ),

            campo(emailController, 'Email'),

            campo(
              documentoController,
              'CPF',
              type: TextInputType.number,
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

            SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : registrarUsuario,
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