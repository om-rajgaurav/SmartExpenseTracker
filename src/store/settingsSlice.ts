import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SettingsState {
  hasCompletedOnboarding: boolean;
  hasSMSPermission: boolean;
  currency: string;
}

const initialState: SettingsState = {
  hasCompletedOnboarding: false,
  hasSMSPermission: false,
  currency: 'INR',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.hasCompletedOnboarding = action.payload;
    },
    setSMSPermission: (state, action: PayloadAction<boolean>) => {
      state.hasSMSPermission = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
  },
});

export const {setOnboardingComplete, setSMSPermission, setCurrency} =
  settingsSlice.actions;

export default settingsSlice.reducer;
