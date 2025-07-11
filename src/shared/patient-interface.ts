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
interface IdentifierType{
    text:string
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
    gender:String
    telecom:Array<Telecom>
    identifier:Array<Identifier>
}