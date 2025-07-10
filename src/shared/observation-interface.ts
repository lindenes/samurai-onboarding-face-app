import {Meta} from "@/shared/shared-interface";

interface Coding{
    code:string
    system:string
    display:string
}
interface Category{
    coding:Coding
}
interface Encounter{
    reference:string
}
interface ValueQuantity{
    code:string
    unit:string
    system:string
    value: number
}
interface Subject{
    reference:string
}
interface Coding{
    code:string
    system:string
    display:string
}
interface Code{
    text:string
    coding:Array<Coding>
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
}