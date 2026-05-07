import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'screens/loginScreen.dart';
import 'screens/dashboardScreen.dart';

import 'config/api.dart';

void main() {

  runApp(MyApp());
}

class MyApp extends StatelessWidget {

  final String baseUrl =
      Api.baseUrl;

  /**
   * 🔑 BUSCAR TOKEN
   */
  Future<String?> getToken() async {

    final prefs =
        await SharedPreferences.getInstance();

    return prefs.getString('token');
  }

  /**
   * 🧹 LIMPAR TOKEN
   */
  Future<void> limparToken() async {

    final prefs =
        await SharedPreferences.getInstance();

    await prefs.remove('token');
  }

  /**
   * 👤 BUSCAR USUÁRIO
   */
  Future<Map?> buscarUsuario(
    String token,
  ) async {

    try {

      final response = await http.get(

        Uri.parse(
          '$baseUrl/usuarios/me',
        ),

        headers: {
          'Authorization':
              'Bearer $token',
        },
      );

      if (response.statusCode == 200) {

        return jsonDecode(
          response.body,
        );
      }

      return null;

    } catch (e) {

      print(
        'ERRO USER: $e',
      );

      return null;
    }
  }

  @override
  Widget build(BuildContext context) {

    return MaterialApp(

      debugShowCheckedModeBanner:
          false,

      title: 'Arena Mull Beach',

      theme: ThemeData(

        primaryColor:
            Color(0xFFFFC107),

        scaffoldBackgroundColor:
            Colors.grey[100],

        appBarTheme: AppBarTheme(

          backgroundColor:
              Color(0xFFFFC107),

          foregroundColor:
              Colors.black,

          elevation: 2,

          centerTitle: true,
        ),

        elevatedButtonTheme:
            ElevatedButtonThemeData(

          style:
              ElevatedButton.styleFrom(

            backgroundColor:
                Colors.black,

            foregroundColor:
                Colors.white,

            padding:
                EdgeInsets.symmetric(
              vertical: 16,
            ),

            shape:
                RoundedRectangleBorder(

              borderRadius:
                  BorderRadius.circular(
                10,
              ),
            ),
          ),
        ),

        inputDecorationTheme:
            InputDecorationTheme(

          border:
              OutlineInputBorder(

            borderRadius:
                BorderRadius.circular(
              10,
            ),
          ),
        ),
      ),

      home: FutureBuilder<String?>(

        future: getToken(),

        builder: (context, snapshot) {

          /**
           * ⏳ LOADING
           */
          if (snapshot.connectionState ==
              ConnectionState.waiting) {

            return Scaffold(

              body: Center(

                child:
                    CircularProgressIndicator(

                  color:
                      Color(0xFFFFC107),
                ),
              ),
            );
          }

          /**
           * 🔑 TOKEN EXISTE
           */
          if (snapshot.hasData &&
              snapshot.data != null &&
              snapshot.data!.isNotEmpty) {

            final token =
                snapshot.data!;

            return FutureBuilder<Map?>(

              future:
                  buscarUsuario(token),

              builder:
                  (context, userSnap) {

                /**
                 * ⏳ LOADING USER
                 */
                if (userSnap.connectionState ==
                    ConnectionState.waiting) {

                  return Scaffold(

                    body: Center(

                      child:
                          CircularProgressIndicator(

                        color:
                            Color(0xFFFFC107),
                      ),
                    ),
                  );
                }

                /**
                 * 👤 USER OK
                 */
                if (userSnap.hasData &&
                    userSnap.data != null) {

                  return DashboardScreen(

                    token: token,

                    user:
                        userSnap.data!,
                  );
                }

                /**
                 * ❌ TOKEN INVÁLIDO
                 */
                limparToken();

                return LoginScreen();
              },
            );
          }

          /**
           * 🚪 SEM LOGIN
           */
          return LoginScreen();
        },
      ),
    );
  }
}