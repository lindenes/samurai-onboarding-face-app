interface Meta{
    versionId:string
}
interface Link{
    relation:string
    url:string
}
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
interface Resource{
    multipleBirthBoolean:boolean
    address:Array<Address>
    name:Array<Name>
    id:string
    birthDate:string
    gender:String
    telecom:Array<Telecom>
}
interface EntryItems{
    resource: Resource
}
export interface FhirPatient{
    resourceType:string
    type:string
    meta:Meta
    total: number
    link:Array<Link>
    entry:Array<EntryItems>
}