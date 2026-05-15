import 'package:flutter/material.dart';
import '../models/grant.dart';
import '../services/grant_service.dart';

class GrantProvider with ChangeNotifier {
  final GrantService _grantService = GrantService();
  List<Grant> _grants = [];
  bool _isLoading = false;
  String? _error;

  List<Grant> get grants => _grants;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadGrants({String? token}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _grants = await _grantService.fetchGrants(token: token);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
