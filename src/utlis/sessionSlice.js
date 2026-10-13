import { createSlice } from '@reduxjs/toolkit';
import { removeUser } from './userSlice';

const sessionSlice = createSlice({
  name: 'session',
  initialState: { creatingAccount: false, notice: '' },
  reducers: {
    setCreatingAccount: (state, action) => {
      state.creatingAccount = action.payload;
    },
    setSessionNotice: (state, action) => {
      state.notice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeUser, (state) => {
      state.notice = '';
    });
  },
});
export const { setCreatingAccount, setSessionNotice } = sessionSlice.actions;
export default sessionSlice.reducer;
