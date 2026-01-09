import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react"
import { fetchGraphql } from "./Users";

type DeleteUserResponse ={
    flag : boolean
}

const deleteQuery = `
    mutation deleteuser($id : ID!){
        deleteUser(id : $id)
    }
`

function DeleteUser() {
    const queryClient = useQueryClient();
    const [id,setId] = useState<string>("");
    const {mutate, error, isPending} = useMutation<DeleteUserResponse,Error,{id : number}>({
        mutationFn : (variables : {id : number}) => fetchGraphql<DeleteUserResponse>(deleteQuery,variables),
        onSuccess : () => queryClient.invalidateQueries({queryKey : ["users"]}) 
    })
    if(error)
        return <h3>Caught an error : {error.message}</h3>
    if(isPending)
        return <h3>Deleting, Please wait ...</h3>
  return (
    <div>
        <h3>Delete User</h3>
        <input type="number" placeholder="Enter user id" value={id}
        onChange={(e) => setId(e.target.value)}
        />
        <button onClick={() =>{setId(""); mutate({id: Number(id)})}}>Delete</button>
    </div>
  )
}

export default DeleteUser