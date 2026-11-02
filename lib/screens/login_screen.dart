import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';
import 'register_screen.dart';
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, this.firebaseUnavailable = false});
  final bool firebaseUnavailable;
  @override State<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>(); final _email = TextEditingController(); final _password = TextEditingController();
  bool _loading = false, _hide = true;
  @override void dispose() { _email.dispose(); _password.dispose(); super.dispose(); }
  void _message(String s) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  Future<void> _login() async {
    if (widget.firebaseUnavailable) { _message('Configure Firebase first. See README_SETUP.md.'); return; }
    if (!_form.currentState!.validate()) return; setState(() => _loading = true);
    try { await AuthService().login(email: _email.text, password: _password.text); if (!mounted) return;
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomeScreen()), (_) => false);
    } on FirebaseAuthException catch (e) { _message(e.message ?? 'Login failed.'); }
    catch (e) { _message('Login failed: $e'); } finally { if (mounted) setState(() => _loading = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('RouteMitra')), body: Center(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 440), child: Form(key: _form, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
    const Icon(Icons.route_rounded, size: 64, color: Color(0xFF176B87)), const SizedBox(height: 12),
    Text('Welcome back', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
    const SizedBox(height: 18),
    if (widget.firebaseUnavailable) const Text('Firebase is not configured. Run flutterfire configure and replace firebase_options.dart.', style: TextStyle(color: Colors.red)),
    TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email'), validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null),
    const SizedBox(height: 12),
    TextFormField(controller: _password, obscureText: _hide, decoration: InputDecoration(labelText: 'Password', suffixIcon: IconButton(onPressed: () => setState(() => _hide = !_hide), icon: Icon(_hide ? Icons.visibility : Icons.visibility_off))), validator: (v) => v == null || v.length < 6 ? 'Use at least 6 characters' : null),
    const SizedBox(height: 18),
    FilledButton(onPressed: _loading ? null : _login, child: Text(_loading ? 'Signing in...' : 'Sign in')),
    TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())), child: const Text('Create account'))
  ]))))));
}
