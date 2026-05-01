import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';

const LoginPage = () => {
  const [role, setRole] = useState('Patient');

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>♡</Text>
        <Text style={styles.logoText}>MediConnect</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to manage your appointments, view test results, and connect with your healthcare team.
        </Text>

        {/* Role Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, role === 'Patient' && styles.activeToggle]}
            onPress={() => setRole('Patient')}
          >
            <Text style={[styles.toggleText, role === 'Patient' && styles.activeToggleText]}>Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, role === 'Doctor' && styles.activeToggle]}
            onPress={() => setRole('Doctor')}
          >
            <Text style={[styles.toggleText, role === 'Doctor' && styles.activeToggleText]}>Doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Email Address */}
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>✉️</Text>
          <TextInput 
            style={styles.input} 
            placeholder="name@example.com" 
            placeholderTextColor="#A0AAB5"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.passwordHeader}>
          <Text style={styles.label}>PASSWORD</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Forgot?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            placeholderTextColor="#A0AAB5"
            secureTextEntry
          />
        </View>

      {/* This should be the reusable button */}
        {/* Log In Button */}
        <TouchableOpacity style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Log in</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default LoginPage;   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 28,
    color: '#1D4ED8',
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#1D4ED8',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 48,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
    color: '#9CA3AF',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: '#1D4ED8',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#9CA3AF',
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    height: 48,
  },
  googleIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});