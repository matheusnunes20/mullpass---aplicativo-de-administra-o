import 'package:flutter/material.dart';
import 'create_aluno_screen.dart';
import 'create_funcionario_screen.dart';

class SelectUserTypeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],

      appBar: AppBar(
        title: Text('Escolher Tipo'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        elevation: 0,
      ),

      body: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 30),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Como você deseja se cadastrar?',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),

              SizedBox(height: 40),

              _botao(
                context,
                texto: 'Sou Aluno',
                icone: Icons.person,
                corFundo: Colors.amber,
                corTexto: Colors.black,
                destino: CreateAlunoScreen(),
              ),

              SizedBox(height: 20),

              _botao(
                context,
                texto: 'Sou Funcionário',
                icone: Icons.badge,
                corFundo: Colors.black87,
                corTexto: Colors.white,
                destino: CreateFuncionarioScreen(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _botao(
    BuildContext context, {
    required String texto,
    required IconData icone,
    required Color corFundo,
    required Color corTexto,
    required Widget destino,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: corFundo,
          foregroundColor: corTexto,
          padding: EdgeInsets.symmetric(vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          elevation: 3,
        ),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => destino),
          );
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icone),
            SizedBox(width: 10),
            Text(
              texto,
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}