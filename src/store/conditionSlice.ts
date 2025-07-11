import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FhirItem } from '@/shared/shared-interface';
import {ConditionResource} from "@/shared/condition-interface";

interface ConditionState {
    data: FhirItem<ConditionResource> | null;
    loading: boolean;
    error: string | null;
    searchParams: {
        patientID:string
    };
}

const initialState: ConditionState = {
    data: null,
    loading: false,
    error: null,
    searchParams: {
        patientID: ''
    },
};

export const fetchConditions = createAsyncThunk(
    'conditions/fetchAll',
    async (params: { patientID?: string;}) => {
        const url = `/conditions?patient=${params.patientID}`
        const response = await fetch(url);
        return await response.json();
    }
);

const conditionSlice = createSlice({
    name: 'conditions',
    initialState,
    reducers: {
        setOConditionSearchField: (state, action) => {
            state.searchParams.patientID = action.payload;
        },
        clearConditionSearch: (state) => {
            state.searchParams.patientID = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConditions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConditions.fulfilled, (state, action) => {
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
            .addCase(fetchConditions.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка загрузки';
                state.loading = false;
            });
    },
});

export const { setOConditionSearchField, clearConditionSearch } = conditionSlice.actions;
export default conditionSlice.reducer;