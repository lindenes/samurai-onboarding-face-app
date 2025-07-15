import {FhirItem} from "@/shared/shared-interface";
import {EncounterResource} from "@/shared/encounter-interface";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const apiUrl = process.env.AIDBOX_URL!;
    const apiKey = process.env.AIDBOX_AUTH!;
    const { searchParams } = new URL(request.url);
    const patient = searchParams.get('patient');
    if(patient){
        const response = await fetch(`${apiUrl}/fhir/Encounter?patient=${patient}`, {
            headers: {
                Authorization: apiKey
            }
        });
        const observations:FhirItem<EncounterResource> = await response.json()
        return NextResponse.json(observations)
    }else{
        const response = await fetch(`${apiUrl}/fhir/Encounter`, {
            headers: {
                Authorization: apiKey
            }
        });
        const observations:FhirItem<EncounterResource> = await response.json()
        return NextResponse.json(observations)
    }
}