'use client';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchPatients, setSearchField, setSearchTerm } from '@/store/patientSlice';
import { fetchObservation } from '@/store/observationSlice';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    data: patients,
    loading: isPatientsLoading,
    error,
    searchParams,
  } = useAppSelector((state) => state.patients);

  const observations = useAppSelector((state) => state.observations.data);
  const [loadingPatients, setLoadingPatients] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = () => {
    setPage(0);
    dispatch(fetchPatients({
      field: searchParams.field,
      term: searchParams.term,
    }));
  };

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  useEffect(() => {
    if (!patients?.entry) return;

    const newLoadingState: Record<string, boolean> = {};
    const patientsToLoad = patients.entry.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    patientsToLoad.forEach((patient) => {
      const patientId = patient.resource.id;
      newLoadingState[patientId] = true;
      dispatch(fetchObservation({ patientID: patientId }))
          .finally(() => {
            setLoadingPatients((prev) => ({ ...prev, [patientId]: false }));
          });
    });
    setLoadingPatients(newLoadingState);
  }, [patients, dispatch, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderPatientRow = (patient: any) => {
    const patientId = patient.resource.id;
    const isLoading = loadingPatients[patientId];

    if (isLoading) {
      return (
          <TableRow key={patientId}>
            <TableCell colSpan={8} align="center">
              <CircularProgress size={24} />
            </TableCell>
          </TableRow>
      );
    }

    const patientObservations = observations?.entry?.filter(
        (obs) => obs.resource.subject?.reference === `Patient/${patientId}`
    );

    const latestWeight = patientObservations
        ?.filter((obs) => obs.resource.code.coding[0].code === "29463-7")
        ?.sort((a, b) => new Date(b.resource.issued).getTime() - new Date(a.resource.issued).getTime())[0]
        ?.resource.valueQuantity.value;

    const latestHeight = patientObservations
        ?.filter((obs) => obs.resource.code.coding[0].code === "8302-2")
        ?.sort((a, b) => new Date(b.resource.issued).getTime() - new Date(a.resource.issued).getTime())[0]
        ?.resource.valueQuantity.value;

    return (
        <TableRow key={patientId}
                  hover
                  onClick={() => router.push(`/patients/${patient.resource.id}`)}
                  sx={{ cursor: 'pointer' }}
        >
          <TableCell>{patient.resource.name[0].family}</TableCell>
          <TableCell>{patient.resource.name[0].given.join(", ")}</TableCell>
          <TableCell align="right">{patient.resource.birthDate}</TableCell>
          <TableCell align="right">{patient.resource.telecom?.[0]?.value || "—"}</TableCell>
          <TableCell align="right">{latestWeight || "—"}</TableCell>
          <TableCell align="right">{latestHeight || "—"}</TableCell>
          <TableCell align="right">{patient.resource.gender}</TableCell>
        </TableRow>
    );
  };

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
                slotProps={{ select:{native: true }}}
                sx={{ minWidth: 150 }}
            >
              <option value="name">Имя</option>
              <option value="age">Возраст</option>
              <option value="phone">Телефон</option>
              <option value="weight">Вес</option>
              <option value="height">Рост</option>
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
                disabled={isPatientsLoading}
            >
              Найти
            </Button>
          </Box>

          {isPatientsLoading ? (
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients?.entry
                        ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        ?.map(renderPatientRow)}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                          rowsPerPageOptions={[5, 10, 25]}
                          colSpan={7}
                          count={patients?.total || 0}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          labelRowsPerPage="Строк на странице:"
                          labelDisplayedRows={({ from, to, count }) =>
                              `${from}-${to} из ${count !== -1 ? count : `больше чем ${to}`}`
                          }
                      />
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
          )}

          {patients?.total === 0 && !isPatientsLoading && (
              <Typography sx={{ mt: 2 }}>Пациенты не найдены</Typography>
          )}
        </Box>
      </Container>
  );
}