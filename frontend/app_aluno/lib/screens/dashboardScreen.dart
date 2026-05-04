import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'loginScreen.dart';
import 'rachaScreen.dart';
import 'createRachaScreen.dart';
import 'createAulaScreen.dart';
import 'homeScreen.dart';
import 'presencaScreen.dart';
import 'turmasScreen.dart';
import 'financeiroScreen.dart';
import 'financeiroAdminScreen.dart';

class DashboardScreen extends StatefulWidget {
  final String token;
  final Map user;

  DashboardScreen({required this.token, required this.user});

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool bloqueado = false;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    verificarFinanceiro();
  }

  Future<void> verificarFinanceiro() async {
    try {
      final res = await http.get(
        Uri.parse('https://mullpass--aplicativo-de-administra-o.onrender.com/financeiro/me'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);

        if (data['status'] == 'atrasado') {
          setState(() {
            bloqueado = true;
            loading = false;
          });
          return;
        }
      }

      setState(() {
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.user;
    final isAluno = user['tipo'] == 'aluno';
    final isStaff =
        user['tipo'] == 'funcionario' || user['tipo'] == 'admin';

    final username = (user['username'] ?? 'Usuário').toString();
    final tipo = (user['tipo'] ?? '').toString();

    if (loading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[100],

      appBar: AppBar(
        title: Text('Arena Mull'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('token');

              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => LoginScreen()),
                (route) => false,
              );
            },
          )
        ],
      ),

      body: bloqueado
          ? _telaBloqueada(context)
          : SingleChildScrollView(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
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
                            username[0].toUpperCase(),
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                        SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Olá, $username'),
                            Text(tipo.toUpperCase()),
                          ],
                        )
                      ],
                    ),
                  ),

                  SizedBox(height: 25),

                  Text('Ações',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),

                  SizedBox(height: 15),

                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 15,
                    mainAxisSpacing: 15,
                    children: [
                      card(context, 'Financeiro', Icons.attach_money,
                          Colors.red, () {
                        if (isStaff) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => FinanceiroAdminScreen(
                                token: widget.token,
                              ),
                            ),
                          );
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => FinanceiroScreen(
                                token: widget.token,
                              ),
                            ),
                          );
                        }
                      }),

                      // 🔥 ALUNO
                      if (isAluno) ...[
                        card(context, 'Presença', Icons.check_circle,
                            Colors.green, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PresencaScreen(
                                token: widget.token,
                                nome: username, // 🔥 CORRIGIDO
                              ),
                            ),
                          );
                        }),

                        card(context, 'Rachas',
                            Icons.sports_volleyball, Colors.orange, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => RachaScreen(
                                token: widget.token,
                                user: widget.user,
                              ),
                            ),
                          );
                        }),
                      ],

                      // 🔥 STAFF
                      if (isStaff) ...[
                        card(context, 'Criar Racha', Icons.add, Colors.black,
                            () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  CreateRachaScreen(token: widget.token),
                            ),
                          );
                        }),

                        card(context, 'Ver Rachas', Icons.list,
                            Colors.orange, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => RachaScreen(
                                token: widget.token,
                                user: widget.user,
                              ),
                            ),
                          );
                        }),

                        card(context, 'Alunos', Icons.group, Colors.blue, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  HomeScreen(token: widget.token),
                            ),
                          );
                        }),

                        card(context, 'Presenças', Icons.checklist,
                            Colors.green, () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  TurmasScreen(token: widget.token),
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

  Widget _telaBloqueada(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 80, color: Colors.red),
            SizedBox(height: 20),
            Text(
              'Acesso bloqueado',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              'Vá até a recepção e renove sua mensalidade',
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        FinanceiroScreen(token: widget.token),
                  ),
                );
              },
              child: Text('Ir para financeiro'),
            )
          ],
        ),
      ),
    );
  }

  Widget card(BuildContext context, String title, IconData icon,
      Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.white),
            SizedBox(height: 10),
            Text(title,
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold))
          ],
        ),
      ),
    );
  }
}