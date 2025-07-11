import {Category, Encounter, Link, Meta, Subject} from "@/shared/shared-interface";

interface SearchMode{
    mode:string
}
interface Coding{
    code:string
    system:string
}

interface Code{
    text:string
    coding:Array<Coding>
}

export interface ConditionResource{
    category:Array<Category>
    clinicalStatus:Code
    meta:Meta
    encounter:Encounter
    resourceType:string
    recordedDate:string
    id:string
    code:Code
    onsetDateTime:string
    subject:Subject
    verificationStatus:Code
    search:SearchMode
    fullUrl:string
    link:Array<Link>
}