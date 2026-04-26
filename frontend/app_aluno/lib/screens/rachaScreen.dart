import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'rachaPlayersScreen.dart';
import 'createRachaScreen.dart';

class RachaScreen extends StatefulWidget {
  final String token;
  final Map user;

  RachaScreen({required this.token, required this.user});

  @override
  _RachaScreenState createState() => _RachaScreenState();
}

class _RachaScreenState extends State<RachaScreen> {
  List rachas = [];

  @override
  void initState() {
    super.initState();
    buscarRachas();
  }

  Future<void> buscarRachas() async {
    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/rachas'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      if (response.statusCode == 200) {
        setState(() {
          rachas = jsonDecode(response.body);
        });
      } else {
        print('Erro ao buscar rachas: ${response.body}');
      }
    } catch (e) {
      print('Erro buscar rachas: $e');
    }
  }

  Future<void> entrarRacha(int id) async {
    final response = await http.post(
      Uri.parse('http://10.0.2.2:3000/rachas/entrar'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'racha_id': id}),
    );

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Entrou no racha')),
      );
      buscarRachas();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.body)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final podeCriarRacha =
        widget.user['tipo'] == 'funcionario' || widget.user['tipo'] == 'admin';

    return Scaffold(
      appBar: AppBar(
        title: Text('Rachas'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),

      floatingActionButton: podeCriarRacha
          ? FloatingActionButton(
              backgroundColor: Colors.amber,
              child: Icon(Icons.add, color: Colors.black),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CreateRachaScreen(token: widget.token),
                  ),
                ).then((_) => buscarRachas());
              },
            )
          : null,

      body: rachas.isEmpty
          ? Center(
              child: Text(
                'Nenhum racha criado ainda 😢',
                style: TextStyle(fontSize: 16),
              ),
            )
          : ListView.builder(
              itemCount: rachas.length,
              itemBuilder: (_, i) {
                final r = rachas[i];

                return Card(
                  elevation: 3,
                  margin: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.all(12),
                    title: Text(
                      '${r['local']} - ${r['quadra']}',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 5),
                        Text('📅 ${r['data']}'),
                        Text('⏰ ${r['hora']}'),
                        Text('👥 ${r['limite']} jogadores'),
                        Text('⚽ ${r['tipo']}'),
                      ],
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => RachaPlayersScreen(
                            token: widget.token,
                            rachaId: r['id'],
                            limite: r['limite'],
                          ),
                        ),
                      );
                    },
                    trailing: widget.user['tipo'] == 'aluno'
                        ? ElevatedButton(
                            onPressed: () => entrarRacha(r['id']),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                            child: Text('Entrar'),
                          )
                        : null,
                  ),
                );
              },
            ),
    );
  }
}