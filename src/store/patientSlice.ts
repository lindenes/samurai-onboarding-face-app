import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FhirPatient } from '@/shared/patient-interface';

interface PatientState {
    data: FhirPatient | null;
    loading: boolean;
    error: string | null;
    searchParams: {
        field: string;
        term: string;
    };
}

const initialState: PatientState = {
    data: null,
    loading: false,
    error: null,
    searchParams: {
        field: 'name',
        term: '',
    },
};

export const fetchPatients = createAsyncThunk(
    'patients/fetchAll',
    async (params?: { field?: string; term?: string }) => {
        const url = params?.term
            ? `/patients?field=${params.field}&term=${encodeURIComponent(params.term)}`
            : '/patients';

        const response = await fetch(url);
        return await response.json();
    }
);

const patientSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {
        setSearchField: (state, action) => {
            state.searchParams.field = action.payload;
        },
        setSearchTerm: (state, action) => {
            state.searchParams.term = action.payload;
        },
        clearSearch: (state) => {
            state.searchParams.term = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка загрузки';
                state.loading = false;
            });
    },
});

export const { setSearchField, setSearchTerm, clearSearch } = patientSlice.actions;
export default patientSlice.reducer;