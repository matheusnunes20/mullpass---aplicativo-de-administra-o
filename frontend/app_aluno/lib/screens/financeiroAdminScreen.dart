import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';

class FinanceiroAdminScreen extends StatefulWidget {
  final String token;

  FinanceiroAdminScreen({required this.token});

  @override
  _FinanceiroAdminScreenState createState() =>
      _FinanceiroAdminScreenState();
}

class _FinanceiroAdminScreenState extends State<FinanceiroAdminScreen> {
  List<Map<String, dynamic>> alunos = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      final res = await http.get(
        Uri.parse('http://10.0.2.2:3000/financeiro/alunos'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);

        setState(() {
          alunos = List<Map<String, dynamic>>.from(data);
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (e) {
      print('Erro financeiro admin: $e');
      setState(() => loading = false);
    }
  }

  Future<void> pagar(int id) async {
    try {
      final res = await http.put(
        Uri.parse('http://10.0.2.2:3000/financeiro/pagar/$id'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pagamento registrado')),
        );
        carregar();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res.body.isNotEmpty ? res.body : 'Erro ao pagar')),
        );
      }
    } catch (e) {
      print('Erro ao pagar: $e');
    }
  }

  Color cor(String status) {
    switch (status) {
      case 'pago':
        return Colors.green;
      case 'atrasado':
        return Colors.red;
      case 'pendente':
        return Colors.orange;
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
      default:
        return 'Sem mensalidade';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Financeiro Admin'),
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : alunos.isEmpty
              ? Center(child: Text('Nenhum aluno encontrado'))
              : ListView.builder(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  itemCount: alunos.length,
                  itemBuilder: (_, i) {
                    final a = alunos[i];

                    final status = (a['status'] ?? '').toString();
                    final valor = a['valor']?.toString() ?? '-';
                    final plano = a['plano']?.toString() ?? '-';
                    final mensalidadeId = a['mensalidade_id'];

                    return Card(
                      margin: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      elevation: 3,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(14),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    a['nome']?.toString() ?? '-',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    '💰 R\$ $valor',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  SizedBox(height: 3),
                                  Text('📅 ${formatarData(a['data_vencimento'])}'),
                                  SizedBox(height: 3),
                                  Text('📌 $plano'),
                                ],
                              ),
                            ),

                            SizedBox(width: 12),

                            Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: cor(status).withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    textoStatus(status),
                                    style: TextStyle(
                                      color: cor(status),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),

                                if (status != 'pago' && mensalidadeId != null) ...[
                                  SizedBox(height: 10),
                                  SizedBox(
                                    height: 34,
                                    child: ElevatedButton.icon(
                                      onPressed: () => pagar(mensalidadeId),
                                      icon: Icon(Icons.check, size: 15),
                                      label: Text(
                                        'Pagar',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        foregroundColor: Colors.white,
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 0,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
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