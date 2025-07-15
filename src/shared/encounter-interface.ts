import {IdentifierType, Link, Meta, SearchMode, Subject} from "@/shared/shared-interface";

interface ServiceProvider{
    display:string
    reference:string
}
interface Period{
    end:string
    start:string
}
interface Individual{
    display:string
    reference:string
}
interface Participant{
    type:IdentifierType
    period:Period
    individual:Individual
}
interface Class{
    code:string
    system:string
}
interface Identifier{
    value:string
    system:string
    type:IdentifierType
    use:string
}
interface Location{
    location:{
        display:string
        reference:string
    }
}
export interface EncounterResource{
    meta: Meta
    serviceProvider: ServiceProvider
    type:IdentifierType
    participant:Participant
    resourceType:string
    status:string
    id:string
    class:Class
    identifier:Identifier
    location:Array<Location>
    subject: Subject
    search:SearchMode
    fullUrl:string
    link:Array<Link>
    period:Period
}