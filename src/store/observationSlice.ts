import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ObservationResource } from '@/shared/observation-interface';
import { FhirItem } from '@/shared/shared-interface';

interface ObservationState {
    data: FhirItem<ObservationResource> | null;
    loading: boolean;
    error: string | null;
    searchParams: {
        patientID:string
    };
}

const initialState: ObservationState = {
    data: null,
    loading: false,
    error: null,
    searchParams: {
        patientID: ''
    },
};

export const fetchObservation = createAsyncThunk(
    'observations/fetchAll',
    async (params: { patientID?: string;}) => {
        const url = `/observations?patient=${params.patientID}`
        const response = await fetch(url);
        return await response.json();
    }
);

const observationSlice = createSlice({
    name: 'observations',
    initialState,
    reducers: {
        setObservationSearchField: (state, action) => {
            state.searchParams.patientID = action.payload;
        },
        clearObservationSearch: (state) => {
            state.searchParams.patientID = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchObservation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchObservation.fulfilled, (state, action) => {
                const newData = action.payload;

                if (!state.data) {
                    state.data = newData;
                } else if (newData?.entry) {
                    const existingEntries = state.data.entry || [];
                    const newEntries = newData.entry;

                    const mergedEntries = [
                        ...existingEntries.filter(
                            existing => !newEntries.some((newEntry: { resource: { id: string; }; }) => newEntry.resource?.id === existing.resource?.id)
                        ),
                        ...newEntries
                    ];

                    state.data = {
                        ...newData,
                        entry: mergedEntries
                    };
                } else
                    state.data = state.data;

                state.loading = false;
            })
            .addCase(fetchObservation.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка загрузки';
                state.loading = false;
            });
    },
});

export const { setObservationSearchField, clearObservationSearch } = observationSlice.actions;
export default observationSlice.reducer;