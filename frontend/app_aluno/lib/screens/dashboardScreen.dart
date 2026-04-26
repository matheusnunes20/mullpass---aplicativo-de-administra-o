import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'loginScreen.dart';

import 'rachaScreen.dart';
import 'createRachaScreen.dart';
import 'createAulaScreen.dart';
import 'homeScreen.dart';
import 'presencaScreen.dart';

class DashboardScreen extends StatelessWidget {
  final String token;
  final Map user;

  DashboardScreen({required this.token, required this.user});

  @override
  Widget build(BuildContext context) {
    final isAluno = user['tipo'] == 'aluno';
    final isStaff =
        user['tipo'] == 'funcionario' || user['tipo'] == 'admin';

    // 🔥 SEGURANÇA DE DADOS
    final username = (user['username'] ?? 'Usuário').toString();
    final tipo = (user['tipo'] ?? '').toString();

    return Scaffold(
      backgroundColor: Colors.grey[100],

      appBar: AppBar(
        title: Text('Arena Mull'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        elevation: 0,

        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              final sair = await showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  title: Text('Sair'),
                  content: Text('Deseja realmente sair?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: Text('Cancelar'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: Text('Sair'),
                    ),
                  ],
                ),
              );

              if (sair == true) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('token');

                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => LoginScreen()),
                  (route) => false,
                );
              }
            },
          )
        ],
      ),

      body: SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // 👋 HEADER
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.amber, Colors.orange],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.black,
                    child: Text(
                      username[0].toUpperCase(), // 🔥 corrigido
                      style: TextStyle(color: Colors.white, fontSize: 22),
                    ),
                  ),
                  SizedBox(width: 15),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Olá, $username 👋', // 🔥 corrigido
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        tipo.toUpperCase(), // 🔥 corrigido
                        style: TextStyle(color: Colors.black87),
                      ),
                    ],
                  )
                ],
              ),
            ),

            SizedBox(height: 25),

            Text(
              'Ações',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            SizedBox(height: 15),

            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              children: [

                // 👤 ALUNO
                if (isAluno) ...[
                  card(context, 'Presença', Icons.check_circle, Colors.green, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PresencaScreen(token: token),
                      ),
                    );
                  }),

                  card(context, 'Rachas', Icons.sports_volleyball, Colors.orange, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RachaScreen(
                          token: token,
                          user: user,
                        ),
                      ),
                    );
                  }),
                ],

                // 👨‍🏫 FUNCIONÁRIO + ADMIN
                if (isStaff) ...[
                  card(context, 'Criar Racha', Icons.add_circle, Colors.black, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CreateRachaScreen(token: token),
                      ),
                    );
                  }),

                  card(context, 'Ver Rachas', Icons.list, Colors.orange, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RachaScreen(
                          token: token,
                          user: user,
                        ),
                      ),
                    );
                  }),

                  card(context, 'Agendar Aula', Icons.calendar_month, Colors.purple, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CreateAulaScreen(token: token),
                      ),
                    );
                  }),

                  card(context, 'Alunos', Icons.group, Colors.blue, () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => HomeScreen(token: token),
                      ),
                    );
                  }),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget card(BuildContext context, String title, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 6,
              offset: Offset(0, 3),
            )
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.white),
            SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            )
          ],
        ),
      ),
    );
  }
}