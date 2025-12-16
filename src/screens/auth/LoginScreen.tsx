import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');

    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email');
      return;
    }

    try {
      await signIn(email, password);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      setLocalError(error.message || 'Failed to sign in');
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'demo@adhdapp.com';
    const demoPassword = 'demo123456';

    setLocalError('');

    try {
      // Try to sign in first
      await signIn(demoEmail, demoPassword);
    } catch (error: any) {
      // If sign in fails, create the demo account
      try {
        await signUp(demoEmail, demoPassword, 'Demo User');
      } catch (signupError: any) {
        setLocalError('Failed to create demo account');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="displayMedium" style={styles.title}>
            ADHD Task Manager
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Welcome back! Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {(localError || error) && (
            <HelperText type="error" visible={true}>
              {localError || error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.textButton}
            disabled={loading}
          >
            Forgot Password?
          </Button>

          <Button
            mode="outlined"
            onPress={handleDemoLogin}
            style={styles.demoButton}
            loading={loading}
            disabled={loading}
            icon="flash"
          >
            Try Demo Mode
          </Button>

          <View style={styles.signupContainer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
              compact
            >
              Sign Up
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  textButton: {
    marginVertical: SPACING.xs,
  },
  demoButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
});
