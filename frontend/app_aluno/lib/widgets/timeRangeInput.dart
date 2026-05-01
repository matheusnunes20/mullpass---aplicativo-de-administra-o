import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TimeRangeInput extends StatelessWidget {
  final TextEditingController inicioController;
  final TextEditingController fimController;

  TimeRangeInput({
    required this.inicioController,
    required this.fimController,
  });

  Widget campo(
    TextEditingController controller,
    String label, {
    IconData? icon,
  }) {
    return Expanded(
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        inputFormatters: [
          FilteringTextInputFormatter.digitsOnly,
          LengthLimitingTextInputFormatter(2), // 🔥 limita até 2 dígitos (ex: 18)
        ],
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
    return Row(
      children: [
        campo(
          inicioController,
          'De (ex: 18)',
          icon: Icons.access_time,
        ),
        SizedBox(width: 10),
        campo(
          fimController,
          'Até (ex: 23)',
        ),
      ],
    );
  }
}