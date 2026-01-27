import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import express from "express";
import cors from "cors";
import { db } from "./firebase.js";
import { FieldValue } from "firebase-admin/firestore";

//without pagination
// ====================================================================================================================================

// const schema = buildSchema(`
//       type User {
//         id : ID!,
//         name : String!,
//         age : Int!,
//         IsMarried : Boolean
//       }

//       type Query {
//         users : [User],
//         getUserById(id : ID!) : User
//       }
//       input CreateUseInput{
//         name : String!,
//         age : Int!,
//         IsMarried : Boolean
//       }
//       type Mutation {
//         createUser(name:String!,age:Int!,IsMarried:Boolean!) : User!,
//         deleteUser(id : ID!) : Boolean
//       }
//     `)

type User = {
  id: string;
  name: string;
  age: number;
  IsMarried: boolean;
  createdAt: string;
};
type CreateUseInput = {
  name: string;
  age: number;
  IsMarried: boolean;
  createdAt: string;
};
// let users : User[] = [
//     {id : 1,name : "vinesh",age : 25},
//     {id : 2,name : "dinesh",age : 26},
//     {id : 3,name : "ainesh",age : 24},
// ];

var resolver = {
  users: async (): Promise<User[]> => {
    const snap = await db.collection("users").get();
    console.log(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    return snap.docs.map((doc: any) => ({
      id: doc.id,
      name: doc.data().name,
      age: doc.data().age,
      IsMarried: doc.data().IsMarried,
      createdAt: "",
    }));
  },
  getUserById: async ({ id }: { id: number }): Promise<User | undefined> => {
    const snapshot = await db.collection("users").doc(String(id)).get();
    if (!snapshot.exists) return undefined;
    return {
      ...(snapshot.data() as User),
    };
  },
  createUser: async (body: {
    name: string;
    age: number;
    IsMarried: boolean;
  }): Promise<User> => {
    const data = await db.collection("users").add({
      name: body.name,
      age: body.age,
      IsMarried: body.IsMarried,
      createdAt: Date.UTC.toString(),
    });
    const snap = data.get().then((res) => console.log(res.data));
    return { ...body, id: data.id, createdAt: "" };
  },
  deleteUser: async ({ id }: { id: number }): Promise<boolean> => {
    const ref = await db.collection("users").doc(String(id)).get();
    if (ref == null) return false;
    await db.collection("users").doc(String(id)).delete();
    return true;
  },
};

// ====================================================================================================================================

// with cursor pagination
// ====================================================================================================================================
//schema
const schema = buildSchema(`
  type User{
    id : ID!,
    name : String!,
    age : Int!,
    isMarried : Boolean!
  }
  type UserEdge{
    node : User!,
    cursor : String!
  }

  type PageInfo {
    hasNextPage : Boolean!,
    endCursor : String!
  }

  type UserConnection{
    edges : [UserEdge!]!,
    pageInfo : PageInfo!
  }

  type Query{
    getUsers(first : Int!, after : String): UserConnection!

  }

  type Mutation {
    createUser(name : String!, age : Int!,IsMarried : Boolean) : User,
    deleteUser(id : ID!) : Boolean
  }

  `);

//not schema, but types defined for resolvers
type UserEdge = {
  node: User;
  cursor: string;
};

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | undefined;
};

type UserConnection = {
  edges: UserEdge[];
  pageInfo: PageInfo;
};

type CursorType = {
  createdAt: string;
  id: string;
};

const resolver1 = {
  getUsers: async ({
    first,
    after,
  }: {
    first: number;
    after?: string;
  }): Promise<UserConnection> => {
    let query = db
      .collection("users")
      .orderBy("__name__")
      .limit(first + 1);
    if (after) {
      const { createdAt, id } = decoder(after);
      query = query.startAfter(id);
    }
    const snapshot = query.get();
    const docs = (await snapshot).docs;
    const hasNextPage = docs.length > first;
    const slicedDocs = hasNextPage ? docs.slice(0, first) : docs;
    const edges: UserEdge[] = slicedDocs.map((doc) => {
      const data = doc.data();
      return {
        node: {
          id: doc.id,
          name: data.name,
          age: data.age,
          IsMarried: data.IsMarried,
          createdAt: data.createdAt,
        },
        cursor: encoder({
          createdAt: "",
          id: doc.id,
        }),
      };
    });
    return {
      edges,
      pageInfo: {
        hasNextPage: hasNextPage,
        endCursor: edges.length ? edges[edges.length - 1].cursor : undefined,
      },
    };
  },
  getUserById: async ({ id }: { id: number }): Promise<User | undefined> => {
    const snapshot = await db.collection("users").doc(String(id)).get();
    if (!snapshot.exists) return undefined;
    return {
      ...(snapshot.data() as User),
    };
  },
  createUser: async (body: {
    name: string;
    age: number;
    IsMarried: boolean;
  }): Promise<User> => {
    const data = await db.collection("users").add({
      name: body.name,
      age: body.age,
      IsMarried: body.IsMarried,
      createdAt: Date.UTC.toString(),
    });
    const snap = data.get().then((res) => console.log(res.data));
    return { ...body, id: data.id, createdAt: "" };
  },
  deleteUser: async ({ id }: { id: number }): Promise<boolean> => {
    const ref = await db.collection("users").doc(String(id)).get();
    if (ref == null) return false;
    await db.collection("users").doc(String(id)).delete();
    return true;
  },
};

const encoder = (item: CursorType): string => {
  return Buffer.from(JSON.stringify(item)).toString("base64");
};

const decoder = (item: string): CursorType => {
  return JSON.parse(Buffer.from(item, "base64").toString("ascii"));
};

const app = express();
app.use(cors());
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolver1,
    graphiql: true,
  }),
);
app.use(express.json());
app.listen(4000, () => {
  console.log("GraphQl Server running on http://localhost:4000/graphql");
});
