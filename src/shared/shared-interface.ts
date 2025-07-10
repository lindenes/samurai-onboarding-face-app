export interface Meta{
    versionId:string
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