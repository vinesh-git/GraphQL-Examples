import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'
import express from "express"
import cors from "cors";
import { db } from './firebase.js';

const schema = buildSchema(`
      type User {
        id : ID!,
        name : String!,
        age : Int!,
        IsMarried : Boolean
      }

      type Query {
        users : [User],
        getUserById(id : ID!) : User
      }
      input CreateUseInput{
        name : String!,
        age : Int!,
        IsMarried : Boolean
      }
      type Mutation {
        createUser(name:String!,age:Int!,IsMarried:Boolean!) : User!,
        deleteUser(id : ID!) : Boolean
      }
    `)

    type User ={
      id : string,
      name : string,
      age : number,
      IsMarried : boolean
    }
    type CreateUseInput ={
      name : string,
      age : number,
      IsMarried : boolean
    }
    // let users : User[] = [
    //     {id : 1,name : "vinesh",age : 25},
    //     {id : 2,name : "dinesh",age : 26},
    //     {id : 3,name : "ainesh",age : 24},
    // ];

    const resolver = {
        users : async() : Promise<User[]> => {
          const snap = await db.collection("users").get();
          console.log(snap.docs.map((doc : any) => ({id : doc.id,...doc.data()})))
          return snap.docs.map((doc:any) => ({
            id : doc.id,
            name : doc.data().name,
            age : doc.data().age,
            IsMarried : doc.data().IsMarried
          }))
        },
        getUserById : async ({id} :{id : number}) : Promise<User|undefined> => {
          const snapshot = await db.collection("users").doc(String(id)).get();
          if(!snapshot.exists) return undefined;
          return {
            ...snapshot.data() as User
          }
        },
        createUser : async (body : {name:string,age:number,IsMarried:boolean}) : Promise<User> => {
          const data = await db.collection("users").add(body);
          return {...body,id : data.id};
        },
        deleteUser : async ({id} : {id : number}) : Promise<boolean> => {
          const ref = await db.collection("users").doc(String(id)).get();
          if(ref == null) return false;
          await db.collection("users").doc(String(id)).delete();
          return true;
        }
    }

    const app = express();
    app.use(cors())
    app.use(
        "/graphql",
        graphqlHTTP({
            schema,
            rootValue : resolver,
            graphiql : true
        })
    )
    app.use(express.json())
    app.listen(4000,() => {
      console.log("GraphQl Server running on http://localhost:4000/graphql");
    });
   
