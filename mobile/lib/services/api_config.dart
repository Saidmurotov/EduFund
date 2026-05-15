class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3001/api',
  );
  
  static const String grants = '$baseUrl/grants';
  static const String auth = '$baseUrl/auth';
  static const String users = '$baseUrl/users';
  static const String ai = '$baseUrl/ai';
}
