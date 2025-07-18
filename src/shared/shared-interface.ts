export interface Extension{
    url:string
    valueInstant:string
}

export interface Meta{
    versionId:string
    lastUpdated:string
    profile:Array<string>
    extension:Array<Extension>
}

export interface Link{
    relation:string
    url:string
}

interface EntryItems<T>{
    resource: T
}

export interface FhirItem<T>{
    resourceType:string
    type:string
    meta:Meta
    total: number
    link:Array<Link>
    entry:Array<EntryItems<T>>
}

export interface Coding{
    code:string
    system:string
    display:string
}

export interface Category{
    coding:Coding
}

export interface Encounter{
    reference:string
}

export interface Coding{
    code:string
    system:string
    display:string
}

export interface Code{
    text:string
    coding:Array<Coding>
}
export interface Subject{
    reference:string
    display: string | undefined
}
export interface IdentifierType{
    text:string
    coding:Array<Coding> | undefined
}
export interface SearchMode{
    mode:string
}

export interface FHIRParameterPart {
    name: string;
    valueCode?: string;
    valueString?: string;
    valueDate?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueDecimal?: number;
    part?: FHIRParameterPart[];
}

export interface FHIRParameters {
    resourceType: "Parameters";
    parameter: Array<{
        name: string;
        part: FHIRParameterPart[];
    }>;
}