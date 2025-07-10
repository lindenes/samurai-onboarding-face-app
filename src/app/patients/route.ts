import { NextResponse } from 'next/server';
import {PatientResource} from '@/shared/patient-interface'
import {FhirItem} from "@/shared/shared-interface";

export async function GET(request: Request) {
    const apiUrl = process.env.AIDBOX_URL!;
    const apiKey = process.env.AIDBOX_AUTH!;
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    const term = searchParams.get('term');
    if(field){
        const response = await fetch(`${apiUrl}/fhir/Patient?${field}=${term}`, {
            headers: {
                Authorization: apiKey
            }
        });
        const patients:FhirItem<PatientResource> = await response.json()
        return NextResponse.json(patients)
    }else{
        const response = await fetch(`${apiUrl}/fhir/Patient`, {
            headers: {
                Authorization: apiKey
            }
        });
        const patients:FhirItem<PatientResource> = await response.json()
        console.log(patients)
        return NextResponse.json(patients)
    }
}