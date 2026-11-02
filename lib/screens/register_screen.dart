import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';
class RegisterScreen extends StatefulWidget { const RegisterScreen({super.key}); @override State<RegisterScreen> createState() => _RegisterScreenState(); }
class _RegisterScreenState extends State<RegisterScreen> {
  final _form = GlobalKey<FormState>(); final _name = TextEditingController(); final _email = TextEditingController(); final _phone = TextEditingController(); final _password = TextEditingController(); bool _loading = false, _hide = true;
  @override void dispose() { _name.dispose(); _email.dispose(); _phone.dispose(); _password.dispose(); super.dispose(); }
  void _message(String s) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  Future<void> _register() async {
    if (!_form.currentState!.validate()) return; setState(() => _loading = true);
    try { await AuthService().register(name: _name.text, email: _email.text, phone: _phone.text, password: _password.text); if (!mounted) return;
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomeScreen()), (_) => false);
    } on FirebaseAuthException catch (e) { _message(e.message ?? 'Registration failed.'); }
    catch (e) { _message('Registration failed: $e'); } finally { if (mounted) setState(() => _loading = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Create account')), body: Center(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 440), child: Form(key: _form, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
    Text('Join RouteMitra', style: Theme.of(context).textTheme.headlineMedium), const SizedBox(height: 18),
    TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Full name'), validator: (v) => v == null || v.trim().isEmpty ? 'Enter your name' : null),
    const SizedBox(height: 12), TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email'), validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null),
    const SizedBox(height: 12), TextFormField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone (optional)')),
    const SizedBox(height: 12), TextFormField(controller: _password, obscureText: _hide, decoration: InputDecoration(labelText: 'Password (min 6 characters)', suffixIcon: IconButton(onPressed: () => setState(() => _hide = !_hide), icon: Icon(_hide ? Icons.visibility : Icons.visibility_off))), validator: (v) => v == null || v.length < 6 ? 'Use at least 6 characters' : null),
    const SizedBox(height: 18), FilledButton(onPressed: _loading ? null : _register, child: Text(_loading ? 'Creating...' : 'Create account'))
  ]))))));
}
