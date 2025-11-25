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
      validateOnMount={false} // ✅ FIX: No initial validation
      validateOnChange={false}
      validateOnBlur={true}
      onSubmit={(values, { resetForm }) => onSubmit(values, resetForm)}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
      }) => (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >

          {/* CATEGORY */}
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => !loading && setShowCategoryModal(true)}
            >
              <TextInput
                label="Category *"
                value={values.category}
                editable={false}
                mode="outlined"
                right={<TextInput.Icon icon="chevron-down" />}
                error={touched.category && !!errors.category}
                style={styles.input}
              />
            </TouchableOpacity>

            <HelperText type="error" visible={touched.category && !!errors.category}>
              {errors.category}
            </HelperText>

            {/* CATEGORY MODAL */}
            <Modal
              transparent
              animationType="slide"
              visible={showCategoryModal}
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                  <Text variant="titleMedium" style={styles.modalTitle}>
                    Select Category
                  </Text>

                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          setFieldValue('category', item);
                          setShowCategoryModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />

                  <Button
                    mode="outlined"
                    onPress={() => setShowCategoryModal(false)}
                    style={styles.modalCloseBtn}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            </Modal>
          </View>

          {/* AMOUNT */}
          <View style={styles.fieldContainer}>
            <TextInput
              label="Amount *"
              value={values.amount}
              onChangeText={handleChange('amount')}
              onBlur={handleBlur('amount')}
              keyboardType="decimal-pad"
              editable={!loading}
              left={<TextInput.Affix text="₹" />}
              error={touched.amount && !!errors.amount}
              mode="outlined"
              style={styles.input}
            />
            <HelperText type="error" visible={touched.amount && !!errors.amount}>
              {errors.amount}
            </HelperText>
          </View>

          {/* DATE */}
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (!loading) {
                  setShowDatePicker(true);
                  setFieldTouched('date', true); // mark as touched only on click
                }
              }}
            >
              <TextInput
                label="Date *"
                value={formatDate(values.date)}
                editable={false}
                mode="outlined"
                right={<TextInput.Icon icon="calendar" />}
                error={touched.date && !!errors.date}
                style={styles.input}
              />
            </TouchableOpacity>

            <HelperText type="error" visible={touched.date && !!errors.date}>
              {errors.date}
            </HelperText>

            {showDatePicker && (
              <DateTimePicker
                value={values.date}
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

          {/* NOTES */}
          <View style={styles.fieldContainer}>
            <TextInput
              label="Notes (Optional)"
              value={values.notes}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              mode="outlined"
              multiline
              numberOfLines={4}
              editable={!loading}
              error={touched.notes && !!errors.notes}
              style={[styles.input, styles.notesInput]}
            />
            <HelperText type="info">{values.notes.length}/200 characters</HelperText>
            <HelperText type="error" visible={touched.notes && !!errors.notes}>
              {errors.notes}
            </HelperText>
          </View>

          {/* SUBMIT */}
          <Button
            mode="contained"
            onPress={() => handleSubmit()}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
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
