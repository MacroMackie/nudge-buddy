import { MemClient } from '@mem-labs/mem-node';
import { ApolloServer, gql } from 'apollo-server';

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://opsnalziryqyzdocyfxz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjIxMDIyMTUxLCJleHAiOjE5MzY1OTgxNTF9.EBdxeOzFgPtXrvprOTrwj-869hG7wG0UJ8OtawwKniU'
const supabase = createClient(supabaseUrl, supabaseKey)

interface User {
  id: number;
  name: string;
  token: string
}

const typeDefs = gql`
  type SupabaseUser {
    id: ID
    name: String
    token: String
  }

  type CreateOrFetchAccountResult {
    success: Boolean
    supabaseUser: SupabaseUser
  }

  type Mutation {
    createOrFetchAccount(
      token: String!
      name: String
    ): CreateOrFetchAccountResult
  }

  type Query {
    healthCheck: Boolean
  }
`;

const memClient = new MemClient({
  apiKey: "da843acd-8ab9-4fbc-8f5f-7dfe3ceab5de"
})

const resolvers = {
  Mutation :{
    createOrFetchAccount: async (
      arg: any,
      inputs: { 
        token: string
        name: string
      }
    ) => {
      console.log(inputs.token)

      const memClient = new MemClient({
        apiKey: inputs.token
      })
      
      const success = memClient.healthCheck()

      if (!success) {
        throw new Error("Token was no good")
      }


      let { data: matchingUsers, error } = await supabase
        .from('users')
        .select("*")
        .eq("token", inputs.token)

      let matchingUser = matchingUsers?.[0]

      if (!matchingUser) {
        const result = await supabase
          .from('users')
          .insert([
            {
              token: inputs.token,
              name: inputs.name
            },
          ])

        matchingUser = result.data?.[0]

        if (!matchingUser) {
          throw new Error("Supabase Failed")
        }
      }

    
      console.log(matchingUser)

      return {
        success: true, 
        supabaseUser: matchingUser as User
      }
    }
  },
  Query: {
    healthCheck: async () => {
      const result = await memClient.healthCheck()
      
      return result
    }
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
});

const serverPort = process.env.PORT || 5555

// The `listen` method launches a web server.
server.listen({
  port: serverPort,
}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

