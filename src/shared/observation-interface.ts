import {Category, Code, Encounter, Meta, Subject} from "@/shared/shared-interface";

interface ValueQuantity{
    code:string
    unit:string
    system:string
    value: number
}
export interface ObservationResource{
    category: Array<Category>
    meta: Meta
    encounter: Encounter
    valueQuantity: ValueQuantity
    resourceType:String
    effectiveDateTime:String
    status:string
    id:string
    subject:Subject
    issued:string
    code:Code
    valueString:string
    valueCodeableConcept:Code
}