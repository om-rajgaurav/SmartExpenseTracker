import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  Text,
  Divider,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Category } from '../types';
import { theme, colors } from '../theme/theme';
import { formatDate } from '../utils/helpers';

interface ExpenseFormValues {
  category: Category | '';
  amount: string;
  date: Date;
  notes: string;
}

interface ExpenseFormProps {
  onSubmit: (values: ExpenseFormValues, resetForm: () => void) => void;
  loading?: boolean;
}

const categories: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Others',
];

const validationSchema = Yup.object().shape({
  category: Yup.string()
    .oneOf(categories, 'Please select a valid category')
    .required('Category is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be a positive number')
    .max(9999999.99, 'Amount is too large')
    .required('Amount is required')
    .test(
      'decimal-places',
      'Amount can have maximum 2 decimal places',
      value => {
        if (value === undefined || value === null) return true;
        const decimalPart = value.toString().split('.')[1];
        return !decimalPart || decimalPart.length <= 2;
      },
    ),

  // ✅ FIXED DATE VALIDATION
  date: Yup.date()
    .nullable()
    .required('Date is required')
    .test('not-future', 'Date cannot be in the future', function (value) {
      if (!value) return true;

      const today = new Date();
      const picked = new Date(value);

      return (
        picked.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)
      );
    }),

  notes: Yup.string().max(200, 'Notes cannot exceed 200 characters'),
});

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const initialValues: ExpenseFormValues = {
    category: '',
    amount: '',
    date: new Date(),
    notes: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={true}
      onSubmit={(values, { resetForm }) => {
        onSubmit(values, resetForm);
      }}>
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        handleSubmit,
        setFieldTouched,
      }) => (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          {/* ✅ Category Picker Modal */}
         <View style={styles.fieldContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (!loading) {
                  setShowDatePicker(true);
                  setFieldTouched('date', true);
                }
              }}>
              <TextInput
                label="Date *"
                value={formatDate(values.date)}
                editable={false}
                error={touched.date && !!errors.date}
                right={<TextInput.Icon icon="calendar" />}
                mode="outlined"
                style={styles.input}
              />
            </TouchableOpacity>

            <HelperText type="error" visible={touched.date && !!errors.date}>
              {typeof errors.date === 'string' ? errors.date : 'Invalid date'}
            </HelperText>

            {showDatePicker && (
              <DateTimePicker
                value={values.date || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFieldValue('date', selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Amount Input */}
          <View style={styles.fieldContainer}>
            <TextInput
              label="Amount *"
              value={values.amount}
              onChangeText={handleChange('amount')}
              onBlur={handleBlur('amount')}
              keyboardType="decimal-pad"
              editable={!loading}
              error={touched.amount && !!errors.amount}
              left={<TextInput.Affix text="₹" />}
              mode="outlined"
              style={styles.input}
            />
            <HelperText type="error" visible={touched.amount && !!errors.amount}>
              {errors.amount}
            </HelperText>
          </View>

          {/* ✅ Date Picker */}
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => !loading && setShowDatePicker(true)}>
              <TextInput
                label="Date *"
                value={formatDate(values.date)}
                editable={false}
                error={touched.date && !!errors.date}
                right={<TextInput.Icon icon="calendar" />}
                mode="outlined"
                style={styles.input}
              />
            </TouchableOpacity>

            <HelperText type="error" visible={touched.date && !!errors.date}>
              {typeof errors.date === 'string' ? errors.date : 'Invalid date'}
            </HelperText>

            {showDatePicker && (
              <DateTimePicker
                value={values.date || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFieldValue('date', selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.fieldContainer}>
            <TextInput
              label="Notes (Optional)"
              value={values.notes}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              multiline
              numberOfLines={4}
              editable={!loading}
              error={touched.notes && !!errors.notes}
              mode="outlined"
              style={[styles.input, styles.notesInput]}
            />
            <HelperText type="info" visible={!errors.notes}>
              {values.notes.length}/200 characters
            </HelperText>
            <HelperText
              type="error"
              visible={touched.notes && !!errors.notes}>
              {errors.notes}
            </HelperText>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={() => handleSubmit()}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}>
            Add Expense
          </Button>

          <Text variant="bodySmall" style={styles.requiredNote}>
            * Required fields
          </Text>
        </ScrollView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },
  fieldContainer: { marginBottom: 8 },
  input: { backgroundColor: colors.surface },
  notesInput: { minHeight: 100 },
  submitButton: { marginTop: 16, marginBottom: 8 },
  requiredNote: { textAlign: 'center', color: colors.disabled, marginTop: 8 },

  // ✅ Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseBtn: {
    marginTop: 12,
  },
});
