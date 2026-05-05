import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RachaPlayersScreen extends StatefulWidget {
  final String token;
  final int rachaId;
  final int limite;

  RachaPlayersScreen({
    required this.token,
    required this.rachaId,
    required this.limite,
  });

  @override
  _RachaPlayersScreenState createState() => _RachaPlayersScreenState();
}

class _RachaPlayersScreenState extends State<RachaPlayersScreen> {

  // ✅ BASE URL CORRETA
  final String baseUrl =
      "https://mullpass-aplicativo-de-administra-o.onrender.com";

  List jogadores = [];

  @override
  void initState() {
    super.initState();
    buscarJogadores();
  }

  Future<void> buscarJogadores() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/rachas/${widget.rachaId}/jogadores'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
        },
      );

      print('PLAYERS STATUS: ${response.statusCode}');
      print('PLAYERS BODY: ${response.body}');

      if (response.statusCode == 200) {
        setState(() {
          jogadores = jsonDecode(response.body);
        });
      }
    } catch (e) {
      print('ERRO PLAYERS: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lista de Jogadores'),
        backgroundColor: Colors.amber,
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(15),
            color: Colors.black87,
            child: Text(
              'Jogadores: ${jogadores.length}/${widget.limite}',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),

          Expanded(
            child: ListView.builder(
              itemCount: jogadores.length,
              itemBuilder: (_, i) {
                final j = jogadores[i];
                final nome = j['nome']?.toString() ?? '-';

                return Card(
                  margin: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.amber,
                      child: Text(
                        nome.isNotEmpty ? nome[0] : '?',
                        style: TextStyle(color: Colors.black),
                      ),
                    ),
                    title: Text(nome),
                    subtitle: Text(j['telefone'] ?? ''),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}