import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CreateRachaScreen extends StatefulWidget {
  final String token;

  CreateRachaScreen({required this.token});

  @override
  _CreateRachaScreenState createState() => _CreateRachaScreenState();
}

class _CreateRachaScreenState extends State<CreateRachaScreen> {
  final dataController = TextEditingController();
  final localController = TextEditingController();
  final limiteController = TextEditingController();

  String hora = '18h às 19h';
  String quadra = 'Quadra 1';
  String tipo = 'misto';

  bool loading = false;

  Future<void> criarRacha() async {
    if (dataController.text.isEmpty ||
        localController.text.isEmpty ||
        limiteController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Preencha todos os campos obrigatórios')),
      );
      return;
    }

    if (int.tryParse(limiteController.text) == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Limite deve ser um número válido')),
      );
      return;
    }

    setState(() => loading = true);

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/rachas'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'data': dataController.text,
          'hora': hora,
          'local': localController.text,
          'quadra': quadra,
          'limite': int.parse(limiteController.text),
          'tipo': tipo,
        }),
      );

      setState(() => loading = false);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Racha criado com sucesso')),
        );

        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response.body)),
        );
      }
    } catch (e) {
      setState(() => loading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro de conexão com servidor')),
      );
    }
  }

  Widget campo(
    TextEditingController controller,
    String label, {
    TextInputType? keyboardType,
    IconData? icon,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          prefixIcon: icon != null ? Icon(icon) : null,
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }

  Widget dropdown({
    required String label,
    required String value,
    required List<DropdownMenuItem<String>> items,
    required Function(String?) onChanged,
    IconData? icon,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<String>(
        value: value,
        items: items,
        onChanged: onChanged,
        decoration: InputDecoration(
          prefixIcon: icon != null ? Icon(icon) : null,
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text('Criar Racha / Day Use'),
        centerTitle: true,
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(18),
        child: Column(
          children: [
            Image.asset(
              'assets/logoMull.png',
              height: 90,
            ),

            SizedBox(height: 20),

            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Informações do Racha',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    SizedBox(height: 18),

                    campo(
                      dataController,
                      'Data (YYYY-MM-DD)',
                      icon: Icons.calendar_today,
                    ),

                    dropdown(
                      label: 'Horário',
                      value: hora,
                      icon: Icons.access_time,
                      items: [
                        DropdownMenuItem(
                          value: '18h às 19h',
                          child: Text('18h às 19h'),
                        ),
                        DropdownMenuItem(
                          value: '19h às 20h',
                          child: Text('19h às 20h'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() => hora = value!);
                      },
                    ),

                    campo(
                      localController,
                      'Local',
                      icon: Icons.location_on,
                    ),

                    dropdown(
                      label: 'Quadra',
                      value: quadra,
                      icon: Icons.sports_volleyball,
                      items: [
                        DropdownMenuItem(
                          value: 'Quadra 1',
                          child: Text('Quadra 1'),
                        ),
                        DropdownMenuItem(
                          value: 'Quadra 2',
                          child: Text('Quadra 2'),
                        ),
                        DropdownMenuItem(
                          value: 'Quadra 3',
                          child: Text('Quadra 3'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() => quadra = value!);
                      },
                    ),

                    campo(
                      limiteController,
                      'Quantidade máxima de pessoas',
                      keyboardType: TextInputType.number,
                      icon: Icons.people,
                    ),

                    dropdown(
                      label: 'Tipo da lista',
                      value: tipo,
                      icon: Icons.group,
                      items: [
                        DropdownMenuItem(
                          value: 'misto',
                          child: Text('Misto'),
                        ),
                        DropdownMenuItem(
                          value: 'feminino',
                          child: Text('Somente feminino'),
                        ),
                      ],
                      onChanged: (value) {
                        setState(() => tipo = value!);
                      },
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 25),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: loading ? null : criarRacha,
                icon: loading
                    ? SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Icon(Icons.add),
                label: Text(loading ? 'Criando...' : 'Criar Racha'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}