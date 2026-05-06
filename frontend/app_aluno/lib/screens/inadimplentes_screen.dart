import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart'; // ✅ NOVO
import '../config/api.dart';

class InadimplentesScreen extends StatefulWidget {
  final String token;

  const InadimplentesScreen({required this.token});

  @override
  State<InadimplentesScreen> createState() => _InadimplentesScreenState();
}

class _InadimplentesScreenState extends State<InadimplentesScreen> {

  final String baseUrl = Api.baseUrl;

  List inadimplentes = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      final res = await http.get(
        Uri.parse("$baseUrl/financeiro/inadimplentes"),
        headers: {
          "Authorization": "Bearer ${widget.token}"
        },
      );

      if (res.statusCode == 200) {
        setState(() {
          inadimplentes = jsonDecode(res.body);
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }

    } catch (e) {
      print("ERRO INADIMPLENTES: $e");
      setState(() => loading = false);
    }
  }

  // 🔥 FUNÇÃO WHATSAPP
  Future<void> abrirWhatsApp(String telefone, String nome, int dias) async {

    if (telefone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Aluno sem telefone cadastrado")),
      );
      return;
    }

    final mensagem = Uri.encodeComponent(
      "Olá $nome! 👋\n\n"
      "Identificamos que sua mensalidade está em atraso há $dias dias.\n\n"
      "Por favor, procure a recepção para regularizar.\n\n"
      "Arena Mull 💰"
    );

    final url = "https://wa.me/$telefone?text=$mensagem";
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      print("Erro ao abrir WhatsApp");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Inadimplentes"),
        backgroundColor: Colors.red,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : inadimplentes.isEmpty
              ? Center(child: Text("Nenhum inadimplente 🎉"))
              : ListView.builder(
                  itemCount: inadimplentes.length,
                  itemBuilder: (_, i) {
                    final item = inadimplentes[i];

                    return Card(
                      margin: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: ListTile(
                        leading: Icon(Icons.warning, color: Colors.red),

                        title: Text(item['nome'] ?? 'Sem nome'),

                        subtitle: Text(
                          "Vencimento: ${item['data_vencimento']}",
                        ),

                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [

                            Text(
                              "${item['dias_atraso']} dias",
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            SizedBox(width: 10),

                            IconButton(
                              icon: Icon(Icons.message, color: Colors.green),
                              onPressed: () {
                                abrirWhatsApp(
                                  item['telefone'] ?? '',
                                  item['nome'] ?? '',
                                  item['dias_atraso'] ?? 0,
                                );
                              },
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