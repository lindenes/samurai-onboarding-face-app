interface Address{
    city:string
    line:Array<string>
    state:string
    country:string
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
export interface PatientResource{
    multipleBirthBoolean:boolean
    address:Array<Address>
    name:Array<Name>
    id:string
    birthDate:string
    gender:String
    telecom:Array<Telecom>
}