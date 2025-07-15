import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FhirItem } from '@/shared/shared-interface';
import {EncounterResource} from "@/shared/encounter-interface";

interface ObservationState {
    data: FhirItem<EncounterResource> | null
    loading: boolean
    error: string | null
    searchParams: {
        patientID:string
    }
}

const initialState: ObservationState = {
    data: null,
    loading: false,
    error: null,
    searchParams: {
        patientID: ''
    },
};

export const fetchEncounter = createAsyncThunk(
    'encounters/fetchAll',
    async (params: { patientID?: string;}) => {
        const url = `/encounters?patient=${params.patientID}`
        const response = await fetch(url);
        return await response.json();
    }
);

const encounterSlice = createSlice({
    name: 'encounters',
    initialState,
    reducers: {
        setEncounterSearchField: (state, action) => {
            state.searchParams.patientID = action.payload;
        },
        clearEncounterSearch: (state) => {
            state.searchParams.patientID = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEncounter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEncounter.fulfilled, (state, action) => {
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
            .addCase(fetchEncounter.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка загрузки';
                state.loading = false;
            });
    },
});

export const { setEncounterSearchField, clearEncounterSearch } = encounterSlice.actions;
export default encounterSlice.reducer;