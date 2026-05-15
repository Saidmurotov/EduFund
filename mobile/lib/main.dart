import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/grant_provider.dart';
import 'screens/main_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GrantProvider()),
      ],
      child: const EduFundApp(),
    ),
  );
}

class EduFundApp extends StatelessWidget {
  const EduFundApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EduFund',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/home': (context) => const MainScreen(),
      },
    );
  }
}
