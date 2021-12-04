import { gql } from "apollo-server";

export default gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  type Query {
    otherFields: Boolean!
  }
  type Mutation {
    editProfile(
      firstName: String
      lastName: String
      username: String
      email: String
      password: String
      bio: String
      avatar: Upload
    ): MutationResponse!
    singleUpload(file: Upload!): File!
  }
`;
