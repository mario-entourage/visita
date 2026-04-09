/**
 * DateField — platform-aware date picker
 *
 * Web:    styled Pressable that opens a hidden <input type="date"> via .showPicker()
 * Native: @react-native-community/datetimepicker
 *
 * Props match a minimal controlled-component API:
 *   value    — JS Date (never undefined after form init with defaultValues)
 *   onChange — called with the new Date
 *   maxDate  — upper bound (defaults to today, enforced by UI only; Firestore rule is
 *              the server-side guard)
 *   label    — optional label rendered above the field
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme';

// Native-only import — bundler tree-shakes this on web
let DateTimePicker: React.ComponentType<{
  value: Date;
  mode: 'date';
  display?: string;
  maximumDate?: Date;
  onChange: (event: unknown, date?: Date) => void;
}> | null = null;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface DateFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  label?: string;
}

export function DateField({
  value,
  onChange,
  maxDate = new Date(),
  label,
}: DateFieldProps) {
  const displayStr = format(value, 'dd/MM/yyyy', { locale: ptBR });

  // ── Web ───────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return <WebDateField value={value} onChange={onChange} maxDate={maxDate} label={label} displayStr={displayStr} />;
  }

  // ── Native ────────────────────────────────────────────────────────────────
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {DateTimePicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={maxDate}
          onChange={(_event, date) => {
            if (date) onChange(date);
          }}
        />
      ) : null}
    </View>
  );
}

// ── Web sub-component ────────────────────────────────────────────────────────
// Kept in same file to avoid an extra module boundary; tree-shaken on native.

interface WebDateFieldProps extends DateFieldProps {
  displayStr: string;
}

function WebDateField({ value, onChange, maxDate, label, displayStr }: WebDateFieldProps) {
  // Ref typed as any — HTMLInputElement is not in React Native's type universe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  // YYYY-MM-DD string required by input[type=date]
  const isoDate = format(value, 'yyyy-MM-dd');
  const isoMax = format(maxDate ?? new Date(), 'yyyy-MM-dd');

  function handlePress() {
    if (!inputRef.current) return;
    try {
      // showPicker() requires a trusted user event context.
      // iOS Safari throws a DOMException if called outside one — catch + fallback.
      inputRef.current.showPicker();
    } catch {
      inputRef.current.focus();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value; // YYYY-MM-DD string
    if (!raw) return;
    // Append local time to avoid UTC-midnight parse (which shifts the day in UTC- timezones)
    const parsed = new Date(raw + 'T00:00:00');
    if (!isNaN(parsed.getTime())) onChange(parsed);
  }

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {/* position:relative wrapper so the absolutely-positioned input stacks under the Pressable */}
      <View style={styles.webWrapper}>
        <Pressable style={styles.webPressable} onPress={handlePress}>
          <Text style={styles.webDateText}>{displayStr}</Text>
          <Ionicons name="chevron-down" size={14} color={C.textMuted} />
        </Pressable>
        {/* Hidden input — opacity:0 so it's invisible but still receives native date picker */}
        <input
          ref={inputRef}
          type="date"
          value={isoDate}
          max={isoMax}
          onChange={handleChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            pointerEvents: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  // Native: DateTimePicker renders its own UI
  // Web wrappers:
  webWrapper: {
    position: 'relative',
  } as never,
  webPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  webDateText: {
    fontSize: 14,
    color: C.text,
  },
});
