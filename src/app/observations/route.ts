import {FhirItem} from "@/shared/shared-interface";
import {ObservationResource} from "@/shared/observation-interface";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const apiUrl = process.env.AIDBOX_URL!;
    const apiKey = process.env.AIDBOX_AUTH!;
    const { searchParams } = new URL(request.url);
    const patient = searchParams.get('patient');
    if(patient){
        const response = await fetch(`${apiUrl}/fhir/Observation?patient=${patient}`, {
            headers: {
                Authorization: apiKey
            }
        });
        const observations:FhirItem<ObservationResource> = await response.json()
        console.log(observations)
        return NextResponse.json(observations)
    }else{
        const response = await fetch(`${apiUrl}/fhir/Observation`, {
            headers: {
                Authorization: apiKey
            }
        });
        const observations:FhirItem<ObservationResource> = await response.json()
        console.log(observations)
        return NextResponse.json(observations)
    }
}