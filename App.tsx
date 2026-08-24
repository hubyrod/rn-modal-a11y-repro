import React, {useState} from 'react';
import {
  LogBox,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Keep the LogBox toast window out of the way: it overlaps the bottom sheet
// and swallows AX-driven taps aimed at the modal's close button.
LogBox.ignoreAllLogs();

// Minimal reproducer for: modal content missing from the iOS accessibility
// tree after repeated present/dismiss cycles driven by accessibility taps
// (XCUITest/Maestro). New architecture (Fabric), RN 0.86.2.
// Modal shape mirrors a production action-sheet: transparent, slide
// animation, statusBarTranslucent, tappable backdrop, accessible={false}
// on the containers so rows stay individual AX elements.
export default function App() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.root}>
      <Text testID="counter" style={styles.text}>
        presentations: {count}
      </Text>
      <Pressable
        testID="open"
        accessibilityRole="button"
        style={styles.btn}
        onPress={() => {
          setOpen(true);
          setCount(c => c + 1);
        }}>
        <Text style={styles.text}>OPEN</Text>
      </Pressable>
      <Modal
        transparent
        visible={open}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <Pressable
          accessible={false}
          style={styles.backdrop}
          onPress={() => setOpen(false)}>
          <Pressable accessible={false} style={styles.sheet}>
            <Text style={styles.text}>MODAL CONTENT</Text>
            <Pressable
              testID="close"
              accessibilityRole="button"
              style={styles.btn}
              onPress={() => setOpen(false)}>
              <Text style={styles.text}>CLOSE</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24},
  btn: {
    backgroundColor: '#ddd',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  text: {fontSize: 20},
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 32,
    gap: 24,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
