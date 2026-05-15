import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/grant.dart';
import 'api_config.dart';

class GrantService {
  Future<List<Grant>> fetchGrants({String? token}) async {
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.grants),
        headers: {
          if (token != null) 'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> body = jsonDecode(response.body);
        return body.map((dynamic item) => Grant.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load grants: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Grant> fetchGrantById(String id, {String? token}) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.grants}/$id'),
      headers: {
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return Grant.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load grant');
    }
  }
}
