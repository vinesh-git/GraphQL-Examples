import { useState } from 'react'
import { fetchGraphql, type User } from './Users';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateUserResponse ={
    createUser : User
}
function AddUser() {
    const queryClient = useQueryClient();
    const [name ,setName] = useState<string>("");
    const [age, setAge] = useState<number>(0);

    const createUser = `
        mutation createUser($name : String!,$age : Int!){
            createUser(name : $name, age : $age){
                id,
                name,
                age
            }
        }
    `
    
    const {mutate,error,isPending} = useMutation<CreateUserResponse,Error,{name : string,age:number}>({
        mutationFn : (variables : {name:string,age:number}) =>  fetchGraphql<CreateUserResponse>(createUser,variables) ,
        onSuccess : () =>  queryClient.invalidateQueries({queryKey : ["users"]})
    })
    if(error) throw new Error(error.message);
    if(isPending) <p>still pending</p>;
    
  return (
    <div>
    <h4>Enter details</h4>
    <label>Enter Name</label>
    <input placeholder='Enter name' value={name} onChange={(e)=>setName(e.target.value)}/><br/>
    
    <label>Enter age</label>
    <input placeholder='Enter age' value={age} onChange={(e)=>setAge(Number(e.target.value))}/><br/><br/>

    <button onClick={() => mutate({name,age})} >Add</button>

    </div>
    
  )
}

export default AddUser