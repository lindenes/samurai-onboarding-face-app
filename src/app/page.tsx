'use client';
import {
  Container,
  Typography,
  Button,
  Box,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from "@mui/material";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchPatients, setSearchField, setSearchTerm } from '@/store/patientSlice';
import { fetchObservation } from '@/store/observationSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const {
    data: patients,
    loading,
    error,
    searchParams
  } = useAppSelector((state) => state.patients);

  const observations = useAppSelector((state) => state.observations.data);

  const handleSearch = () => {
    dispatch(fetchPatients({
      field: searchParams.field,
      term: searchParams.term
    }));
  };

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Загружаем обследования для каждого пациента
  useEffect(() => {
    if (patients?.entry) {
      patients.entry.forEach(patient => {
        dispatch(fetchObservation({ patientID: patient.resource.id }));
      });
    }
  }, [patients, dispatch]);

  return (
      <Container maxWidth="lg">
        <Box component="main" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>Пациенты</Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
                select
                label="Поле поиска"
                value={searchParams.field}
                onChange={(e) => dispatch(setSearchField(e.target.value))}
                slotProps={{ select: { native: true } }}
                sx={{ minWidth: 150 }}
            >
              <option value="name">Имя</option>
              <option value="age">Возраст</option>
              <option value="phone">Телефон</option>
              <option value="weight">Вес</option>
              <option value="height">Рост</option>
              <option value="diagnosis">Диагноз</option>
            </TextField>

            <TextField
                label="Поиск"
                variant="outlined"
                fullWidth
                value={searchParams.term}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
            >
              Найти
            </Button>
          </Box>

          {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
          ) : error ? (
              <Typography color="error">{error}</Typography>
          ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="Таблица пациентов">
                  <TableHead>
                    <TableRow>
                      <TableCell>Фамилия</TableCell>
                      <TableCell>Имя</TableCell>
                      <TableCell align="right">Дата рождения</TableCell>
                      <TableCell align="right">Телефон</TableCell>
                      <TableCell align="right">Вес (кг)</TableCell>
                      <TableCell align="right">Рост (см)</TableCell>
                      <TableCell align="right">Пол</TableCell>
                      <TableCell>Диагноз</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients?.entry?.map((patient) => {
                      const patientObservations = observations?.entry?.filter(
                          obs => obs.resource.subject?.reference === `Patient/${patient.resource.id}`
                      );
                      const height =
                          patientObservations?.filter((item) => {
                            return item.resource.code.coding[0].code === "8302-2"
                          })
                              .sort(
                                  (item1, item2) => {
                                    const firstDate = new Date(item1.resource.issued)
                                    const secondDate = new Date(item2.resource.issued)
                                    return secondDate.getTime() - firstDate.getTime()
                                  }
                              )[0]?.resource.valueQuantity.value
                      const weight =
                          patientObservations?.filter((item) => {
                            return item.resource.code.coding[0].code === "29463-7"
                          })
                              .sort(
                                  (item1, item2) => {
                                    const firstDate = new Date(item1.resource.issued)
                                    const secondDate = new Date(item2.resource.issued)
                                    return secondDate.getTime() - firstDate.getTime()
                                  }
                              )[0]?.resource.valueQuantity.value
                      return (
                          <TableRow key={patient.resource.id}>
                            <TableCell component="th" scope="row">
                              {patient.resource.name[0].family}
                            </TableCell>
                            <TableCell align="right">{patient.resource.name[0].given.join(", ")}</TableCell>
                            <TableCell align="right">{patient.resource.birthDate}</TableCell>
                            <TableCell align="right">{patient.resource.telecom?.[0]?.value}</TableCell>
                            <TableCell align="right">{weight}</TableCell>
                            <TableCell align="right">{height}</TableCell>
                          </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
          )}

          {patients?.total === 0 && !loading && (
              <Typography sx={{ mt: 2 }}>Пациенты не найдены</Typography>
          )}
        </Box>
      </Container>
  );
}