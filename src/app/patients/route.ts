import { NextResponse } from 'next/server';
import {PatientResource} from '@/shared/patient-interface'
import {FhirItem, FHIRParameters} from "@/shared/shared-interface";

export async function GET(request: Request) {
    const apiUrl = process.env.AIDBOX_URL!;
    const apiKey = process.env.AIDBOX_AUTH!;
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    const term = searchParams.get('term');
    if(field){
        if(field === "weight"){
            const response = await fetch(`${apiUrl}/fhir/Observation?code=29463-7&value-quantity=${term}&_include=Observation:patient`, {
                headers: {
                    Authorization: apiKey
                }
            });
            const originalBundle = await response.json();

            const filteredEntry = originalBundle.entry?.filter((entry: any) =>
                entry.resource?.resourceType === "Patient"
            ) || [];

            const patientBundle = {
                resourceType: "Bundle",
                type: "searchset",
                total: filteredEntry.length,
                entry: filteredEntry,
                meta: originalBundle.meta,
                link: originalBundle.link
            };

            return NextResponse.json(patientBundle);
        }
        else if(field === "height"){
            const response = await fetch(`${apiUrl}/fhir/Observation?code=8302-2&value-quantity=${term}&_include=Observation:patient`, {
                headers: {
                    Authorization: apiKey
                }
            });
            const originalBundle = await response.json();

            const filteredEntry = originalBundle.entry?.filter((entry: any) =>
                entry.resource?.resourceType === "Patient"
            ) || [];

            const patientBundle = {
                resourceType: "Bundle",
                type: "searchset",
                total: filteredEntry.length,
                entry: filteredEntry,
                meta: originalBundle.meta,
                link: originalBundle.link
            };

            return NextResponse.json(patientBundle);
        }
        else{
            const response = await fetch(`${apiUrl}/fhir/Patient?${field}=${term}`, {
                headers: {
                    Authorization: apiKey
                }
            });
            const patients:FhirItem<PatientResource> = await response.json()
            return NextResponse.json(patients)
        }
    }else{
        const response = await fetch(`${apiUrl}/fhir/Patient`, {
            headers: {
                Authorization: apiKey
            }
        });
        const patients:FhirItem<PatientResource> = await response.json()
        return NextResponse.json(patients)
    }
}

export async function PATCH(request: Request){
    const apiUrl = process.env.AIDBOX_URL!;
    const apiKey = process.env.AIDBOX_AUTH!;
    const patientData = await request.json()
    const fhirParams:FHIRParameters = {
        resourceType: "Parameters",
        parameter:[

        ]
    }
    console.log(patientData)
    if(patientData.birthDate){
        fhirParams.parameter.push(
            {
                name: "operation",
                part: [
                    {
                        name: "type",
                        valueCode: "add"
                    },
                    {
                        name: "path",
                        valueString: "Patient"
                    },
                    {
                        name: "name",
                        valueString: "birthDate"
                    },
                    {
                        name: "value",
                        valueDate: patientData.birthDate
                    }
                ]
            }
        )
    }
    console.log(fhirParams)
    const response = await fetch(`${apiUrl}/fhir/Patient/${patientData.id}`, {
        method: 'PATCH',
        headers: {
            Authorization: apiKey,
            'Content-Type':"application/json"
        },
        body:JSON.stringify(fhirParams)
    });
    const patients:PatientResource = await response.json()
    return NextResponse.json(patients)
}