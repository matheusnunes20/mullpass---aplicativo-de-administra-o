import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'loginScreen.dart';
import 'dart:convert';
import 'createAlunoScreen.dart';
import 'alunoDetalheScreen.dart';

class HomeScreen extends StatefulWidget {
  final String token;

  HomeScreen({required this.token});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List alunos = [];
  Map user = {};

  @override
  void initState() {
    super.initState();
    buscarUsuario();
    buscarAlunos();
  }

  Future<void> buscarUsuario() async {
    try {
      final response = await http.get(
        Uri.parse('https://mullpass--aplicativo-de-administra-o.onrender.com/usuarios/me'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          user = jsonDecode(response.body);
        });
      }
    } catch (e) {
    }
  }

  Future<void> buscarAlunos() async {
    try {
      final response = await http.get(
        Uri.parse('https://mullpass--aplicativo-de-administra-o.onrender.com/alunos'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          alunos = jsonDecode(response.body);
        });
      }
    } catch (e) {
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Alunos'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            tooltip: 'Sair',
            onPressed: logout,
          )
        ],
      ),

      body: alunos.isEmpty
          ? Center(child: Text('Nenhum aluno cadastrado'))
          : ListView.builder(
              padding: EdgeInsets.all(10),
              itemCount: alunos.length,
              itemBuilder: (context, index) {
                final aluno = alunos[index];

                return Card(
                  elevation: 2,
                  margin: EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: ListTile(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AlunoDetalheScreen(
                            alunoId: int.parse(aluno['id'].toString()),
                            token: widget.token,
                          ),
                        ),
                      );
                    },

                    leading: CircleAvatar(
                      backgroundColor: Colors.amber,
                      child: Text(
                        aluno['nome'][0],
                        style: TextStyle(color: Colors.black),
                      ),
                    ),

                    title: Text(
                      aluno['nome'],
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),

                    subtitle: Text(aluno['telefone'] ?? ''),

                    trailing: user['tipo'] == 'admin'
                        ? IconButton(
                            icon: Icon(Icons.delete, color: Colors.red),
                            onPressed: () {
                            },
                          )
                        : null,
                  ),
                );
              },
            ),

      floatingActionButton:
          (user['tipo'] == 'admin' || user['tipo'] == 'funcionario')
              ? FloatingActionButton(
                  backgroundColor: Colors.amber,
                  child: Icon(Icons.add, color: Colors.black),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CreateAlunoScreen(),
                      ),
                    ).then((_) => buscarAlunos());
                  },
                )
              : null,
    );
  }
}