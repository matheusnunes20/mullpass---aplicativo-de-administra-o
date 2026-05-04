import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class FinanceiroScreen extends StatefulWidget {
  final String token;

  FinanceiroScreen({required this.token});

  @override
  _FinanceiroScreenState createState() => _FinanceiroScreenState();
}

class _FinanceiroScreenState extends State<FinanceiroScreen> {
  Map<String, dynamic>? dados;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      final res = await http.get(
        Uri.parse('https://mullpass--aplicativo-de-administra-o.onrender.com/financeiro/me'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

if (res.statusCode == 200) {
        final json = jsonDecode(res.body);

        setState(() {
          dados = Map<String, dynamic>.from(json);
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (e) {
      setState(() => loading = false);
    }
  }

  String formatarData(String? data) {
    if (data == null) return '-';
    try {
      final date = DateTime.parse(data);
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return data;
    }
  }

  Color corStatus(String status) {
    switch (status) {
      case 'pago':
        return Colors.green;
      case 'atrasado':
        return Colors.red;
      case 'pendente':
        return Colors.orange;
      case 'sem mensalidade':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  String textoStatus(String status) {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'atrasado':
        return 'Atrasado';
      case 'pendente':
        return 'Pendente';
      case 'sem mensalidade':
        return 'Sem mensalidade';
      default:
        return '---';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Financeiro'),
          backgroundColor: Colors.amber,
          foregroundColor: Colors.black,
        ),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (dados == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Financeiro')),
        body: Center(child: Text('Erro ao carregar dados')),
      );
    }

    final status = dados?['status']?.toString() ?? 'sem mensalidade';
    final valor = dados?['valor']?.toString() ?? '0';
    final plano = dados?['plano']?.toString() ?? '-';

    return Scaffold(
      appBar: AppBar(
        title: Text('Financeiro'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: Center(
        child: Card(
          elevation: 4,
          margin: EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),

                SizedBox(height: 8),

                Text(
                  textoStatus(status),
                  style: TextStyle(
                    fontSize: 22,
                    color: corStatus(status),
                    fontWeight: FontWeight.bold,
                  ),
                ),

                SizedBox(height: 16),

                Text('💰 Valor: R\$ $valor'),
                SizedBox(height: 8),

                Text(
                  '📅 Vencimento: ${formatarData(dados?['data_vencimento'])}',
                ),

                SizedBox(height: 8),

                Text('📌 Plano: $plano'),

                SizedBox(height: 16),

                if (status == 'atrasado')
                  Container(
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '⚠️ Vá até a recepção e renove sua mensalidade',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}