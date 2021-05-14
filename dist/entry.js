"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mem_node_1 = require("@mem-labs/mem-node");
const apollo_server_1 = require("apollo-server");
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = 'https://opsnalziryqyzdocyfxz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjIxMDIyMTUxLCJleHAiOjE5MzY1OTgxNTF9.EBdxeOzFgPtXrvprOTrwj-869hG7wG0UJ8OtawwKniU';
const supabase = supabase_js_1.createClient(supabaseUrl, supabaseKey);
const typeDefs = apollo_server_1.gql `
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
const memClient = new mem_node_1.MemClient({
    apiKey: "da843acd-8ab9-4fbc-8f5f-7dfe3ceab5de"
});
const resolvers = {
    Mutation: {
        createOrFetchAccount: (arg, inputs) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            console.log(inputs.token);
            const memClient = new mem_node_1.MemClient({
                apiKey: inputs.token
            });
            const success = memClient.healthCheck();
            if (!success) {
                throw new Error("Token was no good");
            }
            let { data: matchingUsers, error } = yield supabase
                .from('users')
                .select("*")
                .eq("token", inputs.token);
            let matchingUser = matchingUsers === null || matchingUsers === void 0 ? void 0 : matchingUsers[0];
            if (!matchingUser) {
                const result = yield supabase
                    .from('users')
                    .insert([
                    {
                        token: inputs.token,
                        name: inputs.name
                    },
                ]);
                matchingUser = (_a = result.data) === null || _a === void 0 ? void 0 : _a[0];
                if (!matchingUser) {
                    throw new Error("Supabase Failed");
                }
            }
            console.log(matchingUser);
            return {
                success: true,
                supabaseUser: matchingUser
            };
        })
    },
    Query: {
        healthCheck: () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield memClient.healthCheck();
            return result;
        })
    },
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true
});
const serverPort = process.env.PORT || 5555;
// The `listen` method launches a web server.
server.listen({
    port: serverPort,
}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
//# sourceMappingURL=entry.js.map