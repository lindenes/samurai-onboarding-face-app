import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import patientReducer from './patientSlice';
import observationReducer from './observationSlice'
import conditionReducer from './conditionSlice'
import encounterReducer from './encounterSlice'

export const store = configureStore({
    reducer: {
        patients: patientReducer,
        observations:observationReducer,
        conditions:conditionReducer,
        encounters:encounterReducer
    },
});

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Создаем типизированные хуки для использования в компонентах
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;