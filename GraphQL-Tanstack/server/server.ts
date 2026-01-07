import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'
import express from "express"
import cors from "cors";

const schema = buildSchema(`
      type User {
        id : ID!,
        name : String!,
        age : Int!
      }

      type Query {
        users : [User],
        getUserById(id : ID!) : User
      }

      type Mutation {
        createUser(name : String!,age : Int!) : User!,
        deleteUser : Boolean
      }
    `)

    type User ={
      id : number,
      name : string,
      age : number
    }
    const users : User[] = [
        {id : 1,name : "vinesh",age : 25},
        {id : 2,name : "dinesh",age : 26},
        {id : 3,name : "ainesh",age : 24},
    ];

    const resolver = {
        users : () : User[]=> users,
        getUserById : ({id} :{id : number}) : User | undefined => users.find(user => user.id===id),
        createUser : ({name,age} : {name : string,age:number}) : User => {
          const newUser : User = {
            id : 4,
            name,
            age
          }
          users.push(newUser);
          return newUser;
        }
    }

    const app = express();
    app.use(cors({
      origin : "http://localhost:5173",
      methods : ["GET","POST", "OPTIONS"],
      allowedHeaders : ["Content-Type","Authorization"]
    }))
    app.use(
        "/graphql",
        graphqlHTTP({
            schema,
            rootValue : resolver,
            graphiql : true
        })
    )

    app.listen(4000,() => {
      console.log("GraphQl Server running on http://localhost:4000/graphql");
    });
   
