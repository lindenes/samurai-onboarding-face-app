import {IdentifierType} from "@/shared/shared-interface";

interface Address{
    city:string
    line:Array<string>
    state:string
    country:string
    postalCode:string
}
interface Name{
    use:string
    given:Array<string>
    family:string
    prefix:Array<string>
}
interface Telecom{
    use:String
    value:String
    system:String
}
interface Identifier{
    value:string
    system:string
    type:IdentifierType
}
export interface PatientResource{
    multipleBirthBoolean:boolean
    address:Array<Address>
    name:Array<Name>
    id:string
    birthDate:string
    gender:string
    telecom:Array<Telecom>
    identifier:Array<Identifier>
}