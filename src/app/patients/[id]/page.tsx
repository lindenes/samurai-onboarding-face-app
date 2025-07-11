'use client';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    Grid,
    Divider,
    Button,
    Box,
    TableFooter,
    TablePagination,
    Avatar
} from "@mui/material";
import React, {useEffect, useState} from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { Email, Phone, Home, Person, Cake, Transgender, Badge } from '@mui/icons-material';
import {FhirItem} from "@/shared/shared-interface";
import {ObservationResource} from "@/shared/observation-interface";
import {ConditionResource} from "@/shared/condition-interface";
import {fetchConditions} from "@/store/conditionSlice";

export default function PatientPage({ params }: { params: Promise<{ id: string }> })  {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const patientId = React.use(params);

    useEffect(() => {
        dispatch(fetchConditions({ patientID: patientId.id}));
    }, [dispatch, patientId.id]);

    const patient = useAppSelector((state) =>
        state.patients.data?.entry?.find(p => p.resource.id === patientId.id)?.resource
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [conditionsPage, setConditionsPage] = useState(0);
    const [conditionsRowsPerPage, setConditionsRowsPerPage] = useState(5);

    const observations = useAppSelector((state) => state.observations.data);
    const conditions = useAppSelector((state) => state.conditions.data);

    if (!patient) {
        return (
            <Container maxWidth="lg">
                <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    sx={{ mb: 2 }}
                >
                    Return
                </Button>
                <Typography variant="h4" gutterBottom>Пациент не найден</Typography>
            </Container>
        );
    }

    const patientObservations = observations?.entry?.filter(
        (obs) =>
            obs.resource.subject?.reference === `Patient/${patient?.id}`
    ) || [];

    const patientConditions = conditions?.entry?.filter(
        (cond) => cond.resource.subject?.reference === `Patient/${patient?.id}`
    ) || [];

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const currentObservations = patientObservations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const renderedObservationRows= (index:number, resource:ObservationResource) => {
        const valueMap: { [key: string]: () => string } = {
            "72166-2": () => resource.valueCodeableConcept.text,
            "630-4": () => resource.valueString,
        };

        const value = valueMap[resource.code.coding[0].code]?.() || resource.valueQuantity?.value;
        return(
            <TableRow key={index}>
                <TableCell>
                    {resource.code?.text}
                </TableCell>
                <TableCell>
                    {value}
                </TableCell>
                <TableCell>
                    {resource.issued || 'Date not found'}
                </TableCell>
            </TableRow>
        )
    }

    const handleConditionsPageChange = (event: unknown, newPage: number) => {
        setConditionsPage(newPage);
    };

    const handleConditionsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConditionsRowsPerPage(parseInt(event.target.value, 10));
        setConditionsPage(0);
    };

    const currentConditions = patientConditions.slice(
        conditionsPage * conditionsRowsPerPage,
        conditionsPage * conditionsRowsPerPage + conditionsRowsPerPage
    );

    const renderedConditionRows = (index: number, resource: ConditionResource) => {
        console.log(resource)
        return (
            <TableRow key={`condition-${index}`}>
                <TableCell>
                    {resource.clinicalStatus.coding[0].code}
                </TableCell>
                <TableCell>
                    {resource.code.text}
                </TableCell>
                <TableCell>
                    {resource.recordedDate}
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Container maxWidth="xl">
            <Box component="main" sx={{ py: 4 }}>
                <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    sx={{ mb: 2 }}
                >
                    Return
                </Button>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
                                    <Person fontSize="large" />
                                </Avatar>
                                <Typography variant="h5" align="center">
                                    {patient.name[0].family} {patient.name[0].given.join(' ')}
                                </Typography>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Badge sx={{ mr: 1 }} /> Identifiers
                            </Typography>
                            <List dense>
                                {patient.identifier?.map((id, index) => (
                                    <ListItem key={index} sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={id.type?.text || 'Identifiers'}
                                            secondary={id.value}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ mr: 1 }} /> Contacts
                            </Typography>
                            <List dense>
                                {patient.telecom?.map((contact, index) => (
                                    <ListItem key={index} sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={`${contact.system} (${contact.use})`}
                                            secondary={contact.value}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Home sx={{ mr: 1 }} /> Address
                            </Typography>
                            <List dense>
                                {patient.address?.map((addr, index) => (
                                    <ListItem key={index} sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={addr.line?.join(', ')}
                                            secondary={`${addr.city}, ${addr.state}, ${addr.postalCode}`}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Transgender sx={{ mr: 1 }} /> demography
                            </Typography>
                            <List dense>
                                <ListItem sx={{ py: 0 }}>
                                    <ListItemText
                                        primary="Gender"
                                        secondary={patient.gender || 'Не указан'}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0 }}>
                                    <ListItemText
                                        primary="Birthdate"
                                        secondary={patient.birthDate || 'Не указана'}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Observations</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>type</TableCell>
                                            <TableCell>value</TableCell>
                                            <TableCell>date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentObservations.map((obs, index) => renderedObservationRows(index, obs.resource))}
                                        {patientObservations.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3}>Not data</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25]}
                                                count={patientObservations.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={handleChangeRowsPerPage}
                                                labelRowsPerPage="rows:"
                                                labelDisplayedRows={({ from, to, count }) =>
                                                    `${from}-${to} from ${count}`
                                                }
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Paper>
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Conditions</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Diagnosis</TableCell>
                                            <TableCell>Recorded Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentConditions.map((cond, index) =>
                                            renderedConditionRows(index, cond.resource)
                                        )}
                                        {patientConditions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>No conditions found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25]}
                                                count={patientConditions.length}
                                                rowsPerPage={conditionsRowsPerPage}
                                                page={conditionsPage}
                                                onPageChange={handleConditionsPageChange}
                                                onRowsPerPageChange={handleConditionsRowsPerPageChange}
                                                labelRowsPerPage="Rows:"
                                                labelDisplayedRows={({ from, to, count }) =>
                                                    `${from}-${to} of ${count}`
                                                }
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Paper>

                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}