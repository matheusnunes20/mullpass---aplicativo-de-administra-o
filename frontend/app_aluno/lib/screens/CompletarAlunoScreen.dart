import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'loginScreen.dart';

class CompletarAlunoScreen extends StatefulWidget {
  final int usuarioId;
  final String nome;
  final String telefone;
  final String email;
  final String documento;

  CompletarAlunoScreen({
    required this.usuarioId,
    required this.nome,
    required this.telefone,
    required this.email,
    required this.documento,
  });

  @override
  _CompletarAlunoScreenState createState() =>
      _CompletarAlunoScreenState();
}

class _CompletarAlunoScreenState extends State<CompletarAlunoScreen> {

  final ruaController = TextEditingController();
  final numeroController = TextEditingController();
  final bairroController = TextEditingController();

  String modalidade = 'volei';
  String diaSemana = 'segunda-feira e quarta-feira';
  String horario = '18-19';
  String professor = 'caua';
  String sexo = 'feminino';

  // 🔥 NOVO → PLANO
  int planoId = 1;

  final planos = {
    1: 'Vôlei - R\$120',
    2: 'Futevôlei - R\$150',
    3: 'Beach Tennis - R\$200',
  };

  bool loading = false;

  Future<void> salvarAluno() async {
    setState(() => loading = true);

    try {
      final body = {
        'nome': widget.nome,
        'telefone': widget.telefone,
        'email': widget.email,
        'documento': widget.documento,
        'endereco':
            '${ruaController.text}, ${numeroController.text} - ${bairroController.text}',
        'tipo': 'ativo',
        'modalidade': modalidade,
        'dia_semana': diaSemana,
        'horario': horario,
        'professor': professor,
        'sexo': sexo,

        // 🔥 ESSENCIAL
        'usuario_id': widget.usuarioId,
        'plano_id': planoId,
      };

      print('BODY ENVIO: $body');

      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/alunos/public'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );

      print('STATUS: ${response.statusCode}');
      print('BODY: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cadastro completo com sucesso')),
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
          SnackBar(content: Text('Erro ao salvar aluno')),
        );
      }

    } catch (e) {
      print('ERRO: $e');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de conexão')),
      );
    } finally {
      setState(() => loading = false);
    }
  }

  Widget campo(String label, TextEditingController controller) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    );
  }

  Widget dropdown(String label, String value, List<String> items, Function(String?) onChanged) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10),
      child: DropdownButtonFormField<String>(
        value: items.contains(value) ? value : null,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        items: items.map((item) {
          return DropdownMenuItem(
            value: item,
            child: Text(item),
          );
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {

    final modalidades = ['volei', 'futevolei', 'beach tenis'];

    final dias = [
      'segunda-feira e quarta-feira',
      'terca-feira e quinta-feira'
    ];

    final horarios = ['18-19', '19-20', '20-21'];

    final professores = ['caua', 'joao', 'maria'];

    final sexos = ['masculino', 'feminino'];

    return Scaffold(
      appBar: AppBar(
        title: Text('Completar Cadastro'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [

            campo('Nome', TextEditingController(text: widget.nome)),
            campo('Telefone', TextEditingController(text: widget.telefone)),
            campo('Email', TextEditingController(text: widget.email)),
            campo('CPF', TextEditingController(text: widget.documento)),

            SizedBox(height: 10),

            campo('Rua', ruaController),
            campo('Número', numeroController),
            campo('Bairro', bairroController),

            SizedBox(height: 10),

            dropdown('Modalidade', modalidade, modalidades, (v) {
              setState(() => modalidade = v!);
            }),

            dropdown('Dias da Semana', diaSemana, dias, (v) {
              setState(() => diaSemana = v!);
            }),

            dropdown('Horário', horario, horarios, (v) {
              setState(() => horario = v!);
            }),

            dropdown('Professor', professor, professores, (v) {
              setState(() => professor = v!);
            }),

            dropdown('Sexo', sexo, sexos, (v) {
              setState(() => sexo = v!);
            }),

            // 🔥 NOVO → PLANO
            Padding(
              padding: EdgeInsets.only(bottom: 10),
              child: DropdownButtonFormField<int>(
                value: planoId,
                decoration: InputDecoration(
                  labelText: 'Plano',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                items: planos.entries.map((e) {
                  return DropdownMenuItem(
                    value: e.key,
                    child: Text(e.value),
                  );
                }).toList(),
                onChanged: (v) {
                  setState(() => planoId = v!);
                },
              ),
            ),

            SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: loading ? null : salvarAluno,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                ),
                child: loading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Finalizar Cadastro'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}