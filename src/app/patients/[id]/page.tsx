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
    IconButton,
    ListItem,
    ListItemText,
    Chip,
    Grid,
    Divider,
    Button,
    Box,
    TableFooter,
    TablePagination,
    Avatar, TextField,
    Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
} from "@mui/material";
import React, {useEffect, useState} from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { updatePatient } from '@/store/patientSlice';
import {
    Email,
    Phone,
    Home,
    Person,
    Cake,
    Transgender,
    Badge,
    Edit,
    Add,
    Remove,
    Close,
    Check
} from '@mui/icons-material';
import {FhirItem} from "@/shared/shared-interface";
import {ObservationResource} from "@/shared/observation-interface";
import {ConditionResource} from "@/shared/condition-interface";
import {fetchConditions} from "@/store/conditionSlice";
import {fetchEncounter} from "@/store/encounterSlice";
import {EncounterResource} from "@/shared/encounter-interface";
import {string} from "prop-types";

export default function PatientPage({ params }: { params: Promise<{ id: string }> })  {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const patientId = React.use(params);

    useEffect(() => {
        dispatch(fetchConditions({ patientID: patientId.id}))
        dispatch(fetchEncounter({patientID: patientId.id}))
    }, [dispatch, patientId.id]);

    const patient = useAppSelector((state) =>
        state.patients.data?.entry?.find(p => p.resource.id === patientId.id)?.resource
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [conditionsPage, setConditionsPage] = useState(0);
    const [conditionsRowsPerPage, setConditionsRowsPerPage] = useState(5);
    const [encountersPage, setEncountersPage] = useState(0);
    const [encountersRowsPerPage, setEncountersRowsPerPage] = useState(5);

    const observations = useAppSelector((state) => state.observations.data);
    const conditions = useAppSelector((state) => state.conditions.data);
    const encounters = useAppSelector((state) => state.encounters.data);

    const [openTelecomDialog, setOpenTelecomDialog] = useState(false);

    const handleOpenTelecomDialog = () => {
        setOpenTelecomDialog(true);
    };
    const handleCloseTelecomDialog = () => setOpenTelecomDialog(false);

    const [openEncounterDialog, setOpenEncounterDialog] = useState(false);
    const [encounterForm, setEncounterForm] = useState({
        status: 'planned',
        classCode: 'AMB',
        classDisplay: 'ambulatory',
        periodStart: '',
        serviceProviderDisplay: '',
        serviceProviderReference: ''
    });
    const [creatingEncounter, setCreatingEncounter] = useState(false);

    const handleOpenEncounterDialog = () => setOpenEncounterDialog(true);
    const handleCloseEncounterDialog = () => setOpenEncounterDialog(false);
    const handleEncounterFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEncounterForm({ ...encounterForm, [e.target.name]: e.target.value });
    };
    const handleCreateEncounter = async () => {
        if (!patient) return;
        setCreatingEncounter(true);
        const body = {
            resourceType: 'Encounter',
            status: encounterForm.status,
            class: {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: encounterForm.classCode,
                display: encounterForm.classDisplay
            },
            subject: {
                reference: `Patient/${patient.id}`
            },
            period: {
                start: encounterForm.periodStart
            },
            serviceProvider: {
                display: encounterForm.serviceProviderDisplay,
                reference: encounterForm.serviceProviderReference
            }
        };
        const res = await fetch('/encounters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        setCreatingEncounter(false);
        if (res.ok) {
            handleCloseEncounterDialog();
            dispatch(fetchEncounter({patientID: patient.id}));
        }
    };

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

    const patientEncounters = encounters?.entry?.filter(
        (cond) => cond.resource.subject?.reference === `Patient/${patient?.id}`
    ) || [];

    // Sort encounters by meta.lastUpdated descending
    const sortedPatientEncounters = [...patientEncounters].sort((a, b) => {
        const dateA = new Date(a.resource.meta?.lastUpdated || 0).getTime();
        const dateB = new Date(b.resource.meta?.lastUpdated || 0).getTime();
        return dateB - dateA;
    });

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

    const handleEncountersPageChange = (event: unknown, newPage: number) => {
        setEncountersPage(newPage);
    };

    const handleEncountersRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEncountersRowsPerPage(parseInt(event.target.value, 10));
        setEncountersPage(0);
    };

    const currentConditions = patientConditions.slice(
        conditionsPage * conditionsRowsPerPage,
        conditionsPage * conditionsRowsPerPage + conditionsRowsPerPage
    );

    // Use sortedPatientEncounters instead of patientEncounters for pagination and rendering
    const currentEncounters = sortedPatientEncounters.slice(
        encountersPage * encountersRowsPerPage,
        encountersPage * encountersRowsPerPage + encountersRowsPerPage
    );

    const renderedConditionRows = (index: number, resource: ConditionResource) => {
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

    const renderedEncounterRows = (index: number, resource: EncounterResource) => {
        return (
            <TableRow key={`condition-${index}`}>
                <TableCell>
                    {resource.class.code}
                </TableCell>
                <TableCell>
                    {resource.status}
                </TableCell>
                <TableCell>
                    {resource.serviceProvider?.display || "-"}
                </TableCell>
                <TableCell>
                    {resource.period.start + " - " + (resource.period.end || "")}
                </TableCell>
            </TableRow>
        );
    };

    const nameArr = patient.name || [];
    const lastName = nameArr.length > 0 ? { ...nameArr[nameArr.length - 1], prefix: nameArr[nameArr.length - 1].prefix || [] } : { family: '', given: [], prefix: [] };
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editedValues, setEditedValues] = useState<{
        givenNames: string[];
        familyName: string;
        birthDate: string;
        gender: string;
        telecom: { system: string; use: string; value: string }[];
    }>({
        givenNames: lastName.given || [],
        familyName: lastName.family || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || '',
        telecom: (patient.telecom || []).map((t: any) => ({
            system: String(t.system),
            use: String(t.use),
            value: String(t.value)
        }))
    });

    const [newTelecom, setNewTelecom] = useState<{ system: string; use: string; value: string }>({ system: '', use: '', value: '' });
    const [addingTelecom, setAddingTelecom] = useState(false);

    const handleEditStart = (field: string) => {
        setEditingField(field);
    };

    const handleEditCancel = () => {
        setEditingField(null);
    };

    const handleAddTelecomClick = () => {
        setAddingTelecom(true);
        setNewTelecom({ system: '', use: '', value: '' });
    };
    const handleNewTelecomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setNewTelecom({ ...newTelecom, [field]: e.target.value });
    };
    const handleCancelAddTelecom = () => {
        setAddingTelecom(false);
        setNewTelecom({ system: '', use: '', value: '' });
    };

    const handleRemoveTelecom = (index: number) => {
        const newTelecom = [...editedValues.telecom];
        newTelecom.splice(index, 1);
        setEditedValues({ ...editedValues, telecom: newTelecom });
    };

    const handleEditSave = async () => {
        try {
            const updatePayload: {
                id: string,
                birthDate?: string,
                gender?: string,
                newTelecom?: { system: string; use: string; value: string },
                newName?: { family: string; given: string[] }
            } = { id: patient.id };
            let updatedNameArr = null;
            if (editingField === 'names' && (
                editedValues.familyName !== lastName.family ||
                editedValues.givenNames[0] !== lastName.given?.[0]
            )) {
                updatePayload.newName = {
                    family: editedValues.familyName,
                    given: [editedValues.givenNames[0] || '']
                };
                // Prepare new name array for Redux update
                updatedNameArr = [...(patient.name || [])];
                updatedNameArr[updatedNameArr.length - 1] = {
                    use: 'official',
                    family: editedValues.familyName,
                    given: [editedValues.givenNames[0] || ''],
                    prefix: lastName.prefix || []
                };
            }
            if (editingField === 'birthDate' && editedValues.birthDate !== patient.birthDate) {
                updatePayload.birthDate = editedValues.birthDate;
            }
            if (editingField === 'gender' && editedValues.gender !== patient.gender) {
                updatePayload.gender = editedValues.gender;
            }
            if (editingField === 'telecom' && addingTelecom && newTelecom.system && newTelecom.use && newTelecom.value) {
                updatePayload.newTelecom = newTelecom;
            }
            console.log(updatePayload)
            const response = await fetch('/patients', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload)
            });
            if (!response.ok) {
                throw new Error('Failed to update patient');
            }
            // Update Redux state for name if changed
            if (updatedNameArr) {
                dispatch(updatePatient({ id: patient.id, name: updatedNameArr }));
            }
            setEditingField(null);
            setAddingTelecom(false);
            setNewTelecom({ system: '', use: '', value: '' });
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index?: number,
        telecomField?: string
    ) => {
        const { name, value } = e.target;
        if (name === 'givenName' && typeof index === 'number') {
            const newGivenNames = [...editedValues.givenNames];
            newGivenNames[index] = value;
            setEditedValues({ ...editedValues, givenNames: newGivenNames });
        } else if (name === 'telecom' && typeof index === 'number' && telecomField) {
            const newTelecom = [...editedValues.telecom];
            newTelecom[index] = { ...newTelecom[index], [telecomField]: value };
            setEditedValues({ ...editedValues, telecom: newTelecom });
        } else {
            setEditedValues({ ...editedValues, [name]: value });
        }
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
                    {/* Левая колонка - информация о пациенте */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            {/* Блок с именем и демографией (с редактированием) */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 3,
                                textAlign: 'center',
                                position: 'relative'
                            }}>
                                <Avatar sx={{
                                    width: 80,
                                    height: 80,
                                    mb: 2,
                                    fontSize: '2rem',
                                    bgcolor: 'primary.main'
                                }}>
                                    {lastName.given?.[0]?.charAt(0) || ''}
                                    {lastName.family?.charAt(0) || ''}
                                </Avatar>

                                <IconButton
                                    sx={{ position: 'absolute', top: 0, right: 0 }}
                                    onClick={() => handleEditStart('names')}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>

                                {editingField === 'names' ? (
                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <TextField
                                            label="Given Name"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                            name="givenName"
                                            value={editedValues.givenNames[0] || ''}
                                            onChange={e => setEditedValues({ ...editedValues, givenNames: [e.target.value] })}
                                        />
                                        <TextField
                                            label="Family Name"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                            name="familyName"
                                            value={editedValues.familyName}
                                            onChange={e => setEditedValues({ ...editedValues, familyName: e.target.value })}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <IconButton onClick={handleEditCancel}>
                                                <Close />
                                            </IconButton>
                                            <IconButton onClick={handleEditSave} color="primary">
                                                <Check />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="h5" gutterBottom>
                                        {lastName.given?.join(' ')} {lastName.family}
                                    </Typography>
                                )}

                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    width: '100%',
                                    mt: 1
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <Cake color="action" sx={{ mr: 1 }} />
                                        {editingField === 'birthDate' ? (
                                            <>
                                                <TextField
                                                    type="date"
                                                    variant="standard"
                                                    size="small"
                                                    name="birthDate"
                                                    value={editedValues.birthDate}
                                                    onChange={handleChange}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', ml: 1 }}>
                                                    <IconButton size="small" onClick={handleEditSave}>
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={handleEditCancel}>
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body1">
                                                    {editedValues.birthDate || 'Not specified'}
                                                </Typography>
                                                <Tooltip title="Edit birth date">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                        onClick={() => handleEditStart('birthDate')}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <Transgender color="action" sx={{ mr: 1 }} />
                                        {editingField === 'gender' ? (
                                            <>
                                                <TextField
                                                    select
                                                    variant="standard"
                                                    size="small"
                                                    name="gender"
                                                    value={editedValues.gender}
                                                    onChange={handleChange}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                    <option value="unknown">Unknown</option>
                                                </TextField>
                                                <Box sx={{ display: 'flex', ml: 1 }}>
                                                    <IconButton size="small" onClick={handleEditSave}>
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={handleEditCancel}>
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="body1">
                                                    {editedValues.gender ?
                                                        editedValues.gender.charAt(0).toUpperCase() + editedValues.gender.slice(1) :
                                                        'Not specified'}
                                                </Typography>
                                                <Tooltip title="Edit gender">
                                                    <IconButton
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                        onClick={() => handleEditStart('gender')}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                {/* Telecom editing UI */}
                                {editingField === 'telecom' ? (
                                    <Box sx={{ width: '100%', mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                            <TextField
                                                label="System"
                                                variant="outlined"
                                                size="small"
                                                value={newTelecom.system}
                                                onChange={e => handleNewTelecomChange(e, 'system')}
                                            />
                                            <TextField
                                                label="Use"
                                                variant="outlined"
                                                size="small"
                                                value={newTelecom.use}
                                                onChange={e => handleNewTelecomChange(e, 'use')}
                                            />
                                            <TextField
                                                label="Value"
                                                variant="outlined"
                                                size="small"
                                                value={newTelecom.value}
                                                onChange={e => handleNewTelecomChange(e, 'value')}
                                            />
                                            <IconButton onClick={handleCancelAddTelecom} size="small" color="error">
                                                <Close />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                                            <IconButton onClick={handleEditCancel}>
                                                <Close />
                                            </IconButton>
                                            <IconButton onClick={handleEditSave} color="primary">
                                                <Check />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ) : null}
                            </Box>

                            {/* Остальные поля (без редактирования) */}
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Badge sx={{ mr: 1 }} /> Identifiers
                            </Typography>
                            <List dense>
                                {patient.identifier?.map((id, index) => (
                                    <ListItem key={index} sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={id.type?.text || 'ID'}
                                            secondary={id.value}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ mr: 1 }} /> Contacts
                                <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={() => { setEditingField('telecom'); setAddingTelecom(true); setNewTelecom({ system: '', use: '', value: '' }); }}>
                                    Add telecom
                                </Button>
                                <Button size="small" variant="outlined" sx={{ ml: 2 }} onClick={handleOpenTelecomDialog}>
                                    Show all telecoms
                                </Button>
                            </Typography>
                            <List dense>
                                {patient.telecom && patient.telecom.length > 0 ? (
                                    <ListItem sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={`${patient.telecom[patient.telecom.length - 1].system} (${patient.telecom[patient.telecom.length - 1].use})`}
                                            secondary={patient.telecom[patient.telecom.length - 1].value}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ) : null}
                            </List>
                            <Dialog open={openTelecomDialog} onClose={handleCloseTelecomDialog} maxWidth="sm" fullWidth>
                                <DialogTitle>Telecom Details</DialogTitle>
                                <DialogContent>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>System</TableCell>
                                                    <TableCell>Use</TableCell>
                                                    <TableCell>Value</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {(!patient.telecom || patient.telecom.length === 0) && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center">No telecom data</TableCell>
                                                    </TableRow>
                                                )}
                                                {patient.telecom && patient.telecom.length > 0 && patient.telecom.map((tel: any, tIdx: number) => (
                                                    <TableRow key={tIdx}>
                                                        <TableCell>{tel.system}</TableCell>
                                                        <TableCell>{tel.use}</TableCell>
                                                        <TableCell>{tel.value}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseTelecomDialog}>Close</Button>
                                </DialogActions>
                            </Dialog>

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
                        </Paper>
                    </Grid>

                    {/* Правая колонка - таблицы с данными */}
                    <Grid size={{ xs: 12, md: 8 }}>
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

                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button variant="contained" onClick={handleOpenEncounterDialog} disabled={!patient}>Create Encounter</Button>
                            </Box>
                            <Typography variant="h6" gutterBottom>Encounters</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Organization</TableCell>
                                            <TableCell>Period</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentEncounters.map((cond, index) =>
                                            renderedEncounterRows(index, cond.resource)
                                        )}
                                        {patientEncounters.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4}>No conditions found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[5, 10, 25]}
                                                count={patientEncounters.length}
                                                rowsPerPage={encountersRowsPerPage}
                                                page={encountersPage}
                                                onPageChange={handleEncountersPageChange}
                                                onRowsPerPageChange={handleEncountersRowsPerPageChange}
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
            <Dialog open={openEncounterDialog} onClose={handleCloseEncounterDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Create Encounter</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Status"
                            name="status"
                            value={encounterForm.status}
                            onChange={handleEncounterFormChange}
                            fullWidth
                        />
                        <TextField
                            label="Class Code"
                            name="classCode"
                            value={encounterForm.classCode}
                            onChange={handleEncounterFormChange}
                            fullWidth
                        />
                        <TextField
                            label="Class Display"
                            name="classDisplay"
                            value={encounterForm.classDisplay}
                            onChange={handleEncounterFormChange}
                            fullWidth
                        />
                        <TextField
                            label="Period Start (ISO)"
                            name="periodStart"
                            value={encounterForm.periodStart}
                            onChange={handleEncounterFormChange}
                            fullWidth
                            placeholder="2025-07-17T10:00:00Z"
                        />
                        <TextField
                            label="Service Provider Display"
                            name="serviceProviderDisplay"
                            value={encounterForm.serviceProviderDisplay}
                            onChange={handleEncounterFormChange}
                            fullWidth
                        />
                        <TextField
                            label="Service Provider Reference"
                            name="serviceProviderReference"
                            value={encounterForm.serviceProviderReference}
                            onChange={handleEncounterFormChange}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEncounterDialog}>Cancel</Button>
                    <Button onClick={handleCreateEncounter} variant="contained" disabled={creatingEncounter}>
                        {creatingEncounter ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}