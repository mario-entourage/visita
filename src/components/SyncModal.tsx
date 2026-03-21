import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';

export type SyncDirection = 'google-to-app' | 'app-to-google';
export type SyncWeek = 'this' | 'next';

interface SyncModalProps {
  visible: boolean;
  onClose: () => void;
  onSync: (direction: SyncDirection, week: SyncWeek) => void;
}

const OPTIONS: { direction: SyncDirection; week: SyncWeek; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { direction: 'google-to-app', week: 'this', label: 'Google → App: Esta semana', icon: 'download-outline' },
  { direction: 'google-to-app', week: 'next', label: 'Google → App: Próxima semana', icon: 'download-outline' },
  { direction: 'app-to-google', week: 'this', label: 'App → Google: Esta semana', icon: 'cloud-upload-outline' },
  { direction: 'app-to-google', week: 'next', label: 'App → Google: Próxima semana', icon: 'cloud-upload-outline' },
];

export function SyncModal({ visible, onClose, onSync }: SyncModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Sincronizar Agenda</Text>

          {OPTIONS.map((opt) => (
            <Pressable
              key={`${opt.direction}-${opt.week}`}
              style={styles.row}
              onPress={() => {
                onClose();
                onSync(opt.direction, opt.week);
              }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={opt.icon} size={20} color={C.teal} />
              </View>
              <Text style={styles.rowText}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.textLight} />
            </Pressable>
          ))}

          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e6f4f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textMuted,
  },
});
