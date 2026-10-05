import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface NetworkStatusBarProps {
  isConnected: boolean | null;
}

export function NetworkStatusBar({ isConnected }: NetworkStatusBarProps) {
  if (isConnected === true || isConnected === null) return null;

  return (
    <Animated.View style={styles.container}>
      <Text style={styles.text}>Интернет байланысы жоқ. Қосыңыз 🌐</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#ef4444', // Red-500
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#b91c1c',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
