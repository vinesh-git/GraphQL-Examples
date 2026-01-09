import { useQuery } from '@tanstack/react-query'

export type User ={
    id : number,
    name : string,
    age : number
}

type UserQueryResult = {
    users : User[]
}

const User_query = `
    query {
        users{
            id,
            name,
            age
        }
    }
`
type GraphQLResponse<T> = {
    data : T,
    error? : {message : string}[],
}

export async function fetchGraphql<T>(query : string, variables? : Record<string,any>){
    const res = await fetch("http://localhost:4000/graphql",{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify({query,variables})
    })
    const json : GraphQLResponse<T> = await res.json();
    if(json.error)
        throw new Error(json.error[0].message)
    return json.data;
}

function Users() {
    const {data , isLoading, error}  = useQuery<UserQueryResult>({
        queryKey : ["users"],
        queryFn : () => fetchGraphql<UserQueryResult>(User_query)
    });
    if(isLoading) return <h5>Loading...</h5>
    if(error) return <h5>{error.message}</h5>
  return (
    <div>
        {data!.users.map((u,key )=> (
            <div key={key}>{u.name}</div>
        ))}
    </div>
  )
}

export default Users