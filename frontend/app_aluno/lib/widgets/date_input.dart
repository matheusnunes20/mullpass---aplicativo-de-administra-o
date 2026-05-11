import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class DateInput extends StatelessWidget {
  final TextEditingController controller;
  final String label;

  DateInput({
    required this.controller,
    this.label = 'Data (YYYY-MM-DD)',
  });

  String formatarData(String value) {
    value = value.replaceAll(RegExp(r'[^0-9]'), '');

    if (value.length > 4) {
      value = value.substring(0, 4) + '-' + value.substring(4);
    }
    if (value.length > 7) {
      value = value.substring(0, 7) + '-' + value.substring(7);
    }

    return value.length > 10 ? value.substring(0, 10) : value;
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
      ],
      onChanged: (value) {
        final formatted = formatarData(value);
        controller.value = TextEditingValue(
          text: formatted,
          selection: TextSelection.collapsed(offset: formatted.length),
        );
      },
      decoration: InputDecoration(
        prefixIcon: Icon(Icons.calendar_today),
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    );
  }
}