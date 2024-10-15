import { DataSource } from "typeorm";

export const truncateTable = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.clear();
  }
};

export const isJwt = (token: string | null) => {
  if (!token) return false;
  const parts = token.split(".");

  // JWT should have exactly three parts: header, payload, signature
  if (parts.length !== 3) {
    return false;
  }
  // Check if header, payload, and signature are base64url encoded
  return (
    isBase64Url(parts[0]) && isBase64Url(parts[1]) && isBase64Url(parts[2])
  );
};

// A helper function to check if a string is base64url encoded
export const isBase64Url = (str: string): boolean => {
  // Base64url doesn't use padding and replaces characters:
  // '+' -> '-', '/' -> '_'
  const base64UrlRegex = /^[A-Za-z0-9-_]+$/;
  return base64UrlRegex.test(str);
};
