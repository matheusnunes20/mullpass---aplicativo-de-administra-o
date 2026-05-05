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

  // ✅ BASE URL CORRETA
  final String baseUrl =
      "https://mullpass-aplicativo-de-administra-o.onrender.com";

  List rachas = [];

  @override
  void initState() {
    super.initState();
    buscarRachas();
  }

  Future<void> buscarRachas() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rachas'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      print('RACHAS STATUS: ${response.statusCode}');
      print('RACHAS BODY: ${response.body}');

      if (response.statusCode == 200) {
        setState(() {
          rachas = jsonDecode(response.body);
        });
      }
    } catch (e) {
      print('ERRO RACHAS: $e');
    }
  }

  Future<void> entrarRacha(int id) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/rachas/entrar'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'racha_id': id}),
      );

      print('ENTRAR STATUS: ${response.statusCode}');
      print('ENTRAR BODY: ${response.body}');

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
    } catch (e) {
      print('ERRO ENTRAR: $e');
    }
  }

  Future<void> deletarRacha(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/rachas/$id'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      print('DELETE STATUS: ${response.statusCode}');
      print('DELETE BODY: ${response.body}');

      if (response.statusCode == 200) {
        buscarRachas();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Racha excluído')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.body)),
        );
      }
    } catch (e) {
      print('ERRO DELETE: $e');
    }
  }

  void confirmarDelete(int id) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Excluir racha'),
        content: Text('Deseja realmente excluir este racha?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              deletarRacha(id);
            },
            child: Text(
              'Excluir',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final podeCriarRacha =
        widget.user['tipo'] == 'funcionario' ||
        widget.user['tipo'] == 'admin';

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
          ? Center(child: Text('Nenhum racha criado ainda 😢'))
          : ListView.builder(
              itemCount: rachas.length,
              itemBuilder: (_, i) {
                final r = rachas[i];

                final isDono = widget.user['id'].toString() == r['criado_por'].toString();
                final isAdmin = widget.user['tipo'] == 'admin';

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

                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [

                        if (widget.user['tipo'] == 'aluno')
                          ElevatedButton(
                            onPressed: () => entrarRacha(r['id']),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                            child: Text('Entrar'),
                          ),

                        if (isDono || isAdmin)
                          IconButton(
                            icon: Icon(Icons.delete, color: Colors.red),
                            onPressed: () => confirmarDelete(r['id']),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}