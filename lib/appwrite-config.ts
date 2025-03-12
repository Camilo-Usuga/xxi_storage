import {
  Client,
  Account,
  Storage,
  Databases,
  ID,
  Query,
  Role,
  Permission,
} from "appwrite";

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Initialize Appwrite services
export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);

// Helper functions for authentication
export const createUserAccount = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw Error;

    const session = await account.createEmailPasswordSession(email, password);

    return {
      user: newAccount,
      session,
    };
  } catch (error) {
    console.error("Error creating user account:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    return currentAccount;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// File operations
export const uploadFile = async (file: File, userId: string) => {
  try {
    // Upload file to storage
    const id = ID.unique();
    const uploadedFile = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
      id,
      file
    );

    if (!uploadedFile) throw Error;

    // Create file record in database
    const fileUrl = storage.getFileView(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
      uploadedFile.$id
    );

    const fileRecord = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      id,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        user_id: userId,
        file_id: uploadedFile.$id,
        file_url: fileUrl,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    return fileRecord;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const getUserFiles = async (userId: string) => {
  try {
    const files = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal("user_id", userId)]
    );

    return files.documents;
  } catch (error) {
    console.error("Error getting user files:", error);
    throw error;
  }
};

export const getSharedFiles = async (userId: string) => {
  try {
    const files = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal("shared_with", userId)]
    );

    return files.documents;
  } catch (error) {
    console.error("Error getting shared files:", error);
    throw error;
  }
};

export const deleteFile = async (fileId: string, databaseId: string) => {
  try {
    // Delete file from storage
    await storage.deleteFile(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
      fileId
    );

    // Delete file record from database
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      databaseId
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const shareFile = async (fileId: string, userEmail: string) => {
  try {
    // Obtener el usuario con el que compartir
    const users = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID_USERS!,
      [
        // Asumiendo que tienes una colección de usuarios
        Query.equal("email", userEmail),
      ]
    );
    console.log(fileId);
    console.log(users.documents[0]);

    if (users.documents.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const userToShareWith = users.documents[0];

    // Actualizar el registro del archivo para incluir al usuario en el array shared_with
    const updatedFile = await storage.updateFile(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
      fileId,
      undefined,
      [Permission.read(Role.user(userToShareWith.$id))]
    );
    console.log(updatedFile);
    return updatedFile;
  } catch (error) {
    console.error("Error al compartir el archivo:", error);
    throw error;
  }
};

export const updateFileVisibility = async (
  fileId: string,
  isPublic: boolean
) => {
  try {
    const updatedFile = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      fileId,
      {
        is_public: isPublic,
      }
    );

    return updatedFile;
  } catch (error) {
    console.error("Error updating file visibility:", error);
    throw error;
  }
};

export { ID };
