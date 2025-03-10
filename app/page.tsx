"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getUserFiles, getSharedFiles } from "@/lib/appwrite-config";
import { FileCard } from "@/components/file-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my-files");
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      if (user) {
        try {
          setIsLoadingFiles(true);
          const myFiles = await getUserFiles(user.$id);
          setUserFiles(myFiles);

          const shared = await getSharedFiles(user.$id);
          setSharedFiles(shared);
        } catch (error) {
          console.error("Error fetching files:", error);
        } finally {
          setIsLoadingFiles(false);
        }
      }
    };

    if (user) {
      fetchFiles();
    } else if (!isLoading && !user) {
      // If not logged in and not loading, redirect to login
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Files</h1>
        <Button onClick={() => router.push("/upload")}>Upload New File</Button>
      </div>

      <Tabs defaultValue="my-files" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-files">My Files</TabsTrigger>
          <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
        </TabsList>

        <TabsContent value="my-files">
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFiles.map((file) => (
                <FileCard
                  key={file.$id}
                  file={file}
                  onDelete={() => {
                    setUserFiles(userFiles.filter((f) => f.$id !== file.$id));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have any files yet
              </p>
              <Button onClick={() => router.push("/upload")}>
                Upload Your First File
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared-with-me">
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sharedFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedFiles.map((file) => (
                <FileCard key={file.$id} file={file} isShared={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No files have been shared with you yet
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
